import { useEffect, useRef, useState } from 'react'
import './TrustBar.css'

function AnimatedMetric({ value, label, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let start = 0
    const duration = 2000
    const startTime = performance.now()
    let rafId
    let cancelled = false

    const animate = (currentTime) => {
      if (cancelled) return
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = eased * value

      setCount(start)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [value, isVisible])

  return (
    <div className="trustbar__metric" ref={ref}>
      <div className="trustbar__metric-value">
        {prefix}{count.toFixed(value % 1 === 0 ? 0 : 2)}{suffix}
      </div>
      <div className="trustbar__metric-label">{label}</div>
    </div>
  )
}

export default function TrustBar() {
  const barRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('trustbar__visible')
        }
      },
      { threshold: 0.1 }
    )
    if (barRef.current) observer.observe(barRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="trustbar-wrapper">
      <div className="trustbar" ref={barRef}>
        <div className="trustbar__inner container">
          <AnimatedMetric label="Decisions Logged" value={1.2} suffix="M+" />
          <div className="trustbar__divider" />
          <AnimatedMetric label="Active Agents" value={500} suffix="+" />
          <div className="trustbar__divider" />
          <AnimatedMetric label="Verification Time" value={50} prefix="<" suffix="ms" />
          <div className="trustbar__divider" />
          <AnimatedMetric label="Network Uptime" value={99.99} suffix="%" />
        </div>
      </div>
    </section>
  )
}
