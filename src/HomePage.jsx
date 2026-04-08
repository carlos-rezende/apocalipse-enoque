import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useMusic } from './musicContext.jsx'
import { sections, SECTION_ORDER } from './data/sectionsData.js'
import { prefetchSimulationChunk, prefetchSectionImages } from './prefetchExperience.js'
import { useDocumentMeta } from './documentMeta.js'

function HomeParticles() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    let W = window.innerWidth
    let H = window.innerHeight
    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * DPR
      canvas.height = H * DPR
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const N = 72
    const rng = (s) => {
      let x = s
      return () => {
        x = (x * 1664525 + 1013904223) % 4294967296
        return x / 4294967296
      }
    }
    const rand = rng(0x5eedface)
    const pts = Array.from({ length: N }, () => ({
      x: rand() * W,
      y: rand() * H,
      r: 0.35 + rand() * 1.2,
      vx: (rand() - 0.5) * 0.12,
      vy: (rand() - 0.5) * 0.1 - 0.02,
      a: 0.08 + rand() * 0.35,
    }))

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -4) p.x = W + 4
        if (p.x > W + 4) p.x = -4
        if (p.y < -4) p.y = H + 4
        if (p.y > H + 4) p.y = -4
        ctx.beginPath()
        ctx.fillStyle = `rgba(201,168,76,${p.a})`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.35,
      }}
      aria-hidden
    />
  )
}

export default function HomePage() {
  const music = useMusic()

  useDocumentMeta(
    'Apocalipse de Enoque — Mapa do livro',
    'Cinco secções do Livro de Enoque com simulação em cenas, imagens, modo ritual e notas sobre o texto.',
  )

  const onAmbientClick = useCallback(() => {
    music.setMuted(false)
    music.start(0.11)
  }, [music])

  const onAmbientOff = useCallback(() => {
    music.setMuted(true)
  }, [music])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #2a1538 0%, #0f0818 45%, #06040c 100%)',
        color: '#e8e0d0',
      }}
    >
      <HomeParticles />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 100%, transparent 30%, rgba(0,0,6,.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      <header style={{ position: 'relative', zIndex: 2, padding: 'clamp(28px,6vw,56px) clamp(20px,5vw,48px) 8px' }}>
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '.55rem',
            letterSpacing: '.48em',
            color: 'rgba(201,168,76,.5)',
            textTransform: 'uppercase',
            margin: '0 0 14px',
          }}
        >
          Manuscriptum apocryphum
        </p>
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem,6vw,3.6rem)',
            letterSpacing: '.12em',
            margin: 0,
            lineHeight: 1.05,
            textShadow: '0 0 40px rgba(201,168,76,.15)',
          }}
        >
          APOCALIPSE DE ENOQUE
        </h1>
        <p
          style={{
            fontFamily: "'Crimson Text', Georgia, serif",
            fontSize: 'clamp(1rem,2.2vw,1.2rem)',
            maxWidth: 560,
            lineHeight: 1.75,
            opacity: 0.72,
            marginTop: 18,
          }}
        >
          Mapa interativo do livro: cinco partes com cenas cinematográficas leves, narrativa resumida,
          modo ritual, autoplay por URL e trilha contínua entre seções.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22, alignItems: 'center' }}>
          <button
            type="button"
            onClick={onAmbientClick}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '.48rem',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: '1px solid rgba(201,168,76,.4)',
              background: 'rgba(10,8,16,.55)',
              color: '#c9a84c',
              cursor: 'pointer',
            }}
          >
            ouvir ambiente
          </button>
          <button
            type="button"
            onClick={onAmbientOff}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '.48rem',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: '1px solid rgba(201,168,76,.22)',
              background: 'transparent',
              color: 'rgba(201,168,76,.55)',
              cursor: 'pointer',
            }}
          >
            silenciar
          </button>
          <Link
            to="/notas"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '.48rem',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: '1px solid rgba(201,168,76,.32)',
              background: 'rgba(10,8,16,.45)',
              color: 'rgba(201,168,76,.75)',
              textDecoration: 'none',
            }}
          >
            notas sobre o texto
          </Link>
        </div>
      </header>

      <section className="cards-grid" aria-label="Secções do livro">
        {SECTION_ORDER.map((id) => {
          const s = sections[id]
          return (
            <article
              key={id}
              className="card"
              onMouseEnter={() => {
                prefetchSimulationChunk()
                prefetchSectionImages(id)
              }}
            >
              <div className="card-image-wrap">
                <img
                  src={s.cardImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <div className="card-image-overlay" aria-hidden />
              </div>
              <div className="card-content">
                <h2 className="card-title">{s.title}</h2>
                <p className="card-subtitle">{s.chapters}</p>
                <p className="card-text">{s.cardSummary}</p>
                <Link
                  to={s.path}
                  className="card-button"
                  onMouseEnter={() => {
                    prefetchSimulationChunk()
                    prefetchSectionImages(id)
                  }}
                  onFocus={() => {
                    prefetchSimulationChunk()
                    prefetchSectionImages(id)
                  }}
                >
                  Explorar
                </Link>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
