import { useState, useEffect, useRef } from 'react';
import { Atom } from 'lucide-react';
import { motion } from 'framer-motion';

interface PillNavProps {
  items: string[];
}

export default function PillNav({ items }: PillNavProps) {
  const [active, setActive] = useState(items[0]);
  const isClicking = useRef(false);

  // Handle scroll to update active state
  useEffect(() => {
    const handleScroll = () => {
      if (isClicking.current) return;
      
      const windowHeight = window.innerHeight;
      
      for (const item of items) {
        let targetId = item.toLowerCase().replace(/\s+/g, '-');
        if (item === 'Features') targetId = 'how-it-works';
        if (item === 'About Us') targetId = 'about';

        const element = document.getElementById(targetId);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          // If the element is near the top of the viewport
          if (top < windowHeight * 0.4 && bottom > windowHeight * 0.3) {
            setActive(item);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: string) => {
    e.preventDefault();
    setActive(item);
    isClicking.current = true;
    
    // Custom smooth scroll with offset for fixed header
    // Map labels to IDs
    let targetId = item.toLowerCase().replace(/\s+/g, '-');
    if (item === 'Features') targetId = 'how-it-works';
    if (item === 'About Us') targetId = 'about';

    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -90; // Offset for navbar height
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    
    // Re-enable scroll spy after scroll animation roughly completes
    setTimeout(() => {
      isClicking.current = false;
    }, 800);
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      position: 'relative'
    }}>
      {/* Dynamic Logo Icon */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'black',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Atom size={28} />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        position: 'relative' 
      }}>
        {items.map((item) => {
          const isActive = active === item;
          // Clean layout: Floating individual white pills as in reference
          let targetHref = `#${item.toLowerCase().replace(/\s+/g, '-')}`;
          if (item === 'Features') targetHref = '#how-it-works';
          if (item === 'About Us') targetHref = '#about';

          return (
            <motion.a
              key={item}
              href={targetHref}
              onClick={(e) => handleClick(e, item)}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'relative',
                padding: '12px 32px',
                color: 'black',
                background: '#F8FAFC',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '999px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
              whileHover={{ 
                 scale: 1.05, 
                 background: '#FFFFFF',
                 boxShadow: '0 8px 30px rgba(0,0,0,0.12)' 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span style={{ position: 'relative', zIndex: 10 }}>{item}</span>
              {isActive && (
                <motion.div
                  layoutId="active-pill-bg"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#FFFFFF',
                    borderRadius: '999px',
                    zIndex: 0,
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
