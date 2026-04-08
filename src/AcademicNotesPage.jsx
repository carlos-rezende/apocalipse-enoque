import { ACADEMIC } from './data/academic.js'
import { useDocumentMeta } from './documentMeta.js'

export default function AcademicNotesPage() {
  useDocumentMeta(
    'Notas sobre o texto — Apocalipse de Enoque',
    'Referência ao 1 Enoque etíope, limites da adaptação narrativa e ligação a leitura completa (recurso externo).',
  )

  return (
    <div className="academic-notes-page">
      <main className="academic-notes-main">
        <p className="academic-notes-eyebrow">Referência e leitura</p>
        <h1 className="academic-notes-title">Notas sobre o texto</h1>
        <div className="academic-notes-divider" aria-hidden />
        <div className="academic-notes-body">
          <p className="academic-notes-lead">{ACADEMIC.translationNote}</p>
          <p className="academic-notes-muted">{ACADEMIC.disclaimer}</p>
          <p className="academic-notes-actions">
            <a
              href={ACADEMIC.fullReadingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="academic-notes-external-link"
            >
              {ACADEMIC.fullReadingLabel}
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
