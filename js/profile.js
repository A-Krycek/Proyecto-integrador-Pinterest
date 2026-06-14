
function obtenerLlaveGuardados() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.id) {
                return `saved_pins_user_${user.id}`;
            }
        } catch (e) {}
    }
    return "saved_pins";
}

async function cargarPerfil() {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        window.location.href = "bienvenida.html";
        return;
    }

    const loggedInUser = JSON.parse(userStr);
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserIdStr = urlParams.get("id");

    const isOwnProfile = !targetUserIdStr || parseInt(targetUserIdStr, 10) === loggedInUser.id;
    const userIdToLoad = isOwnProfile ? loggedInUser.id : parseInt(targetUserIdStr, 10);

    try {
        const response = await fetch(`${API_URL}/users/${userIdToLoad}`);
        if (!response.ok) throw new Error("Usuario no encontrado");
        const userData = await response.json();

        $("#txt-nombre-completo").text(userData.username);
        $("#nombre-usuario-perfil").text(`@${userData.username.toLowerCase()}`);
        $("#biografia-usuario-perfil").text(userData.bio || `¡Bienvenido/a a tu LookBook, ${userData.username}! Aquí puedes gestionar tus ideas inspiradoras y ver el estado de moderación ética por IA.`);
        renderizarAvatar("#cabecera-perfil-usuario .avatar-placeholder", userData);

        // Renderizar seguidores y seguidos
        $("#contador-seguidores").text(`${userData.followers_count} seguidores`);
        $("#contador-seguidos").text(`${userData.following_count} seguidos`);

        if (isOwnProfile) {
            $("#btn-editar-perfil").show();
            $("#btn-seguir-perfil").hide();
            $("#pestana-guardados-perfil").show();
        } else {
            $("#btn-editar-perfil").hide();
            $("#btn-seguir-perfil").show();
            $("#pestana-guardados-perfil").hide();

            // Cargar estado de seguimiento
            try {
                const followRes = await fetch(`${API_URL}/users/${userIdToLoad}/is-following?follower_id=${loggedInUser.id}`);
                if (followRes.ok) {
                    const followData = await followRes.json();
                    const $btnSeguir = $("#btn-seguir-perfil");
                    if (followData.following) {
                        $btnSeguir.addClass("siguiendo").text("Siguiendo").css({"background-color": "#2d2a26", "color": "#ffffff", "border": "1px solid #2d2a26"});
                    } else {
                        $btnSeguir.removeClass("siguiendo").text("Seguir").css({"background-color": "#B1BF49", "color": "#ffffff", "border": "none"});
                    }
                }
            } catch (err) {
                console.error("Error al comprobar seguimiento:", err);
            }

            // Cambiar pestaña activa si estaba en guardados
            if ($("#pestana-guardados-perfil").hasClass("activo")) {
                $("#pestana-guardados-perfil").removeClass("activo");
                $("#pestana-creados-perfil").addClass("activo");
            }
        }

        await cargarMisPines(userIdToLoad);
    } catch (error) {
        console.error("Error al cargar perfil:", error);
        showToast("Error", "No se pudo cargar la información del perfil.", "error");
    }
}

async function cargarMisPines(userId) {
    const $mosaico = $("#perfil-mosaico-pines");
    if (!$mosaico.length) return;

    $mosaico.html("<p class='cargando-feed-placeholder'>Cargando tus publicaciones...</p>");
    applyStyles();

    try {
        
        const response = await fetch(`${API_URL}/pins/?user_id=${userId}`);
        if (!response.ok) throw new Error("Error al obtener los pines");
        const pines = await response.json();

        $mosaico.data("mis-pines", pines);

        renderizarPinesLista(pines);
    } catch (error) {
        console.error("Error al cargar pines del perfil:", error);
        $mosaico.html("<p class='feed-error-placeholder'>No se pudieron cargar tus pines.</p>");
        applyStyles();
    }
}

function renderizarPinesLista(pines) {
    const $mosaico = $("#perfil-mosaico-pines");
    $mosaico.empty();

    if (pines.length === 0) {
        $mosaico.html("<p class='cargando-feed-placeholder'>No has publicado ninguna idea aún.</p>");
        applyStyles();
        return;
    }

    pines.forEach(pin => {
        const $article = $("<article>").addClass("pin-tarjeta");
        const imgUrl = pin.image_url || "../assets/placeholder.jpg";
        
        let badgeHtml = "";
        let imgClass = "";
        let overlayHtml = "";

        if (pin.status === "pending") {
            badgeHtml = `<div class="badge-etico pending">⏳ En revisión IA</div>`;
            overlayHtml = `
                <div class="pin-estado-info-overlay pending">
                    <h4>⏳ En Revisión</h4>
                    <p>La IA está evaluando éticamente la descripción e imagen.</p>
                </div>
            `;
        } else if (pin.status === "rejected") {
            badgeHtml = `<div class="badge-etico rejected">❌ Rechazado</div>`;
            imgClass = "imagen-desenfocada";
            overlayHtml = `
                <div class="pin-estado-info-overlay rejected">
                    <h4>⚠️ Bloqueado</h4>
                    <p>${pin.moderation_reason || "Contenido no ético"}</p>
                </div>
            `;
        } else {
            let saved = [];
            try {
                saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
            } catch (err) {
                saved = [];
            }
            const isSaved = saved.includes(pin.id);
            const btnText = isSaved ? "Guardado" : "Guardar";
            const btnClass = isSaved ? "boton-guardar-pin guardado" : "boton-guardar-pin";

            const userStr = localStorage.getItem("user");
            const loggedInUser = userStr ? JSON.parse(userStr) : null;
            const urlParams = new URLSearchParams(window.location.search);
            const targetUserIdStr = urlParams.get("id");
            const isOwnProfile = loggedInUser && (!targetUserIdStr || parseInt(targetUserIdStr, 10) === loggedInUser.id);
            const esPestanaCreados = $("#pestana-creados-perfil").hasClass("activo");

            let deleteBtnHtml = "";
            if (isOwnProfile && esPestanaCreados) {
                deleteBtnHtml = `<button class="boton-eliminar-pin">Eliminar</button>`;
            }

            overlayHtml = `
                <div class="pin-overlay">
                    <div class="pin-overlay-header" style="display: flex; justify-content: space-between; width: 100%; align-items: center; z-index: 2; width: 100%;">
                        ${deleteBtnHtml}
                        <button class="${btnClass}">${btnText}</button>
                    </div>
                    <a href="ver-pin.html?id=${pin.id}" class="pin-overlay-link-cover" aria-label="Ver detalle"></a>
                </div>
            `;
        }

        $article.html(`
            <div class="pin-imagen-contenedor">
                ${badgeHtml}
                <img src="${imgUrl}" alt="${pin.title}" class="pin-imagen ${imgClass}">
                ${overlayHtml}
            </div>
            <div class="pin-info">
                <a href="${pin.status === 'approved' ? 'ver-pin.html?id=' + pin.id : '#'}" class="pin-titulo-link">
                    <h3 class="pin-titulo-mini">${pin.title}</h3>
                </a>
            </div>
        `);

        $article.find(".boton-eliminar-pin").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            mostrarConfirmacionEliminar(async function() {
                try {
                    const userStr = localStorage.getItem("user");
                    if (!userStr) return;
                    const loggedInUser = JSON.parse(userStr);

                    const res = await fetch(`${API_URL}/pins/${pin.id}?user_id=${loggedInUser.id}`, {
                        method: "DELETE"
                    });
                    if (res.ok) {
                        showToast("Publicación", "Publicación eliminada correctamente.", "success");
                        $article.remove();
                        
                        let misPines = $("#perfil-mosaico-pines").data("mis-pines") || [];
                        misPines = misPines.filter(p => p.id !== pin.id);
                        $("#perfil-mosaico-pines").data("mis-pines", misPines);
                    } else {
                        const err = await res.json();
                        showToast("Error", err.detail || "No se pudo eliminar la publicación.", "error");
                    }
                } catch (error) {
                    console.error("Error al eliminar publicación:", error);
                    showToast("Error", "No se pudo conectar con el servidor.", "error");
                }
            });
        });

        $article.find(".boton-guardar-pin").on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            let saved = [];
            try {
                saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
            } catch (err) {
                saved = [];
            }
            const $btn = $(this);
            if (!saved.includes(pin.id)) {
                saved.push(pin.id);
                localStorage.setItem(obtenerLlaveGuardados(), JSON.stringify(saved));
                $btn.text("Guardado").addClass("guardado");
                applyStyles();
                showToast("LookBook Guardado", `¡"${pin.title}" se guardó en tu colección!`, "success");
            } else {
                saved = saved.filter(id => id !== pin.id);
                localStorage.setItem(obtenerLlaveGuardados(), JSON.stringify(saved));
                $btn.text("Guardar").removeClass("guardado");
                applyStyles();
                showToast("LookBook Colección", `"${pin.title}" se eliminó de tu colección.`, "info");
            }
        });

        const $img = $article.find(".pin-imagen");
        $img.on("load", function() {
            $(this).parent().addClass("cargada");
            $(this).css('opacity', '1');
            applyStyles();
        });

        if ($img[0] && $img[0].complete) {
            $img.parent().addClass("cargada");
            $img.css('opacity', '1');
        }

        $mosaico.append($article);
    });
    applyStyles();
}

async function abrirModalLista(tipo, userId) {
    const titulo = tipo === "followers" ? "Seguidores" : "Seguidos";
    try {
        const res = await fetch(`${API_URL}/users/${userId}/${tipo}`);
        if (!res.ok) throw new Error("No se pudo obtener la lista");
        const usuarios = await res.json();

        const listHtml = usuarios.map(u => `
            <div class="user-list-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #D9D5A0;">
                <a href="perfil.html?id=${u.id}" class="user-list-link" style="display: flex; align-items: center; gap: 10px; flex-grow: 1;">
                    <div class="avatar-placeholder" style="width: 36px; height: 36px; font-size: 0.95rem; border-radius: 50%; background-color: #B1BF49; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; text-transform: uppercase; flex-shrink: 0; overflow: hidden; border: 1px solid #D9D5A0;">
                        ${u.avatar_url ? `<img src="${u.avatar_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : u.username.charAt(0).toUpperCase()}
                    </div>
                    <span style="font-weight: 600; color: #2d2a26;">${u.username}</span>
                </a>
            </div>
        `).join('');

        const modalHtml = `
            <div id="modal-lista-usuarios" class="modal-backdrop">
                <div class="modal-contenido" style="max-width: 400px; max-height: 450px; display: flex; flex-direction: column;">
                    <h2 class="modal-titulo" style="margin-bottom: 15px;">${titulo}</h2>
                    <div style="flex-grow: 1; overflow-y: auto; margin-bottom: 15px; padding-right: 5px;">
                        ${usuarios.length === 0 ? `<p style="color: #8C533E; text-align: center; margin-top: 20px;">Nadie por aquí todavía.</p>` : listHtml}
                    </div>
                    <div class="modal-acciones" style="margin-top: auto; text-align: right;">
                        <button type="button" class="boton-accion-secundario" id="btn-cerrar-lista-modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        $("body").append(modalHtml);
        applyStyles();

        $(".user-list-link").on("click", function() {
            $("#modal-lista-usuarios").remove();
        });

        $("#btn-cerrar-lista-modal").on("click", function() {
            $("#modal-lista-usuarios").fadeOut(200, function() {
                $(this).remove();
            });
        });

    } catch (error) {
        console.error("Error al cargar lista:", error);
        showToast("Error", "No se pudo cargar la lista de usuarios.", "error");
    }
}

function mostrarConfirmacionEliminar(onConfirm) {
    $(".modal-backdrop").remove();
    const modalHtml = `
        <div class="modal-backdrop" id="modal-confirmacion-eliminar">
            <div class="modal-contenido" style="text-align: center;">
                <h3 class="modal-titulo" style="text-align: center; margin-top: 0;">¿Seguro desea eliminar?</h3>
                <p style="color: #8C533E; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5; text-align: center;">
                    Esta acción es permanente y no se podrá deshacer.
                </p>
                <div class="modal-acciones" style="justify-content: center; gap: 16px;">
                    <button class="boton-accion-cancelar" id="btn-cancelar-eliminar">Cancelar</button>
                    <button class="boton-enviar" id="btn-confirmar-eliminar" style="background-color: #e11d48;">Eliminar</button>
                </div>
            </div>
        </div>
    `;
    $("body").append(modalHtml);
    applyStyles();

    $("#btn-cancelar-eliminar").on("click", function() {
        $("#modal-confirmacion-eliminar").fadeOut(200, function() {
            $(this).remove();
        });
    });

    $("#btn-confirmar-eliminar").on("click", function() {
        $("#modal-confirmacion-eliminar").fadeOut(200, function() {
            $(this).remove();
        });
        onConfirm();
    });

    $("#modal-confirmacion-eliminar").on("click", function(e) {
        if ($(e.target).hasClass("modal-backdrop")) {
            $(this).fadeOut(200, function() {
                $(this).remove();
            });
        }
    });
}

$(function() {
    cargarPerfil();

    $("#pestana-creados-perfil").on("click", function() {
        $(".perfil-pestañas div").removeClass("activo");
        $(this).addClass("activo");
        applyStyles();
        const pines = $("#perfil-mosaico-pines").data("mis-pines") || [];
        renderizarPinesLista(pines);
    });

    $("#pestana-guardados-perfil").on("click", async function() {
        $(".perfil-pestañas div").removeClass("activo");
        $(this).addClass("activo");
        applyStyles();
        
        const $mosaico = $("#perfil-mosaico-pines");
        $mosaico.html("<p class='cargando-feed-placeholder'>Cargando tus pines guardados...</p>");
        applyStyles();
        
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
        } catch (err) {
            saved = [];
        }
        
        if (saved.length === 0) {
            $mosaico.html("<p class='cargando-feed-placeholder'>No tienes pines guardados aún.</p>");
            applyStyles();
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/pins/`);
            if (!response.ok) throw new Error("Error al obtener los pines");
            const todosLosPines = await response.json();
            const aprobadosGuardados = todosLosPines.filter(p => saved.includes(p.id));
            renderizarPinesLista(aprobadosGuardados);
        } catch (error) {
            console.error("Error al cargar pines guardados:", error);
            $mosaico.html("<p class='feed-error-placeholder'>No se pudieron cargar tus pines guardados.</p>");
            applyStyles();
        }
    });

    $("#btn-compartir-perfil").on("click", function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast("Enlace Copiado", "El enlace a tu perfil ético ha sido copiado al portapapeles.", "success");
        }).catch(() => {
            showToast("Enlace Copiado", "El enlace a tu perfil es: " + url, "info");
        });
    });

    $("#contador-seguidores").on("click", function() {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUserIdStr = urlParams.get("id");
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const userId = targetUserIdStr ? parseInt(targetUserIdStr, 10) : loggedInUser.id;
        abrirModalLista("followers", userId);
    });

    $("#contador-seguidos").on("click", function() {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUserIdStr = urlParams.get("id");
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const userId = targetUserIdStr ? parseInt(targetUserIdStr, 10) : loggedInUser.id;
        abrirModalLista("following", userId);
    });

    $("#btn-seguir-perfil").on("click", async function() {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const loggedInUser = JSON.parse(userStr);
        const urlParams = new URLSearchParams(window.location.search);
        const targetUserId = parseInt(urlParams.get("id"), 10);
        if (!targetUserId) return;

        try {
            const res = await fetch(`${API_URL}/users/${targetUserId}/follow?follower_id=${loggedInUser.id}`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Error en la petición de follow");
            const data = await res.json();

            const $btn = $(this);
            if (data.following) {
                $btn.addClass("siguiendo").text("Siguiendo").css({"background-color": "#2d2a26", "color": "#ffffff", "border": "1px solid #2d2a26"});
                showToast("Usuario", "¡Ahora sigues a este creador!", "success");
            } else {
                $btn.removeClass("siguiendo").text("Seguir").css({"background-color": "#B1BF49", "color": "#ffffff", "border": "none"});
                showToast("Usuario", "Dejaste de seguir a este creador.", "info");
            }

            $("#contador-seguidores").text(`${data.followers_count} seguidores`);
        } catch (error) {
            console.error("Error al seguir/dejar de seguir:", error);
            showToast("Error", "No se pudo actualizar el estado de seguimiento.", "error");
        }
    });

    $("#btn-editar-perfil").on("click", function() {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        let base64Avatar = user.avatar_url || "";
        
        const modalHtml = `
            <div id="modal-editar-perfil" class="modal-backdrop">
                <div class="modal-contenido">
                    <h2 class="modal-titulo">Editar Perfil</h2>
                    <form id="form-editar-perfil">
                        <div class="grupo-formulario">
                            <label class="label-formulario">Nombre de usuario</label>
                            <input type="text" id="edit-username" class="input-formulario" value="${user.username}" required>
                        </div>
                        <div class="grupo-formulario">
                            <label class="label-formulario">Biografía</label>
                            <textarea id="edit-bio" class="crear-textarea" required>${user.bio || ''}</textarea>
                        </div>
                        <div class="grupo-formulario" style="margin-bottom: 18px;">
                            <label class="label-formulario">Foto de Perfil</label>
                            <button type="button" class="boton-accion-secundario" id="btn-cambiar-avatar-modal" style="margin-bottom: 8px;">Seleccionar Imagen</button>
                            <input type="file" id="input-avatar-modal" style="display: none;" accept="image/*">
                            <div id="vista-previa-avatar-modal" style="width: 70px; height: 70px; border-radius: 50%; overflow: hidden; display: ${user.avatar_url ? 'block' : 'none'}; border: 2px solid #D9D5A0;">
                                <img id="img-avatar-modal" src="${user.avatar_url || ''}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                        </div>
                        <div class="modal-acciones">
                            <button type="button" class="boton-accion-secundario" id="btn-cerrar-modal">Cancelar</button>
                            <button type="submit" class="boton-enviar">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        $("body").append(modalHtml);
        applyStyles();
        
        $("#btn-cambiar-avatar-modal").on("click", function() {
            $("#input-avatar-modal").trigger("click");
        });
        
        $("#input-avatar-modal").on("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast("Tamaño excedido", "El archivo excede los 5 MB.", "warning");
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    base64Avatar = event.target.result;
                    $("#img-avatar-modal").attr("src", base64Avatar);
                    $("#vista-previa-avatar-modal").show();
                };
                reader.readAsDataURL(file);
            }
        });
        
        $("#btn-cerrar-modal").on("click", function() {
            $("#modal-editar-perfil").fadeOut(200, function() {
                $(this).remove();
            });
        });
        
        $("#form-editar-perfil").on("submit", async function(e) {
            e.preventDefault();
            const newUsername = $("#edit-username").val().trim();
            const newBio = $("#edit-bio").val().trim();
            
            if (!newUsername || !newBio) {
                showToast("Editar Perfil", "Todos los campos son requeridos.", "warning");
                return;
            }
            
            const payload = {
                username: newUsername,
                bio: newBio,
                avatar_url: base64Avatar || null
            };

            try {
                const res = await fetch(`${API_URL}/users/${user.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    showToast("Error", err.detail || "No se pudo actualizar el perfil", "error");
                    return;
                }

                const updatedUser = await res.json();
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                $("#txt-nombre-completo").text(updatedUser.username);
                $("#nombre-usuario-perfil").text(`@${updatedUser.username.toLowerCase()}`);
                $("#biografia-usuario-perfil").text(updatedUser.bio || "");
                renderizarAvatar("#cabecera-perfil-usuario .avatar-placeholder", updatedUser);
                renderizarAvatar("#link-perfil-usuario .avatar-placeholder", updatedUser);
                
                showToast("Perfil Actualizado", "Tus datos de perfil han sido modificados con éxito.", "success");
                
                $("#modal-editar-perfil").fadeOut(200, function() {
                    $(this).remove();
                });
            } catch (error) {
                console.error("Error al guardar perfil:", error);
                showToast("Error", "No se pudo guardar la información en el servidor.", "error");
            }
        });
    });
});