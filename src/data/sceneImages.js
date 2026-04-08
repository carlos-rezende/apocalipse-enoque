/**
 * Imagens por cena — mesma ordem que `sections[id].scenes` e `SCENE_CHAPTER_META`.
 *
 * - `null` = mantém o `image` definido em `scene({ … })` em sectionsData.js.
 * - Pastas em `public/images/` (URLs começam por `/images/…`).
 * - Usa nomes de ficheiro em minúsculas (melhor em Linux/servidor).
 *
 * Pastas por secção (as tuas):
 * - Vigilantes: `secao-1-vigilantes/`
 * - Parábolas: `secao-2-parabolas/`
 * - Astronomia: `secao-3-astronomy/`
 * - Sonhos: `secao-4-sonhos/`
 * - Epístola: `secao-5-epistola/`
 */
export const SCENE_IMAGES = {
  watchers: [
    '/images/secao-1-vigilantes/a-queda.webp', // A QUEDA
    '/images/secao-1-vigilantes/os-gigantes.webp', // OS GIGANTES
    '/images/secao-1-vigilantes/a-corrupcao.webp', // A CORRUPÇÃO
    '/images/secao-1-vigilantes/a-prisao.webp', // A PRISÃO
    '/images/secao-1-vigilantes/o-julgamento.webp', // O JULGAMENTO
  ],
  parables: [
    '/images/secao-2-parabolas/o-segundo-trono.webp', // O SEGUNDO TRONO
    '/images/secao-2-parabolas/o-filho-do-homem.webp', // O FILHO DO HOMEM
    '/images/secao-2-parabolas/o-bosque-e-as-arvores.webp', // O BOSQUE E AS ÁRVORES
    '/images/secao-2-parabolas/o-reino-novo.webp', // O REINO NOVO
  ],
  astronomy: [
    '/images/secao-3-astronomy/as-portas-do-sol.webp', // AS PORTAS DO SOL
    '/images/secao-3-astronomy/a-lua-e-as-sombras.webp', // A LUA E AS SOMBRAS
    '/images/secao-3-astronomy/ventos-e-lideres.webp', // VENTOS E LÍDERES
    '/images/secao-3-astronomy/o-livro-dos-luminares.webp', // O LIVRO DOS LUMINARES
  ],
  dreams: [
    '/images/secao-4-sonhos/o-primeiro-sonho.webp', // O PRIMEIRO SONHO
    '/images/secao-4-sonhos/o-segundo-sonho-touros-e-ovelhas.webp', // O SEGUNDO SONHO
    '/images/secao-4-sonhos/touros-e-ovelhas-pastor-supremo.webp', // TOUROS E OVELHAS
    '/images/secao-4-sonhos/o-pastor-supremo-cena-final.webp', // O PASTOR SUPREMO
  ],
  epistle: [
    '/images/secao-5-epistola/as-dez-semanas.webp', // O VALE DO JUÍZO
    '/images/secao-5-epistola/exortacao-aos-justos.webp', // EXORTAÇÃO AOS JUSTOS
    '/images/secao-5-epistola/montanhas-de-ferro.webp', // MONTANHAS DE FERRO
    '/images/secao-5-epistola/o-testamento.webp', // O TESTAMENTO
  ],
}
