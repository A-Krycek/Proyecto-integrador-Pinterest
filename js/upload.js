var API_URL = "http://127.0.0.1:8000/api";

// Cargar categorías dinámicas en el <select>
async function cargarCategoriasSelect() {
    const selectCat = document.getElementById("categoria-select");
    if (!selectCat) return;

    try {
        const response = await fetch(`${API_URL}/categories/`);
        if (!response.ok) throw new Error("Error al obtener las categorías");
        const categorias = await response.json();

        selectCat.innerHTML = '<option value="" disabled selected>Selecciona una categoría...</option>';
        categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            selectCat.appendChild(opt);
        });
    } catch (error) {
        console.error("Error al cargar categorías en select:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarCategoriasSelect();

    let base64Image = "";
    
    // Gestión del botón personalizado y el input de archivo real
    const inputArchivo = document.getElementById("input-archivo-real");
    const btnActivar = document.getElementById("btn-activar-subida");
    const imgVistaPrevia = document.getElementById("img-vista-previa");
    const txtEstado = document.getElementById("txt-estado-subida");

    if (btnActivar && inputArchivo) {
        btnActivar.addEventListener("click", () => {
            inputArchivo.click();
        });

        inputArchivo.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                // Verificar límite de tamaño (ej. 20MB de la etiqueta)
                if (file.size > 20 * 1024 * 1024) {
                    alert("El archivo excede los 20 MB sugeridos.");
                    inputArchivo.value = "";
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    base64Image = event.target.result;
                    if (imgVistaPrevia) {
                        imgVistaPrevia.src = base64Image;
                        imgVistaPrevia.style.display = "block";
                    }
                    if (txtEstado) {
                        txtEstado.textContent = `Archivo cargado: ${file.name}`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Procesar el formulario de subida
    const formSubida = document.getElementById("formulario-subida");
    if (formSubida) {
        formSubida.addEventListener("submit", async (e) => {
            e.preventDefault();

            const user = localStorage.getItem("user");
            if (!user) {
                alert("Debes iniciar sesión para publicar.");
                window.location.href = "iniciar-sesion.html";
                return;
            }
            const userData = JSON.parse(user);

            const title = document.getElementById("input-titulo-pin").value.trim();
            const description = document.getElementById("textarea-desc-pin").value.trim();
            const categoryId = document.getElementById("categoria-select").value;
            
            // Obtener etiquetas (tags) si existe el campo
            const inputTags = document.getElementById("input-tags-pin");
            const tags = inputTags ? inputTags.value.trim() : "general";

            // Si no se cargó una imagen por archivo, usamos un placeholder basado en el título
            let imageUrl = base64Image;
            if (!imageUrl) {
                const colorRandom = Math.floor(Math.random()*16777215).toString(16);
                imageUrl = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23${colorRandom}'/%3E%3Ctext x='50%25' y='50%25' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='24' text-anchor='middle'%3E${title}%3C/text%3E%3C/svg%3E`;
            }

            // Generar slug
            const slug = title.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            const pinPayload = {
                title: title,
                slug: slug,
                description: description,
                image_url: imageUrl,
                tags: tags,
                category_id: parseInt(categoryId),
                user_id: userData.id
            };

            try {
                const response = await fetch(`${API_URL}/pins/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pinPayload)
                });

                if (!response.ok) {
                    const err = await response.json();
                    // Capturar el error del filtro de contenido ético (HTTP 400)
                    alert(err.detail || "Error al publicar la idea.");
                    return;
                }

                alert("¡Idea publicada con éxito en tu LookBook!");
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error al publicar pin:", error);
                alert("No se pudo conectar con el servidor. Revisa si la API está encendida.");
            }
        });
    }
});
