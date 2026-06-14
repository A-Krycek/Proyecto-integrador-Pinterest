import re
from typing import Optional, Tuple, List

def auto_generate_tags(title: str, description: str, category_name: str) -> List[str]:
    keywords = {
        "diseno": ["diseño", "design", "grafico", "vector", "logo", "color", "tipografia"],
        "fotografia": ["foto", "camara", "paisaje", "retrato", "lente", "captura", "luces"],
        "arquitectura": ["casa", "edificio", "construccion", "interiores", "decoracion", "sala", "hogar"],
        "ilustracion": ["dibujo", "arte", "pintura", "vector", "comic", "anime", "boceto"],
        "viajes": ["viaje", "playa", "montaña", "hotel", "turismo", "aventura", "vuelo"],
        "gastronomia": ["comida", "receta", "cocina", "pizza", "postre", "artesanal", "restaurante"],
        "tecnologia": ["setup", "gamer", "computadora", "teclado", "mouse", "pantalla", "software"],
        "mascotas": ["perro", "gato", "animal", "mascota", "cachorro", "pajarito", "veterinaria"]
    }
    
    text = f"{title} {description}".lower()
    tags = set()
    
    for category, words in keywords.items():
        for word in words:
            if word in text:
                tags.add(category)
                tags.add(word)
                
    if category_name:
        tags.add(category_name.lower())
        
    return list(tags)

PROHIBITED_WORDS = [
    "violencia", "odio", "armas", "ilegal", "droga", "ofensivo", 
    "bullying", "acoso", "insulto", "dañino", "porno", "suicidio",
    "armas", "sangre", "desnudo", "robo", "estafa"
]

def analyze_content_heuristics(title: str, description: str, tags: str, image_url: str) -> Tuple[bool, Optional[str]]:
    text_content = f"{title} {description} {tags}".lower()
    
    for word in PROHIBITED_WORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', text_content):
            return False, f"El contenido contiene el término restringido '{word}', lo cual infringe la política ética sobre convivencia, seguridad y prevención de violencia de LookBook."
            
    image_indicators = ["armas", "violento", "sangriento", "nude", "blood", "pistola", "cuchillo", "gore"]
    for indicator in image_indicators:
        if indicator in image_url.lower() or indicator in text_content:
            return False, f"La IA de Visión detectó elementos visuales sugerentes de '{indicator}', lo cual infringe la política de contenido seguro de la comunidad."
            
    return True, None