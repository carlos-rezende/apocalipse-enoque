// ─────────────────────────────────────────────────────────────────────────────
// APOCALIPSE DE ENOQUE — Simulação 2D Cinemática  v2.0
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect, memo } from 'react'
import { useParams, Link, useLocation, Navigate, useSearchParams } from 'react-router-dom'
import { prefetchSimulationChunk, prefetchSectionImages } from './prefetchExperience.js'
import { useMusic } from './musicContext.jsx'
import { getSectionById, getAdjacentSections } from './data/sectionsData.js'
import { useDocumentMeta } from './documentMeta.js'

// ═══════════════════════════════════════════════════════════════════════════════
// prefers-reduced-motion — desliga respiração, parallax, grão animado e float da imagem
// ═══════════════════════════════════════════════════════════════════════════════
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduce(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduce
}

// ═══════════════════════════════════════════════════════════════════════════════
// URL PARAMS & INTENSITY CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
function parseURLParams(search, maxSceneExclusive) {
  const p = new URLSearchParams(search)
  const scene = parseInt(p.get('scene') ?? '-1', 10)
  const int = p.get('intensity') ?? 'default'
  return {
    autoplay: p.get('autoplay') === '1',
    ritual: p.get('ritual') === '1',
    explore: p.get('explore') === '1',
    startScene: Number.isFinite(scene) && scene >= 0 && scene < maxSceneExclusive ? scene : -1,
    intensity: ['leve', 'intenso'].includes(int) ? int : 'default',
  }
}

const INTENSITY_CONFIG = {
  leve:    { pMult: 0.6, dMult: 0.9, gMult: 0.8, aVol: 0.14, wMult: 0.7 },
  default: { pMult: 1.0, dMult: 1.0, gMult: 1.0, aVol: 0.18, wMult: 1.0 },
  intenso: { pMult: 1.4, dMult: 1.1, gMult: 1.2, aVol: 0.207, wMult: 1.5 },
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEYFRAMES
// ═══════════════════════════════════════════════════════════════════════════════
const KEYFRAMES = `
@keyframes title-shimmer {
  0%,100%{text-shadow:0 0 22px rgba(201,168,76,.4)}
  50%{text-shadow:0 0 50px rgba(201,168,76,.85),0 0 100px rgba(201,168,76,.2)}
}
@keyframes fade-rise {
  from{opacity:0;transform:translateY(18px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes btn-pulse {
  0%,100%{box-shadow:0 0 20px rgba(201,168,76,.3)}
  50%{box-shadow:0 0 44px rgba(201,168,76,.7),0 0 88px rgba(201,168,76,.2)}
}
@keyframes indicator-float {
  0%{opacity:0;transform:translateY(6px)}
  20%{opacity:1;transform:translateY(0)}
  80%{opacity:1;transform:translateY(-4px)}
  100%{opacity:0;transform:translateY(-10px)}
}
@keyframes img-float {
  0%,100%{transform:scale(1.02) translateY(0)}
  50%{transform:scale(1.04) translateY(-7px)}
}
@keyframes img-float-intenso {
  0%,100%{transform:scale(1.02) translateY(0)}
  50%{transform:scale(1.06) translateY(-10px)}
}
@keyframes panel-slide-in {
  from{transform:translateX(320px);opacity:0}
  to{transform:translateX(0);opacity:1}
}
@keyframes tooltip-fade {
  from{opacity:0;transform:translateY(4px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes hotspot-pulse {
  0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.5)}
  50%{box-shadow:0 0 0 6px rgba(201,168,76,0)}
}
@keyframes breathe {
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.008)}
}
@keyframes trans-phrase-in {
  from{opacity:0;transform:translateY(8px)}
  to{opacity:1;transform:translateY(0)}
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// CENA 3 — indicadores flutuantes (visual compartilhado)
// ═══════════════════════════════════════════════════════════════════════════════
const INDICATORS = [
  { text: '− 23%  colheita',   delay: 2600, x: '18%', y: '38%' },
  { text: '+ 18%  violência',  delay: 4400, x: '66%', y: '50%' },
  { text: '− 51%  esperança',  delay: 6000, x: '32%', y: '64%' },
  { text: '+ 34%  iniquidade', delay: 7600, x: '70%', y: '30%' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// useSceneController
// ═══════════════════════════════════════════════════════════════════════════════
function useSceneController(durations, getHoldPaused = () => false) {
  const durRef = useRef(durations)
  useEffect(() => { durRef.current = durations })

  const getHoldPausedRef = useRef(getHoldPaused)
  useEffect(() => { getHoldPausedRef.current = getHoldPaused })

  const [scene, setScene]           = useState(-1)
  const [progress, setProgress]     = useState(0)
  const [isTrans, setIsTrans]       = useState(false)
  const [ended, setEnded]           = useState(false)
  // Cena da qual estamos saindo — fixa durante toda a transição (evita trocar a frase
  // quando `scene` já atualiza mas o overlay ainda está visível)
  const [transFromScene, setTransFromScene] = useState(null)

  const transRef  = useRef(false)
  const endedRef  = useRef(false)
  const sceneRef  = useRef(-1)
  const rafRef    = useRef(null)
  const tRef      = useRef(null)
  const wasHeldRef = useRef(false)
  const pauseFrozenPctRef = useRef(0)

  const doTransition = useCallback((target) => {
    if (transRef.current) return
    transRef.current = true
    setTransFromScene(sceneRef.current)
    setIsTrans(true)
    cancelAnimationFrame(rafRef.current)

    setTimeout(() => {
      const count = durRef.current.length
      if (target >= count) {
        endedRef.current = true
        setEnded(true); setScene(-2); sceneRef.current = -2
        transRef.current = false; setIsTrans(false); setTransFromScene(null)
        return
      }
      sceneRef.current = target
      tRef.current = null
      setScene(target); setProgress(0)
      setTimeout(() => {
        transRef.current = false
        setIsTrans(false)
        setTransFromScene(null)
      }, 80)
    }, 3800)
  }, [])

  const nextScene       = useCallback(() => doTransition(sceneRef.current + 1), [doTransition])
  const startSimulation = useCallback(() => doTransition(0), [doTransition])
  const startAtScene    = useCallback((n) => {
    const c = durRef.current.length
    doTransition(Math.max(0, Math.min(n, c - 1)))
  }, [doTransition])
  const resetSimulation = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    transRef.current = false; endedRef.current = false
    sceneRef.current = -1; tRef.current = null
    setScene(-1); setEnded(false); setIsTrans(false); setProgress(0); setTransFromScene(null)
  }, [])

  /** Salto direto (índice / URL) — sem overlay de transição de 3,8s. */
  const jumpToScene = useCallback((n) => {
    const count = durRef.current.length
    if (count === 0) return
    const target = Math.max(0, Math.min(n, count - 1))
    cancelAnimationFrame(rafRef.current)
    transRef.current = false
    endedRef.current = false
    tRef.current = null
    sceneRef.current = target
    setEnded(false)
    setIsTrans(false)
    setTransFromScene(null)
    setScene(target)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (scene < 0) return
    cancelAnimationFrame(rafRef.current)
    tRef.current = null
    wasHeldRef.current = false
    const dur = durRef.current[scene] ?? 10000

    const tick = (ts) => {
      if (endedRef.current) return
      if (transRef.current) { rafRef.current = requestAnimationFrame(tick); return }
      if (!tRef.current) tRef.current = ts

      const held = getHoldPausedRef.current()
      if (held) {
        if (!wasHeldRef.current) {
          pauseFrozenPctRef.current = Math.min((ts - tRef.current) / dur, 1)
          wasHeldRef.current = true
        }
        setProgress(pauseFrozenPctRef.current)
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (wasHeldRef.current) {
        tRef.current = ts - pauseFrozenPctRef.current * dur
        wasHeldRef.current = false
      }

      const pct = Math.min((ts - tRef.current) / dur, 1)
      setProgress(pct)
      if (pct >= 1) { nextScene(); return }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [scene, nextScene])

  return { scene, progress, isTrans, transFromScene, ended, nextScene, startSimulation, startAtScene, resetSimulation, jumpToScene }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SceneImageOverlay — imagem cinemática entre canvas e narrativa
// lazy load, blend overlay, leve parallax flutuante, fallback silencioso
// ═══════════════════════════════════════════════════════════════════════════════
function SceneImageOverlay({
  src,
  srcSet,
  sizes,
  objectPosition = 'center 24%',
  transformOrigin = '50% 28%',
  opacity = 0.18,
  intenso = false,
  reduceMotion = false,
}) {
  const [loaded, setLoaded] = useState(false)
  const [err,    setErr]    = useState(false)
  const parallaxRef = useRef(null)
  const mouseRef    = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })
  const rafRef      = useRef(null)
  // Desativado em dispositivos touch
  const isMobile    = useRef(typeof window !== 'undefined' && 'ontouchstart' in window)

  // Parallax via rAF com lerp suave — max ±2px
  useEffect(() => {
    if (reduceMotion || isMobile.current || !loaded) return

    const onMove = (e) => {
      mouseRef.current.tx = (e.clientX / window.innerWidth  - 0.5) * 4
      mouseRef.current.ty = (e.clientY / window.innerHeight - 0.5) * 4
    }

    const tick = () => {
      const m = mouseRef.current
      m.cx += (m.tx - m.cx) * 0.06
      m.cy += (m.ty - m.cy) * 0.06
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate(${m.cx.toFixed(2)}px,${m.cy.toFixed(2)}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [loaded, reduceMotion])

  if (!src || err) return null

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none', zIndex: 5,
      overflow: 'hidden',
    }}>
      {/* Inner div ligeiramente maior absorve o translate sem mostrar borda */}
      <div ref={parallaxRef} style={{ position: 'absolute', inset: '-6px', willChange: reduceMotion ? 'auto' : 'transform' }}>
        <img
          src={src}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          alt=""
          draggable={false}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition,
            transformOrigin,
            srcSet: srcSet || undefined,
            sizes: sizes || undefined,
            mixBlendMode: 'overlay',
            opacity: loaded ? opacity : 0,
            transition: 'opacity 1.4s ease',
            animation: loaded && !reduceMotion
              ? `${intenso ? 'img-float-intenso' : 'img-float'} ${intenso ? 16 : 22}s ease-in-out infinite`
              : 'none',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TooltipHotspot — hotspot interativo com tooltip contextual
// ═══════════════════════════════════════════════════════════════════════════════
function TooltipHotspot({ x, y, label, info }) {
  const [hovered, setHovered] = useState(false)

  // Detecta se tooltip vai sair pela direita
  const xNum = parseFloat(x)
  const alignRight = xNum > 60

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y,
        zIndex: 42, transform: 'translate(-50%, -50%)',
        pointerEvents: 'all',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={e => e.stopPropagation()}
    >
      {/* Círculo hotspot */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: `1px solid rgba(201,168,76,${hovered ? '.85' : '.45'})`,
        background: `rgba(10,10,15,${hovered ? '.75' : '.45'})`,
        cursor: 'help',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
        animation: 'hotspot-pulse 2.5s ease-in-out infinite',
        transition: 'border-color .2s, background .2s, box-shadow .2s',
        boxShadow: hovered ? '0 0 18px rgba(201,168,76,.5)' : '0 0 6px rgba(201,168,76,.22)',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', opacity: .88 }} />
      </div>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          [alignRight ? 'right' : 'left']: '50%',
          transform: alignRight ? 'translateX(50%)' : 'translateX(-50%)',
          background: 'rgba(8,7,14,.93)',
          border: '1px solid rgba(201,168,76,.28)',
          backdropFilter: 'blur(10px)',
          padding: '10px 14px',
          width: 210,
          animation: 'tooltip-fade .15s ease both',
          pointerEvents: 'none',
          zIndex: 50,
        }}>
          {/* Seta */}
          <div style={{
            position: 'absolute', bottom: -6, [alignRight ? 'right' : 'left']: 'calc(50% - 5px)',
            width: 10, height: 6,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'rgba(201,168,76,.28)',
          }} />
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: '.5rem', letterSpacing: '.22em',
            color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase',
          }}>{label}</p>
          <p style={{
            fontFamily: "'Crimson Text', Georgia, serif", fontSize: '.83rem',
            color: '#e8e0d0', margin: 0, lineHeight: 1.5, opacity: .85,
          }}>{info}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ChapterInfoPanel — painel lateral 320px com info do capítulo
// ═══════════════════════════════════════════════════════════════════════════════
function ChapterInfoPanel({ data, visible, onClose }) {
  if (!visible || !data) return null

  return (
    <div
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 320, maxWidth: '85vw',
        background: 'rgba(8,7,14,.9)',
        backdropFilter: 'blur(14px)',
        borderLeft: '1px solid rgba(201,168,76,.15)',
        zIndex: 45,
        display: 'flex', flexDirection: 'column',
        animation: 'panel-slide-in .38s cubic-bezier(.22,1,.36,1) both',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(201,168,76,.2) transparent',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(201,168,76,.1)', position: 'relative' }}>
        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: '.44rem', letterSpacing: '.42em',
          color: '#c9a84c', opacity: .55, margin: '0 0 5px', textTransform: 'uppercase',
        }}>Informações do Capítulo</p>
        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: '.5rem', letterSpacing: '.2em',
          color: 'rgba(201,168,76,.55)', margin: '0 0 8px',
        }}>{data.reference}</p>
        <h3 style={{
          fontFamily: "'Cinzel', serif", fontSize: '.9rem', fontWeight: 600,
          color: '#e8e0d0', margin: 0, lineHeight: 1.45, paddingRight: 24,
        }}>{data.title}</h3>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', color: 'rgba(201,168,76,.5)',
            cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1,
            transition: 'color .2s', padding: 2,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#c9a84c' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,168,76,.5)' }}
        >×</button>
      </div>

      {/* Resumo */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,.07)' }}>
        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: '.42rem', letterSpacing: '.24em',
          color: '#c9a84c', opacity: .5, margin: '0 0 8px', textTransform: 'uppercase',
        }}>Resumo</p>
        <p style={{
          fontFamily: "'Crimson Text', Georgia, serif", fontSize: '.94rem',
          color: '#e8e0d0', margin: 0, lineHeight: 1.7, opacity: .88,
        }}>{data.summary}</p>
      </div>

      {/* Temas */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(201,168,76,.07)' }}>
        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: '.42rem', letterSpacing: '.24em',
          color: '#c9a84c', opacity: .5, margin: '0 0 9px', textTransform: 'uppercase',
        }}>Temas</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.themes.map((t, i) => (
            <span key={i} style={{
              fontFamily: "'Crimson Text', Georgia, serif", fontSize: '.75rem',
              color: '#c9a84c', background: 'rgba(201,168,76,.09)',
              border: '1px solid rgba(201,168,76,.2)',
              padding: '3px 10px', lineHeight: 1.6,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Curiosidades */}
      <div style={{ padding: '12px 20px 22px' }}>
        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: '.42rem', letterSpacing: '.24em',
          color: '#c9a84c', opacity: .5, margin: '0 0 8px', textTransform: 'uppercase',
        }}>Curiosidades</p>
        <p style={{
          fontFamily: "'Crimson Text', Georgia, serif", fontSize: '.92rem', fontStyle: 'italic',
          color: '#e8e0d0', margin: 0, lineHeight: 1.7, opacity: .72,
        }}>{data.notes}</p>
      </div>

      {/* Hotspots listados */}
      {data.hotspots?.length > 0 && (
        <div style={{ padding: '0 20px 22px', borderTop: '1px solid rgba(201,168,76,.07)', paddingTop: 12 }}>
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: '.42rem', letterSpacing: '.24em',
            color: '#c9a84c', opacity: .5, margin: '0 0 10px', textTransform: 'uppercase',
          }}>Pontos de Interesse</p>
          {data.hotspots.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{
                marginTop: 4, width: 8, height: 8, borderRadius: '50%',
                background: '#c9a84c', flexShrink: 0, opacity: .7,
              }} />
              <div>
                <p style={{
                  fontFamily: "'Cinzel', serif", fontSize: '.5rem', letterSpacing: '.12em',
                  color: '#c9a84c', margin: '0 0 3px',
                }}>{h.label}</p>
                <p style={{
                  fontFamily: "'Crimson Text', Georgia, serif", fontSize: '.82rem',
                  color: '#e8e0d0', margin: 0, lineHeight: 1.5, opacity: .72,
                }}>{h.info}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ExploreToggle — botão discreto para ativar modo explorar
// ═══════════════════════════════════════════════════════════════════════════════
function ExploreToggle({ explore, onToggle }) {
  return (
    <button
      type="button"
      className="sim-control-btn"
      onClick={e => { e.stopPropagation(); onToggle() }}
      title={explore ? 'Fechar exploração (Esc)' : 'Explorar capítulo'}
      style={{
        position: 'absolute', top: 38, right: 22, zIndex: 46,
        background: explore ? 'rgba(201,168,76,.15)' : 'rgba(10,10,15,.72)',
        border: `1px solid rgba(201,168,76,${explore ? '.55' : '.26'})`,
        color: explore ? '#c9a84c' : 'rgba(201,168,76,.52)',
        padding: '5px 11px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: "'Cinzel', serif", fontSize: '.44rem', letterSpacing: '.18em',
        transition: 'all .25s ease',
        backdropFilter: 'blur(5px)',
        textTransform: 'uppercase',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.7)'; e.currentTarget.style.color = '#c9a84c' }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = explore ? 'rgba(201,168,76,.55)' : 'rgba(201,168,76,.26)'
        e.currentTarget.style.color = explore ? '#c9a84c' : 'rgba(201,168,76,.52)'
      }}
    >
      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
        <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      {explore ? 'fechar' : 'explorar'}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILM GRAIN OVERLAY — ruído cinematográfico procedural, 120ms update
// ═══════════════════════════════════════════════════════════════════════════════
function FilmGrainOverlay({ reduceMotion = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const SIZE = 256
    canvas.width = SIZE; canvas.height = SIZE
    const ctx = canvas.getContext('2d')

    const update = () => {
      const img = ctx.createImageData(SIZE, SIZE)
      const d   = img.data
      for (let i = 0; i < d.length; i += 4) {
        const v    = (Math.random() * 255) | 0
        d[i]       = v; d[i+1] = v; d[i+2] = v
        d[i+3]     = (Math.random() * 28) | 0
      }
      ctx.putImageData(img, 0, 0)
    }
    update()
    if (reduceMotion) return
    const id = setInterval(update, 120)
    return () => clearInterval(id)
  }, [reduceMotion])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      opacity: 0.055, mixBlendMode: 'overlay',
      pointerEvents: 'none', zIndex: 200,
      imageRendering: 'pixelated',
    }} />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARE BUTTON — copia link com estado atual para clipboard
// ═══════════════════════════════════════════════════════════════════════════════
function ShareButton({ scene, intensity, ritual, explore, autoplayMode }) {
  const location = useLocation()
  const [copied,   setCopied]   = useState(false)
  const [fallback, setFallback] = useState('')

  const share = useCallback((e) => {
    e.stopPropagation()
    const p = new URLSearchParams()
    if (scene >= 0) p.set('scene', scene)
    if (intensity !== 'default') p.set('intensity', intensity)
    if (ritual) p.set('ritual', '1')
    if (explore) p.set('explore', '1')
    if (autoplayMode) p.set('autoplay', '1')
    const url = `${window.location.origin}${location.pathname}${p.toString() ? '?' + p : ''}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200) })
        .catch(() => setFallback(url))
    } else {
      setFallback(url)
    }
  }, [scene, intensity, ritual, explore, autoplayMode, location.pathname])

  return (
    <div style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 60 }} onClick={e => e.stopPropagation()}>
      {fallback ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            value={fallback} readOnly
            style={{ fontFamily:"'Crimson Text',serif", fontSize:'.7rem', color:'#c9a84c', background:'rgba(10,10,15,.9)', border:'1px solid rgba(201,168,76,.4)', padding:'5px 10px', outline:'none', width:260 }}
            onFocus={e => e.target.select()}
          />
          <button onClick={() => setFallback('')} style={{ background:'none', border:'none', color:'#c9a84c', cursor:'pointer', fontSize:'1rem', lineHeight:1 }}>×</button>
        </div>
      ) : (
        <button
          type="button"
          className="sim-control-btn"
          onClick={share}
          title="Compartilhar experiência"
          style={{
            background: 'rgba(10,10,15,.75)', border: '1px solid rgba(201,168,76,.32)',
            color: copied ? '#5cba6a' : '#c9a84c',
            padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'Cinzel',serif", fontSize: '.55rem', letterSpacing: '.12em',
            transition: 'all .3s ease', backdropFilter: 'blur(4px)',
          }}
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="2,7 6,11 12,3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="11" cy="3" r="1.8" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="11" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="3"  cy="7" r="1.8" stroke="currentColor" strokeWidth="1.4" />
              <line x1="9.3" y1="3.9"  x2="4.7" y2="6.1" stroke="currentColor" strokeWidth="1.2" />
              <line x1="9.3" y1="10.1" x2="4.7" y2="7.9" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
          {copied ? 'copiado' : 'compartilhar'}
        </button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Citação / referência — bloco informativo sob a narrativa (mesma coluna)
// ═══════════════════════════════════════════════════════════════════════════════
function NarrativeReference({ text, active }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      const id = requestAnimationFrame(() => setVisible(false))
      return () => cancelAnimationFrame(id)
    }
    if (!text) {
      const id = requestAnimationFrame(() => setVisible(false))
      return () => cancelAnimationFrame(id)
    }
    const id0 = requestAnimationFrame(() => setVisible(false))
    const t = setTimeout(() => setVisible(true), 1500)
    return () => {
      cancelAnimationFrame(id0)
      clearTimeout(t)
    }
  }, [active, text])

  if (!text) return null

  return (
    <div
      className="narrative-reference"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="narrative-reference-label">Referência textual</p>
      <p
        className="narrative-reference-quote"
        style={{ opacity: visible ? 0.92 : 0 }}
      >
        {text}
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NARRATIVE OVERLAY — fade in palavra por palavra (30ms/palavra)
// ═══════════════════════════════════════════════════════════════════════════════
function NarrativeOverlay({ text, quote, active, progress = 0, reduceMotion = false, paused = false }) {
  const [count, setCount] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef(null)
  const words = useMemo(() => text.split(/\s+/), [text])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (!active) {
      const id0 = requestAnimationFrame(() => setFading(true))
      const t = setTimeout(() => { setCount(0); setFading(false) }, 420)
      return () => {
        cancelAnimationFrame(id0)
        clearTimeout(t)
      }
    }
    const id1 = requestAnimationFrame(() => {
      setFading(false)
      setCount(0)
      if (reduceMotion) {
        setCount(words.length)
      }
    })
    return () => cancelAnimationFrame(id1)
  }, [active, words, reduceMotion])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (!active || reduceMotion) return undefined
    if (paused) return undefined
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c >= words.length) {
          clearInterval(timerRef.current)
          return c
        }
        return c + 1
      })
    }, 30)
    return () => clearInterval(timerRef.current)
  }, [active, words.length, reduceMotion, paused])

  const pct = Math.min(100, Math.max(0, progress * 100))

  return (
    <div
      className={`narrative-overlay-root${reduceMotion ? ' narrative-overlay-root--reduce' : ''}`}
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity .42s ease',
      }}
    >
      <div
        className="narrative-progress"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <div
        className="narrative-overlay-inner"
        role="region"
        aria-label="Narrativa da cena"
        onClick={(e) => e.stopPropagation()}
      >
        {words.map((w, i) => (
          <span
            key={i}
            className={`narrative-overlay-word${i < count ? ' active' : ''}`}
          >
            {w}
          </span>
        ))}
      </div>
      <NarrativeReference text={quote} active={active} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MinimalTimeline — 5 pontos discretos no canto inferior central
// substitui a barra de progresso grande
// ═══════════════════════════════════════════════════════════════════════════════
function MinimalTimeline({ currentScene, total }) {
  return (
    <div style={{
      position: 'absolute', bottom: 22, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30, pointerEvents: 'none',
      display: 'flex', gap: 8, alignItems: 'center',
    }}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === currentScene
        const isPast   = i < currentScene
        return (
          <div key={i} style={{
            width:  isActive ? 9 : 5,
            height: isActive ? 9 : 5,
            borderRadius: '50%',
            background: isActive
              ? '#c9a84c'
              : isPast
              ? 'rgba(201,168,76,.45)'
              : 'rgba(201,168,76,.14)',
            transition: 'all .45s ease',
            boxShadow: isActive ? '0 0 8px rgba(201,168,76,.65)' : 'none',
          }} />
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Viewport estreito — índice vira modal
// ═══════════════════════════════════════════════════════════════════════════════
function useNarrowViewport(bp = 768) {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < bp,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
    const fn = () => setNarrow(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [bp])
  return narrow
}

// ═══════════════════════════════════════════════════════════════════════════════
// Índice lateral de cenas — desktop: coluna fixa; mobile: botão + modal
// ═══════════════════════════════════════════════════════════════════════════════
const SceneIndexPanel = memo(function SceneIndexPanel({
  scenes,
  activeIndex,
  onSelect,
  narrow,
  mobileOpen,
  setMobileOpen,
  reduceMotion,
}) {
  const activeBtnRef = useRef(null)

  useEffect(() => {
    const el = activeBtnRef.current
    if (!el) return
    el.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [activeIndex, narrow, mobileOpen, reduceMotion])

  const itemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    textAlign: 'left',
    padding: '8px 10px',
    marginBottom: 4,
    border: `1px solid ${isActive ? 'rgba(201,168,76,.45)' : 'rgba(201,168,76,.12)'}`,
    borderRadius: 2,
    background: isActive ? 'rgba(201,168,76,.12)' : 'rgba(6,5,12,.35)',
    cursor: 'pointer',
    transition: 'border-color .25s ease, box-shadow .25s ease, background .25s ease',
    boxShadow: isActive ? '0 0 14px rgba(201,168,76,.22)' : 'none',
    opacity: isActive ? 1 : 0.72,
  })

  const labelStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: '.5rem',
    letterSpacing: '.14em',
    color: '#c9a84c',
    flexShrink: 0,
    minWidth: 22,
  }
  const titleStyle = {
    fontFamily: "'Crimson Text', Georgia, serif",
    fontSize: '.78rem',
    lineHeight: 1.45,
    color: '#e8e0d0',
    textTransform: 'none',
    letterSpacing: '.02em',
  }

  const listInner = (
    <div style={{ padding: narrow ? 12 : 10, paddingTop: narrow ? 12 : 8 }}>
      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '.42rem',
        letterSpacing: '.28em',
        color: 'rgba(201,168,76,.45)',
        textTransform: 'uppercase',
        margin: '0 0 12px',
      }}>Cenas</p>
      {scenes.map((sc, idx) => {
        const isActive = idx === activeIndex
        return (
          <button
            key={idx}
            type="button"
            ref={isActive ? activeBtnRef : undefined}
            onClick={() => {
              onSelect(idx)
              if (narrow) setMobileOpen(false)
            }}
            style={itemStyle(isActive)}
          >
            <span style={labelStyle}>{idx + 1}</span>
            <span style={titleStyle}>{sc.name}</span>
          </button>
        )
      })}
    </div>
  )

  if (narrow) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'fixed',
            left: 12,
            bottom: 52,
            zIndex: 49,
            fontFamily: "'Cinzel', serif",
            fontSize: '.44rem',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: '#c9a84c',
            background: 'rgba(8,6,14,.88)',
            border: '1px solid rgba(201,168,76,.35)',
            padding: '8px 12px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
          }}
        >
          ☰ cenas
        </button>
        {mobileOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Índice de cenas"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 55,
              background: 'rgba(0,0,0,.72)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setMobileOpen(false) }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 320,
                maxHeight: '72vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(10,8,16,.96)',
                border: '1px solid rgba(201,168,76,.28)',
                borderRadius: 4,
                boxShadow: '0 24px 60px rgba(0,0,0,.55)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(201,168,76,.12)',
              }}>
                <span style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '.5rem',
                  letterSpacing: '.24em',
                  color: '#c9a84c',
                  textTransform: 'uppercase',
                }}>Índice</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(201,168,76,.6)',
                    fontSize: '1.25rem',
                    lineHeight: 1,
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >×</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>{listInner}</div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <nav
      aria-label="Índice de cenas"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 180,
        zIndex: 35,
        background: 'rgba(6,5,12,.78)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(201,168,76,.14)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      {listInner}
    </nav>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSITION OVERLAY — negro com fade
// ═══════════════════════════════════════════════════════════════════════════════
function TransitionOverlay({ on, phrase }) {
  const [showPhrase, setShowPhrase] = useState(false)

  useEffect(() => {
    if (!on) return
    const t = setTimeout(() => setShowPhrase(true), 300)
    return () => {
      clearTimeout(t)
      setShowPhrase(false)
    }
  }, [on])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none',
      background: '#000',
      opacity: on ? 1 : 0,
      transition: on ? 'opacity .35s ease' : 'opacity .9s ease .1s',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {showPhrase && phrase && (
        <p style={{
          fontFamily: "'Crimson Text', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 'clamp(.88rem,2vw,1.15rem)',
          color: 'rgba(201,168,76,.78)',
          textAlign: 'center',
          maxWidth: 460,
          padding: '0 2.5rem',
          margin: 0,
          lineHeight: 1.75,
          letterSpacing: '.02em',
          animation: 'trans-phrase-in .55s ease both',
        }}>{phrase}</p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENA 1 — QUEDA DOS VIGILANTES
// Canvas 2D: gradiente radial + 200 estrelas + 16 anjos dourados caindo
// ═══════════════════════════════════════════════════════════════════════════════
function Scene1_Queda() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 28%, #1d0b32 0%, #110622 48%, #090910 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,8,.8) 100%)', pointerEvents: 'none' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENA 2 — SURGIMENTO DOS GIGANTES
// ═══════════════════════════════════════════════════════════════════════════════
function Scene2_Gigantes() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0c0208 0%, #180406 50%, #0a0a0f 100%)' }}>
      {/* Lua vermelha */}
      <div style={{
        position: 'absolute', top: '7%', right: '8%',
        width: 88, height: 88, borderRadius: '50%',
        background: 'radial-gradient(circle at 42% 42%, #aa1100 0%, #5a0000 55%, transparent 100%)',
        boxShadow: '0 0 30px rgba(180,10,0,.5), 0 0 60px rgba(100,0,0,.3)',
      }} />
      {/* Atmosfera */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,6,.82) 100%)', pointerEvents: 'none' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENA 3 — CORRUPÇÃO DA TERRA
// Canvas: grade de círculos 10×6, BFS flood-fill em ~8s, indicadores flutuantes
// ═══════════════════════════════════════════════════════════════════════════════
function IndicatorFloat({ text, delay, x, y, active }) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    if (!active) return
    const t1 = setTimeout(() => setVis(true),  delay)
    const t2 = setTimeout(() => setVis(false), delay + 2400)
    return () => {
      clearTimeout(t1); clearTimeout(t2)
      setVis(false)
    }
  }, [active, delay])
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 10,
      fontFamily: "'Crimson Text', Georgia, serif", fontSize: '.82rem', fontWeight: 600,
      color: '#e85555',
      opacity: vis ? 1 : 0,
      animation: vis ? 'indicator-float 2.4s ease forwards' : 'none',
      textShadow: '0 0 10px rgba(232,85,85,.65)',
      letterSpacing: '.04em',
    }}>{text}</div>
  )
}

function Scene3_Corrupcao({ active }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0410 0%, #07050b 50%, #050208 100%)' }}>
      {/* Floating indicators */}
      {INDICATORS.map((ind, i) => (
        <IndicatorFloat key={i} {...ind} active={active} />
      ))}
      {/* Purple moon */}
      <div style={{
        position: 'absolute', top: '5%', left: '16%',
        width: 68, height: 68, borderRadius: '50%',
        background: 'radial-gradient(circle at 44% 44%, #5a0082 0%, #1a0a2e 65%, transparent 100%)',
        boxShadow: '0 0 28px rgba(90,0,130,.55)',
      }} />
      {/* Vinheta lateral */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,8,.75) 100%)', pointerEvents: 'none' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENA 4 — PRISÃO DOS ANJOS
// ═══════════════════════════════════════════════════════════════════════════════
function Scene4_Prisao() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #09060f 0%, #050210 60%, #020105 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,8,.88) 100%)', pointerEvents: 'none' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENA 5 — JULGAMENTO FINAL
// ═══════════════════════════════════════════════════════════════════════════════
function Scene5_Julgamento() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(201,168,76,.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELA INICIAL
// ═══════════════════════════════════════════════════════════════════════════════
function LandingScreen({
  onStart,
  isAutoplay,
  intensity,
  onIntensity,
  ritual,
  onRitual,
  sectionTitle,
  sectionEyebrow,
  sectionChapters,
  sectionSummary,
}) {
  useEffect(() => {
    if (!isAutoplay) return
    const t = setTimeout(onStart, 5000)
    return () => clearTimeout(t)
  }, [isAutoplay, onStart])

  const LABELS = { leve: 'Leve', default: 'Padrão', intenso: 'Intenso' }

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #1e0a38 0%, #0a0a0f 68%)',
    }}>
      <Link
        to="/"
        style={{
          position: 'absolute', top: 22, left: 22, zIndex: 12,
          fontFamily: "'Cinzel', serif", fontSize: '.48rem', letterSpacing: '.2em',
          color: 'rgba(201,168,76,.65)', textDecoration: 'none', textTransform: 'uppercase',
          transition: 'color .25s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a84c' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(201,168,76,.65)' }}
      >
        ← mapa do livro
      </Link>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width:1, height:68, background:'linear-gradient(to bottom,transparent,#c9a84c)', marginBottom:28 }} />

        <p style={{ fontFamily:"'Cinzel',serif", fontSize:'.6rem', letterSpacing:'.52em', color:'#c9a84c', opacity:.44, marginBottom:22, textTransform:'uppercase', animation:'fade-rise 2s ease both' }}>
          {sectionEyebrow}
        </p>

        <h1 style={{ fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:'clamp(2.5rem,8vw,5.4rem)', color:'#e8e0d0', letterSpacing:'.06em', textAlign:'center', lineHeight:1, margin:0, animation:'title-shimmer 4s ease-in-out infinite, fade-rise 2.2s ease .2s both' }}>
          {sectionTitle}
        </h1>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:'clamp(1rem,3vw,1.75rem)', color:'#c9a84c', letterSpacing:'.42em', margin:'12px 0 0', animation:'fade-rise 2.2s ease .55s both' }}>
          {sectionChapters}
        </h2>

        <div style={{ display:'flex', alignItems:'center', gap:18, margin:'34px 0' }}>
          <div style={{ width:92, height:1, background:'linear-gradient(to right,transparent,#c9a84c)' }} />
          <svg width="20" height="20" viewBox="0 0 20 20">
            <polygon points="10,1 12.5,7.5 19,7.5 13.5,12 15.5,19 10,15 4.5,19 6.5,12 1,7.5 7.5,7.5" fill="none" stroke="#c9a84c" strokeWidth="1.2" />
          </svg>
          <div style={{ width:92, height:1, background:'linear-gradient(to left,transparent,#c9a84c)' }} />
        </div>

        <p style={{ fontFamily:"'Crimson Text',Georgia,serif", fontSize:'1.05rem', fontStyle:'italic', color:'#e8e0d0', opacity:.52, textAlign:'center', maxWidth:520, lineHeight:1.8, margin:'0 0 36px', padding:'0 2rem', animation:'fade-rise 2.2s ease 1s both' }}>
          {sectionSummary}
        </p>

        {/* Intensidade */}
        {!isAutoplay && (
          <div style={{ display:'flex', gap:8, marginBottom:28, animation:'fade-rise 2.2s ease 1.2s both' }}>
            {['leve','default','intenso'].map(lvl => (
              <button key={lvl}
                onClick={() => onIntensity(lvl)}
                style={{
                  fontFamily:"'Cinzel',serif", fontSize:'.52rem', letterSpacing:'.2em',
                  color: intensity===lvl ? '#0a0a0f' : 'rgba(201,168,76,.7)',
                  background: intensity===lvl ? '#c9a84c' : 'transparent',
                  border:'1px solid rgba(201,168,76,.38)',
                  padding:'6px 14px', cursor:'pointer', textTransform:'uppercase',
                  transition:'all .28s ease',
                }}
              >{LABELS[lvl]}</button>
            ))}
            <button
              onClick={() => onRitual(!ritual)}
              title="Modo Ritual"
              style={{
                marginLeft: 8,
                fontFamily:"'Cinzel',serif", fontSize:'.52rem', letterSpacing:'.2em',
                color: ritual ? '#0a0a0f' : 'rgba(201,168,76,.7)',
                background: ritual ? '#c9a84c' : 'transparent',
                border:'1px solid rgba(201,168,76,.38)',
                padding:'6px 14px', cursor:'pointer',
                transition:'all .28s ease',
              }}
            >
              {/* moon icon */}
              <svg width="12" height="12" viewBox="0 0 12 12" style={{ display:'inline-block', verticalAlign:'middle', marginRight:5 }}>
                <path d="M9,6A5,5,0,1,1,4,1a4,4,0,1,0,5,5Z" fill="currentColor"/>
              </svg>
              Ritual
            </button>
          </div>
        )}

        {!isAutoplay && (
          <button
            onClick={onStart}
            style={{
              fontFamily:"'Cinzel',serif", fontSize:'.76rem', fontWeight:600, letterSpacing:'.4em',
              color:'#0a0a0f', background:'#c9a84c', border:'none', padding:'16px 48px',
              cursor:'pointer', textTransform:'uppercase',
              animation:'btn-pulse 2.5s ease-in-out infinite, fade-rise 2.2s ease 1.5s both',
              transition:'background .32s ease, transform .24s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#e8e0d0'; e.currentTarget.style.transform='scale(1.04)' }}
            onMouseLeave={e => { e.currentTarget.style.background='#c9a84c'; e.currentTarget.style.transform='scale(1)' }}
          >
            [ INICIAR SIMULAÇÃO ]
          </button>
        )}

        <div style={{ width:1, height:68, background:'linear-gradient(to top,transparent,#c9a84c)', marginTop:48, opacity:.4 }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELA FINAL
// ═══════════════════════════════════════════════════════════════════════════════
function EndScreen({
  onReset,
  isAutoplay,
  epilogue,
  prevPath,
  nextPath,
  nextTitle,
  prevTitle,
  prevSectionId,
  nextSectionId,
}) {
  const warm = (sectionId) => {
    prefetchSimulationChunk()
    if (sectionId) prefetchSectionImages(sectionId)
  }

  return (
    <div style={{ position:'absolute', inset:0, background:'#0a0a0f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <Link
        to="/"
        onMouseEnter={() => prefetchSimulationChunk()}
        onFocus={() => prefetchSimulationChunk()}
        style={{
          position: 'absolute', top: 22, left: 22,
          fontFamily: "'Cinzel', serif", fontSize: '.48rem', letterSpacing: '.2em',
          color: 'rgba(201,168,76,.55)', textDecoration: 'none', textTransform: 'uppercase',
        }}
      >
        ← mapa
      </Link>
      <div style={{ width:1, height:60, background:'linear-gradient(to bottom,transparent,#c9a84c)', marginBottom:28 }} />
      <p style={{ fontFamily:"'Cinzel',serif", fontSize:'.65rem', letterSpacing:'.46em', color:'#c9a84c', opacity:.48, marginBottom:20, textTransform:'uppercase', animation:'fade-rise 2s ease both' }}>
        Fim do Ciclo
      </p>
      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(1.1rem,2.8vw,1.85rem)', fontWeight:600, color:'#e8e0d0', letterSpacing:'.07em', textAlign:'center', padding:'0 2.5rem', animation:'fade-rise 2s ease .35s both', lineHeight:1.55, maxWidth:620 }}>
        &ldquo;{epilogue.quote}&rdquo;
      </h2>
      <p style={{ fontFamily:"'Crimson Text',Georgia,serif", fontSize:'.98rem', fontStyle:'italic', color:'#c9a84c', opacity:.6, marginTop:24, animation:'fade-rise 2s ease .75s both' }}>
        — {epilogue.attribution}
      </p>
      <div style={{ width:1, height:60, background:'linear-gradient(to top,transparent,#c9a84c)', marginTop:44, opacity:.38 }} />
      {!isAutoplay && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 28, maxWidth: 640, padding: '0 1rem' }}>
          {prevPath && (
            <Link
              to={prevPath}
              onMouseEnter={() => warm(prevSectionId)}
              onFocus={() => warm(prevSectionId)}
              style={{
                fontFamily:"'Cinzel',serif", fontSize:'.62rem', fontWeight:600, letterSpacing:'.22em',
                color:'#c9a84c', background:'transparent', border:'1px solid rgba(201,168,76,.38)',
                padding:'12px 22px', cursor:'pointer', textTransform:'uppercase', textDecoration:'none',
                transition:'all .3s ease', animation:'fade-rise 2s ease 1s both',
              }}
            >
              ← {prevTitle}
            </Link>
          )}
          <button
            type="button"
            onClick={onReset}
            style={{
              fontFamily:"'Cinzel',serif", fontSize:'.7rem', fontWeight:600, letterSpacing:'.38em',
              color:'#c9a84c', background:'transparent', border:'1px solid rgba(201,168,76,.45)',
              padding:'12px 36px', cursor:'pointer', textTransform:'uppercase',
              transition:'all .3s ease', animation:'fade-rise 2s ease 1.2s both',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,.1)'; e.currentTarget.style.borderColor='#c9a84c' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(201,168,76,.45)' }}
          >
            [ RECOMEÇAR ]
          </button>
          {nextPath && (
            <Link
              to={nextPath}
              onMouseEnter={() => warm(nextSectionId)}
              onFocus={() => warm(nextSectionId)}
              style={{
                fontFamily:"'Cinzel',serif", fontSize:'.62rem', fontWeight:600, letterSpacing:'.22em',
                color:'#0a0a0f', background:'#c9a84c', border:'1px solid #c9a84c',
                padding:'12px 22px', cursor:'pointer', textTransform:'uppercase', textDecoration:'none',
                transition:'all .3s ease', animation:'fade-rise 2s ease 1.05s both',
              }}
            >
              {nextTitle} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION SIMULATION — rota /:sectionId
// ═══════════════════════════════════════════════════════════════════════════════
const SCENES = [Scene1_Queda, Scene2_Gigantes, Scene3_Corrupcao, Scene4_Prisao, Scene5_Julgamento]

export default function SectionSimulation() {
  const { sectionId } = useParams()
  const section = getSectionById(sectionId)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const music = useMusic()

  useDocumentMeta(
    section
      ? `${section.title} — Apocalipse de Enoque`
      : 'Apocalipse de Enoque',
    section
      ? `Secção «${section.title}» (${section.chapters}): simulação em cenas, narrativa e imagens do Livro de Enoque.`
      : 'Simulação do Livro de Enoque por secções.',
  )

  const narrow = useNarrowViewport()
  const [mobileIndexOpen, setMobileIndexOpen] = useState(false)

  const sceneFromUrl = useMemo(() => {
    const s = searchParams.get('scene')
    if (s == null || s === '') return null
    const n = parseInt(s, 10)
    return Number.isFinite(n) ? n : null
  }, [searchParams])

  const sceneCount = section?.scenes.length ?? 0
  const urlParams = useMemo(
    () => (section ? parseURLParams(location.search, sceneCount) : null),
    [location.search, section, sceneCount],
  )

  const [intensity, setIntensity] = useState('default')
  const [ritual, setRitual] = useState(false)
  const [explore, setExplore] = useState(false)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!urlParams) return
    const id = requestAnimationFrame(() => {
      setIntensity(urlParams.intensity)
      setRitual(urlParams.ritual)
      setExplore(urlParams.explore)
    })
    return () => cancelAnimationFrame(id)
  }, [urlParams])

  const iCfg = INTENSITY_CONFIG[intensity]
  const imgOpacity = intensity === 'leve' ? 0.12 : intensity === 'intenso' ? 0.25 : 0.18

  const effectiveDurations = useMemo(
    () => (section ? section.scenes.map((s) => Math.round(s.duration * iCfg.dMult)) : [12000]),
    [section, iCfg.dMult],
  )

  const holdPausedRef = useRef(false)
  const holdTimerRef = useRef(null)
  const longHoldDidActivateRef = useRef(false)
  const suppressSceneClickRef = useRef(false)
  const keyboardPauseRef = useRef(false)
  const [sceneHoldPausedUi, setSceneHoldPausedUi] = useState(false)
  const [keyboardPauseUi, setKeyboardPauseUi] = useState(false)
  const [sceneAnnouncement, setSceneAnnouncement] = useState('')
  const getHoldPaused = useCallback(() => holdPausedRef.current || keyboardPauseRef.current, [])

  const ctrl = useSceneController(effectiveDurations, getHoldPaused)
  const { resetSimulation, jumpToScene } = ctrl

  const endSceneHold = useCallback(() => {
    clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
    holdPausedRef.current = false
    setSceneHoldPausedUi(false)
    if (longHoldDidActivateRef.current) {
      suppressSceneClickRef.current = true
    }
    longHoldDidActivateRef.current = false
  }, [])

  const onScenePointerDown = useCallback((e) => {
    if (!section) return
    if (ctrl.scene < 0 || ctrl.ended || ctrl.isTrans) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    longHoldDidActivateRef.current = false
    clearTimeout(holdTimerRef.current)
    holdTimerRef.current = setTimeout(() => {
      holdPausedRef.current = true
      longHoldDidActivateRef.current = true
      setSceneHoldPausedUi(true)
    }, 220)
  }, [section, ctrl.scene, ctrl.ended, ctrl.isTrans])

  useEffect(() => {
    clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
    holdPausedRef.current = false
    setSceneHoldPausedUi(false)
    longHoldDidActivateRef.current = false
    keyboardPauseRef.current = false
    setKeyboardPauseUi(false)
  }, [ctrl.scene])

  useEffect(() => {
    if (!section || ctrl.scene < 0 || ctrl.ended) {
      setSceneAnnouncement('')
      return
    }
    const sc = section.scenes[ctrl.scene]
    if (!sc) return
    setSceneAnnouncement(
      `${section.title}: ${sc.name}. Cena ${ctrl.scene + 1} de ${section.scenes.length}.`,
    )
  }, [section, ctrl.scene, ctrl.ended])

  useEffect(() => {
    if (!section || !urlParams) return undefined
    const inScene = ctrl.scene >= 0 && !ctrl.ended
    if (!inScene || urlParams.autoplay) return undefined

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (ritual) {
          e.preventDefault()
          setRitual(false)
          return
        }
        if (explore) {
          e.preventDefault()
          setExplore(false)
        }
        return
      }
      const t = e.target
      if (
        t instanceof HTMLElement
        && (t.tagName === 'INPUT'
          || t.tagName === 'TEXTAREA'
          || t.closest?.('[contenteditable="true"]'))
      ) {
        return
      }
      if (ctrl.isTrans || ctrl.ended) return

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        keyboardPauseRef.current = !keyboardPauseRef.current
        setKeyboardPauseUi(keyboardPauseRef.current)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        ctrl.nextScene()
        return
      }
      if (e.key === 'ArrowLeft' && ctrl.scene > 0) {
        e.preventDefault()
        jumpToScene(ctrl.scene - 1)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    /* ctrl como objeto muda a cada render; dependências são campos usados no handler. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    section,
    urlParams,
    ctrl.scene,
    ctrl.ended,
    ctrl.isTrans,
    ctrl.nextScene,
    jumpToScene,
    ritual,
    explore,
  ])

  const canSceneHold = Boolean(section) && ctrl.scene >= 0 && !ctrl.ended && !ctrl.isTrans
  useEffect(() => {
    if (!canSceneHold) return undefined
    const onWinUp = () => { endSceneHold() }
    window.addEventListener('pointerup', onWinUp)
    window.addEventListener('pointercancel', onWinUp)
    return () => {
      window.removeEventListener('pointerup', onWinUp)
      window.removeEventListener('pointercancel', onWinUp)
      endSceneHold()
    }
  }, [canSceneHold, endSceneHold])

  const selectSceneFromIndex = useCallback((i) => {
    if (!section) return
    const clamped = Math.max(0, Math.min(i, section.scenes.length - 1))
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('scene', String(clamped))
      return p
    }, { replace: true })
    jumpToScene(clamped)
  }, [section, setSearchParams, jumpToScene])

  const warmAdjacent = useCallback((id) => {
    prefetchSimulationChunk()
    if (id) prefetchSectionImages(id)
  }, [])

  useLayoutEffect(() => {
    if (!section) return
    resetSimulation()
  }, [sectionId, resetSimulation, section])

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setMobileIndexOpen(false))
    return () => cancelAnimationFrame(id)
  }, [sectionId])

  // Sincronizar URL → cena só quando o parâmetro `scene` muda (busca, link partilhado, histórico).
  // Não depender de ctrl.scene: senão, com ?scene=0 fixo, cada avanço 0→1 reexecutava o efeito
  // e jumpToScene(0) rebocava a narrativa — transições “travadas”.
  useEffect(() => {
    if (!section || !urlParams) return
    if (urlParams.autoplay) return
    if (sceneFromUrl == null) return
    const clamped = Math.max(0, Math.min(sceneFromUrl, section.scenes.length - 1))
    if (ctrl.scene < 0 || ctrl.ended) return
    if (clamped === ctrl.scene) return
    const id = requestAnimationFrame(() => {
      jumpToScene(clamped)
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reagir apenas a mudanças na query `scene`
  }, [sceneFromUrl, section, urlParams, jumpToScene])

  // Manter ?scene= alinhado ao índice actual (partilha e deep links) sem lutar com o controlador.
  useEffect(() => {
    if (!section || !urlParams) return
    if (urlParams.autoplay) return
    if (ctrl.ended) return
    if (ctrl.scene < 0) return
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        const next = String(ctrl.scene)
        if (p.get('scene') === next) return prev
        p.set('scene', next)
        return p
      },
      { replace: true },
    )
  }, [ctrl.scene, ctrl.ended, section, urlParams, setSearchParams])

  const effectiveVol = Math.min(iCfg.aVol + (ritual ? 0.05 : 0), 0.5)
  const effectiveVolRef = useRef(effectiveVol)
  effectiveVolRef.current = effectiveVol

  useEffect(() => {
    const s = getSectionById(sectionId)
    if (!s) return undefined
    const urls = s.audioStem ? [`/audio/${s.audioStem}.mp3`] : []
    if (music.getIsPlaying()) {
      music.applySectionCandidates(urls, effectiveVolRef.current)
    } else {
      music.setAudioCandidates(urls)
    }
    return () => {
      music.setAudioCandidates([])
    }
    // getIsPlaying / setAudioCandidates / applySectionCandidates são estáveis no provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId])

  useEffect(() => { music.setVolume(effectiveVol) }, [effectiveVol, music.setVolume]) // eslint-disable-line react-hooks/exhaustive-deps

  const prevExploreSceneRef = useRef(ctrl.scene)
  useEffect(() => {
    if (prevExploreSceneRef.current === ctrl.scene) return
    prevExploreSceneRef.current = ctrl.scene
    const id = requestAnimationFrame(() => setExplore(false))
    return () => cancelAnimationFrame(id)
  }, [ctrl.scene])

  const lastSceneIndex = section ? section.scenes.length - 1 : 0
  useEffect(() => {
    if (!section || ctrl.scene < 0 || ctrl.scene >= lastSceneIndex) return
    const nextSrc = section.scenes[ctrl.scene + 1]?.image
    if (!nextSrc) return
    const img = new Image()
    img.src = nextSrc
  }, [ctrl.scene, lastSceneIndex, section])

  useEffect(() => {
    document.body.style.cursor = ritual ? 'none' : ''
    if (ritual) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    }
    return () => { document.body.style.cursor = '' }
  }, [ritual])

  const endedFadeDoneRef = useRef(false)
  useEffect(() => {
    if (!ctrl.ended) {
      endedFadeDoneRef.current = false
      return
    }
    if (endedFadeDoneRef.current) return
    endedFadeDoneRef.current = true
    music.fadeOut()
  }, [ctrl.ended, music.fadeOut]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(() => {
    if (!urlParams) return
    music.start(effectiveVol)
    const target = urlParams.startScene >= 0 ? urlParams.startScene : 0
    ctrl.startAtScene(target)
  }, [ctrl.startAtScene, music.start, effectiveVol, urlParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = useCallback(() => {
    music.stop()
    ctrl.resetSimulation()
  }, [ctrl.resetSimulation, music.stop]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRitual = useCallback((val) => setRitual(val), [])

  const transPhrases = useMemo(
    () => (section ? [null, ...section.scenes.map((s) => s.bridge ?? null)] : [null]),
    [section],
  )
  const transPhrase = ctrl.isTrans && ctrl.transFromScene != null
    ? (transPhrases[ctrl.transFromScene + 1] ?? null)
    : null

  const adjacent = useMemo(
    () => (section ? getAdjacentSections(section.id) : { prev: null, next: null }),
    [section],
  )

  if (!section || !urlParams) {
    return <Navigate to="/" replace />
  }

  const showScene = ctrl.scene >= 0 && !ctrl.ended
  const current = showScene ? section.scenes[ctrl.scene] : null
  const SceneComp = current ? SCENES[current.visual] : null
  const sceneVisualProps = current?.visual === 2 ? { active: !ctrl.isTrans } : {}

  const { prev: prevSec, next: nextSec } = adjacent
  const ritualFilter = ritual ? 'brightness(0.92) contrast(1.05)' : 'none'

  const showIndexChrome = showScene && !urlParams.autoplay && !ritual
  const navInsetLeft = showIndexChrome && !narrow ? 196 : 18
  const controlsInsetLeft = showIndexChrome && !narrow ? 196 : 22

  const navLinkStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: '.44rem',
    letterSpacing: '.18em',
    color: 'rgba(201,168,76,.62)',
    textDecoration: 'none',
    textTransform: 'uppercase',
    transition: 'color .2s ease',
  }

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {sceneAnnouncement}
      </div>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <FilmGrainOverlay reduceMotion={reduceMotion} />
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        overflow: 'hidden', background: '#0a0a0f',
        filter: ritualFilter,
        animation: showScene && !reduceMotion ? 'breathe 12s ease-in-out infinite' : 'none',
        willChange: showScene && !reduceMotion ? 'transform' : 'auto',
      }}>

        {showIndexChrome && (
          <SceneIndexPanel
            scenes={section.scenes}
            activeIndex={ctrl.scene}
            onSelect={selectSceneFromIndex}
            narrow={narrow}
            mobileOpen={mobileIndexOpen}
            setMobileOpen={setMobileIndexOpen}
            reduceMotion={reduceMotion}
          />
        )}

        {ctrl.scene === -1 && (
          <LandingScreen
            onStart={handleStart}
            isAutoplay={urlParams.autoplay}
            intensity={intensity}
            onIntensity={setIntensity}
            ritual={ritual}
            onRitual={handleRitual}
            sectionTitle={section.title.toUpperCase()}
            sectionEyebrow={section.landingEyebrow}
            sectionChapters={section.chapters}
            sectionSummary={section.summary}
          />
        )}

        {ctrl.ended && (
          <EndScreen
            onReset={handleReset}
            isAutoplay={urlParams.autoplay}
            epilogue={section.epilogue}
            prevPath={prevSec?.path}
            nextPath={nextSec?.path}
            prevTitle={prevSec?.title ?? ''}
            nextTitle={nextSec?.title ?? ''}
            prevSectionId={prevSec?.id}
            nextSectionId={nextSec?.id}
          />
        )}

        {showScene && SceneComp && (
          <div
            style={{ position: 'absolute', inset: 0, cursor: ritual ? 'none' : 'pointer', userSelect: 'none', touchAction: 'manipulation' }}
            onPointerDown={onScenePointerDown}
            onPointerUp={endSceneHold}
            onPointerLeave={endSceneHold}
            onClick={() => {
              if (suppressSceneClickRef.current) {
                suppressSceneClickRef.current = false
                return
              }
              if (!urlParams.autoplay) ctrl.nextScene()
            }}
          >
            <div
              key={ctrl.scene}
              className={reduceMotion ? undefined : 'chapter-fade-enter'}
              style={{ position: 'absolute', inset: 0 }}
            >
              <SceneComp {...sceneVisualProps} />

              <SceneImageOverlay
                key={current.image ?? ctrl.scene}
                src={current.image}
                srcSet={current.imageSrcSet}
                sizes={current.sizes}
                objectPosition={current.imageFocus ?? 'center 24%'}
                transformOrigin={
                  current.imageTransformOrigin
                    ?? (current.imageFocus ? current.imageFocus : '50% 28%')
                }
                opacity={imgOpacity}
                intenso={intensity === 'intenso'}
                reduceMotion={reduceMotion}
              />
            </div>

            {explore && !urlParams.autoplay && current.panel?.hotspots?.map((h, i) => (
              <TooltipHotspot key={i} x={h.x} y={h.y} label={h.label} info={h.info} />
            ))}

            {!urlParams.autoplay && !ritual && (
              <div
                style={{
                  position: 'absolute', top: 18, left: navInsetLeft, right: 18, zIndex: 48,
                  display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', pointerEvents: 'all',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to="/"
                  style={navLinkStyle}
                  onMouseEnter={() => prefetchSimulationChunk()}
                  onFocus={() => prefetchSimulationChunk()}
                >← mapa</Link>
                {prevSec && (
                  <Link
                    to={prevSec.path}
                    style={navLinkStyle}
                    onMouseEnter={() => warmAdjacent(prevSec.id)}
                    onFocus={() => warmAdjacent(prevSec.id)}
                  >← {prevSec.title}</Link>
                )}
                {nextSec && (
                  <Link
                    to={nextSec.path}
                    style={{ ...navLinkStyle, marginLeft: 'auto' }}
                    onMouseEnter={() => warmAdjacent(nextSec.id)}
                    onFocus={() => warmAdjacent(nextSec.id)}
                  >
                    {nextSec.title} →
                  </Link>
                )}
              </div>
            )}

            <div style={{
              position: 'absolute', top: 32, left: 0, right: 0, zIndex: 22, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              maxWidth: 'min(880px, calc(100% - 2rem))', margin: '0 auto', padding: '0 1rem', boxSizing: 'border-box',
            }}
            >
              <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom,transparent,#c9a84c)', marginBottom: 12 }} />
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: '.6rem', letterSpacing: '.44em', color: '#c9a84c', opacity: .62, textTransform: 'uppercase', margin: 0 }}>
                {current.sub}
              </p>
              <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(1.7rem,3.8vw,2.85rem)', fontWeight: 700, color: '#e8e0d0', letterSpacing: '.14em', margin: '8px 0 0', animation: 'title-shimmer 4.5s ease-in-out infinite' }}>
                {current.name}
              </h1>
              {(current.chapters || current.additionalReading) && (
                <div
                  style={{
                    marginTop: 10,
                    width: '100%',
                    padding: '0 0.5rem',
                    textAlign: 'center',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {current.chapters && (
                    <p style={{
                      fontFamily: "'Crimson Text', Georgia, serif",
                      fontSize: '.78rem',
                      color: 'rgba(232,224,208,.58)',
                      margin: '0 0 4px',
                      lineHeight: 1.5,
                    }}>
                      Capítulos relacionados: {current.chapters}
                    </p>
                  )}
                  {current.additionalReading && (
                    <p style={{
                      fontFamily: "'Crimson Text', Georgia, serif",
                      fontSize: '.72rem',
                      color: 'rgba(201,168,76,.42)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      Leitura complementar: {current.additionalReading}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Vinheta inferior ancorada ao fundo do ecrã — evita “corte” com o bloco de texto */}
            <div
              className={`narrative-viewport-vignette${reduceMotion ? ' narrative-viewport-vignette--reduce' : ''}`}
              aria-hidden
            />

            <NarrativeOverlay
              text={current.text}
              quote={current.quote}
              active={!ctrl.isTrans}
              progress={ctrl.progress}
              reduceMotion={reduceMotion}
              paused={sceneHoldPausedUi}
            />

            <ChapterInfoPanel
              data={current.panel}
              visible={explore && !urlParams.autoplay}
              onClose={() => setExplore(false)}
            />

            {!urlParams.autoplay && !ritual && (
              <ExploreToggle explore={explore} onToggle={() => setExplore((e) => !e)} />
            )}

            {!urlParams.autoplay && !ritual && (
              <MinimalTimeline currentScene={ctrl.scene} total={section.scenes.length} />
            )}

            {!urlParams.autoplay && (
              <div
                style={{ position: 'absolute', bottom: 18, left: controlsInsetLeft, zIndex: 50, display: 'flex', gap: 6 }}
                onClick={(e) => e.stopPropagation()}
              >
                {['leve', 'default', 'intenso'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className="sim-control-btn"
                    onClick={() => setIntensity(lvl)}
                    title={`Intensidade: ${lvl}`}
                    style={{
                      fontFamily: "'Cinzel',serif", fontSize: '.46rem', letterSpacing: '.15em',
                      color: intensity === lvl ? '#0a0a0f' : 'rgba(201,168,76,.55)',
                      background: intensity === lvl ? '#c9a84c' : 'rgba(10,10,15,.65)',
                      border: '1px solid rgba(201,168,76,.28)',
                      padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase',
                      transition: 'all .25s ease', backdropFilter: 'blur(4px)',
                    }}
                  >{lvl === 'default' ? '◈' : lvl === 'leve' ? '◇' : '◆'}</button>
                ))}
                <button
                  type="button"
                  className="sim-control-btn"
                  onClick={() => setRitual((r) => !r)}
                  title="Modo Ritual (Esc para sair)"
                  style={{
                    marginLeft: 4,
                    fontFamily: "'Cinzel',serif", fontSize: '.46rem', letterSpacing: '.1em',
                    color: ritual ? '#0a0a0f' : 'rgba(201,168,76,.55)',
                    background: ritual ? '#c9a84c' : 'rgba(10,10,15,.65)',
                    border: '1px solid rgba(201,168,76,.28)',
                    padding: '4px 10px', cursor: 'pointer',
                    transition: 'all .25s ease', backdropFilter: 'blur(4px)',
                  }}
                >☽</button>
              </div>
            )}

            {!urlParams.autoplay && !ritual && (
              <div style={{ position: 'absolute', bottom: 22, right: 168, zIndex: 55, pointerEvents: 'none' }}>
                <p style={{ fontFamily: "'Crimson Text',serif", fontSize: '.62rem', color: '#c9a84c', opacity: .38, margin: 0, letterSpacing: '.04em', textAlign: 'right', maxWidth: 260, lineHeight: 1.4 }}>
                  Pausa: segure ou espaço. Cenas: ← →. Esc: ritual ou explorar.
                </p>
              </div>
            )}

            {!urlParams.autoplay && (
              <ShareButton
                scene={ctrl.scene}
                intensity={intensity}
                ritual={ritual}
                explore={explore}
                autoplayMode={urlParams.autoplay}
              />
            )}
          </div>
        )}

        <TransitionOverlay on={ctrl.isTrans} phrase={transPhrase} />

        {showScene && (sceneHoldPausedUi || keyboardPauseUi) && (
          <div className="scene-pause-overlay" role="status" aria-live="polite">
            <span className="scene-pause-overlay__label">Pausado</span>
            <span className="scene-pause-overlay__hint">solte, prima espaço ou use as setas</span>
          </div>
        )}
      </div>
    </>
  )
}
