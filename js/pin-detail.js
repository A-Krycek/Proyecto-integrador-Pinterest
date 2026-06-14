const API_URL = "http://127.0.0.1:8000/api";

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

async function cargarDetallePin() {
    const urlParams = new URLSearchParams(window.location.search);
    const pinId = urlParams.get("id");
    if (!pinId) {
        showToast("Error", "Publicación no especificada.", "error");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/pins/${pinId}`);
        if (!response.ok) throw new Error("No se pudo cargar la publicación");
        const pin = await response.json();
        const $imgElement = $(".pin-detalle-imagen img");
        if ($imgElement.length) {
            $imgElement.attr("src", pin.image_url || "../assets/placeholder.jpg");
            $imgElement.attr("alt", pin.title);
            $imgElement.hide().fadeIn(600);
        }
        $(".pin-detalle-titulo").text(pin.title);
        $(".pin-detalle-descripcion").text(pin.description);
        let tagsHtml = "";
        if (pin.tags) {
            const tagsList = pin.tags.split(",").map(t => t.trim()).filter(Boolean);
            tagsHtml = '<div class="pin-detalle-tags">';
            tagsList.forEach(tag => {
                tagsHtml += `<span class="pin-tag">#${tag}</span>`;
            });
            tagsHtml += '</div>';
        }
        $(".pin-detalle-tags").remove();
        $(".pin-detalle-descripcion").after(tagsHtml);
        const $creatorName = $(".creador-nombre");
        if ($creatorName.length) {
            try {
                const userResponse = await fetch(`${API_URL}/users/${pin.user_id}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    
                    // Hacer que el nombre y el avatar sean enlaces al perfil
                    $creatorName.html(`<a href="perfil.html?id=${userData.id}">${userData.username}</a>`);
                    
                    const $creatorAvatar = $(".pin-detalle-creador .avatar-placeholder");
                    if ($creatorAvatar.length) {
                        renderizarAvatar(".pin-detalle-creador .avatar-placeholder", userData);
                        // Envolver avatar en enlace
                        $creatorAvatar.wrap(`<a href="perfil.html?id=${userData.id}"></a>`);
                    }

                    // Renderizar número de seguidores dinámico
                    $(".creador-seguidores").text(`${userData.followers_count} seguidores`);

                    // Comprobar estado de seguimiento si hay un usuario logueado
                    const loggedInUserStr = localStorage.getItem("user");
                    if (loggedInUserStr) {
                        const loggedInUser = JSON.parse(loggedInUserStr);
                        if (loggedInUser.id === userData.id) {
                            // Si es el propio usuario logueado, ocultar botón seguir
                            $(".boton-seguir").hide();
                        } else {
                            $(".boton-seguir").show();
                            const followRes = await fetch(`${API_URL}/users/${userData.id}/is-following?follower_id=${loggedInUser.id}`);
                            if (followRes.ok) {
                                const followData = await followRes.json();
                                const $btn = $(".boton-seguir");
                                if (followData.following) {
                                    $btn.addClass("siguiendo").text("Siguiendo").css("background-color", "var(--bg-tertiary)");
                                } else {
                                    $btn.removeClass("siguiendo").text("Seguir").css("background-color", "var(--brand-color)");
                                }
                            }
                        }
                    } else {
                        // Si no hay sesión, ocultar botón seguir
                        $(".boton-seguir").hide();
                    }
                }
            } catch (error) {
                console.error("Error al cargar creador:", error);
                $creatorName.text("Usuario de LookBook");
            }
        }
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
        } catch (err) {
            saved = [];
        }
        const isSaved = saved.includes(parseInt(pinId, 10));
        const $btn = $(".pin-detalle-acciones .boton-guardar-pin");
        if (isSaved) {
            $btn.text("Guardado").addClass("guardado");
        } else {
            $btn.text("Guardar").removeClass("guardado");
        }
        cargarComentarios(pinId);
        cargarRecomendaciones(pin.category_id, pin.user_id, pin.id, pin.tags, pin.image_url);
        applyStyles();
    } catch (error) {
        console.error("Error al cargar el detalle del pin:", error);
        showToast("Error", "No se pudo cargar el detalle de esta idea.", "error");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    }
}

function cargarComentarios(pinId) {
    const $lista = $(".lista-comentarios");
    if (!$lista.length) return;
    $lista.empty();
    let comments = [];
    const stored = localStorage.getItem(`comments_pin_${pinId}`);
    if (stored === null) {
        if (pinId == "1" || pinId === 1) {
            comments = [
                { author: "Ana Gómez", text: "Me encanta el balance de colores y la simetría. Muy limpio." },
                { author: "Carlos Ramos", text: "Excelente trabajo con la proporción. Inspirador." }
            ];
            localStorage.setItem(`comments_pin_${pinId}`, JSON.stringify(comments));
        } else {
            comments = [];
        }
    } else {
        try {
            comments = JSON.parse(stored) || [];
        } catch (e) {
            comments = [];
        }
    }
    comments.forEach(c => {
        const $item = $("<div>").addClass("comentario-item").html(`
            <span class="comentario-autor">${c.author}:</span>
            <span>${c.text}</span>
        `);
        $lista.append($item);
    });
    $(".pin-detalle-comentarios h3").text(`Comentarios (${comments.length})`);
    applyStyles();
}

$(function() {
    cargarDetallePin();

    const loggedInUserStr = localStorage.getItem("user");
    if (loggedInUserStr) {
        const loggedInUser = JSON.parse(loggedInUserStr);
        renderizarAvatar(".formulario-comentario .avatar-placeholder", loggedInUser);
    }

    $(document).on("click", ".pin-detalle-acciones .boton-guardar-pin", function(e) {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const pinIdStr = urlParams.get("id");
        if (!pinIdStr) return;
        const pinId = parseInt(pinIdStr, 10);
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
        } catch (err) {
            saved = [];
        }
        const $btn = $(this);
        if (!saved.includes(pinId)) {
            saved.push(pinId);
            localStorage.setItem(obtenerLlaveGuardados(), JSON.stringify(saved));
            $btn.text("Guardado").addClass("guardado");
            applyStyles();
            showToast("LookBook Guardado", "¡Esta idea se guardó en tu colección!", "success");
        } else {
            saved = saved.filter(id => id !== pinId);
            localStorage.setItem(obtenerLlaveGuardados(), JSON.stringify(saved));
            $btn.text("Guardar").removeClass("guardado");
            applyStyles();
            showToast("LookBook Colección", "Esta idea se eliminó de tu colección.", "info");
        }
    });

    $(".boton-seguir").on("click", async function() {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            showToast("Acceso Restringido", "Debes iniciar sesión para seguir creadores.", "warning");
            return;
        }
        const loggedInUser = JSON.parse(userStr);
        
        // Obtener el ID del creador desde la URL del perfil en el enlace del nombre
        const $link = $(".creador-nombre a");
        if (!$link.length) return;
        const href = $link.attr("href");
        const match = href.match(/id=(\d+)/);
        if (!match) return;
        const creatorId = parseInt(match[1], 10);

        try {
            const res = await fetch(`${API_URL}/users/${creatorId}/follow?follower_id=${loggedInUser.id}`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Error en la petición de follow");
            const data = await res.json();

            const $btn = $(this);
            if (data.following) {
                $btn.addClass("siguiendo").text("Siguiendo").css("background-color", "var(--bg-tertiary)");
                showToast("Creador", "¡Ahora sigues a este creador!", "success");
            } else {
                $btn.removeClass("siguiendo").text("Seguir").css("background-color", "var(--brand-color)");
                showToast("Creador", "Dejaste de seguir a este creador.", "info");
            }

            $(".creador-seguidores").text(`${data.followers_count} seguidores`);
        } catch (error) {
            console.error("Error al seguir/dejar de seguir:", error);
            showToast("Error", "No se pudo actualizar el seguimiento.", "error");
        }
    });

    const $formComentario = $(".formulario-comentario");
    if ($formComentario.length) {
        $formComentario.on("submit", function(e) {
            e.preventDefault();
            const $input = $(this).find(".input-comentario");
            const commentText = $input.val().trim();
            if (!commentText) return;
            const urlParams = new URLSearchParams(window.location.search);
            const pinId = urlParams.get("id");
            if (!pinId) return;
            const user = localStorage.getItem("user");
            let username = "Tú";
            if (user) {
                username = JSON.parse(user).username;
            }
            let comments = [];
            const stored = localStorage.getItem(`comments_pin_${pinId}`);
            if (stored) {
                try {
                    comments = JSON.parse(stored) || [];
                } catch (err) {
                    comments = [];
                }
            }
            comments.push({ author: username, text: commentText });
            localStorage.setItem(`comments_pin_${pinId}`, JSON.stringify(comments));
            $input.val("");
            cargarComentarios(pinId);
            showToast("Comentario", "Tu comentario ético fue publicado.", "success");
        });
    }
    $(document).on("click", ".pin-tag", function() {
        const tagText = $(this).text().replace("#", "");
        window.location.href = `index.html?busqueda=${encodeURIComponent(tagText)}`;
    });
});

async function cargarRecomendaciones(categoryId, artistId, currentPinId, tagsString, currentImageUrl) {
    const $mosaico = $(".mosaico-recomendado");
    if (!$mosaico.length) return;
    
    $mosaico.html("<p style='grid-column: 1/-1; text-align: center; color: #8C533E; font-weight: 600;'>Cargando recomendaciones...</p>");
    applyStyles();

    try {
        let tags = [];
        if (tagsString) {
            tags = tagsString.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
        }

        const fetchPromises = [];

        // 1. Cargar por categoría
        fetchPromises.push(fetch(`${API_URL}/pins/?category_id=${categoryId}`).then(r => r.ok ? r.json() : []));

        // 2. Cargar por creador
        fetchPromises.push(fetch(`${API_URL}/pins/?user_id=${artistId}`).then(r => r.ok ? r.json() : []));

        // 3. Cargar por tags/búsquedas de coincidencia (máximo las primeras 3 tags para evitar exceso de peticiones)
        const selectedTags = tags.slice(0, 3);
        selectedTags.forEach(tag => {
            fetchPromises.push(fetch(`${API_URL}/pins/?q=${encodeURIComponent(tag)}`).then(r => r.ok ? r.json() : []));
        });

        const results = await Promise.all(fetchPromises);

        const categoryPines = results[0];
        const artistPines = results[1];
        const tagPinesArrays = results.slice(2);

        let tagPines = [];
        tagPinesArrays.forEach(arr => {
            tagPines = tagPines.concat(arr);
        });

        // Orden de prioridad:
        // 1. Pines que coinciden por tags/búsqueda (relación directa por términos como gengar, pokemon)
        // 2. Pines del mismo artista (relación de autor)
        // 3. Pines de la misma categoría (relación de temática general)
        let combinedPines = [...tagPines, ...artistPines, ...categoryPines];

        // Filtrar el pin actual por ID e imagen para evitar duplicar el pin actual
        combinedPines = combinedPines.filter(p => parseInt(p.id, 10) !== parseInt(currentPinId, 10) && p.image_url !== currentImageUrl);

        // Eliminar duplicados
        const uniquePines = [];
        const seenIds = new Set();
        for (const pin of combinedPines) {
            if (!seenIds.has(pin.id)) {
                seenIds.add(pin.id);
                uniquePines.push(pin);
            }
        }

        renderizarRecomendaciones(uniquePines);
    } catch (error) {
        console.error("Error al cargar recomendaciones:", error);
        $mosaico.html("<p style='grid-column: 1/-1; text-align: center; color: #ef4444;'>No se pudieron cargar las recomendaciones.</p>");
    }
}

function renderizarRecomendaciones(pines) {
    const $mosaico = $(".mosaico-recomendado");
    $mosaico.empty();

    if (pines.length === 0) {
        $mosaico.html("<p style='grid-column: 1/-1; text-align: center; color: #8C533E;'>No hay ideas similares disponibles.</p>");
        applyStyles();
        return;
    }

    pines.forEach(pin => {
        const $article = $("<article>").addClass("pin-tarjeta");
        const imgUrl = pin.image_url || "../assets/placeholder.jpg";
        
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
        } catch (err) {
            saved = [];
        }
        const isSaved = saved.includes(pin.id);
        const btnText = isSaved ? "Guardado" : "Guardar";
        const btnClass = isSaved ? "boton-guardar-pin guardado" : "boton-guardar-pin";

        $article.html(`
            <div class="pin-imagen-contenedor">
                <img src="${imgUrl}" alt="${pin.title}" class="pin-imagen" style="opacity: 0; transition: opacity 0.5s ease-in-out;">
                <div class="pin-overlay">
                    <button class="${btnClass}">${btnText}</button>
                    <a href="ver-pin.html?id=${pin.id}" class="pin-overlay-link-cover" aria-label="Ver detalle"></a>
                </div>
            </div>
            <div class="pin-info">
                <a href="ver-pin.html?id=${pin.id}" class="pin-titulo-link">
                    <h3 class="pin-titulo-mini">${pin.title}</h3>
                </a>
            </div>
        `);

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