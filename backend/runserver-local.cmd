@echo off
rem ============================================================
rem  SOBE O BACKEND ACESSÍVEL PELA REDE LOCAL (0.0.0.0:8000)
rem
rem  Use este script quando o frontend estiver no modo "dev:local"
rem  (VITE_API_URL=http://<SEU_IP>:8000/api) ou quando quiser testar
rem  de um celular/outra máquina na mesma rede.
rem
rem  O runserver padrão (manage.py runserver) escuta SOMENTE em
rem  127.0.0.1 e, por isso, gera ERR_INTERNET_DISCONNECTED /
rem  Connection refused no navegador quando o frontend aponta para o
rem  IP da máquina (ex.: http://192.168.18.209:8000/api).
rem ============================================================

cd /d "%~dp0"

venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
