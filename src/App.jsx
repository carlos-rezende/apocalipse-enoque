import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { MusicProvider, useMusic } from './musicContext.jsx'
import HomePage from './HomePage.jsx'
import AcademicNotesPage from './AcademicNotesPage.jsx'
import GlobalSearch from './GlobalSearch.jsx'
import { prefetchSimulationChunk } from './prefetchExperience.js'

const SectionSimulation = lazy(() => prefetchSimulationChunk())

function RouteFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        color: 'rgba(201,168,76,.55)',
        fontFamily: "'Cinzel', serif",
        fontSize: '.55rem',
        letterSpacing: '.35em',
        textTransform: 'uppercase',
      }}
    >
      carregando…
    </div>
  )
}

const headerStyle = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '10px 16px',
  background: 'rgba(6,4,10,.94)',
  borderBottom: '1px solid rgba(201,168,76,.14)',
  zIndex: 80,
}

const linkHome = {
  fontFamily: "'Cinzel', serif",
  fontSize: '.48rem',
  letterSpacing: '.22em',
  color: 'rgba(201,168,76,.72)',
  textDecoration: 'none',
  textTransform: 'uppercase',
  flexShrink: 0,
}

const soundBtn = {
  flexShrink: 0,
  marginLeft: 'auto',
  fontFamily: "'Cinzel', serif",
  fontSize: '.46rem',
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  padding: '8px 12px',
  cursor: 'pointer',
  border: '1px solid rgba(201,168,76,.32)',
  background: 'rgba(10,8,16,.75)',
  color: 'rgba(201,168,76,.78)',
  transition: 'border-color .2s, color .2s, background .2s',
}

function HeaderSoundToggle() {
  const { muted, toggleMute } = useMusic()
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-pressed={muted}
      title={muted ? 'Ligar som' : 'Desligar som'}
      style={soundBtn}
    >
      {muted ? 'som off' : 'som on'}
    </button>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <MusicProvider>
        <div style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <header style={headerStyle}>
            <Link to="/" style={linkHome}>
              Mapa
            </Link>
            <Link to="/notas" style={linkHome}>
              Notas
            </Link>
            <GlobalSearch variant="bar" />
            <HeaderSoundToggle />
          </header>

          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/notas" element={<AcademicNotesPage />} />
                <Route path="/:sectionId" element={<SectionSimulation />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </MusicProvider>
    </BrowserRouter>
  )
}
