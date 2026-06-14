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
    const errorLogin = document.getElementById("error-login");
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("correo").value;
            const password = document.getElementById("contraseña").value;
            
            if (errorLogin) {
                errorLogin.style.display = "none";
                errorLogin.textContent = "";
            }
            
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
                    const errMsg = err.detail || "Error de inicio de sesión";
                    if (errorLogin) {
                        errorLogin.textContent = errMsg;
                        errorLogin.style.display = "block";
                    } else {
                        alert(errMsg);
                    }
                    return;
                }
                
                const data = await response.json();
                localStorage.setItem("user", JSON.stringify(data));
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                const networkErrMsg = "No se pudo conectar con el servidor. Verifica que la API esté corriendo.";
                if (errorLogin) {
                    errorLogin.textContent = networkErrMsg;
                    errorLogin.style.display = "block";
                } else {
                    alert(networkErrMsg);
                }
            }
        });
    }

    // Lógica para Mostrar/Ocultar contraseña
    const chkMostrar = document.getElementById("chk-mostrar-contraseña");
    const inputContraseña = document.getElementById("contraseña");
    if (chkMostrar && inputContraseña) {
        chkMostrar.addEventListener("change", () => {
            if (chkMostrar.checked) {
                inputContraseña.type = "text";
            } else {
                inputContraseña.type = "password";
            }
        });
    }

    // Lógica para Registrarse
    const formRegistro = document.getElementById("formulario-registro");
    const errorRegistro = document.getElementById("error-registro");
    const successRegistro = document.getElementById("success-registro");
    const btnEnviarRegistro = document.getElementById("boton-enviar-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("nombre-usuario").value;
            const email = document.getElementById("correo-registro").value;
            const password = document.getElementById("contrasena-registro").value;
            const confirmPass = document.getElementById("contrasena-confirmar").value;
            
            if (errorRegistro) {
                errorRegistro.style.display = "none";
                errorRegistro.textContent = "";
            }
            if (successRegistro) {
                successRegistro.style.display = "none";
                successRegistro.textContent = "";
            }
            
            if (password !== confirmPass) {
                const passMsg = "Las contraseñas no coinciden.";
                if (errorRegistro) {
                    errorRegistro.textContent = passMsg;
                    errorRegistro.style.display = "block";
                } else {
                    alert(passMsg);
                }
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
                    const errMsg = err.detail || "Error al registrarse";
                    if (errorRegistro) {
                        errorRegistro.textContent = errMsg;
                        errorRegistro.style.display = "block";
                    } else {
                        alert(errMsg);
                    }
                    return;
                }
                
                const successMsg = "¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...";
                if (successRegistro) {
                    successRegistro.textContent = successMsg;
                    successRegistro.style.display = "block";
                    if (btnEnviarRegistro) btnEnviarRegistro.disabled = true;
                } else {
                    alert(successMsg);
                }
                
                setTimeout(() => {
                    window.location.href = "iniciar-sesion.html";
                }, 2000);
                
            } catch (error) {
                console.error("Error al registrarse:", error);
                const netMsg = "No se pudo conectar con el servidor.";
                if (errorRegistro) {
                    errorRegistro.textContent = netMsg;
                    errorRegistro.style.display = "block";
                } else {
                    alert(netMsg);
                }
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
