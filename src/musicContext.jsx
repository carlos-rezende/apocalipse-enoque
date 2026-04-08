/* eslint-disable react-refresh/only-export-components -- hook + provider no mesmo módulo */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const MusicContext = createContext(null)

const FALLBACK_URLS = ['/audio/ambience.mp3', '/audio/Myuu-Haunted-by-Screams.mp3']

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic deve ser usado dentro de MusicProvider')
  return ctx
}

function useBackgroundMusicValue() {
  const audioRef = useRef(null)
  const fadeRef = useRef(null)
  const candidatesRef = useRef([...FALLBACK_URLS])
  const lastTargetVolRef = useRef(0.18)
  const mutedRef = useRef(false)
  const playingBeforeMuteRef = useRef(false)
  const [muted, setMuted] = useState(false)

  const clearFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current)
      fadeRef.current = null
    }
  }, [])

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio()
      a.loop = true
      a.preload = 'auto'
      a.crossOrigin = 'anonymous'
      a.volume = 0
      audioRef.current = a
    }
    return audioRef.current
  }, [])

  const attachFirstWorking = useCallback((a, urls, onDone) => {
    let i = 0
    const tryNext = () => {
      if (i >= urls.length) {
        onDone(false)
        return
      }
      const url = urls[i++]
      const onErr = () => {
        a.removeEventListener('error', onErr)
        tryNext()
      }
      const onReady = () => {
        a.removeEventListener('error', onErr)
        a.removeEventListener('canplaythrough', onReady)
        onDone(true)
      }
      a.addEventListener('error', onErr, { once: true })
      a.addEventListener('canplaythrough', onReady, { once: true })
      a.src = url
      a.load()
    }
    tryNext()
  }, [])

  const setAudioCandidates = useCallback((urls) => {
    const merged = [...(urls || []).filter(Boolean), ...FALLBACK_URLS]
    const seen = new Set()
    candidatesRef.current = merged.filter((u) => {
      if (seen.has(u)) return false
      seen.add(u)
      return true
    })
  }, [])

  const applyMuted = useCallback(
    (m) => {
      mutedRef.current = m
      setMuted(m)
      const a = audioRef.current
      clearFade()
      if (m) {
        playingBeforeMuteRef.current = !!(a && !a.paused)
        if (a) {
          a.volume = 0
          a.pause()
        }
      } else if (playingBeforeMuteRef.current && a) {
        a.play().catch(() => {})
        a.volume = Math.min(Math.max(lastTargetVolRef.current, 0), 1)
      }
    },
    [clearFade],
  )

  const setVolume = useCallback(
    (targetVol) => {
      const target = Math.min(Math.max(targetVol, 0), 1)
      lastTargetVolRef.current = target
      if (mutedRef.current) return
      const a = audioRef.current
      if (!a || a.paused) return
      clearFade()
      const current = a.volume
      const STEPS = 20
      const stepSize = (target - current) / STEPS
      fadeRef.current = setInterval(() => {
        a.volume = Math.min(Math.max(a.volume + stepSize, 0), 1)
        if (Math.abs(a.volume - target) < 0.003) {
          a.volume = target
          clearFade()
        }
      }, 500 / STEPS)
    },
    [clearFade],
  )

  const fadeVolumeTo = useCallback(
    (targetVol, ms, then) => {
      const a = audioRef.current
      if (!a) {
        then?.()
        return
      }
      clearFade()
      const startV = a.volume
      const STEPS = Math.max(12, Math.floor(ms / 40))
      let step = 0
      fadeRef.current = setInterval(() => {
        step++
        const t = Math.min(step / STEPS, 1)
        a.volume = startV + (targetVol - startV) * t
        if (t >= 1) {
          clearFade()
          then?.()
        }
      }, ms / STEPS)
    },
    [clearFade],
  )

  const start = useCallback(
    (targetVol = 0.18) => {
      const a = ensureAudio()
      clearFade()
      lastTargetVolRef.current = Math.min(Math.max(targetVol, 0), 1)
      const TARGET = mutedRef.current ? 0 : lastTargetVolRef.current
      const urls = candidatesRef.current

      if (!a.paused) {
        setVolume(lastTargetVolRef.current)
        return
      }

      attachFirstWorking(a, urls, (ok) => {
        if (!ok) return
        a.currentTime = 0
        a.volume = 0
        a.play().catch(() => {})
        const STEPS = 50
        const stepSize = TARGET / STEPS
        fadeRef.current = setInterval(() => {
          a.volume = Math.min(a.volume + stepSize, TARGET)
          if (a.volume >= TARGET) clearFade()
        }, 2500 / STEPS)
      })
    },
    [ensureAudio, clearFade, attachFirstWorking, setVolume],
  )

  const applySectionCandidates = useCallback(
    (urls, targetVol = 0.18) => {
      setAudioCandidates(urls)
      const a = ensureAudio()
      lastTargetVolRef.current = Math.min(Math.max(targetVol, 0), 1)
      const TARGET = mutedRef.current ? 0 : lastTargetVolRef.current
      const list = candidatesRef.current

      const loadAndPlay = () => {
        attachFirstWorking(a, list, (ok) => {
          if (!ok) return
          a.currentTime = 0
          a.volume = 0
          a.play().catch(() => {})
          const STEPS = 40
          const stepSize = TARGET / STEPS
          clearFade()
          fadeRef.current = setInterval(() => {
            a.volume = Math.min(a.volume + stepSize, TARGET)
            if (a.volume >= TARGET) clearFade()
          }, 900 / STEPS)
        })
      }

      if (!a.paused && a.volume > 0.02) {
        fadeVolumeTo(0, 380, () => {
          a.pause()
          loadAndPlay()
        })
      }
    },
    [setAudioCandidates, ensureAudio, attachFirstWorking, clearFade, fadeVolumeTo],
  )

  const fadeOut = useCallback(() => {
    const a = audioRef.current
    if (!a || a.paused) return
    clearFade()
    const initial = a.volume
    const STEPS = 40
    const stepSize = initial / STEPS
    fadeRef.current = setInterval(() => {
      a.volume = Math.max(a.volume - stepSize, 0)
      if (a.volume <= 0) {
        clearFade()
        a.pause()
        a.currentTime = 0
      }
    }, 2000 / STEPS)
  }, [clearFade])

  const stop = useCallback(() => {
    clearFade()
    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
      a.volume = 0
    }
  }, [clearFade])

  useEffect(() => () => clearFade(), [clearFade])

  const getIsPlaying = useCallback(
    () => !!(audioRef.current && !audioRef.current.paused),
    [],
  )

  const toggleMute = useCallback(() => {
    applyMuted(!mutedRef.current)
  }, [applyMuted])

  return {
    start,
    fadeOut,
    stop,
    setVolume,
    setAudioCandidates,
    applySectionCandidates,
    getIsPlaying,
    muted,
    setMuted: applyMuted,
    toggleMute,
  }
}

export function MusicProvider({ children }) {
  const music = useBackgroundMusicValue()
  return <MusicContext.Provider value={music}>{children}</MusicContext.Provider>
}
