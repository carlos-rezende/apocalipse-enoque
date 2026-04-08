import { useEffect } from 'react'

export const DEFAULT_DOCUMENT_TITLE = 'Apocalipse de Enoque — Simulação 2D Cinemática'
export const DEFAULT_DOCUMENT_DESCRIPTION =
  'Simulação cinemática em cenas baseada no Livro de Enoque — narrativa, imagens e música ambiente.'

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
