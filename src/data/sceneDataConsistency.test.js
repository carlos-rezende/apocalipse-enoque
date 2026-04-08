import { describe, it, expect } from 'vitest'
import { SECTION_ORDER, sections } from './sectionsData.js'
import { SCENE_IMAGES } from './sceneImages.js'

describe('dados de cenas', () => {
  it('cada secção em SECTION_ORDER existe em sections e SCENE_IMAGES', () => {
    for (const id of SECTION_ORDER) {
      expect(sections[id], `sections.${id}`).toBeDefined()
      expect(SCENE_IMAGES[id], `SCENE_IMAGES.${id}`).toBeDefined()
    }
  })

  it('número de imagens = número de cenas por secção', () => {
    for (const id of SECTION_ORDER) {
      const n = sections[id].scenes.length
      expect(SCENE_IMAGES[id].length, id).toBe(n)
    }
  })
})
