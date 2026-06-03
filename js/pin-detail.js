var API_URL = "http://127.0.0.1:8000/api";

async function cargarDetallePin() {
    // Obtener ID del pin desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const pinId = urlParams.get("id");
    
    if (!pinId) {
        alert("Publicación no especificada.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/pins/${pinId}`);
        if (!response.ok) throw new Error("No se pudo cargar la publicación");
        const pin = await response.json();

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

        // 4. Cargar información de creador si es posible (en este caso el email o username)
        const creatorNameElement = document.querySelector(".creador-nombre");
        if (creatorNameElement) {
            // Buscaremos el usuario usando la API
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
    } catch (error) {
        console.error("Error al cargar el detalle del pin:", error);
        alert("Error: No se pudo cargar el detalle de esta idea.");
        window.location.href = "index.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDetallePin();
});
