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
});
