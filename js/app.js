var API_URL = "http://127.0.0.1:8000/api";

// Cargar Pines en el Feed
async function cargarFeed(query = "", categoryId = null) {
    const mosaico = document.getElementById("mosaico-explorar");
    if (!mosaico) return;

    mosaico.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary);'>Cargando ideas increíbles...</p>";

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
            mosaico.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary);'>No se encontraron ideas. ¡Sé el primero en crear una!</p>";
            return;
        }

        mosaico.innerHTML = ""; // Limpiar
        pines.forEach(pin => {
            const article = document.createElement("article");
            article.className = "pin-tarjeta";
            
            // Si la URL es relativa de desarrollo o placeholder, la consumimos tal cual.
            // Si es un archivo S3, se mostrará directamente.
            const imgUrl = pin.image_url || "../assets/placeholder.jpg";

            article.innerHTML = `
                <div class="pin-imagen-contenedor">
                    <img src="${imgUrl}" alt="${pin.title}" class="pin-imagen" loading="lazy" onload="this.parentElement.classList.add('cargada')" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;500&quot; height=&quot;500&quot;><rect width=&quot;100%25&quot; height=&quot;100%25&quot; fill=&quot;%23f1f5f9&quot;/></svg>'">
                    <div class="pin-overlay">
                        <button class="boton-guardar-pin" onclick="event.preventDefault(); alert('¡Pin guardado en tu colección!')">Guardar</button>
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
        console.error("Error al cargar el feed:", error);
        mosaico.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>No se pudo conectar con la base de datos de la API.</p>";
    }
}

// Cargar categorías en el feed principal (si existe una barra de categorías)
async function cargarCategoriasNav() {
    const navCategorias = document.getElementById("barra-categorias");
    if (!navCategorias) return;

    try {
        const response = await fetch(`${API_URL}/categories/`);
        if (!response.ok) throw new Error("Error al obtener las categorías");
        const categorias = await response.json();

        // Botón "Todas"
        const btnTodas = document.createElement("button");
        btnTodas.className = "categoria-item activo";
        btnTodas.textContent = "Todas";
        btnTodas.addEventListener("click", () => {
            document.querySelectorAll(".categoria-item").forEach(btn => btn.classList.remove("activo"));
            btnTodas.classList.add("activo");
            cargarFeed();
        });
        navCategorias.appendChild(btnTodas);

        categorias.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "categoria-item";
            btn.textContent = cat.name;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".categoria-item").forEach(btn => btn.classList.remove("activo"));
                btn.classList.add("activo");
                cargarFeed("", cat.id);
            });
            navCategorias.appendChild(btn);
        });
    } catch (error) {
        console.error("Error al cargar categorías en nav:", error);
    }
}

// Inicialización de búsquedas y feed
document.addEventListener("DOMContentLoaded", () => {
    // Verificar si hay una búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("busqueda") || "";

    if (queryParam) {
        const inputBusqueda = document.getElementById("busqueda");
        if (inputBusqueda) inputBusqueda.value = queryParam;
        cargarFeed(queryParam);
    } else {
        cargarFeed();
    }
    cargarCategoriasNav();

    // Lógica del Formulario de Búsqueda
    const formBusqueda = document.getElementById("formulario-busqueda");
    if (formBusqueda) {
        formBusqueda.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = document.getElementById("busqueda").value.trim();
            cargarFeed(query);
        });

        // Búsqueda en tiempo real (opcional y fluida)
        const inputBusqueda = document.getElementById("busqueda");
        if (inputBusqueda) {
            let timeout = null;
            inputBusqueda.addEventListener("input", () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    cargarFeed(inputBusqueda.value.trim());
                }, 400); // Esperar 400ms después de escribir para no saturar la API
            });
        }
    }
});
