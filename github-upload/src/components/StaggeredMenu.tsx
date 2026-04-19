import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface StaggeredMenuProps {
  position?: 'left' | 'right';
  menuItems?: string[];
}

export default function StaggeredMenu({ 
  position = 'right',
  menuItems = ['Home', 'Features', 'Community', 'Docs', 'Blog']
}: StaggeredMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const isRight = position === 'right';

  // Animation variants
  const panelVariants = {
    closed: { 
      x: isRight ? '100%' : '-100%',
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const, // Custom bezier for smooth spring-like feel
        staggerChildren: 0.05,
        staggerDirection: -1,
      }
    },
    open: {
      x: '0%',
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
        staggerChildren: 0.1,
        delayChildren: 0.2, // Delay staggered children until panel is somewhat open
      }
    }
  };

  const itemVariants = {
    closed: { 
      y: 20, 
      opacity: 0,
      transition: { duration: 0.3 }
    },
    open: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
  };


  return (
    <>
      {/* Menu Toggle Button */}
      <button 
        onClick={toggleMenu}
        style={{
          width: 44,
          height: 44,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 100,
          position: 'relative',
        }}
      >
        <span style={{ width: 20, height: 2, background: 'white', display: 'block' }} />
        <span style={{ width: 20, height: 2, background: 'white', display: 'block' }} />
      </button>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100vh',
              zIndex: 90,
              display: 'flex',
              justifyContent: isRight ? 'flex-end' : 'flex-start',
              pointerEvents: isOpen ? 'auto' : 'none'
            }}
          >
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer'
              }}
              onClick={toggleMenu}
            />

            {/* Layer 1 Underlay (Light Purple) */}
            <motion.div
              variants={{
                closed: { x: isRight ? '100%' : '-100%', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
                open: { x: '0%', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
              }}
              style={{
                position: 'absolute',
                top: 0,
                [isRight ? 'right' : 'left']: 0,
                width: '100%',
                maxWidth: 400,
                height: '100vh',
                background: '#818CF8', // Indigo 400
              }}
            />

            {/* Layer 2 Underlay (Dark Purple) */}
            <motion.div
              variants={{
                closed: { x: isRight ? '100%' : '-100%', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
                open: { x: '0%', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 } }
              }}
              style={{
                position: 'absolute',
                top: 0,
                [isRight ? 'right' : 'left']: 0,
                width: '100%',
                maxWidth: 400,
                height: '100vh',
                background: '#4F46E5', // Indigo 600
              }}
            />

            {/* Main Menu Panel */}
            <motion.div
              variants={panelVariants}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 400,
                height: '100vh',
                background: '#0F172A', // Slate 900
                padding: '100px 40px 40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
              }}
            >
              {/* Close Button Inside Panel */}
              <button 
                onClick={toggleMenu}
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: 8
                }}
              >
                <X size={28} />
              </button>

              {/* Navigation Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {menuItems.map((item) => (
                  <motion.a
                    key={item}
                    variants={itemVariants}
                    href={`#${item.toLowerCase()}`}
                    onClick={toggleMenu}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 48,
                      fontWeight: 700,
                      color: 'white',
                      textDecoration: 'none',
                      lineHeight: 1,
                      letterSpacing: '-1px'
                    }}
                    whileHover={{ x: 10, color: '#818CF8' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
