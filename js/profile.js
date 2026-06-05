var API_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
        window.location.href = "bienvenida.html";
        return;
    }
    const user = JSON.parse(userString);

    // Cargar datos básicos en la interfaz
    const txtNombreCompleto = document.getElementById("txt-nombre-completo");
    const txtNombreUsuario = document.getElementById("nombre-usuario-perfil");
    const txtBiografia = document.getElementById("biografia-usuario-perfil");
    const avatarPlaceholders = document.querySelectorAll("#cabecera-perfil-usuario .avatar-placeholder");

    if (txtNombreCompleto) txtNombreCompleto.textContent = user.username;
    if (txtNombreUsuario) txtNombreUsuario.textContent = `@${user.username.toLowerCase().replace(/\s+/g, "")}`;
    
    avatarPlaceholders.forEach(el => {
        el.textContent = user.username.charAt(0).toUpperCase();
    });

    // Cargar estadísticas y datos detallados desde la API
    try {
        const response = await fetch(`${API_URL}/users/${user.id}`);
        if (response.ok) {
            const fullUser = await response.json();
            if (txtBiografia && fullUser.bio) {
                txtBiografia.textContent = fullUser.bio;
            }
            
            // Cargar imagen de perfil si existe
            if (fullUser.profile_pic) {
                avatarPlaceholders.forEach(el => {
                    el.innerHTML = `<img src="${fullUser.profile_pic}" class="perfil-foto-grande" alt="Foto de perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                });
            }
        }
    } catch (error) {
        console.error("Error al cargar perfil desde API:", error);
    }

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
                        <img src="${imgUrl}" alt="${pin.title}" class="pin-imagen" loading="lazy" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'500\\' height=\\'500\\'%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23f1f5f9\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%2310b981\\' font-family=\\'sans-serif\\' font-weight=\\'bold\\' font-size=\\'20\\' text-anchor=\\'middle\\'%3E${pin.title}%3C/text%3E%3C/svg%3E'">
                        <div class="pin-overlay">
                            <button class="boton-guardar-pin" onclick="event.preventDefault(); toggleGuardarPin(${pin.id}, this)">Guardar</button>
                            <a href="ver-pin.html?id=${pin.id}" class="pin-overlay-link-cover" aria-label="Ver detalle"></a>
                        </div>
                    </div>
                    <div class="pin-info">
                        <a href="ver-pin.html?id=${pin.id}" class="pin-titulo-link">
                            <h3 class="pin-titulo-mini">${pin.title}</h3>
                        </a>
                    </div>
                `;
                mosaico.appendChild(article);
            });
        } catch (error) {
            console.error(`Error al cargar pines de tipo ${tipo}:`, error);
            mosaico.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>No se pudieron cargar los pines de la base de datos.</p>";
        }
    }
});
