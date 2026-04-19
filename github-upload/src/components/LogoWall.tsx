import { useState } from 'react';
import './LogoWall.css';

export interface LogoItem {
  imgUrl: string;
  altText: string;
}

interface LogoWallProps {
  items?: LogoItem[];
  direction?: 'horizontal' | 'vertical';
  pauseOnHover?: boolean;
  size?: string;
  duration?: string;
  textColor?: string;
  bgColor?: string;
  bgClass?: string;
}

export default function LogoWall({
  items = [],
  direction = 'horizontal',
  pauseOnHover = false,
  size = 'clamp(3rem, 1rem + 10vmin, 5rem)',
  duration = '60s',
  textColor = '#ffffff',
  bgColor = 'transparent',
  bgClass = ''
}: LogoWallProps) {
  const [isPaused, setIsPaused] = useState(false);

  const wrapperClass = [
    'logo-wall-wrapper',
    direction === 'vertical' && 'wrapper--vertical',
    bgClass
  ].filter(Boolean).join(' ');

  const marqueeClass = [
    'logo-wall-marquee',
    direction === 'vertical' && 'marquee--vertical',
    isPaused && 'marquee--paused'
  ].filter(Boolean).join(' ');

  return (
    <article
      className={wrapperClass}
      style={{
        '--size': size,
        '--duration': duration,
        '--color-text': textColor,
        '--color-bg': bgColor,
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-bg)'
      } as React.CSSProperties}
    >
      <div
        className={marqueeClass}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        <div className="logo-wall-marquee__group">
          {items.map((item, idx) => (
            <img key={idx} src={item.imgUrl} alt={item.altText} />
          ))}
        </div>
        <div className="logo-wall-marquee__group" aria-hidden="true">
          {items.map((item, idx) => (
            <img key={`dup-${idx}`} src={item.imgUrl} alt={item.altText} />
          ))}
        </div>
      </div>
    </article>
  );
}
