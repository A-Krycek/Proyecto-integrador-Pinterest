
const API_URL = "http://127.0.0.1:8000/api";

async function cargarCategoriasSelect() {
    const $selectCat = $("#categoria-select");
    if (!$selectCat.length) return;
    try {
        const response = await fetch(`${API_URL}/categories/`);
        if (!response.ok) throw new Error("Error al obtener las categorías");
        const categorias = await response.json();
        $selectCat.html('<option value="" disabled selected>Selecciona una categoría...</option>');
        categorias.forEach(cat => {
            const $opt = $("<option>").val(cat.id).text(cat.name);
            $selectCat.append($opt);
        });
        $selectCat.append('<option value="add-new-category" style="font-weight: bold; color: var(--brand-color);">+ Añadir nueva categoría...</option>');
    } catch (error) {
        console.error("Error al cargar categorías en select:", error);
    }
}

$(function() {
    cargarCategoriasSelect();
    $("#categoria-select").on("change", function() {
        const selectedValue = $(this).val();
        if (selectedValue === "add-new-category") {
            const modalHtml = `
                <div id="modal-nueva-categoria" class="modal-backdrop">
                    <div class="modal-contenido">
                        <h2 class="modal-titulo">Añadir Nueva Categoría</h2>
                        <form id="form-nueva-categoria">
                            <div class="grupo-formulario">
                                <label class="label-formulario">Nombre de la Categoría</label>
                                <input type="text" id="new-cat-name" class="input-formulario" placeholder="Ej. Arte Moderno" required autocomplete="off">
                            </div>
                            <div class="modal-acciones">
                                <button type="button" class="boton-accion-secundario" id="btn-cancelar-cat">Cancelar</button>
                                <button type="submit" class="boton-enviar" id="btn-crear-cat">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            $("body").append(modalHtml);
            applyStyles();
            $("#btn-cancelar-cat").on("click", function() {
                $("#modal-nueva-categoria").fadeOut(200, function() {
                    $(this).remove();
                });
                $("#categoria-select").val("");
                applyStyles();
            });
            $("#form-nueva-categoria").on("submit", async function(e) {
                e.preventDefault();
                const name = $("#new-cat-name").val().trim();
                if (!name) return;
                const slug = name.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                const randomColor = Math.floor(Math.random()*16777215).toString(16);
                const image = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23${randomColor}'/%3E%3Ctext x='50%25' y='50%25' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='20' text-anchor='middle'%3E${name}%3C/text%3E%3C/svg%3E`;
                try {
                    const response = await fetch(`${API_URL}/categories/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ name, slug, image })
                    });
                    if (!response.ok) {
                        const err = await response.json();
                        showToast("Error", err.detail || "No se pudo crear la categoría.", "error");
                        return;
                    }
                    const newCat = await response.json();
                    showToast("Categoría Creada", `¡Categoría "${newCat.name}" añadida con éxito!`, "success");
                    $("#modal-nueva-categoria").fadeOut(200, function() {
                        $(this).remove();
                    });
                    await cargarCategoriasSelect();
                    $("#categoria-select").val(newCat.id);
                    applyStyles();
                } catch (error) {
                    console.error("Error al crear categoría:", error);
                    showToast("Error", "No se pudo conectar con el servidor.", "error");
                }
            });
        }
    });
    let base64Image = "";
    const $inputArchivo = $("#input-archivo-real");
    const $btnActivar = $("#btn-activar-subida");
    const $imgVistaPrevia = $("#img-vista-previa");
    const $txtEstado = $("#txt-estado-subida");
    if ($btnActivar.length && $inputArchivo.length) {
        $btnActivar.on("click", function() {
            $inputArchivo.trigger("click");
        });
        $inputArchivo.on("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 20 * 1024 * 1024) {
                    showToast("Tamaño excedido", "El archivo excede los 20 MB sugeridos.", "warning");
                    $inputArchivo.val("");
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    base64Image = event.target.result;
                    if ($imgVistaPrevia.length) {
                        $imgVistaPrevia.attr("src", base64Image);
                        $("#vista-previa-contenedor").fadeIn(400);
                        applyStyles();
                    }
                    if ($txtEstado.length) {
                        $txtEstado.text(`Archivo cargado: ${file.name}`);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    const $zonaSubida = $("#zona-arrastrar-archivo");
    if ($zonaSubida.length) {
        $zonaSubida.on("dragover", function(e) {
            e.preventDefault();
            $(this).css("border-color", "var(--brand-color)");
        });
        $zonaSubida.on("dragleave", function(e) {
            e.preventDefault();
            $(this).css("border-color", "var(--border-color)");
        });
        $zonaSubida.on("drop", function(e) {
            e.preventDefault();
            $(this).css("border-color", "var(--border-color)");
            const files = e.originalEvent.dataTransfer.files;
            if (files && files.length > 0) {
                $inputArchivo[0].files = files;
                $inputArchivo.trigger("change");
            }
        });
    }
    const $formSubida = $("#formulario-subida");
    if ($formSubida.length) {
        $formSubida.on("submit", async function(e) {
            e.preventDefault();
            const user = localStorage.getItem("user");
            if (!user) {
                showToast("Acceso Restringido", "Debes iniciar sesión para publicar.", "warning");
                setTimeout(() => {
                    window.location.href = "iniciar-sesion.html";
                }, 1500);
                return;
            }
            const userData = JSON.parse(user);
            const title = $("#input-titulo-pin").val().trim();
            const description = $("#textarea-desc-pin").val().trim();
            const categoryId = $("#categoria-select").val();
            const tags = $("#input-tags-pin").val().trim() || "general";
            let imageUrl = base64Image;
            if (!imageUrl) {
                const colorRandom = Math.floor(Math.random()*16777215).toString(16);
                imageUrl = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23${colorRandom}'/%3E%3Ctext x='50%25' y='50%25' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='24' text-anchor='middle'%3E${title}%3C/text%3E%3C/svg%3E`;
            }
            const slug = title.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
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
            const $btnPublicar = $("#boton-publicar");
            $btnPublicar.prop("disabled", true).text("Enviando...");
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
                    $btnPublicar.prop("disabled", false).text("Publicar");
                    showToast("Moderación de Contenido", err.detail || "Error al publicar la idea.", "error");
                    return;
                }
                const pin = await response.json();
                if (pin.status === "approved") {
                    showToast("Publicado", "¡Idea publicada con éxito y aprobada por la IA!", "success");
                    setTimeout(() => {
                        window.location.href = "perfil.html";
                    }, 2000);
                } else if (pin.status === "rejected") {
                    $btnPublicar.prop("disabled", false).text("Publicar");
                    showToast("Moderación de Contenido", "La publicación fue rechazada por la IA: " + (pin.moderation_reason || "Contenido no ético"), "warning");
                } else {
                    showToast("Publicado", "¡Idea publicada con éxito!", "success");
                    setTimeout(() => {
                        window.location.href = "perfil.html";
                    }, 2000);
                }
            } catch (error) {
                console.error("Error al publicar pin:", error);
                $btnPublicar.prop("disabled", false).text("Publicar");
                showToast("Error", "No se pudo conectar con el servidor. Revisa si la API está encendida.", "error");
            }
        });
    }
});