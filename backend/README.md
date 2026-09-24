# ⚙️ Backend - API DITRAM Abastecimento

API REST construída com **Django 5.x** e **Django REST Framework (DRF)** para gerenciamento da frota, emissão de guias de abastecimento e relatórios analíticos da DITRAM.

---

## 📁 Estrutura de Apps e Domínios

```text
backend/
├── api/                    # Configurações do projeto, settings, urls principais e exception handler
├── apps/
│   ├── core/               # Paginação relativa, cache mixins, comandos de seed e gestão de banco
│   ├── usuarios/           # Modelo customizado de Usuario (login via CPF), autenticação JWT e permissões
│   ├── organizacao/        # Modelos de Secretaria e Instituicao (Escolas, Postos de Saúde, UPAs)
│   ├── pessoas/            # Modelo de Pessoa / Condutor com validação estrita de CPF (11 dígitos)
│   ├── frota/              # Veiculos (categorias, consumo estimado km/L), Rotas e Tipos de Combustivel
│   └── operacao/           # Guias de Abastecimento, TipoAtividade, Registro de Hodometro e Relatórios
├── logs/                   # Rotação de logs de erros (django_errors.log)
├── staticfiles/            # Arquivos estáticos (brasões oficiais para ReportLab)
└── manage.py
```

---

## 🔗 Principais Endpoints da API (`/api/v1/`)

### Autenticação & Usuários
* `POST /api/login/`: Obtenção do token JWT (CPF + Senha).
* `POST /api/token/refresh/`: Atualização de token JWT.
* `GET/PATCH /api/v1/usuarios/me/`: Perfil do usuário autenticado.
* `GET /api/v1/usuarios/permissions/`: Listagem de operadores e permissões (Admin).
* `PATCH /api/v1/usuarios/{id}/permissions/`: Atualização de permissões de operador.

### Operação & Guias
* `GET/POST /api/v1/operacao/guias/`: Listagem com filtros e criação de Guia.
* `GET/PATCH/DELETE /api/v1/operacao/guias/{id}/`: Detalhes, edição e exclusão de Guia.
* `GET /api/v1/operacao/guias/{id}/pdf/`: Emissão de PDF da guia em duas vias A4 para impressão.
* `GET /api/v1/operacao/guias/sugestoes/?pessoa={id}`: Sugestões de veículo, serviço, secretaria e rota mais frequentes do condutor.
* `GET /api/v1/operacao/guias/relatorio-consolidado/`: Relatório analítico com KPIs, totais por secretaria, combustível e modalidade.
* `GET/POST /api/v1/operacao/atividades/`: Cadastro e busca de tipos de atividades (suporta lookup com deduplicação RapidFuzz).

### Frota & Organização
* `GET/POST /api/v1/frota/veiculos/`: Cadastro de veículos com placa, categoria e consumo médio.
* `GET/POST /api/v1/frota/rotas/`: Cadastro de rotas com distância em km e secretaria.
* `GET/POST /api/v1/frota/tipos-combustivel/`: Cadastro de tipos de combustível.
* `GET/POST /api/v1/organizacao/secretarias/`: Cadastro de secretarias (SEME, Saúde, SEMA, etc.).
* `GET/POST /api/v1/organizacao/instituicoes/`: Cadastro de instituições (Escola, Posto, UPA, Hospital).
* `GET/POST /api/v1/pessoas/base/`: Cadastro de condutores e beneficiários.

---

## 🛠️ Serviços de Negócio (`apps/operacao/services/`)

* `guia_service.py`: Criação atômica de guias, resolução de rotas manuais e atividades dinâmicas.
* `sugestoes_service.py`: Cálculo de frequência histórica para autopreenchimento de dados por condutor.
* `relatorio_service.py`: Agregação de dados para relatórios consolidados mensais e por período.
* `pdf_service.py`: Montagem de PDF com ReportLab contendo brasões, duas vias e adaptação dinâmica de termos.
* `tipo_atividade_service.py`: Algoritmo de fuzzy matching (`RapidFuzz`) para deduplicar serviços digitados com grafias semelhantes.

---

## 💻 Comandos de Gerenciamento (`manage.py`)

```bash
# Executar migrações
python manage.py migrate

# Carregar dados padrão de secretarias, veículos e superadmin
python manage.py seed

# Executar testes automatizados
python manage.py test

# Verificar integridade do projeto
python manage.py check
```
