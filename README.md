# VerifiCarFront

Frontend do projeto VerifiCar — Plataforma Digital para Redução da Assimetria Informacional no Mercado de Veículos Usados.

## Tecnologias

- React 18 + Vite
- React Router DOM
- Axios

## Pré-requisitos

- Node.js 18+
- API `VerificarApi` rodando em `http://localhost:5255`

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

O frontend ficará disponível em `http://localhost:3000`.

## Estrutura

```
src/
├── contexts/
│   └── AuthContext.jsx      # Gerenciamento de autenticação (JWT)
├── services/
│   └── api.js               # Integração com a API
├── components/
│   └── Navbar.jsx
├── pages/
│   ├── LoginPage.jsx        # Login e registro
│   ├── ConsultaPage.jsx     # Seleção de marca, modelo e ano
│   └── ResultadoPage.jsx    # Resultado da consulta FIPE + dados complementares
└── App.jsx                  # Rotas
```

## Fluxo da aplicação

1. Usuário faz login ou cria conta
2. Seleciona marca → modelo → ano em etapas
3. Clica em "Consultar agora"
4. Visualiza o valor FIPE atualizado + análise completa do veículo (se cadastrado)
