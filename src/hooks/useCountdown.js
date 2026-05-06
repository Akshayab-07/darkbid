import { useState, useEffect } from 'react'

export function useCountdown(endTimestamp) {
  const [timeLeftStr, setTimeLeftStr] = useState('')
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    if (!endTimestamp) {
      setTimeLeftStr('Ended')
      setIsEnded(true)
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const diff = endTimestamp - now

      if (diff <= 0) {
        setTimeLeftStr('Ended')
        setIsEnded(true)
        return true
      }

      const totalSeconds = Math.floor(diff / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        setTimeLeftStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
      } else {
        setTimeLeftStr(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
      }
      return false
    }

    const ended = updateTimer()
    if (ended) return

    const interval = setInterval(() => {
      const isDone = updateTimer()
      if (isDone) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [endTimestamp])

  return { timeLeftStr, isEnded }
}
