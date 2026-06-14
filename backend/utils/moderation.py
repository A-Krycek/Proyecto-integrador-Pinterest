import re
from typing import Optional, Tuple, List, Dict

# ---------------------------------------------------------------------------
# Módulo de Moderación Ética – LookBook
# ---------------------------------------------------------------------------
# Detecta contenido sensible o prohibido en los metadatos de cada publicación
# (título, descripción y etiquetas) y lo clasifica en una de las siguientes
# seis categorías éticas definidas por las políticas de la plataforma.
# ---------------------------------------------------------------------------

# ── Categoría 1: Contenido Sexual o Adulto (NSFW) ──────────────────────────
SEXUAL_ADULT = [
    # Términos explícitos y anatómicos
    "erotismo", "erotico", "erótico", "erótica", "erotica",
    "lenceria", "lencería", "pezón", "pezon", "genitales", "genital",
    "fetiche", "fetiches", "orgia", "orgía", "ninfomana", "ninfómana",
    "escort", "prostitucion", "prostitución", "prostituta", "prostitutas",
    "table dance", "excitado", "excitada", "pornografia", "pornografía",
    "porno", "pornografico", "pornográfico", "desnudo", "desnuda",
    "desnudez", "xxx",
    # Jerga y eufemismos
    "pack", "nudes", "nude", "onlyfans", "only fans", "webcammer",
    "webcam sex", "sugar daddy", "sugar baby", "stripper",
    "sexo", "sexting", "masturbacion", "masturbación",
]

# ── Categoría 2: Sustancias Ilícitas y Medicamentos Controlados ─────────────
DRUGS_SUBSTANCES = [
    # Drogas ilegales
    "cocaina", "cocaína", "marihuana", "cannabis", "heroina", "heroína",
    "metanfetamina", "meth", "extasis", "éxtasis", "lsd", "hongos psilocibios",
    "hongos magicos", "hongos mágicos", "fentanilo", "narco", "narcotrafico",
    "narcotráfico", "dealer", "cartel", "crack", "bazuco", "ketamina",
    "mdma", "anfetamina", "anfetaminas", "opioides", "opioide",
    # Medicamentos de uso indebido y parafernalia
    "xanax", "esteroide", "esteroides", "jeringa", "pipa de droga",
    "bong", "b0ng", "vape droga", "vapeo droga", "narcotics",
    "drogas", "droga", "drogadicto", "drogadiccion", "drogadicción",
    "sobredosis", "vender drogas", "comprar drogas",
]

# ── Categoría 3: Violencia, Armas y Sangre ──────────────────────────────────
VIOLENCE_WEAPONS = [
    # Armas
    "pistola", "rifle", "municion", "munición", "balas", "bala",
    "explosivo", "explosivos", "bomba", "granada", "navaja",
    "tiroteo", "disparo", "fusil", "escopeta", "revolver", "revólver",
    "ametralladora", "arma de fuego", "armamento", "kalashnikov",
    # Violencia y daño
    "asesinato", "asesinar", "homicidio", "masacre", "tortura",
    "decapitar", "decapitacion", "decapitación", "golpiza", "maltrato",
    "crueldad animal", "herida grave", "cadaver", "cadáver", "morgue",
    "gore", "snuff", "linchamient", "apuñalar", "acuchillar",
    "sangre", "sangriento", "sangrienta",
]

# ── Categoría 4: Odio, Acoso y Discriminación (Hate Speech) ─────────────────
HATE_SPEECH = [
    # Discriminación e ideologías extremistas
    "racismo", "racista", "supremacia", "supremacía", "supremacist",
    "nazi", "nazismo", "neonazi", "xenofobia", "xenofobo", "xenófoba",
    "homofobia", "homofobico", "homofóbico", "transfobia", "transfobico",
    "transfóbico", "discriminacion", "discriminación",
    "antisemitismo", "antisemita", "fascismo", "fascista",
    # Insultos y acoso
    "muérete", "muerate", "suicidate", "suicídate",
    "doxxing", "doxing", "ciberacoso", "acosador", "acosadora",
    "linchar", "linchamient",
    # Fatshaming y humillación
    "gordofobia", "gordofobo", "retrasado mental", "imbecil peyorativo",
    "escoria humana", "plaga social",
]

# ── Categoría 5: Autolesión y Trastornos Alimenticios ───────────────────────
SELF_HARM = [
    # Autolesión
    "cutting", "cortarse a proposito", "cortarse a propósito",
    "autolesion", "autolesión", "asfixia autoinfligida",
    "ahorcar", "ahorcarse", "saltar al vacio", "saltar al vacío",
    "metodo suicida", "método suicida", "suicidio", "suicida",
    "quitarse la vida", "hacerse daño", "flagelacion", "flagelación",
    # Trastornos alimenticios y conductas de riesgo
    "anorexia", "anoréxica", "anorexico", "anoréxica",
    "bulimia", "bulimica", "bulimic", "pro-ana", "pro ana",
    "pro-mia", "pro mia", "ayuno extremo", "purga", "purgarse",
    "dieta extrema peligrosa", "come cero",
]

# ── Categoría 6: Fraudes, Delitos y Ciberseguridad ──────────────────────────
FRAUD_CRIME = [
    # Estafas y delitos financieros
    "esquema ponzi", "ponzi", "piramide financiera", "pirámide financiera",
    "trading falso", "dinero facil ilegal", "clonar tarjeta",
    "phishing", "contrabando", "falsificacion", "falsificación",
    "billetes falsos", "moneda falsa", "lavado de dinero",
    "estafa", "estafar", "timo", "fraude",
    # Delitos informáticos
    "hackear", "crackear", "crack software", "keylogger",
    "malware", "ransomware", "exploit venta", "vulnerabilidad venta",
    "ddos", "botnet", "carding", "skimming",
    # Tráfico y comercio ilegal
    "trafico de personas", "tráfico de personas", "trata de blancas",
    "venta ilegal", "armas ilegales", "organo ilegal",
]

# Mapa: lista de términos → (nombre de categoría, descripción de política)
SENSITIVE_CATEGORIES: Dict[str, Tuple[List[str], str]] = {
    "contenido_sexual_adulto": (
        SEXUAL_ADULT,
        "La publicación contiene términos relacionados con contenido sexual, adulto o NSFW ('{term}'), "
        "lo cual infringe la Política de Contenido Seguro de LookBook — Sección 1: Material Adulto."
    ),
    "sustancias_ilicitas": (
        DRUGS_SUBSTANCES,
        "La publicación contiene referencias a sustancias ilícitas o medicamentos de uso indebido ('{term}'), "
        "lo cual infringe la Política de Contenido Seguro de LookBook — Sección 2: Drogas y Sustancias."
    ),
    "violencia_armas": (
        VIOLENCE_WEAPONS,
        "La publicación contiene términos relacionados con violencia, armas o contenido gráfico ('{term}'), "
        "lo cual infringe la Política de Contenido Seguro de LookBook — Sección 3: Violencia y Armas."
    ),
    "odio_acoso_discriminacion": (
        HATE_SPEECH,
        "La publicación contiene lenguaje de odio, acoso o discriminación hacia grupos protegidos ('{term}'), "
        "lo cual infringe la Política de Comunidad de LookBook — Sección 4: Discurso de Odio."
    ),
    "autolesion_trastornos": (
        SELF_HARM,
        "La publicación contiene términos que promueven la autolesión o trastornos alimenticios ('{term}'), "
        "lo cual infringe la Política de Bienestar de LookBook — Sección 5: Seguridad del Usuario."
    ),
    "fraude_delitos_ciberseguridad": (
        FRAUD_CRIME,
        "La publicación contiene términos vinculados a fraudes, delitos o actividades ilegales en línea ('{term}'), "
        "lo cual infringe la Política de Uso Legal de LookBook — Sección 6: Actividades Ilícitas."
    ),
}

# Lista consolidada de términos absolutamente prohibidos (rechazo inmediato)
# Estos términos son tan graves que el pin se rechaza en lugar de marcarse
# como "sensible"; cubren los casos más extremos de cada categoría.
HARD_PROHIBITED: List[str] = [
    # Sexual explícito extremo
    "pornografia infantil", "pornografía infantil", "pedo", "pedofilia",
    "grooming",
    # Violencia extrema
    "asesinato en vivo", "snuff film", "decapitacion real", "decapitación real",
    # Sustancias más peligrosas en contexto de venta
    "vendo fentanilo", "vendo heroina", "vendo heroína", "vendo cocaina",
    # Supremacismo extremo
    "exterminio raza", "limpieza étnica", "limpieza etnica",
    # Explotación
    "trata de personas", "trafico humano", "tráfico humano",
]


# ---------------------------------------------------------------------------
# Utilidades de normalización
# ---------------------------------------------------------------------------

def _normalize(text: str) -> str:
    """Convierte texto a minúsculas y elimina acentos para comparación."""
    import unicodedata
    text = text.lower()
    # Normalización NFD para descomponer acentos, luego filtrar marcas diacríticas
    nfd = unicodedata.normalize("NFD", text)
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


def _contains_term(text: str, term: str) -> bool:
    """Busca un término (con word-boundary cuando es una sola palabra)."""
    norm_text = _normalize(text)
    norm_term = _normalize(term)
    # Si el término tiene espacios, se busca como subcadena exacta
    if " " in norm_term:
        return norm_term in norm_text
    # Si es una sola palabra, se usa word boundary para evitar falsos positivos
    return bool(re.search(r'\b' + re.escape(norm_term) + r'\b', norm_text))


# ---------------------------------------------------------------------------
# Función principal de análisis ético
# ---------------------------------------------------------------------------

def analyze_content_ethics(
    title: str,
    description: str,
    tags: str,
    image_url: str
) -> Tuple[str, Optional[str], Optional[str]]:
    """
    Analiza los metadatos de un pin y determina su veredicto ético.

    Returns:
        (status, sensitive_category, moderation_reason)

        status:
            "approved"  → contenido limpio, se publica normalmente.
            "sensitive" → contenido marcado como sensible; queda en cuarentena
                          y se etiqueta para revisión manual.
            "rejected"  → contenido con términos absolutamente prohibidos;
                          se rechaza de inmediato.

        sensitive_category:
            Nombre de la categoría sensible detectada (o None si aprobado).

        moderation_reason:
            Mensaje explicativo de la política infringida (o None si aprobado).
    """
    full_text = f"{title} {description} {tags}"

    # ── Paso 1: Verificar términos absolutamente prohibidos (rechazo duro) ──
    for term in HARD_PROHIBITED:
        if _contains_term(full_text, term):
            return (
                "rejected",
                "contenido_prohibido_absoluto",
                (
                    f"La publicación contiene el término '{term}', considerado contenido absolutamente "
                    "prohibido y sin posibilidad de apelación bajo las Políticas de LookBook. "
                    "Esta acción puede estar sujeta a reporte a las autoridades competentes."
                ),
            )

    # ── Paso 2: Verificar URL de imagen por indicadores visuales sospechosos ──
    image_indicators = [
        "gore", "blood", "nude", "naked", "nsfw", "xxx",
        "pistola", "armas", "violento", "sangriento",
    ]
    for indicator in image_indicators:
        if indicator in _normalize(image_url):
            return (
                "sensitive",
                "contenido_visual_sospechoso",
                (
                    f"La URL de la imagen contiene el indicador visual '{indicator}', "
                    "lo que sugiere contenido gráfico o inapropiado. La publicación ha sido "
                    "marcada para revisión manual bajo la Política de Contenido Visual de LookBook."
                ),
            )

    # ── Paso 3: Escanear las seis categorías éticas ─────────────────────────
    for category_key, (terms, reason_template) in SENSITIVE_CATEGORIES.items():
        for term in terms:
            if _contains_term(full_text, term):
                reason = reason_template.format(term=term)
                return ("sensitive", category_key, reason)

    # ── Sin detección: contenido aprobado ───────────────────────────────────
    return ("approved", None, None)


# ---------------------------------------------------------------------------
# Generación automática de tags (lógica original preservada y expandida)
# ---------------------------------------------------------------------------

def auto_generate_tags(title: str, description: str, category_name: str) -> List[str]:
    """Genera etiquetas automáticas basadas en el contenido del pin."""
    keywords = {
        "diseno": ["diseño", "design", "grafico", "vector", "logo", "color", "tipografia"],
        "fotografia": ["foto", "camara", "paisaje", "retrato", "lente", "captura", "luces"],
        "arquitectura": ["casa", "edificio", "construccion", "interiores", "decoracion", "sala", "hogar"],
        "ilustracion": ["dibujo", "arte", "pintura", "vector", "comic", "anime", "boceto"],
        "viajes": ["viaje", "playa", "montaña", "hotel", "turismo", "aventura", "vuelo"],
        "gastronomia": ["comida", "receta", "cocina", "pizza", "postre", "artesanal", "restaurante"],
        "tecnologia": ["setup", "gamer", "computadora", "teclado", "mouse", "pantalla", "software"],
        "mascotas": ["perro", "gato", "animal", "mascota", "cachorro", "pajarito", "veterinaria"],
        "moda": ["moda", "outfit", "ropa", "tendencia", "estilo", "fashion", "accesorios"],
        "fitness": ["gym", "ejercicio", "rutina", "deporte", "entrenamiento", "crossfit", "yoga"],
    }

    text = f"{title} {description}".lower()
    tags: set = set()

    for category, words in keywords.items():
        for word in words:
            if word in text:
                tags.add(category)
                tags.add(word)

    if category_name:
        tags.add(category_name.lower())

    return list(tags)


# ---------------------------------------------------------------------------
# Función de compatibilidad hacia atrás (mantiene la firma original)
# ---------------------------------------------------------------------------

def analyze_content_heuristics(
    title: str,
    description: str,
    tags: str,
    image_url: str
) -> Tuple[bool, Optional[str]]:
    """
    Wrapper de compatibilidad.  Internamente llama a analyze_content_ethics.
    Retorna (is_approved: bool, reason: str | None).
    """
    status, _category, reason = analyze_content_ethics(title, description, tags, image_url)
    return (status == "approved", reason)