import './Marquee.css'

export default function Marquee() {
  const text = "TRANSPARENT • ACCOUNTABLE • VERIFIABLE • DECENTRALIZED • IMMUTABLE • "
  
  return (
    <div className="marquee-wrapper">
      <div className="marquee">
        <div className="marquee__inner">
          <span className="marquee__text">{text}</span>
          <span className="marquee__text">{text}</span>
          <span className="marquee__text">{text}</span>
          <span className="marquee__text">{text}</span>
        </div>
      </div>
    </div>
  )
}
