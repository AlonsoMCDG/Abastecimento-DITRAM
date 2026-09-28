# Frontend do Abastecimento DITRAM

Aplicação React e Vite para os cadastros, guias de abastecimento e relatórios.

## Executar localmente

Com o backend disponível em `http://localhost:8000`:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

`VITE_API_URL` deve apontar para a raiz da API, por exemplo `http://localhost:8000/api`.

## Formulários

Os cadastros usam `SimpleForm` com campos HTML comuns. Cada select carrega suas opções diretamente do endpoint de lookup ou de choices indicado no esquema da página. Na guia, a secretaria filtra instituições e rotas pelo vínculo registrado no backend, e o veículo cadastrado preenche o tipo de combustível, que continua editável. Motoristas não são filtrados pela secretaria, pois o cadastro de pessoas não mantém esse vínculo. A guia permite digitar veículo/equipamento e rota/serviço quando necessário. As regras obrigatórias permanecem nos esquemas de validação e no backend.

## Validação

```bash
cd frontend
npm run build
npm run lint
```
