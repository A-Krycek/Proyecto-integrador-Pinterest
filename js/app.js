

async function cargarFeed(query = "", categoryId = null) {
    const $mosaico = $("#mosaico-explorar");
    if (!$mosaico.length) return;

    $mosaico.html("<p class='cargando-feed-placeholder'>Cargando ideas increíbles...</p>");
    applyStyles();

    try {
        let url = `${API_URL}/pins/`;
        const params = [];
        if (query) params.push(`q=${encodeURIComponent(query)}`);
        if (categoryId) params.push(`category_id=${categoryId}`);
        
        if (params.length > 0) {
            url += `?${params.join("&")}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener los pines");

        const pines = await response.json();
        
        if (pines.length === 0) {
            $mosaico.html("<p class='cargando-feed-placeholder'>No se encontraron ideas. ¡Sé el primero en crear una!</p>");
            applyStyles();
            return;
        }

        $mosaico.attr('data-pin-count', pines.length);
        $mosaico.empty(); 
        pines.forEach(pin => {
            const $article = $("<article>").addClass("pin-tarjeta");
            const imgUrl = pin.image_url || "../assets/placeholder.jpg";

            let saved = [];
            try {
                saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
            } catch (err) {
                saved = [];
            }
            const isSaved = saved.includes(pin.id);
            const btnText = isSaved ? "Guardado" : "Guardar";
            const btnClass = isSaved ? "boton-guardar-pin guardado" : "boton-guardar-pin";

            $article.html(`
                <div class="pin-imagen-contenedor">
                    <img src="${imgUrl}" alt="${pin.title}" class="pin-imagen" loading="lazy" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'500\\' height=\\'500\\'%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23f1f5f9\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%2310b981\\' font-family=\\'sans-serif\\' font-weight=\\'bold\\' font-size=\\'20\\' text-anchor=\\'middle\\'%3E${pin.title}%3C/text%3E%3C/svg%3E'">
                    <div class="pin-overlay">
                        <button class="${btnClass}">${btnText}</button>
                        <a href="ver-pin.html?id=${pin.id}" class="pin-overlay-link-cover" aria-label="Ver detalle"></a>
                    </div>
                </div>
                <div class="pin-info">
                    <a href="ver-pin.html?id=${pin.id}" class="pin-titulo-link">
                        <h3 class="pin-titulo-mini">${pin.title}</h3>
                    </a>
                </div>
            `);

            $article.find(".boton-guardar-pin").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                let saved = [];
                try {
                    saved = JSON.parse(localStorage.getItem(obtenerLlaveGuardados())) || [];
                } catch (err) {
                    saved = [];
                }
                const $btn = $(this);
                if (!saved.includes(pin.id)) {
                    saved.push(pin.id);
                    localStorage.setItem(obtenerLlaveGuardados(), JSON.stringify(saved));
                    $btn.text("Guardado").addClass("guardado");
                    applyStyles();
                    showToast("LookBook Guardado", `¡"${pin.title}" se guardó en tu colección!`, "success");
                } else {
                    saved = saved.filter(id => id !== pin.id);
                    localStorage.setItem(obtenerLlaveGuardados(), JSON.stringify(saved));
                    $btn.text("Guardar").removeClass("guardado");
                    applyStyles();
                    showToast("LookBook Colección", `"${pin.title}" se eliminó de tu colección.`, "info");
                }
            });

            const $img = $article.find(".pin-imagen");
            $img.on("load", function() {
                $(this).parent().addClass("cargada");
                $(this).css('opacity', '1');
                applyStyles();
            });

            if ($img[0] && $img[0].complete) {
                $img.parent().addClass("cargada");
                $img.css('opacity', '1');
            }

            $mosaico.append($article);
        });
        applyStyles();
    } catch (error) {
        console.error("Error al cargar el feed:", error);
        $mosaico.html("<p class='feed-error-placeholder'>No se pudo conectar con la base de datos de la API.</p>");
        applyStyles();
    }
}

async function cargarCategoriasNav() {
    const $navCategorias = $("#barra-categorias");
    if (!$navCategorias.length) return;

    try {
        const response = await fetch(`${API_URL}/categories/`);
        if (!response.ok) throw new Error("Error al obtener las categorías");
        const categorias = await response.json();

        $navCategorias.empty();

        const $btnTodas = $("<button>")
            .addClass("categoria-item activo")
            .text("Todas")
            .on("click", function() {
                $(".categoria-item").removeClass("activo");
                $(this).addClass("activo");
                cargarFeed();
            });
        $navCategorias.append($btnTodas);

        categorias.forEach(cat => {
            const $btn = $("<button>")
                .addClass("categoria-item")
                .text(cat.name)
                .on("click", function() {
                    $(".categoria-item").removeClass("activo");
                    $(this).addClass("activo");
                    cargarFeed("", cat.id);
                });
            $navCategorias.append($btn);
        });
    } catch (error) {
        console.error("Error al cargar categorías en nav:", error);
    }
}

$(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("busqueda") || "";
    if (query) {
        $("#busqueda").val(query);
    }
    cargarFeed(query);
    cargarCategoriasNav();

    const $formBusqueda = $("#formulario-busqueda");
    if ($formBusqueda.length) {
        $formBusqueda.on("submit", function(e) {
            e.preventDefault();
            const query = $("#busqueda").val().trim();
            cargarFeed(query);
        });

        const $inputBusqueda = $("#busqueda");
        if ($inputBusqueda.length) {
            let timeout = null;
            $inputBusqueda.on("input", function() {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    cargarFeed($inputBusqueda.val().trim());
                }, 400); 
            });
        }
    }
});