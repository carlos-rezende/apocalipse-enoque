import { getSectionById } from './data/sectionsData.js'

let simulationImportPromise = null

/** Cacheia o dynamic import do chunk da simulação (mesma promessa do React.lazy). */
export function prefetchSimulationChunk() {
  if (!simulationImportPromise) {
    simulationImportPromise = import('./SectionSimulation.jsx')
  }
  return simulationImportPromise
}

/** Pré-carrega imagens das cenas de uma seção (leve, sem bloquear). */
export function prefetchSectionImages(sectionId) {
  const sec = getSectionById(sectionId)
  if (!sec?.scenes) return
  for (const sc of sec.scenes) {
    if (!sc.image) continue
    const img = new Image()
    img.src = sc.image
  }
}
