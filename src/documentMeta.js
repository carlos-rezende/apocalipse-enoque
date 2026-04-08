import { useEffect } from 'react'

export const DEFAULT_DOCUMENT_TITLE = 'Apocalipse de Enoque — Experiência Interativa'
export const DEFAULT_DOCUMENT_DESCRIPTION =
  'Experiência interativa baseada no Livro de Enoque com visualizações imersivas.'

/** Atualiza <title> e meta description; restaura ao desmontar. */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    document.title = title
    const el = document.querySelector('meta[name="description"]')
    if (el) el.setAttribute('content', description)
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE
      if (el) el.setAttribute('content', DEFAULT_DOCUMENT_DESCRIPTION)
    }
  }, [title, description])
}
