import os
import sys
import random
import re
import mimetypes
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
from sqlmodel import SQLModel, Session, select

# Reconfigurar la salida estándar para evitar UnicodeEncodeError en Windows
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def make_long_path_safe(path):
    """
    Prefija la ruta con \\?\ en Windows para soportar rutas de más de 260 caracteres (MAX_PATH).
    """
    abspath = os.path.abspath(path)
    if os.name == 'nt' and not abspath.startswith("\\\\?\\"):
        return "\\\\?\\" + abspath
    return abspath

# Asegurar que el directorio actual esté en el PATH para las importaciones locales
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import engine, create_db
from models import User, Category, Pin

# Cargar variables de entorno desde .env si existe
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

# Credenciales de AWS
ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "YOUR_ACCESS_KEY")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "YOUR_SECRET_KEY")
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "lookbook-data-storage-dfpaz")
SOURCE_DIR = "C:\\Users\\dfpaz\\OneDrive\\Documentos\\Imagenes_S3"

# Categorías predefinidas
CATEGORIES_LIST = [
    {"name": "Caballeros y Armaduras", "slug": "caballeros-y-armaduras", "image": f"https://{BUCKET_NAME}.s3.amazonaws.com/categories/knights.jpg"},
    {"name": "Autos y Carreras", "slug": "autos-y-carreras", "image": f"https://{BUCKET_NAME}.s3.amazonaws.com/categories/cars.jpg"},
    {"name": "Anime y Gaming", "slug": "anime-y-gaming", "image": f"https://{BUCKET_NAME}.s3.amazonaws.com/categories/anime.jpg"},
    {"name": "Moda Masculina", "slug": "moda-masculina", "image": f"https://{BUCKET_NAME}.s3.amazonaws.com/categories/fashion.jpg"},
    {"name": "Memes y Divertido", "slug": "memes-y-divertido", "image": f"https://{BUCKET_NAME}.s3.amazonaws.com/categories/memes.jpg"},
    {"name": "Diseño y Arte", "slug": "diseno-y-arte", "image": f"https://{BUCKET_NAME}.s3.amazonaws.com/categories/art.jpg"},
]

# Usuarios realistas con temáticas asociadas
USERS_LIST = [
    {"username": "Danixdy", "email": "danixdy@lookbook.com", "password": "password123", "theme": "Caballeros y Armaduras"},
    {"username": "IronKnight", "email": "ironknight@lookbook.com", "password": "password123", "theme": "Caballeros y Armaduras"},
    {"username": "JDM_Racer", "email": "jdm_racer@lookbook.com", "password": "password123", "theme": "Autos y Carreras"},
    {"username": "PorscheFan", "email": "porschefan@lookbook.com", "password": "password123", "theme": "Autos y Carreras"},
    {"username": "OtakuGamer", "email": "otakugamer@lookbook.com", "password": "password123", "theme": "Anime y Gaming"},
    {"username": "GengarLover", "email": "gengarlover@lookbook.com", "password": "password123", "theme": "Anime y Gaming"},
    {"username": "AestheticSummer", "email": "aesthetic_summer@lookbook.com", "password": "password123", "theme": "Moda Masculina"},
    {"username": "DapperMan", "email": "dapperman@lookbook.com", "password": "password123", "theme": "Moda Masculina"},
    {"username": "MemeKing", "email": "memeking@lookbook.com", "password": "password123", "theme": "Memes y Divertido"},
    {"username": "KirbyClub", "email": "kirbyclub@lookbook.com", "password": "password123", "theme": "Memes y Divertido"},
    {"username": "ArtSpire", "email": "artspire@lookbook.com", "password": "password123", "theme": "Diseño y Arte"},
]

def detect_category(folder_name):
    """
    Clasifica el pin en base a palabras clave encontradas en el nombre del directorio.
    """
    fn_lower = folder_name.lower()
    
    knights_kws = ["knight", "warrior", "armor", "guerreiro", "rytsari", "templar", "cleric", "gael", "artorias", "penitente", "blasphemous", "sword", "shield", "dagger", "samurai", "gpos", "ous"]
    cars_kws = ["car", "coche", "drift", "skyline", "mustang", "mclaren", "porsche", "f1", "ferrari", "lamborghini", "jdm", "speed", "racing", "automotive", "jet", "aircraft", "plane", "chevelle"]
    anime_kws = ["anime", "gengar", "godzilla", "spiderman", "cyberpunk", "elden ring", "dark souls", "bloodborne", "jojo", "pokemon", "manga", "jjk", "satoru", "nanami", "gundam", "toji", "vegetta777", "minecraft", "sukuna", "devil may cry", "daft punk", "evangelion", "darth vader", "star wars", "starwars", "lightsaber", "pikachu"]
    fashion_kws = ["outfit", "clothes", "fashion", "wardrobe", "sweater", "style", "menswear", "dapper", "shoes", "sneakers", "hair", "mullet", "converse", "bracelet", "laces"]
    memes_kws = ["meme", "cat", "funny", "gato", "kirby", "jerry", "toad", "animal", "chuckles", "joke", "sticker", "dog", "perro"]
    
    if any(kw in fn_lower for kw in knights_kws):
        return "Caballeros y Armaduras"
    elif any(kw in fn_lower for kw in cars_kws):
        return "Autos y Carreras"
    elif any(kw in fn_lower for kw in anime_kws):
        return "Anime y Gaming"
    elif any(kw in fn_lower for kw in fashion_kws):
        return "Moda Masculina"
    elif any(kw in fn_lower for kw in memes_kws):
        return "Memes y Divertido"
    else:
        return "Diseño y Arte"

def parse_folder_name(folder_name):
    """
    Limpia y analiza el nombre del directorio para extraer un título, slug, descripción y etiquetas de calidad.
    """
    # Descartar prefijo de ID si es numérico
    parts = folder_name.split("_", 1)
    if len(parts) > 1 and parts[0].isdigit():
        text = parts[1]
    else:
        text = folder_name
        
    # Separar por caracter de pleca si existe
    if "¦" in text:
        subparts = text.split("¦")
        part1 = subparts[0].strip()
        part2 = subparts[1].strip()
        
        # Si la parte 1 es sólo ruido de autoría o muy corta, usar la parte 2
        clean_part1 = part1.replace("((NOT MINE))", "").replace("(NOT MINE)", "").strip()
        if len(clean_part1) < 4 or clean_part1.lower() == "not mine":
            title = part2.split(",")[0].strip()
        else:
            title = clean_part1
            
        description = part2
    else:
        title = text.strip()
        description = text.strip()
        
    # Limpieza final del título
    title = title.replace("((NOT MINE))", "").replace("(NOT MINE)", "").strip()
    title = title.strip(" ¦,-_")
    title = title.capitalize()
    if not title:
        title = "Publicación de LookBook"
        
    # Generar un slug único
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug).strip('-')
    if not slug:
        slug = f"pin-{random.randint(1000, 9999)}"
        
    # Generar tags a partir del texto
    if "," in description:
        tags_list = [t.strip().lower() for t in description.split(",")]
    else:
        tags_list = [t.strip().lower() for t in description.split()]
    tags_list = [t for t in tags_list if len(t) > 2][:5]
    tags = ",".join(tags_list) if tags_list else "general"
    
    return title, slug, description, tags

def find_image_in_dir(dir_path):
    """
    Busca el primer archivo de imagen válido en la carpeta dada.
    """
    valid_exts = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    try:
        for file in os.listdir(dir_path):
            ext = os.path.splitext(file)[1].lower()
            if ext in valid_exts:
                return os.path.join(dir_path, file)
    except Exception as e:
        print(f"Error al listar archivos en {dir_path}: {e}")
    return None

def seed_database_structure():
    """
    Inserta categorías y usuarios por defecto si no existen.
    """
    print("Inicializando estructura de base de datos...")
    create_db()
    
    session = Session(engine)
    
    # 1. Poblar Categorías
    db_categories = {}
    for cat_data in CATEGORIES_LIST:
        existing = session.exec(select(Category).where(Category.name == cat_data["name"])).first()
        if not existing:
            cat = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                image=cat_data["image"]
            )
            session.add(cat)
            session.commit()
            session.refresh(cat)
            db_categories[cat.name] = cat.id
            print(f"Categoría creada: '{cat.name}'")
        else:
            db_categories[existing.name] = existing.id
            
    # 2. Poblar Usuarios
    db_users = {}
    category_users_map = {cat["name"]: [] for cat in CATEGORIES_LIST}
    
    for user_data in USERS_LIST:
        existing = session.exec(select(User).where(User.username == user_data["username"])).first()
        if not existing:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password=user_data["password"]
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            user_id = user.id
            print(f"Usuario creado: '{user.username}' (Interés: {user_data['theme']})")
        else:
            user_id = existing.id
            
        db_users[user_data["username"]] = user_id
        category_users_map[user_data["theme"]].append(user_id)
        
    session.close()
    return db_categories, db_users, category_users_map

def run_import(limit=150):
    """
    Escanea la carpeta de imágenes, las sube a S3 y las asocia con usuarios/categorías en la DB.
    """
    db_categories, db_users, category_users_map = seed_database_structure()
    
    # Conexión con S3
    s3 = boto3.client(
        's3',
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY
    )
    
    safe_source_dir = make_long_path_safe(SOURCE_DIR)
    if not os.path.exists(safe_source_dir):
        print(f"ERROR: La ruta de origen no existe: {SOURCE_DIR}")
        return
        
    subdirs = [
        os.path.join(safe_source_dir, d) 
        for d in os.listdir(safe_source_dir) 
        if os.path.isdir(os.path.join(safe_source_dir, d))
    ]
    
    # Mezclar carpetas para distribuir la inserción de forma variada y realista
    random.shuffle(subdirs)
    
    session = Session(engine)
    count = 0
    print(f"\nIniciando escaneo e importación de pines (Límite: {limit})...")
    
    for subdir in subdirs:
        if count >= limit:
            print(f"\nLímite de {limit} pines alcanzado. Deteniendo importación.")
            break
            
        folder_name = os.path.basename(subdir)
        image_path = find_image_in_dir(subdir)
        if not image_path:
            continue
            
        # Detectar Categoría
        cat_name = detect_category(folder_name)
        cat_id = db_categories.get(cat_name)
        if not cat_id:
            continue
            
        # Seleccionar usuario temático
        users_for_cat = category_users_map.get(cat_name, [])
        if not users_for_cat:
            user_id = random.choice(list(db_users.values()))
        else:
            user_id = random.choice(users_for_cat)
            
        # Extraer metadatos limpios
        title, slug, description, tags = parse_folder_name(folder_name)
        
        # Subir imagen a S3
        file_ext = os.path.splitext(image_path)[1].lower()
        s3_key = f"pins/{slug}-{random.randint(1000, 9999)}{file_ext}"
        
        print(f"[{count+1}] Importando: '{title}' | Categoría: '{cat_name}'")
        
        content_type, _ = mimetypes.guess_type(image_path)
        if not content_type:
            content_type = "image/jpeg"
            
        image_url = None
        try:
            # Intento de subida con ACL public-read
            s3.upload_file(
                image_path,
                BUCKET_NAME,
                s3_key,
                ExtraArgs={"ContentType": content_type, "ACL": "public-read"}
            )
            image_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
        except Exception as e:
            # Reintento sin ACL si falla por políticas del bucket
            print(f"  Aviso: Carga con ACL falló. Reintentando sin ACL...")
            try:
                s3.upload_file(
                    image_path,
                    BUCKET_NAME,
                    s3_key,
                    ExtraArgs={"ContentType": content_type}
                )
                image_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
            except Exception as ex:
                print(f"  Error de reintento de carga a S3 (sin ACL): {ex}")
                
        if not image_url:
            print(f"  FALLÓ la carga a S3. Saltando pin...")
            continue
            
        # Crear objeto Pin
        new_pin = Pin(
            title=title,
            slug=slug,
            description=description,
            image_url=image_url,
            tags=tags,
            category_id=cat_id,
            user_id=user_id
        )
        
        try:
            session.add(new_pin)
            session.commit()
            count += 1
            print(f"  ÉXITO: Guardado en BD (ID User: {user_id}) -> {image_url}")
        except Exception as e:
            session.rollback()
            print(f"  Error al guardar en base de datos: {e}")
            
    session.close()
    print(f"\n==========================================")
    print(f"Proceso finalizado. Se importaron {count} pines exitosamente.")
    print(f"==========================================")

if __name__ == "__main__":
    # Puedes ajustar el límite de subidas aquí. Por defecto procesará hasta 150 pines.
    import_limit = 150
    if len(sys.argv) > 1:
        try:
            import_limit = int(sys.argv[1])
        except ValueError:
            pass
    run_import(import_limit)
