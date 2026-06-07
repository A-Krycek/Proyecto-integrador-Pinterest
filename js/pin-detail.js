var API_URL = "http://127.0.0.1:8000/api";
var currentPinId = null;
var creatorId = null;

async function cargarDetallePin() {
    const urlParams = new URLSearchParams(window.location.search);
    const pinId = urlParams.get("id");
    currentPinId = pinId;
    
    if (!pinId) {
        alert("Publicación no especificada.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/pins/${pinId}`);
        if (!response.ok) throw new Error("No se pudo cargar la publicación");
        const pin = await response.json();
        creatorId = pin.user_id;

        // 1. Mostrar Imagen
        const imgElement = document.querySelector(".pin-detalle-imagen img");
        if (imgElement) {
            imgElement.src = pin.image_url || "../assets/placeholder.jpg";
            imgElement.alt = pin.title;
        }

        // 2. Mostrar Título
        const titleElement = document.querySelector(".pin-detalle-titulo");
        if (titleElement) {
            titleElement.textContent = pin.title;
        }

        // 3. Mostrar Descripción
        const descElement = document.querySelector(".pin-detalle-descripcion");
        if (descElement) {
            descElement.textContent = pin.description;
        }

        // 4. Cargar información de creador
        const creatorNameElement = document.getElementById("creador-nombre-txt");
        if (creatorNameElement) {
            try {
                const userResponse = await fetch(`${API_URL}/users/${pin.user_id}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    creatorNameElement.textContent = userData.username;
                    
                    const creatorAvatar = document.querySelector(".pin-detalle-creador .avatar-placeholder");
                    if (creatorAvatar) {
                        creatorAvatar.textContent = userData.username.charAt(0).toUpperCase();
                    }
                }
            } catch (error) {
                console.error("Error al cargar creador:", error);
                creatorNameElement.textContent = "Usuario de LookBook";
            }
        }

        // Cargar estadísticas de seguimiento y comentarios
        await cargarEstadisticasSeguidores(creatorId);
        await verificarEstadoSeguimiento(creatorId);
        await cargarComentarios(pinId);
        await cargarRecomendados(pin.category_id, pinId);

    } catch (error) {
        console.error("Error al cargar el detalle del pin:", error);
        alert("Error: No se pudo cargar el detalle de esta idea.");
        window.location.href = "index.html";
    }
}

async function cargarEstadisticasSeguidores(userId) {
    const elCount = document.getElementById("creador-seguidores-count");
    if (!elCount) return;
    try {
        const res = await fetch(`${API_URL}/users/${userId}/follow-stats`);
        if (res.ok) {
            const stats = await res.json();
            elCount.textContent = `${stats.followers_count} seguidores`;
        }
    } catch (error) {
        console.error("Error al obtener estadísticas de follow:", error);
    }
}

async function verificarEstadoSeguimiento(targetId) {
    const btn = document.getElementById("btn-seguir-usuario");
    if (!btn) return;

    const userString = localStorage.getItem("user");
    if (!userString) return;
    const user = JSON.parse(userString);

    if (user.id == targetId) {
        btn.style.display = "none"; // Ocultar si es su propio pin
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users/${user.id}/follow-status/${targetId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.is_following) {
                btn.textContent = "Siguiendo";
                btn.classList.add("siguiendo");
                btn.style.backgroundColor = "var(--text-primary)";
                btn.style.color = "var(--bg-primary)";
            } else {
                btn.textContent = "Seguir";
                btn.classList.remove("siguiendo");
                btn.style.backgroundColor = "var(--bg-tertiary)";
                btn.style.color = "var(--text-primary)";
            }
        }
    } catch (error) {
        console.error("Error al verificar seguimiento:", error);
    }
}

async function cargarComentarios(pinId) {
    const contenedor = document.getElementById("contenedor-comentarios");
    const titulo = document.getElementById("comentarios-titulo");
    if (!contenedor) return;

    try {
        const response = await fetch(`${API_URL}/pins/${pinId}/comments`);
        if (response.ok) {
            const comentarios = await response.json();
            if (titulo) titulo.textContent = `Comentarios (${comentarios.length})`;
            
            contenedor.innerHTML = "";
            comentarios.forEach(com => {
                const div = document.createElement("div");
                div.className = "comentario-item";
                div.innerHTML = `
                    <span class="comentario-autor" style="font-weight:700;">${com.username || 'Usuario'}:</span>
                    <span>${com.content}</span>
                `;
                contenedor.appendChild(div);
            });
        }
    } catch (error) {
        console.error("Error al cargar comentarios:", error);
    }
}

async function cargarRecomendados(categoryId, currentPinId) {
    const mosaico = document.getElementById("mosaico-recomendado");
    if (!mosaico) return;

    try {
        const response = await fetch(`${API_URL}/pins/?category_id=${categoryId}`);
        if (response.ok) {
            const pines = await response.json();
            const filtrados = pines.filter(p => p.id != currentPinId).slice(0, 6);
            
            if (filtrados.length === 0) {
                mosaico.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary);'>No hay más ideas en esta categoría.</p>";
                return;
            }

            mosaico.innerHTML = "";
            filtrados.forEach(pin => {
                const article = document.createElement("article");
                article.className = "pin-tarjeta";
                
                const imgUrl = pin.image_url || "../assets/placeholder.jpg";
                
                article.innerHTML = `
                    <div class="pin-imagen-contenedor">
                        <img src="${imgUrl}" alt="${pin.title}" class="pin-imagen" loading="lazy" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'500\\' height=\\'500\\'%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23f1f5f9\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%2310b981\\' font-family=\\'sans-serif\\' font-weight=\\'bold\\' font-size=\\'20\\' text-anchor=\\'middle\\'%3E${pin.title}%3C/text%3E%3C/svg%3E'">
                        <div class="pin-overlay">
                            <button class="boton-guardar-pin" onclick="event.preventDefault(); alert('Pin guardado')">Guardar</button>
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
        }
    } catch (error) {
        console.error("Error al cargar recomendados:", error);
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarDetallePin();

    const userString = localStorage.getItem("user");
    if (userString) {
        const user = JSON.parse(userString);
        const commentAvatar = document.getElementById("comentario-avatar-usuario");
        if (commentAvatar) {
            commentAvatar.textContent = user.username.charAt(0).toUpperCase();
        }
    }

    // Gestionar botón de Seguir
    const btnSeguir = document.getElementById("btn-seguir-usuario");
    if (btnSeguir) {
        btnSeguir.addEventListener("click", async () => {
            if (!userString) {
                alert("Debes iniciar sesión para seguir usuarios.");
                window.location.href = "iniciar-sesion.html";
                return;
            }
            const user = JSON.parse(userString);
            if (!creatorId) return;

            const esSiguiendo = btnSeguir.classList.contains("siguiendo");
            const method = esSiguiendo ? "DELETE" : "POST";
            const endpoint = esSiguiendo 
                ? `${API_URL}/users/${user.id}/unfollow/${creatorId}`
                : `${API_URL}/users/${user.id}/follow/${creatorId}`;

            try {
                const res = await fetch(endpoint, { method: method });
                if (res.ok) {
                    await verificarEstadoSeguimiento(creatorId);
                    await cargarEstadisticasSeguidores(creatorId);
                }
            } catch (error) {
                console.error("Error al cambiar estado de seguimiento:", error);
            }
        });
    }

    // Gestionar envío de comentarios
    const formComentario = document.getElementById("form-comentario");
    if (formComentario) {
        formComentario.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!userString) {
                alert("Debes iniciar sesión para comentar.");
                window.location.href = "iniciar-sesion.html";
                return;
            }
            const user = JSON.parse(userString);
            const input = document.getElementById("input-nuevo-comentario");
            const content = input.value.trim();
            if (!content || !currentPinId) return;

            try {
                const response = await fetch(`${API_URL}/pins/${currentPinId}/comments`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: content,
                        user_id: user.id
                    })
                });

                if (response.ok) {
                    input.value = "";
                    await cargarComentarios(currentPinId);
                } else {
                    const err = await response.json();
                    alert(err.detail || "Error al comentar.");
                }
            } catch (error) {
                console.error("Error al publicar comentario:", error);
            }
        });
    }
});
