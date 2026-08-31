# Abastecimento DITRAM

Sistema de controle e emissão de guias de abastecimento para a Diretoria de Transporte Municipal (DITRAM) de Sena Madureira - AC.

[![Figma Design](https://img.shields.io/badge/Figma-Design-blue?logo=figma&logoColor=white)](https://www.figma.com/design/iyTMnJRem5A4SyjrpKxiOO/SEME?node-id=0-1&t=aqXvkX3mVawrXngo-1)

---

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos
- Python 3.10+
- Node.js 20+
- npm 10+

### 🔧 1. Backend (Django)

```bash
# Entrar na pasta do backend
cd backend

# Criar e ativar o ambiente virtual (venv)
python3 -m venv venv
source venv/bin/activate  # No Linux/macOS
# ou: venv\Scripts\activate  (No Windows)

# Instalar dependências
pip install -r requirements.txt

# Configurar o arquivo .env (copie do exemplo)
cp .env.example .env

# Aplicar migrações do banco de dados
python manage.py migrate

# Popular com dados padrão de testes (138 registros)
python manage.py seed_default_data --force

# Iniciar o servidor de desenvolvimento (http://127.0.0.1:8000)
python manage.py runserver
```

**Credenciais padrão de desenvolvimento (seed):**
- **CPF:** `999.999.999-99` (ou `99999999999`)
- **Senha:** `admin`

---

### 💻 2. Frontend (React + Vite)

Em **outro terminal**:

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Configurar o arquivo .env (copie do exemplo)
cp .env.example .env

# Iniciar o servidor Vite (http://localhost:5173)
npm run dev
```

---

## 🛠️ Arquitetura e Convenções

### Perfis do Backend (`DJANGO_PROFILE`)
| Perfil | Banco | Debug | Finalidade |
|---|---|---|---|
| `dev` | SQLite local (`db.sqlite3`) | `True` | Desenvolvimento local |
| `validation` | PostgreSQL (Render) | `False` | Homologação e testes |
| `prod` | PostgreSQL (Render) | `False` | Produção final |

### Convenção de Contrato da API REST
- **Sufixo `_id` em FKs:** Toda chave estrangeira nos DTOs de leitura e escrita utiliza o sufixo `_id` (ex.: `tipo_combustivel_id`, `secretaria_id`, `pessoa_id`).
- **Fonte Única de Verdade dos Enums:** Os selects de enums consome o endpoint `/api/v1/choices/` alimentado diretamente pelos `CHOICES` dos models Django, garantindo consistência total entre frontend e backend.

---

## ☁️ Deploy no Render

1. **Backend:** Web Service com build `bash build.sh` e start `gunicorn api.wsgi:application`.
   - Requer as variáveis: `DJANGO_PROFILE=validation`, `DEBUG=False`, `SECRET_KEY`, `ALLOWED_HOSTS`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`.
2. **Frontend:** Static Site com build `npm run build` e publish directory `dist`.

---

## 📋 Requisitos Funcionais (RF)

| ID | Requisito Funcional | Descrição |
| :--- | :--- | :--- |
| **RF01** | **Gestão de Secretarias** | Cadastro e edição de secretarias (Nome e Sigla). |
| **RF02** | **Gestão de Condutores** | Cadastro de condutores com Nome, CPF e vínculo com secretaria. |
| **RF03** | **Gestão de Frota** | Cadastro de veículos com Placa, Modelo, Ano e Combustível. |
| **RF04** | **Gestão de Destinos** | Cadastro de Escolas, Postos de Saúde e Rotas por secretaria. |
| **RF05** | **Emissão de Guias** | Formulário inteligente com hodômetro opcional para medidores quebrados. |
| **RF06** | **Autopreenchimento** | Carrega veículo, rota e combustível automaticamente ao selecionar condutor. |
| **RF07** | **Cálculo Sugerido** | Sugestão de litragem baseada no consumo médio da rota/veículo. |
| **RF08** | **Geração de PDF** | Exportação da guia em formato PDF para impressão (duas vias idênticas). |
| **RF09** | **Relatórios por Período** | Geração de consolidados baseados em intervalos de datas customizáveis. |
| **RF10** | **Histórico** | Consulta de guias emitidas para fins de conferência e auditoria. |
| **RF11** | **Gestão de Perfil** | Alteração de dados (nome, e-mail e senha) pelo próprio usuário. |
| **RF12** | **Controle de Usuários** | Gestão de operadores e permissões realizada pelo Diretor (Admin). |
| **RF13** | **Favoritos de Relatório** | Salvar filtros recorrentes para geração em um clique. |

## 🛠️ Requisitos Não Funcionais (RNF)

| ID | Categoria | Requisito | Classificação |
| :--- | :--- | :--- | :--- |
| **RNF01** | **Disponibilidade** | Aplicação Web acessível via rede local ou internet. | Essencial |
| **RNF02** | **Portabilidade** | Interface responsiva (Mobile/Tablet/Desktop). | Essencial |
| **RNF03** | **Segurança** | Armazenamento de senhas com Hash BCrypt. | Essencial |
| **RNF04** | **Auditoria** | Registro do ID do usuário emissor em cada guia gerada. | Essencial |
| **RNF05** | **Hierarquia** | Funções críticas (Reset de DB) restritas ao Super Admin. | Essencial |

## 📐 Regras de Operação

### Tipos de Serviço Suportados
* **Veículos:** Caminhonete, Ônibus, Motocicleta, Carro, Van, Máquina Pesada.
* **Embarcações:** Catraia (embarcações de transporte fluvial).
* **Outros:** Recipientes Avulsos (Corote).

### Automações de Campo
* **Concatenação:** Modelo e Placa são unidos automaticamente no PDF (`L200 - MXX-0000`).
* **Rótulos Dinâmicos:** A guia altera termos conforme o serviço (ex: "Catraieiro" para barcos, "Responsável" para roçagem).
* **Validação de Hodômetro:** O sistema bloqueia KM inferior à última registrada, mas permite confirmação manual caso o campo seja deixado vazio (medidor quebrado).



