import { useState, useEffect } from 'react'

function CountdownTimer({ endTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now())
      setTimeLeft(remaining)
      if (remaining === 0) {
        onExpire?.()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime, onExpire])

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const display = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`

  // Color logic
  let timerColor = 'var(--text-primary)'
  if (timeLeft < 60000) timerColor = 'var(--warning)'   // < 60s = amber
  if (timeLeft < 10000) timerColor = 'var(--error)'     // < 10s = red

  return (
    <div className="countdown">
      <span
        className="countdown__display mono"
        style={{ color: timerColor }}
      >
        {display}
      </span>
      <div className="countdown__bar">
        <div
          className="countdown__progress"
          style={{
            width: `${(timeLeft / (endTime - Date.now() + timeLeft)) * 100}%`,
            backgroundColor: timerColor,
            transition: 'width 1s linear, background-color 0.5s ease'
          }}
        />
      </div>
    </div>
  )
}

// Export both as default and named export
export { CountdownTimer }
export default CountdownTimer
