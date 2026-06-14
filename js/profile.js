var API_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
        window.location.href = "bienvenida.html";
        return;
    }
    let user = JSON.parse(userString);

    // Cargar datos básicos en la interfaz
    const txtNombreCompleto = document.getElementById("txt-nombre-completo");
    const txtNombreUsuario = document.getElementById("nombre-usuario-perfil");
    const txtBiografia = document.getElementById("biografia-usuario-perfil");
    const avatarPlaceholders = document.querySelectorAll("#cabecera-perfil-usuario .avatar-placeholder");

    function renderUserData(data) {
        if (txtNombreCompleto) txtNombreCompleto.textContent = data.username;
        if (txtNombreUsuario) txtNombreUsuario.textContent = `@${data.username.toLowerCase().replace(/\s+/g, "")}`;
        if (txtBiografia) txtBiografia.textContent = data.bio || "¡Bienvenido a tu perfil de LookBook! Aquí se mostrarán tus pines creados y guardados.";
        
        avatarPlaceholders.forEach(el => {
            if (data.profile_pic) {
                el.innerHTML = `<img src="${data.profile_pic}" class="perfil-foto-grande" alt="Foto de perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                el.innerHTML = "";
                el.textContent = data.username.charAt(0).toUpperCase();
            }
        });
    }

    renderUserData(user);

    // Cargar estadísticas y datos detallados desde la API
    async function loadFullProfile() {
        try {
            const response = await fetch(`${API_URL}/users/${user.id}`);
            if (response.ok) {
                const fullUser = await response.json();
                renderUserData(fullUser);
                
                // Actualizar los inputs del modal
                document.getElementById("edit-nombre").value = fullUser.username;
                document.getElementById("edit-bio").value = fullUser.bio || "";
                document.getElementById("edit-foto").value = fullUser.profile_pic || "";
                
                // Cargar estadísticas de seguidores/seguidos
                try {
                    const statsRes = await fetch(`${API_URL}/users/${user.id}/follow-stats`);
                    if (statsRes.ok) {
                        const stats = await statsRes.json();
                        const segCountEl = document.getElementById("seguidores-count");
                        const seguidosCountEl = document.getElementById("seguidos-count");
                        if (segCountEl) segCountEl.textContent = `${stats.followers_count} seguidores`;
                        if (seguidosCountEl) seguidosCountEl.textContent = `${stats.following_count} seguidos`;
                    }
                } catch (statsErr) {
                    console.error("Error al cargar estadísticas de seguidores:", statsErr);
                }
            }
        } catch (error) {
            console.error("Error al cargar perfil desde API:", error);
        }
    }

    await loadFullProfile();

    // Lógica para Pestañas (Creados y Guardados)
    const tabCreados = document.getElementById("pestana-creados-perfil");
    const tabGuardados = document.getElementById("pestana-guardados-perfil");
    const mosaico = document.getElementById("perfil-mosaico-pines");

    if (tabCreados && tabGuardados && mosaico) {
        // Inicialmente cargar Guardados (según diseño original)
        cargarPinesDePerfil("saved");

        tabCreados.addEventListener("click", () => {
            tabGuardados.style.backgroundColor = "transparent";
            tabGuardados.style.color = "var(--text-secondary)";
            tabCreados.style.backgroundColor = "var(--text-primary)";
            tabCreados.style.color = "var(--bg-primary)";
            cargarPinesDePerfil("created");
        });

        tabGuardados.addEventListener("click", () => {
            tabCreados.style.backgroundColor = "transparent";
            tabCreados.style.color = "var(--text-secondary)";
            tabGuardados.style.backgroundColor = "var(--text-primary)";
            tabGuardados.style.color = "var(--bg-primary)";
            cargarPinesDePerfil("saved");
        });
    }

    async function cargarPinesDePerfil(tipo) {
        mosaico.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary);'>Cargando tus pines...</p>";
        
        try {
            const endpoint = tipo === "created" 
                ? `${API_URL}/users/${user.id}/pins` 
                : `${API_URL}/users/${user.id}/saved`;
                
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Error al obtener pines");
            
            const pines = await response.json();
            
            if (pines.length === 0) {
                mosaico.innerHTML = `<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary);'>No tienes pines en esta sección todavía.</p>`;
                return;
            }
            
            mosaico.innerHTML = "";
            pines.forEach(pin => {
                const article = document.createElement("article");
                article.className = "pin-tarjeta";
                
                const imgUrl = pin.image_url || "../assets/placeholder.jpg";
                
                article.innerHTML = `
                    <div class="pin-imagen-contenedor">
                        <img src="${imgUrl}" alt="${pin.title}" class="pin-imagen" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;500&quot; height=&quot;500&quot;><rect width=&quot;100%25&quot; height=&quot;100%25&quot; fill=&quot;%23f1f5f9&quot;/></svg>'">
                        <div class="pin-overlay">
                            <div class="pin-overlay-header" style="display: flex; justify-content: space-between; width: 100%; align-items: center; z-index: 2;">
                                <button class="boton-eliminar-pin" data-pin-id="${pin.id}">Eliminar</button>
                                <button class="boton-guardar-pin" onclick="event.preventDefault(); alert('Pin guardado')">Guardar</button>
                            </div>
                            <a href="ver-pin.html?id=${pin.id}" class="pin-overlay-link-cover" aria-label="Ver detalle"></a>
                        </div>
                    </div>
                    <div class="pin-info">
                        <a href="ver-pin.html?id=${pin.id}" class="pin-titulo-link">
                            <h3 class="pin-titulo-mini">${pin.title}</h3>
                        </a>
                    </div>
                `;
                
                const deleteBtn = article.querySelector(".boton-eliminar-pin");
                if (deleteBtn) {
                    deleteBtn.addEventListener("click", async () => {
                        if (confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
                            try {
                                const response = await fetch(`${API_URL}/pins/${pin.id}`, {
                                    method: "DELETE"
                                });
                                if (response.ok) {
                                    alert("Publicación eliminada");
                                    article.remove();
                                } else {
                                    alert("Error al eliminar (código de respuesta no OK)");
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                    });
                }
                
                mosaico.appendChild(article);
            });
        } catch (error) {
            console.error(`Error al cargar pines de tipo ${tipo}:`, error);
            mosaico.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>No se pudieron cargar los pines de la base de datos.</p>";
        }
    }

    // Gestión del Modal de Edición de Perfil
    const modal = document.getElementById("modal-editar-perfil");
    const btnEditar = document.getElementById("btn-editar-perfil");
    const btnCancelar = document.getElementById("btn-cancelar-edicion");
    const formEditar = document.getElementById("form-editar-perfil");

    if (btnEditar && modal) {
        btnEditar.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }

    if (btnCancelar && modal) {
        btnCancelar.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    if (formEditar) {
        formEditar.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const updatedUsername = document.getElementById("edit-nombre").value.trim();
            const updatedBio = document.getElementById("edit-bio").value.trim();
            const updatedFoto = document.getElementById("edit-foto").value.trim();

            try {
                const response = await fetch(`${API_URL}/users/${user.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: updatedUsername,
                        bio: updatedBio,
                        profile_pic: updatedFoto
                    })
                });

                if (!response.ok) throw new Error("Error al actualizar perfil");
                
                const updatedUser = await response.json();
                
                // Actualizar localStorage session info (mantener id y email)
                user.username = updatedUser.username;
                localStorage.setItem("user", JSON.stringify(user));
                
                // Renderizar datos en UI
                renderUserData(updatedUser);
                
                // Ocultar modal
                modal.style.display = "none";
                alert("¡Perfil actualizado con éxito!");
            } catch (error) {
                console.error("Error al actualizar perfil:", error);
                alert("Ocurrió un error al actualizar los datos en el servidor.");
            }
        });
    }
});
