import os
from pathlib import Path
import dj_database_url
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ======================
# PROFILE / ENV LOADING
# ======================

DJANGO_PROFILE = os.getenv("DJANGO_PROFILE", "dev").strip().lower()
if DJANGO_PROFILE not in {"dev", "prod", "validation"}:
    DJANGO_PROFILE = "dev"

# Variáveis de ambiente
try:
    from dotenv import load_dotenv

    # Tenta carregar primeiro `.env.<profile>` e depois `.env`
    load_dotenv(BASE_DIR / f".env.{DJANGO_PROFILE}", override=False)
    load_dotenv(BASE_DIR / ".env", override=False)
except:
    pass

# ======================
# SECURITY
# ======================

SECRET_KEY = os.getenv("SECRET_KEY")

if "DEBUG" in os.environ:
    DEBUG = os.getenv("DEBUG", "False") == "True"
else:
    DEBUG = DJANGO_PROFILE == "dev"

allowed_hosts_env = os.getenv("ALLOWED_HOSTS", "").strip()
if allowed_hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(",") if h.strip()]
elif DEBUG:
    # Fallback seguro apenas em desenvolvimento local
    ALLOWED_HOSTS = ["127.0.0.1", "localhost"]
else:
    # FAIL-CLOSED: em validação/produção, ALLOWED_HOSTS é OBRIGATÓRIO.
    # Levantar erro aqui impede o app de subir aceitando Hosts arbitrários
    # (evita ataques de Host Header Injection). Configure a env var!
    raise RuntimeError(
        "ALLOWED_HOSTS não configurado. Fora do perfil 'dev' esta variável "
        "é obrigatória (ex.: ALLOWED_HOSTS=seu-app.onrender.com)."
    )

# ======================
# SECURITY (PRODUCTION)
# ======================

if not DEBUG:
    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ======================
# APPS
# ======================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    'django_filters',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Apps de Infraestrutura
    'apps.core',
    'apps.usuarios',

    # Apps de Domínio (Aponte para a pasta raiz do App)
    'apps.frota',
    'apps.operacao',
    'apps.organizacao',
    'apps.pessoas',
]

# ======================
# MIDDLEWARE
# ======================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'api.urls'

# ======================
# AUTENTICAÇÃO & AUTORIZAÇÃO
# ======================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated', # Bloqueia tudo por padrão
    ),
    'EXCEPTION_HANDLER': 'api.exception_handler.custom_exception_handler',

    ### Versionamento da API
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.NamespaceVersioning',
    'DEFAULT_VERSION': 'v1',            # Versão assumida se não houver namespace
    'ALLOWED_VERSIONS': ['v1',],
    'VERSION_PARAM': 'version',
    ###

    ### Paginação
    # Paginação padrão (ex: 10 itens por página)
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',

    # Define o backend de filtro padrão
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']

}

# ======================
# SIMPLE JWT
# ======================

SIMPLE_JWT = {
    # Tempo que o utilizador pode navegar sem precisar de usar o refresh token
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    
    # Tempo total que o utilizador pode ficar logado (7 dias)
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    
    # Se True, ao usar o refresh token para obter um novo access, 
    # o utilizador recebe também um NOVO refresh token (renova a validade de 7 dias)
    'ROTATE_REFRESH_TOKENS': False,
    
    # Se True, o refresh token anterior vai para uma "lista negra" e deixa de funcionar
    'BLACKLIST_AFTER_ROTATION': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY, # Usa a chave configurada no nas varíaveis de ambiente
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ======================
# TEMPLATES
# ======================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'api.wsgi.application'

# ======================
# DATABASE
# ======================

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DJANGO_PROFILE == "dev":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL é obrigatório para DJANGO_PROFILE=prod/validation")

    DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=True)}

# ======================
# PASSWORD VALIDATION
# ======================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ======================
# INTERNATIONALIZATION
# ======================

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ======================
# STATIC FILES
# ======================

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ======================
# DEFAULT FIELD
# ======================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ======================
# CORS
# ======================

# Leitura do CORS
cors_allowed_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()
if cors_allowed_origins_env:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_allowed_origins_env.split(",") if o.strip()]
elif DEBUG:
    # Fallback seguro apenas em desenvolvimento local (Vite)
    CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
else:
    # FAIL-CLOSED fora de dev: sem env var, nenhuma origem externa é permitida
    CORS_ALLOWED_ORIGINS = []

# Leitura do CSRF
csrf_trusted_env = os.getenv("CSRF_TRUSTED_ORIGINS", "").strip()
if csrf_trusted_env:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in csrf_trusted_env.split(",") if o.strip()]
elif DEBUG:
    CSRF_TRUSTED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
else:
    CSRF_TRUSTED_ORIGINS = []

# CORS_ALLOW_CREDENTIALS = True

# ======================
# AUTH
# ======================

AUTH_USER_MODEL = 'usuarios.Usuario'

# ======================
# CACHE
# ======================

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "abastecimento-ditram",
    }
}


# ======================
# LOGGING
# ======================

import os

# 1. Garante que a pasta "logs" exista na raiz do projeto para não dar erro
LOGS_DIR = BASE_DIR / 'logs'
os.makedirs(LOGS_DIR, exist_ok=True)

# 2. Configuração do Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False, # Muito importante: mantém os avisos nativos do Django
    
    # FORMATTERS: A "roupa" da mensagem (data, hora, nível, etc)
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} [{module}:{lineno}] - {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'simple': {
            'format': '{levelname} - {message}',
            'style': '{',
        },
    },
    
    # HANDLERS: Os entregadores (Terminal, Arquivo, E-mail, etc)
    'handlers': {
        # Para o Terminal: Mostra tudo (INFO pra cima) com visual simples
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        # Para o Arquivo: Salva problemas graves (WARNING, ERROR) com detalhes técnicos
        'file': {
            'level': 'WARNING', 
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'django_errors.log',
            'maxBytes': 1024 * 1024 * 5, # Corta o arquivo quando chegar em 5MB
            'backupCount': 3,            # Guarda até 3 arquivos antigos, apagando o resto
            'formatter': 'verbose',
            'encoding': 'utf-8',
        },
    },
    
    # LOGGERS: Os detetives que ficam escutando o código
    'loggers': {
        # Captura os erros internos do próprio Django
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        # Captura os avisos do SEU código (a pasta 'apps' inteira)
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}