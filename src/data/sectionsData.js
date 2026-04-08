/**
 * Livro de Enoque — experiência por seções (mapa → rotas /watchers … /epistle)
 * Cada seção: title, chapters, summary, cardImage, scenes (narrativa, citação, painel, visual)
 * Capítulos / palavras-chave por cena: sceneChapterMeta.js (fundido abaixo).
 * Imagens opcionais por capítulo-bloco: sceneImages.js (sobrepõe `image` da cena).
 * Por cena (opcional): `imageFocus`, `imageTransformOrigin` (CSS), `imageSrcSet` + `sizes` (srcset responsivo).
 */
import { SCENE_CHAPTER_META } from './sceneChapterMeta.js'
import { SCENE_IMAGES } from './sceneImages.js'

const IMG = {
  fall: '/images/fall-of-watchers.webp',
  giants: '/images/giants.webp',
  corrupt: '/images/corruption.webp',
  seals: '/images/seals.webp',
  judge: '/images/judgement.webp',
}

function scene({
  name,
  sub,
  text,
  quote,
  duration = 10000,
  visual = 0,
  bridge = null,
  image,
  panel,
  imageFocus,
  imageTransformOrigin,
  imageSrcSet,
  sizes,
}) {
  return {
    name,
    sub,
    text,
    quote,
    duration,
    visual,
    bridge,
    image,
    panel,
    ...(imageFocus != null && { imageFocus }),
    ...(imageTransformOrigin != null && { imageTransformOrigin }),
    ...(imageSrcSet != null && { imageSrcSet }),
    ...(sizes != null && { sizes }),
  }
}

export const SECTION_ORDER = ['watchers', 'parables', 'astronomy', 'dreams', 'epistle']

export const sections = {
  watchers: {
    id: 'watchers',
    path: '/watchers',
    title: 'Vigilantes',
    audioStem: 'watchers',
    chapters: 'Capítulos 1–36',
    cardSummary:
      'Hermom: pacto dos Vigilantes, conhecimento proibido e género dos gigantes — o céu inclina-se à rebeldia.',
    cardImage: '/images/vigilantes-card.webp',
    landingEyebrow: 'Liber Enochi · Pars I',
    summary:
      'No Hermom, o pacto abre passagem ao saber vedado; da terra e do céu nasce uma linhagem colossal, e o mundo inclina-se para a corrupção.',
    epilogue: {
      quote: 'E toda iniquidade desaparecerá da face da terra.',
      attribution: '1 Enoque 10:20',
    },
    scenes: [
      scene({
        name: 'A DESCIDA NO MONTE HERMON',
        sub: 'Capítulos 6–11 — Pacto e conhecimento proibido',
        text: 'Os Vigilantes descem sobre o Monte Hermon e selam um pacto irreversível. O céu toca a terra sob rebeldia, e o conhecimento proibido começa a se espalhar entre os homens. Dessa união surgem os gigantes, marcando o início da corrupção que alterará o destino da humanidade.',
        quote: '"E viram as filhas dos homens que eram belas, e as desejaram." — 1 En 6:2',
        duration: 10000,
        visual: 0,
        imageFocus: '50% 16%',
        bridge: 'E assim começou a era dos gigantes sobre a terra...',
        image: IMG.fall,
        panel: {
          title: 'A descida no Monte Hermon',
          reference: '1 Enoque 6–11',
          summary:
            'No Hermom, os Vigilantes juram o pacto; o saber celeste vaza à terra e nasce a linhagem dos gigantes — prelúdio da grande corrupção.',
          themes: ['anjos caídos', 'Monte Hermom', 'pacto proibido', 'corrupção celestial'],
          notes:
            'Os Vigilantes ensinaram metalurgia, astrologia e artes ocultas. Semyaza liderou 20 capitães, cada um com 10 subordinados — totalizando 200 seres angelicais.',
          hotspots: [
            { x: '28%', y: '42%', label: 'Vigilantes', info: 'Seres angelicais guardiões que desobedeceram. "Ir", em aramaico, significa "aquele que está desperto e vigia".' },
            { x: '68%', y: '55%', label: 'Monte Hermom', info: 'Local do pacto dos 200 anjos. Em hebraico, חֶרְמוֹן — "lugar do anátema" ou "lugar consagrado ao destruição".' },
          ],
        },
      }),
      scene({
        name: 'OS GIGANTES',
        sub: 'Capítulo VII — Os Nefilim',
        text: 'Os Nephilim, os gigantes da antiguidade. Eles consumiram tudo que os homens produziram, até que os homens não podiam mais sustentá-los...',
        quote: '"Eles devoraram toda a aquisição dos homens até que os homens não podiam mais sustentá-los." — 1 En 7:4',
        duration: 10000,
        visual: 1,
        bridge: 'Toda carne havia corrompido o seu caminho...',
        image: IMG.giants,
        panel: {
          title: 'Os Nephilim e os Gigantes',
          reference: '1 Enoque 7–8',
          summary:
            'Os filhos dos Vigilantes com mulheres humanas geraram gigantes de proporções colossais. Consumiram os recursos dos homens, depois a própria carne humana — semeando terror e desolação.',
          themes: ['Nefilim', 'gigantes', 'violência', 'fome'],
          notes:
            'A palavra "Nefilim" pode significar "os que caíram" ou "os que fazem cair". Tradições antigas estimam sua estatura em proporções sobre-humanas, simbolizando o excesso.',
          hotspots: [
            { x: '52%', y: '28%', label: 'Nefilim', info: 'Filhos dos anjos caídos com humanas. No hebraico bíblico, נְפִילִים — colossos ou tiranos que terrorizavam a terra.' },
            { x: '18%', y: '62%', label: 'Azazel', info: 'Líder espiritual da rebelião que ensinou forja de armas e a arte da guerra, corrompendo a paz.' },
          ],
        },
      }),
      scene({
        name: 'A CORRUPÇÃO',
        sub: 'Capítulos VIII–IX — A terra corrompida',
        text: 'A terra foi corrompida perante Deus, e se encheu de iniquidade. Toda carne havia corrompido o seu caminho sobre a terra...',
        quote: '"Toda iniquidade estava escrita perante o Senhor, na terra." — 1 En 9:3',
        duration: 12000,
        visual: 2,
        imageFocus: '48% 30%',
        bridge: 'Então desceram os arcanjos com ordens do Altíssimo...',
        image: IMG.corrupt,
        panel: {
          title: 'A Corrupção da Terra',
          reference: '1 Enoque 8–9',
          summary:
            'Azazel ensinou metalurgia e joalheria às mulheres, gerando vaidade e pecado. Semyaza ensinou encantamentos. A terra se encheu de derramamento de sangue e abominação.',
          themes: ['artes proibidas', 'metalurgia', 'magia', 'iniquidade'],
          notes:
            'Os Quatro Arcanjos — Miguel, Sariel, Rafael e Gabriel — observaram o caos e clamaram a Deus por intervenção divina em favor de toda carne oprimida.',
          hotspots: [
            { x: '44%', y: '44%', label: 'Artes proibidas', info: 'Azazel ensinou forja de metais; Semyaza, encantamentos; Baraqiel, astrologia; Kokabiel, sinais das estrelas.' },
            { x: '72%', y: '33%', label: 'Quatro arcanjos', info: 'Miguel, Sariel, Rafael e Gabriel intercederam por toda a carne que clamava ao céu por socorro e redenção.' },
          ],
        },
      }),
      scene({
        name: 'A PRISÃO',
        sub: 'Capítulo X — O decreto do Altíssimo',
        text: "E ao Senhor foi dito: 'Amarra Azazel mãos e pés, e lança-o nas trevas'. E o anjo Rafael desceu e amarrou-o...",
        quote: '"Cobre seu rosto para que ele não veja a luz, e para que ele seja entregue ao fogo." — 1 En 10:4',
        duration: 10000,
        visual: 3,
        bridge: 'E o escriba Enoque foi chamado como testemunha eterna...',
        image: IMG.seals,
        panel: {
          title: 'A Prisão de Azazel',
          reference: '1 Enoque 10',
          summary:
            'Rafael foi enviado para prender Azazel. Suas mãos e pés foram amarrados e ele foi lançado em trevas no deserto de Dudael, coberto por pedras aguçadas, para aguardar o julgamento eterno.',
          themes: ['Rafael', 'prisão divina', 'Azazel', 'redenção'],
          notes:
            'O nome "Dudael" é associado ao deserto de Judá. A punição de Azazel prefigura o rito do bode expiatório descrito em Levítico 16.',
          hotspots: [
            { x: '24%', y: '27%', label: 'Rafael', info: 'Arcanjo da cura enviado para prender Azazel. רָפָאֵל em hebraico — "Deus cura".' },
            { x: '76%', y: '65%', label: 'Abismo', info: 'Lugar de trevas onde anjos caídos aguardam o Grande Julgamento ao fim dos tempos.' },
            { x: '50%', y: '58%', label: 'Selos', info: 'Os selos simbolizam o aprisionamento dos Vigilantes, cada um vinculado a um nome angélico proibido.' },
          ],
        },
      }),
      scene({
        name: 'O JULGAMENTO',
        sub: 'Capítulo XIV — Visão do trono',
        text: 'E toda a terra foi inundada com água, e foi destruída toda a carne... Mas Enoque andou com Deus, e não foi mais visto.',
        quote: '"E toda iniquidade desaparecerá da face da terra." — 1 En 10:20',
        duration: 12000,
        visual: 4,
        bridge: null,
        image: IMG.judge,
        panel: {
          title: 'A Visão do Trono Celestial',
          reference: '1 Enoque 14',
          summary:
            'Enoque é transportado em visão ao palácio celestial de cristal e fogo. Contempla o Grande Trono de Glória, rodeado de querubins. O Altíssimo declara o julgamento final dos Vigilantes.',
          themes: ['trono celestial', 'visão profética', 'julgamento', 'Enoque'],
          notes:
            'Um dos registros mais antigos de literatura de ascensão celestial, precursora da literatura merkabá e das apocalípticas.',
          hotspots: [
            { x: '50%', y: '36%', label: 'Trono de glória', info: 'Descrito como cristal circundado por fogo vivo. Deus entronizado, rodeado de roda de fogo e querubins.' },
            { x: '22%', y: '58%', label: 'Enoque', info: 'O único humano a "caminhar com Deus" sem morrer (Gn 5:24). Mediador aceito como escriba celestial.' },
          ],
        },
      }),
    ],
  },

  parables: {
    id: 'parables',
    path: '/parables',
    title: 'Parábolas',
    audioStem: 'parables',
    chapters: 'Capítulos 37–71',
    cardSummary:
      'Casa de cristal e trono: revelam-se o juízo futuro e o Filho do Homem sobre reis e anjos caídos.',
    cardImage: '/images/parabolas-card.webp',
    landingEyebrow: 'Liber Enochi · Pars II',
    summary:
      'Através de fogo e gelo, Enoque alcança a morada transparente: o trono arde em silêncio, e a justiça futura se desenha contra tronos terrenos.',
    epilogue: {
      quote: 'E a iniquidade não subsistirá diante dele.',
      attribution: 'Parábolas de Enoque (síntese)',
    },
    scenes: [
      scene({
        name: 'A CASA DE CRISTAL',
        sub: 'Capítulos 14–16 — Morada e trono (abertura parabólica)',
        text: 'Conduzido em espírito, Enoque atravessa nuvens de fogo e gelo até uma morada celestial. Diante dele surge o Trono da Glória, rodeado por seres vigilantes. Ali são revelados o julgamento futuro e o papel do Filho do Homem, que trará justiça sobre reis e anjos caídos.',
        quote: '"E vi até que um livro estava aberto diante dele." — 1 En 81:2 (eco literário)',
        duration: 11000,
        visual: 0,
        imageFocus: '52% 22%',
        bridge: 'Então a figura do Eleito se delineou entre as chamas...',
        image: IMG.fall,
        panel: {
          title: 'A casa de cristal',
          reference: '1 Enoque 14–16 · eco 37–44',
          summary: 'Morada transparente, trono e vigilantes: o juízo e o Filho do Homem emergem na luz da corte celestial.',
          themes: ['trono', 'fogo', 'nome divino'],
          notes: 'As Parábolas alternam descrição hipnótica e juízo — estilo que influenciou literatura apocalíptica posterior.',
          hotspots: [{ x: '48%', y: '40%', label: 'Cristal', info: 'O palácio como fronteira entre o ordenado e o caótico.' }],
        },
      }),
      scene({
        name: 'O FILHO DO HOMEM',
        sub: 'Cap. 46–48 — O Eleito',
        text: 'Antes dele estava o Filho do Homem, que tinha justiça consigo; e com ele habitava a sabedoria. Os reis da terra serão julgados por sua palavra.',
        quote: '"Este é o Filho do Homem a quem pertence a justiça." — 1 En 46:3',
        duration: 12000,
        visual: 1,
        bridge: 'As nações viraram rebanhos sobre colinas escuras...',
        image: IMG.giants,
        panel: {
          title: 'O Eleito e a justiça',
          reference: '1 Enoque 46–48',
          summary: 'A figura messiânica surge como depositária da justiça contra opressores e ídolos.',
          themes: ['Filho do Homem', 'justiça', 'reis'],
          notes: 'Tema amplamente estudado por sua proximidade com linguagem do NT e da tradição judaica antiga.',
          hotspots: [{ x: '55%', y: '52%', label: 'Justiça', info: 'Personificada ao lado do trono, contraponto à violência terrena.' }],
        },
      }),
      scene({
        name: 'O BOSQUE E AS ÁRVORES',
        sub: 'Cap. 60–61 — Cosmologia oculta',
        text: 'Mostrou-me o leão, o touro e o mar — sinais dos poderes que governam correntes e estrelas. O Bosque guarda medidas que os sábios não deveriam profanar.',
        quote: '"E o nome do Filho do Homem foi revelado." — 1 En 69:26',
        duration: 11000,
        visual: 0,
        bridge: 'Do bosque veio o rumor de cascos — o rebanho do fim...',
        image: IMG.corrupt,
        panel: {
          title: 'Símbolos e medidas',
          reference: '1 Enoque 60–61',
          summary: 'Animais e elementos naturais encarnam forças cósmicas e limites do conhecimento humano.',
          themes: ['cosmologia', 'símbolos', 'segredo'],
          notes: 'A tradição enoquiana liga sabedoria astronômica e responsabilidade moral.',
          hotspots: [{ x: '33%', y: '58%', label: 'Medidas', info: 'Geometria sagrada como linguagem do juízo.' }],
        },
      }),
      scene({
        name: 'O REINO NOVO',
        sub: 'Cap. 62–71 — Fim dos opressores',
        text: 'Os poderosos serão humilhados; os justos herdarão luz estável. A terra se renovará quando o nome do Senhor dos Espíritos for exaltado sobre todo oídio.',
        quote: '"E os justos serão salvos naquele dia." — 1 En 62:13',
        duration: 12000,
        visual: 4,
        bridge: null,
        image: IMG.judge,
        panel: {
          title: 'Restauração',
          reference: '1 Enoque 62–71',
          summary: 'Queda dos tiranos e ascensão dos humildes — conclusão ética do ciclo parabólico.',
          themes: ['esperança', 'juízo', 'herança'],
          notes: 'Fechamento que prepara o leitor para o Livro Astronômico e ciclos seguintes.',
          hotspots: [{ x: '50%', y: '45%', label: 'Luz estável', info: 'Imagem de shalom cósmico após o tribunal.' }],
        },
      }),
    ],
  },

  astronomy: {
    id: 'astronomy',
    path: '/astronomy',
    title: 'Livro astronômico',
    audioStem: 'astronomy',
    chapters: 'Capítulos 72–82',
    cardSummary:
      'Uriel revela portas do céu e a cadência infalível dos luminares — tempo divino em harmonia.',
    cardImage: '/images/livro-astronomico-card.webp',
    landingEyebrow: 'Liber Enochi · Astronomia',
    summary:
      'Porta após porta, o sol e a lua cumprem medida; o céu funciona como relógio sagrado, testemunha silenciosa contra a iniquidade.',
    epilogue: {
      quote: 'Eles não transgridem os seus próprios lugares.',
      attribution: '1 Enoque 72 (paráfrase)',
    },
    scenes: [
      scene({
        name: 'AS PORTAS DO CÉU',
        sub: 'Capítulos 72–75 — Uriel e os luminares',
        text: 'Guiado por Uriel, Enoque observa as leis que governam os luminares. O sol, a lua e as estrelas emergem por portas celestes em perfeita ordem. A visão revela a precisão do tempo divino e a harmonia da criação.',
        quote: '"Uriel, o santo anjo que está sobre o mundo e sobre Tartarus." — 1 En 20:2',
        duration: 11000,
        visual: 0,
        imageFocus: '50% 18%',
        bridge: 'Depois vieram as portas prateadas da lua...',
        image: IMG.fall,
        panel: {
          title: 'As portas do céu',
          reference: '1 Enoque 72–75',
          summary: 'Portas, nomes e medidas: o ciclo dos luminares como lei escrita no firmamento.',
          themes: ['Uriel', 'sol', 'calendário'],
          notes: 'Texto fundamental para estudos de calendário qumrânico e judaico antigo.',
          hotspots: [{ x: '62%', y: '35%', label: 'Doze portões', info: 'Simetria entre luz e trevas, ordem e transgressão.' }],
        },
      }),
      scene({
        name: 'A LUA E AS SOMBRAS',
        sub: 'Cap. 73–78 — Fases e eclipse',
        text: 'A lua cresce e minge em câmaras celestes; quando falha em aparecer, é sinal de perturbação na terra. Os vigilantes das estrelas anotam cada atraso.',
        quote: '"E a lua traz a luz para toda a terra." — 1 En 73:3',
        duration: 11000,
        visual: 1,
        bridge: 'Nas profundezas, estrelas rebeldes traçaram outros caminhos...',
        image: IMG.giants,
        panel: {
          title: 'Lunares e sinais',
          reference: '1 Enoque 73–78',
          summary: 'Fases lunares como metáfora de juízo gradual e advertência aos povos.',
          themes: ['lua', 'sinais', 'disciplina'],
          notes: 'A astronomia enoquiana liga céu visível e ética terrena.',
          hotspots: [{ x: '40%', y: '48%', label: 'Câmaras', info: 'Onde a lua "descansa" entre manifestações.' }],
        },
      }),
      scene({
        name: 'VENTOS E LÍDERES',
        sub: 'Cap. 76–77 — Cardinais',
        text: 'Quatro ventos sustentam a terra; quatro árvores grandes marcam os cantos do mundo. Quando sopram fora de ordem, colheitas e reinos estremecem.',
        quote: '"E os quatro ventos do céu que sustentam a terra." — 1 En 76:1',
        duration: 10000,
        visual: 0,
        bridge: 'Uriel fechou o livro — e restou o silêncio dos que calculam o fim...',
        image: IMG.corrupt,
        panel: {
          title: 'Geografia sagrada',
          reference: '1 Enoque 76–77',
          summary: 'Ventos, montanhas e árvores como pilares de uma ordem cósmica.',
          themes: ['ventos', 'terra', 'pilares'],
          notes: 'Eco de mapas míticos do Oriente Próximo antigo.',
          hotspots: [{ x: '70%', y: '55%', label: 'Quatro cantos', info: 'Limite entre o habitável e o caótico.' }],
        },
      }),
      scene({
        name: 'O LIVRO DOS LUMINARES',
        sub: 'Cap. 78–82 — Testemunho final',
        text: 'Tudo foi escrito para os filhos da terra: para que saibam que nenhuma palavra se altera. O céu é testemunha contra os que mudam os tempos estabelecidos.',
        quote: '"Escreve tudo a memória de teus pais." — 1 En 82:1',
        duration: 12000,
        visual: 3,
        bridge: null,
        image: IMG.seals,
        panel: {
          title: 'Memória e lei celeste',
          reference: '1 Enoque 78–82',
          summary: 'O astrônomo escriba fecha o ciclo: sabedoria transmitida como herança.',
          themes: ['escrita', 'herança', 'lei'],
          notes: 'Transição natural para os Sonhos e visões simbólicas seguintes.',
          hotspots: [{ x: '50%', y: '40%', label: 'Memória', info: 'O livro como antídoto ao esquecimento dos Vigilantes.' }],
        },
      }),
    ],
  },

  dreams: {
    id: 'dreams',
    path: '/dreams',
    title: 'Sonhos',
    audioStem: 'dreams',
    chapters: 'Capítulos 83–90',
    cardSummary:
      'Animais em sonho: patriarcas, nações e pastor supremo — a história como visão simbólica.',
    cardImage: '/images/sonhos-card.webp',
    landingEyebrow: 'Liber Enochi · Somnia',
    summary:
      'Touros, ovelhas e feras contam séculos de sangue e fé; no alto pasto, o Senhor das Ovelhas mede o rebanho até ao corte final.',
    epilogue: {
      quote: 'E vi até que um cordeiro nasceu.',
      attribution: '1 Enoque 90 (eco)',
    },
    scenes: [
      scene({
        name: 'O APOCALIPSE ANIMAL',
        sub: 'Capítulos 85–90 — História em bestiário',
        text: 'Em sonhos simbólicos, a história do mundo é revelada através de animais. Touros, ovelhas e feras representam patriarcas, fiéis e impérios. A visão mostra a luta espiritual da humanidade e a proteção final do Senhor das Ovelhas.',
        quote: '"E levantei as mãos em justiça e bendisse." — 1 En 84:1',
        duration: 10000,
        visual: 0,
        imageFocus: '48% 20%',
        bridge: 'Do sono veio um segundo véu — mais denso que o primeiro...',
        image: IMG.fall,
        panel: {
          title: 'O apocalipse animal',
          reference: '1 Enoque 85–90',
          summary: 'Bestiário onírico: linhagens, impérios e pastor divino num único fio de visão.',
          themes: ['dilúvio', 'intercessão', 'estrelas'],
          notes: 'Ligação explícita com a narrativa de Noé no próprio texto enoquiano.',
          hotspots: [{ x: '45%', y: '38%', label: 'Estrelas', info: 'Quedas como metáfora de desordem angelical.' }],
        },
      }),
      scene({
        name: 'O SEGUNDO SONHO',
        sub: 'Cap. 85 — Vigilantes como estrelas',
        text: 'Vi grandes estrelas lançadas ao rebanho de touros; elas conceberam elefantes, camelos e asnos — uma genealogia simbólica da corrupção.',
        quote: '"E aqueles touros começaram a morder umas às outras." — 1 En 85:3',
        duration: 11000,
        visual: 1,
        bridge: 'Da manada nasceu a história de Israel em forma animal...',
        image: IMG.giants,
        panel: {
          title: 'Animais e estrelas',
          reference: '1 Enoque 85',
          summary: 'Bestiário visionário substitui genealogias por imagens oníricas.',
          themes: ['símbolo', 'rebanho', 'queda'],
          notes: 'Capítulo famoso pela codificação de personagens bíblicos como animais.',
          hotspots: [{ x: '58%', y: '50%', label: 'Touros', info: 'Representam líderes e linhagens escolhidas.' }],
        },
      }),
      scene({
        name: 'TOUROS E OVELHAS',
        sub: 'Cap. 86–89 — Perseguição',
        text: 'Lobos devoraram ovelhas; cordeiros cegos tropeçaram; um leão e um touro lutaram até o Senhor dos Carneiros enviar auxílio. O sangue cobriu o pasto.',
        quote: '"E os cordeiros gritaram por causa dos seus cordeirinhos." — 1 En 89:16',
        duration: 12000,
        visual: 1,
        bridge: 'No alto pasto, um rosto de águia observava tudo...',
        image: IMG.corrupt,
        panel: {
          title: 'Pasto ensanguentado',
          reference: '1 Enoque 86–89',
          summary: 'Alegoria histórica de opressão, exílio e esperança de pastoreio divino.',
          themes: ['ovelhas', 'opressão', 'lamento'],
          notes: 'Leitura histórica associa períodos a monarquias e invasores.',
          hotspots: [{ x: '30%', y: '60%', label: 'Lobos', info: 'Poderes hostis ao rebanho.' }],
        },
      }),
      scene({
        name: 'O PASTOR SUPREMO',
        sub: 'Cap. 90 — Julgamento do rebanho',
        text: 'Um homem alto construiu um foice de fogo e ceifou os ímpios; depois mediu o rebanho e abriu muitas portas. A casa branca foi renovada.',
        quote: '"E vi até que um cordeiro nasceu." — 1 En 90:6',
        duration: 12000,
        visual: 4,
        bridge: null,
        image: IMG.judge,
        panel: {
          title: 'Ceifa e medida',
          reference: '1 Enoque 90',
          summary: 'Clímax visionário: instrumento flamejante, balança e renovação do povo.',
          themes: ['juízo', 'foice', 'renovação'],
          notes: 'Pontes literárias com outras apocalípticas judaicas.',
          hotspots: [{ x: '52%', y: '42%', label: 'Foice', info: 'Separação final entre fiéis e opressores.' }],
        },
      }),
    ],
  },

  epistle: {
    id: 'epistle',
    path: '/epistle',
    title: 'Epístola',
    audioStem: 'judgement',
    chapters: 'Capítulos 91–108',
    cardSummary:
      'Vale do juízo: trevas prometidas aos ímpios e luz de restauração para os justos.',
    cardImage: '/images/epistola-card.webp',
    landingEyebrow: 'Liber Enochi · Epistula',
    summary:
      'Sob a escrita das semanas e das exortações, abre-se o vale onde o fim se mede — sombra para os violentos, aurora para os fiéis.',
    epilogue: {
      quote: 'Escolhei para vós a justiça e um comprido caminho.',
      attribution: '1 Enoque 94:1',
    },
    scenes: [
      scene({
        name: 'O VALE DO JUÍZO',
        sub: 'Capítulos 91–108 — Visão do fim (complemento cap. 27)',
        text: 'Enoque contempla o vale reservado ao julgamento final. As sombras representam o destino dos ímpios, enquanto uma luz distante anuncia a restauração. A visão encerra a promessa de justiça e renovação para os justos.',
        quote: '"E compreendei tudo pelos livros que me deu Uriel." — 1 En 93:2',
        duration: 11000,
        visual: 0,
        imageFocus: '50% 26%',
        bridge: 'Das profundezas da visão surgiu a voz que conta o tempo em semanas...',
        image: IMG.fall,
        panel: {
          title: 'O vale do juízo',
          reference: '1 Enoque 91–108 · ver também 27',
          summary: 'Vale, trevas e claridade: o destino dos ímpios e o alento prometido aos justos.',
          themes: ['tempo', 'semanas', 'escrita'],
          notes: 'Objeto de estudo para cronologias judaicas do II a.C.',
          hotspots: [{ x: '50%', y: '35%', label: 'Dez portas', info: 'Cada "semana" um estágio moral do mundo.' }],
        },
      }),
      scene({
        name: 'EXORTAÇÃO AOS JUSTOS',
        sub: 'Cap. 94–96 — Contra os ricos',
        text: 'Ai de vós que edificais iniquidade com ouro; vossos tesouros testemunharão contra vós no dia em que as montanhas fugirem.',
        quote: '"Ai de vós, ricos, porque sois pobres." — 1 En 94:8',
        duration: 11000,
        visual: 3,
        bridge: 'Das exortações passou-se à visão de metal derretido...',
        image: IMG.corrupt,
        panel: {
          title: 'Juízo social',
          reference: '1 Enoque 94–96',
          summary: 'Profecias de queda dos opressores e consolo aos humilhados.',
          themes: ['justiça social', 'riqueza', 'testemunho'],
          notes: 'Tom semelhante a tradições proféticas bíblicas.',
          hotspots: [{ x: '38%', y: '55%', label: 'Tesouros', info: 'Objetos que se voltam contra seus donos.' }],
        },
      }),
      scene({
        name: 'MONTANHAS DE FERRO',
        sub: 'Cap. 52–54 (visão integrada) — Metais e fogo',
        text: 'Montanhas de ferro, prata e ouro derreteram; de seus rios nasceu um anjo que mediu a iniquidade acumulada nas forjas dos reis.',
        quote: '"E todas estas coisas servirão ao Senhor dos Espíritos." — 1 En 54:6',
        duration: 10000,
        visual: 3,
        bridge: 'Por fim restou o nome gravado na pedra viva...',
        image: IMG.seals,
        panel: {
          title: 'Metais fundidos',
          reference: '1 Enoque 52–54',
          summary: 'Visão complementar de forjas cósmicas e instrumentos de juízo.',
          themes: ['metal', 'fogo', 'medida'],
          notes: 'Integração temática com o fio condutor da Epístola.',
          hotspots: [{ x: '65%', y: '48%', label: 'Forja', info: 'O império transformado em escória.' }],
        },
      }),
      scene({
        name: 'O TESTAMENTO',
        sub: 'Cap. 104–108 — Enoque glorificado',
        text: 'Vossos nomes estarão escritos para sempre; o Grande Santo será vosso guia. Enoque desaparece da terra, mas sua voz permanece como luz para os que escutam.',
        quote: '"E sereis como luz das estrelas." — 1 En 104:2',
        duration: 12000,
        visual: 4,
        bridge: null,
        image: IMG.judge,
        panel: {
          title: 'Glorificação dos justos',
          reference: '1 Enoque 104–108',
          summary: 'Promessa de memória eterna e continuidade da voz profética.',
          themes: ['memória', 'luz', 'testamento'],
          notes: 'Fecho do corpus enoquiano em tom de esperança.',
          hotspots: [{ x: '48%', y: '50%', label: 'Estrelas', info: 'Metáfora da comunidade dos justos.' }],
        },
      }),
    ],
  },
}

for (const id of SECTION_ORDER) {
  const meta = SCENE_CHAPTER_META[id]
  const imgs = SCENE_IMAGES[id]
  const scs = sections[id]?.scenes
  if (!scs) continue
  scs.forEach((s, i) => {
    if (meta?.[i]) Object.assign(s, meta[i])
    const url = imgs?.[i]
    if (url) s.image = url
  })
}

export function getSectionById(id) {
  return sections[id] ?? null
}

export function getAdjacentSections(id) {
  const i = SECTION_ORDER.indexOf(id)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? sections[SECTION_ORDER[i - 1]] : null,
    next: i < SECTION_ORDER.length - 1 ? sections[SECTION_ORDER[i + 1]] : null,
  }
}
