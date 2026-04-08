# Apocalipse de Enoque

Experiência interativa em **React** e **Vite** inspirada no **Livro de Enoque** (tradição etíope): mapa em cinco secções, simulação em cenas com narrativa, ilustrações, modo ritual, som ambiente e página de notas sobre o texto.

## Demo em produção

**[https://apocalipse-enoque.vercel.app/](https://apocalipse-enoque.vercel.app/)**

## Funcionalidades

- **Mapa do livro** — Vigilantes, Parábolas, Livro astronómico, Sonhos e Epístola, cada uma com várias cenas.
- **Simulação cinematográfica** — Transições, texto progressivo, citações de referência, imagens por cena e intensidade (leve / padrão / intenso).
- **Explorar** — Painel opcional com resumo, temas e hotspots por capítulo.
- **Modo ritual** — Ecrã cheio e atmosfera mais imersiva (sair com **Esc** ou desactivar o modo).
- **Teclado** — Espaço para pausar, setas para mudar de cena, **Esc** para ritual/explorar.
- **Partilha** — Link com cena e parâmetros na URL.
- **Som** — Trilho por secção; silenciar globalmente no cabeçalho.
- **Notas** — Página [`/notas`](https://apocalipse-enoque.vercel.app/notas) com aviso editorial e ligação a leitura externa.

## Stack

- [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/)
- [Vite 8](https://vite.dev/)
- ESLint, Vitest (teste de consistência dos dados de cenas)

## Requisitos

- Node.js **20.19+** ou **22.12+** (ver `engines` em `package.json`)

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abre o endereço indicado no terminal (por defeito `http://localhost:5173`).

## Scripts

| Comando           | Descrição              |
| ----------------- | ---------------------- |
| `npm run dev`     | Servidor de desenvolvimento |
| `npm run build`   | Build de produção → `dist/` |
| `npm run preview` | Pré-visualizar o build |
| `npm run lint`    | ESLint                 |
| `npm test`        | Vitest (uma vez)       |

## Deploy (Vercel)

O repositório inclui `vercel.json` com build `npm run build`, saída `dist` e rewrites para SPA (`index.html`). Na [Vercel](https://vercel.com), importar o repositório Git; framework **Vite** e pasta de output **dist** são detectados ou já alinhados com o ficheiro de configuração.

## Estrutura (resumo)

- `src/App.jsx` — Rotas e cabeçalho global
- `src/HomePage.jsx` — Mapa de secções
- `src/SectionSimulation.jsx` — Simulação por secção
- `src/data/sectionsData.js` — Textos, cenas e metadados
- `src/data/sceneImages.js` — Caminhos das imagens em `public/images/`
- `public/images/` — Arte por secção (WebP)

## Licença e texto

A app é uma **adaptação narrativa**; não substitui uma edição académica integral do 1 Enoque. Ver detalhes na página **Notas** e na meta-descrição do site.
