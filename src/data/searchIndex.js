import { sections, SECTION_ORDER } from './sectionsData.js'

/** Lista pesquisável (memoizar no componente com useMemo). */
export function buildSearchEntries() {
  const out = []
  for (const id of SECTION_ORDER) {
    const sec = sections[id]
    if (!sec?.scenes) continue
    sec.scenes.forEach((sc, idx) => {
      const blob = [
        sec.title,
        sec.chapters,
        sc.name,
        sc.sub,
        sc.text,
        sc.chapters,
        sc.additionalReading,
        ...(sc.keywords || []),
        ...(sc.panel?.themes || []),
        sc.panel?.reference,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      out.push({
        id: `${id}-${idx}`,
        sectionId: id,
        sectionTitle: sec.title,
        sceneIndex: idx,
        sceneTitle: sc.name,
        path: sec.path,
        chapters: sc.chapters,
        additionalReading: sc.additionalReading,
        blob,
      })
    })
  }
  return out
}

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function filterSearchEntries(entries, query, limit = 14) {
  const q = stripDiacritics(query.trim().toLowerCase())
  if (!q) return []
  const qn = q.replace(/\s+/g, ' ')
  return entries
    .filter((e) => stripDiacritics(e.blob).includes(qn))
    .slice(0, limit)
}
