var API_URL = "http://127.0.0.1:8000/api";

// Verificación de sesión en páginas protegidas
function checkSession() {
    const user = localStorage.getItem("user");
    const currentPage = window.location.pathname.split("/").pop();
    
    // Si no está logueado y está en una página protegida, redirigir
    const publicPages = ["bienvenida.html", "iniciar-sesion.html", "registro.html", ""];
    if (!user && !publicPages.includes(currentPage)) {
        window.location.href = "bienvenida.html";
    }
    
    // Si ya está logueado e intenta ir a login o registro, redirigir al feed
    if (user && (currentPage === "iniciar-sesion.html" || currentPage === "registro.html" || currentPage === "bienvenida.html")) {
        window.location.href = "index.html";
    }

    // Cargar información del perfil en el header si está logueado
    if (user) {
        const userData = JSON.parse(user);
        const avatarPlaceholder = document.querySelector(".avatar-placeholder");
        if (avatarPlaceholder) {
            // Mostrar la primera letra del usuario en mayúscula
            avatarPlaceholder.textContent = userData.username.charAt(0).toUpperCase();
        }
    }
}

// Ejecutar verificación de sesión inmediatamente al cargar el archivo
document.addEventListener("DOMContentLoaded", () => {
    checkSession();

    // Lógica para Iniciar Sesión
    const formLogin = document.getElementById("formulario-autenticacion");
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("correo").value;
            const password = document.getElementById("contraseña").value;
            
            try {
                const response = await fetch(`${API_URL}/users/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    alert(err.detail || "Error de inicio de sesión");
                    return;
                }
                
                const data = await response.json();
                localStorage.setItem("user", JSON.stringify(data));
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                alert("No se pudo conectar con el servidor. Verifica que la API esté corriendo.");
            }
        });
    }

    // Lógica para Registrarse
    const formRegistro = document.getElementById("formulario-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("nombre-usuario").value;
            const email = document.getElementById("correo-registro").value;
            const password = document.getElementById("contrasena-registro").value;
            const confirmPass = document.getElementById("contrasena-confirmar").value;
            
            if (password !== confirmPass) {
                alert("Las contraseñas no coinciden.");
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/users/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, email, password })
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    alert(err.detail || "Error al registrarse");
                    return;
                }
                
                alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
                window.location.href = "iniciar-sesion.html";
            } catch (error) {
                console.error("Error al registrarse:", error);
                alert("No se pudo conectar con el servidor.");
            }
        });
    }

    // Lógica para Cerrar Sesión
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("user");
            window.location.href = "bienvenida.html";
        });
    }
});
