let API_URL = "http://127.0.0.1:8000/api";

function showToast(title, message, type = "info") {
    const $container = $("#toast-container");
    if (!$container.length) return;
    
    const toastId = "toast-" + Date.now() + Math.floor(Math.random() * 1000);
    const toastHtml = `
        <div id="${toastId}" class="toast-notificacion ${type}">
            <div class="toast-titulo">${title}</div>
            <div class="toast-mensaje">${message}</div>
        </div>
    `;
    
    $container.append(toastHtml);
    applyStyles();
    const $toast = $(`#${toastId}`);
    
    setTimeout(() => {
        $toast.fadeOut(400, function() {
            $(this).remove();
        });
    }, 4500);
}

function renderizarAvatar(selector, user) {
    const $el = $(selector);
    if (!$el.length) return;
    if (user && user.avatar_url) {
        $el.html(`<img src="${user.avatar_url}" class="avatar-imagen" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`);
    } else {
        const letter = user && user.username ? user.username.charAt(0).toUpperCase() : 'U';
        $el.html(letter);
    }
}

async function checkSession() {
    const user = localStorage.getItem("user");
    const currentPage = window.location.pathname.split("/").pop();
    
    const publicPages = ["bienvenida.html", "iniciar-sesion.html", "registro.html", ""];
    if (!user && !publicPages.includes(currentPage)) {
        window.location.href = "bienvenida.html";
        return;
    }
    
    if (user && (currentPage === "iniciar-sesion.html" || currentPage === "registro.html" || currentPage === "bienvenida.html")) {
        window.location.href = "index.html";
        return;
    }

    if (user) {
        const userData = JSON.parse(user);
        // Renderizar el avatar en la barra de navegación superior
        renderizarAvatar("#link-perfil-usuario .avatar-placeholder", userData);

        // Sincronizar datos del usuario en segundo plano (avatar, bio, etc.)
        try {
            const response = await fetch(`${API_URL}/users/${userData.id}`);
            if (response.ok) {
                const freshUserData = await response.json();
                localStorage.setItem("user", JSON.stringify(freshUserData));
                renderizarAvatar("#link-perfil-usuario .avatar-placeholder", freshUserData);
            }
        } catch (e) {
            console.error("Error al sincronizar datos del usuario:", e);
        }
    }
}

$(function() {
    checkSession();

    const $formLogin = $("#formulario-autenticacion");
    if ($formLogin.length) {
        $formLogin.on("submit", async function(e) {
            e.preventDefault();
            const email = $("#correo").val();
            const password = $("#contraseña").val();
            
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
                    showToast("Inicio de Sesión", err.detail || "Error de inicio de sesión", "error");
                    return;
                }
                
                const data = await response.json();
                localStorage.setItem("user", JSON.stringify(data));
                
                showToast("Bienvenido", "Sesión iniciada con éxito.", "success");
                
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                showToast("Error", "No se pudo conectar con el servidor. Verifica que la API esté corriendo.", "error");
            }
        });
    }

    // Lógica para Mostrar/Ocultar contraseña
    const $chkMostrar = $("#chk-mostrar-contraseña");
    const $inputContraseña = $("#contraseña");
    if ($chkMostrar.length && $inputContraseña.length) {
        $chkMostrar.on("change", function() {
            if ($(this).is(":checked")) {
                $inputContraseña.attr("type", "text");
            } else {
                $inputContraseña.attr("type", "password");
            }
        });
    }

    const $formRegistro = $("#formulario-registro");
    if ($formRegistro.length) {
        $formRegistro.on("submit", async function(e) {
            e.preventDefault();
            
            const terminosAceptados = $("#chk-terminos-registro").is(":checked");
            if (!terminosAceptados) {
                showToast("Registro", "Debes aceptar los Términos de la Comunidad y la Política de Privacidad Ética.", "warning");
                return;
            }
            
            const username = $("#nombre-usuario").val();
            const email = $("#correo-registro").val();
            const password = $("#contrasena-registro").val();
            const confirmPass = $("#contrasena-confirmar").val();
            
            if (password !== confirmPass) {
                showToast("Registro", "Las contraseñas no coinciden.", "warning");
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
                    showToast("Registro", err.detail || "Error al registrarse", "error");
                    return;
                }
                
                showToast("Registro Exitoso", "¡Cuenta creada con éxito! Redirigiendo...", "success");
                setTimeout(() => {
                    window.location.href = "iniciar-sesion.html";
                }, 1500);
            } catch (error) {
                console.error("Error al registrarse:", error);
                showToast("Error", "No se pudo conectar con el servidor.", "error");
            }
        });
    }

    const $btnCerrarSesion = $("#btn-cerrar-sesion");
    if ($btnCerrarSesion.length) {
        $btnCerrarSesion.on("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("user");
            window.location.href = "bienvenida.html";
        });
    }
});