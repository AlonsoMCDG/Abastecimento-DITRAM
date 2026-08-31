#!/usr/bin/env bash
# Script de build do Render (Backend).
# Requer as env vars: SECRET_KEY, ALLOWED_HOSTS, DJANGO_PROFILE, DATABASE_URL
# (em validation/prod, ALLOWED_HOSTS é obrigatório — o app falha sem ele).
set -euo pipefail

echo "[build.sh] Instalando dependências..."
pip install -r requirements.txt

echo "[build.sh] Aplicando migrações..."
python manage.py migrate --noinput

echo "[build.sh] Coletando estáticos..."
python manage.py collectstatic --noinput

echo "[build.sh] Build concluído."