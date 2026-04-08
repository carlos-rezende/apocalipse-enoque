import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildSearchEntries, filterSearchEntries } from './data/searchIndex.js'

const wrap = {
  position: 'relative',
  zIndex: 70,
  flex: '1 1 220px',
  maxWidth: 320,
  minWidth: 160,
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: "'Crimson Text', Georgia, serif",
  fontSize: '.88rem',
  padding: '8px 12px',
  borderRadius: 2,
  border: '1px solid rgba(201,168,76,.28)',
  background: 'rgba(8,6,14,.88)',
  color: '#e8e0d0',
  outline: 'none',
}

const dropdown = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  maxHeight: 280,
  overflowY: 'auto',
  background: 'rgba(10,8,16,.97)',
  border: '1px solid rgba(201,168,76,.25)',
  borderRadius: 2,
  boxShadow: '0 16px 40px rgba(0,0,0,.45)',
}

export default function GlobalSearch({ variant = 'bar' }) {
  const navigate = useNavigate()
  const entries = useMemo(() => buildSearchEntries(), [])
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 200)
    return () => clearTimeout(t)
  }, [q])

  const results = useMemo(
    () => filterSearchEntries(entries, debounced),
    [entries, debounced],
  )

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = useCallback(
    (r) => {
      navigate(`${r.path}?scene=${r.sceneIndex}`)
      setQ('')
      setDebounced('')
      setOpen(false)
    },
    [navigate],
  )

  const showDrop = open && debounced.trim().length > 0

  return (
    <div ref={rootRef} style={wrap}>
      <label htmlFor="global-search" className="sr-only">
        Buscar no livro
      </label>
      <input
        id="global-search"
        type="search"
        placeholder={variant === 'home' ? 'Buscar tema, cena ou capítulo…' : 'Buscar…'}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        style={inputStyle}
        autoComplete="off"
      />
      {showDrop && (
        <div style={dropdown} role="listbox">
          {results.length === 0 ? (
            <div
              style={{
                padding: '12px 14px',
                fontFamily: "'Crimson Text', serif",
                fontSize: '.82rem',
                color: 'rgba(232,224,208,.45)',
              }}
            >
              Nenhum resultado
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                role="option"
                onClick={() => pick(r)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: '1px solid rgba(201,168,76,.08)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#e8e0d0',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '.42rem',
                    letterSpacing: '.2em',
                    color: 'rgba(201,168,76,.55)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {r.sectionTitle}
                  {r.chapters ? ` · cap. ${r.chapters}` : ''}
                </span>
                <span
                  style={{
                    fontFamily: "'Crimson Text', serif",
                    fontSize: '.88rem',
                  }}
                >
                  {r.sceneTitle}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
