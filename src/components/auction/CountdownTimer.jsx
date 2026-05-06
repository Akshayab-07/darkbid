import { useState, useEffect } from 'react'

function CountdownTimer({ timeLeft = 0, state, totalDuration = 45, bids = 0, onExpire }) {
  const [displayTime, setDisplayTime] = useState(timeLeft)

  useEffect(() => {
    // If timeLeft is provided and valid, use it directly
    if (typeof timeLeft === 'number' && !isNaN(timeLeft)) {
      setDisplayTime(Math.max(0, timeLeft))
    }
  }, [timeLeft])

  // Ensure displayTime is a valid number (timeLeft is in seconds, not milliseconds)
  const validTime = typeof displayTime === 'number' && !isNaN(displayTime) ? displayTime : 0
  
  // Convert seconds to minutes:seconds format
  const minutes = Math.floor(validTime / 60)
  const seconds = Math.floor(validTime % 60)
  const display = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`

  // Calculate progress percentage based on totalDuration (both in seconds)
  const progressPercent = totalDuration > 0 ? Math.max(0, (validTime / totalDuration) * 100) : 0

  // Color logic
  let timerColor = 'var(--text-primary)'
  if (validTime < 60000) timerColor = 'var(--warning)'   // < 60s = amber
  if (validTime < 10000) timerColor = 'var(--error)'     // < 10s = red

  return (
    <div className="countdown">
      <div className="countdown__info">
        <span className="countdown__label">Time Left</span>
        <span
          className="countdown__display mono"
          style={{ color: timerColor }}
        >
          {display}
        </span>
        <span className="countdown__bids mono text-sm text-text-muted">
          {bids} sealed bids
        </span>
      </div>
      <div className="countdown__bar">
        <div
          className="countdown__progress"
          style={{
            width: `${progressPercent}%`,
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
