import React, { useState, useEffect, useRef } from 'react';
import { Link as LinkIcon, Search, Star, GitBranch, Terminal, Cpu, Blocks, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './pages/landing/index.css';

// --- Components ---

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const ringX = useSpring(cursorX, { damping: 20, stiffness: 250 });
  const ringY = useSpring(cursorY, { damping: 20, stiffness: 250 });

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#00FF88] rounded-full pointer-events-none z-[9999]"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#00FF88]/30 rounded-full pointer-events-none z-[9998]"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
      />
    </>
  );
};

const LivingNeuralNetwork = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 60 : 80;
    const connectionDist = 160;
    const repulsionDist = 120;

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    });
    
    const handleMouseDown = (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      nodes.forEach(node => {
        const dx = node.x - clickX;
        const dy = node.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200;
          node.rvx += (dx / dist) * force * 15;
          node.rvy += (dy / dist) * force * 15;
        }
      });
    };
    window.addEventListener('mousedown', handleMouseDown);
    handleResize();

    class Node {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.baseRadius = 2 + Math.random() * 2;
        this.radius = this.baseRadius;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
        this.color = Math.random() > 0.5 ? 'rgba(0, 229, 255, 0.6)' : 'rgba(0, 255, 136, 0.4)';
        this.flash = 0;
        this.rvx = 0;
        this.rvy = 0;
      }

      update() {
        // Drifting movement
        this.y += this.vy;

        // Repulsion Velocity (from clicks)
        this.x += this.rvx;
        this.y += this.rvy;
        this.rvx *= 0.97;
        this.rvy *= 0.97;

        // Mouse repulsion & attraction
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attraction logic
        if (dist < 150) {
          this.x += (mouseRef.current.x - this.x) * 0.02;
          this.y += (mouseRef.current.y - this.y) * 0.02;
        }

        if (dist < repulsionDist) {
          const force = (repulsionDist - dist) / repulsionDist;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }

        // Bouncing logic
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Pulsing radius
        this.pulsePhase += this.pulseSpeed;
        this.radius = this.baseRadius + Math.sin(this.pulsePhase) * 1.5;

        if (this.flash > 0) this.flash -= 0.05;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + (this.flash * 4), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.min(1, 0.6 + this.flash);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    class Signal {
      constructor(startNode, endNode) {
        this.start = startNode;
        this.end = endNode;
        this.progress = 0;
        this.speed = 0.02 + Math.random() * 0.01;
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          this.end.flash = 1;
          return true;
        }
        return false;
      }

      draw() {
        const x = this.start.x + (this.end.x - this.start.x) * this.progress;
        const y = this.start.y + (this.end.y - this.start.y) * this.progress;

        // Dynamic Signal Boost
        const dx = x - mouseRef.current.x;
        const dy = y - mouseRef.current.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        const isNearCursor = distToMouse < 100;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.shadowBlur = isNearCursor ? 20 : 12;
        ctx.shadowColor = '#00e5ff';
        ctx.fillStyle = '#00e5ff';
        ctx.fill();
        ctx.restore();

        // Speed adjustment
        if (isNearCursor) {
          this.progress += this.speed; // Effective 2x speed when combined with update()
        }
      }
    }

    const nodes = Array.from({ length: nodeCount }, () => new Node());
    const signals = [];

    const triggerSignal = () => {
      if (signals.length >= 6) return;

      const nodeA = nodes[Math.floor(Math.random() * nodes.length)];
      const connectedNodes = nodes.filter(nodeB => {
        if (nodeA === nodeB) return false;
        const dist = Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
        return dist < connectionDist;
      });

      if (connectedNodes.length > 0) {
        const nodeB = connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
        signals.push(new Signal(nodeA, nodeB));
      }
    };

    let lastSignalTime = 0;

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cursor Glow Aura
      const auraGradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 120
      );
      auraGradient.addColorStop(0, 'rgba(0, 229, 255, 0.08)');
      auraGradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = auraGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      nodes.forEach(node => node.update());

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const opacity = 1 - (dist / connectionDist);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => node.draw());

      // Update & Draw signals
      for (let i = signals.length - 1; i >= 0; i--) {
        if (signals[i].update()) {
          signals.splice(i, 1);
        } else {
          signals[i].draw();
        }
      }

      // Randomly trigger signals
      if (time - lastSignalTime > 1500 + Math.random() * 1500) {
        triggerSignal();
        lastSignalTime = time;
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

const TypewriterText = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let timeout;
    if (displayedText.length < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 50);
    } else {
      setComplete(true);
    }
    return () => clearTimeout(timeout);
  }, [displayedText, text]);

  return (
    <span>
      {displayedText}
      {!complete && <span className="animate-pulse">|</span>}
    </span>
  );
};

function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fullPlaceholder = "Paste a GitHub repo → See its architecture instantly";

  // Typewriter Effect logic
  useEffect(() => {
    let timer;
    const type = () => {
      const currentText = placeholderText;
      const shouldDelete = isDeleting;

      if (!shouldDelete && currentText.length < fullPlaceholder.length) {
        // Typing
        setPlaceholderText(fullPlaceholder.slice(0, currentText.length + 1));
        timer = setTimeout(type, 55);
      } else if (shouldDelete && currentText.length > 0) {
        // Deleting
        setPlaceholderText(currentText.slice(0, -1));
        timer = setTimeout(type, 35);
      } else if (!shouldDelete && currentText.length === fullPlaceholder.length) {
        // Finished typing - pause
        timer = setTimeout(() => setIsDeleting(true), 2500);
      } else if (shouldDelete && currentText.length === 0) {
        // Finished deleting - pause then restart
        timer = setTimeout(() => {
          setIsDeleting(false);
          type();
        }, 800);
      }
    };

    if (!isFocused && !repoUrl) {
      timer = setTimeout(type, 55);
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, isFocused, repoUrl]);

  const loadingSteps = [
    "Fetching repo metadata...",
    "Parsing codebase structure...",
    "Analyzing module dependencies...",
    "Mapping architectural flows...",
    "Generating visualization engine..."
  ];

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setIsAnalyzing(true);
    setShowProgress(true);

    // Animate through steps
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setLoadingStep(prev => prev + 1);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/analysis', { state: { repoUrl } });
        }, 800);
      }
    }, 1200);
  };

  const extractRepoName = (url) => {
    try {
      // Very basic extraction for visual mocking
      let cleanUrl = url.replace('https://', '').replace('http://', '');
      const parts = cleanUrl.split('/');
      if (parts[0] === 'github.com' && parts.length >= 3) {
        return `${parts[1]}/${parts[2]}`;
      }
      return cleanUrl || 'repository';
    } catch {
      return 'repository';
    }
  };

  return (
    <div className="landing-root">
      <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
        <CustomCursor />
        <LivingNeuralNetwork />

        {/* Background patterns overlay */}
        <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none z-[1]" />
        <div className="absolute inset-0 bg-grid animate-pulse-grid pointer-events-none z-[2]" />

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
          <div className="w-full px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Blocks className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-xl md:text-2xl tracking-tight">Archflow</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Demo
              </button>
              <button className="flex items-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center relative z-10">
          <div className="max-w-3xl w-full text-center space-y-8">

            {/* Hero Text */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white min-h-[160px] md:min-h-[200px]">
                <TypewriterText text="Turn Repos Into Architecture Maps in Seconds" /> <br />
                <span className="text-3xl md:text-4xl lg:text-5xl italic animate-shimmer">
                  in minutes, not weeks.
                </span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="text-base md:text-lg text-gray-400 mx-auto font-light"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)'
                }}
              >
                Paste a GitHub repository and visualize its architecture, flows, and dependencies in seconds.
              </motion.p>
            </div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="max-w-3xl mx-auto w-full"
            >
              <form
                onSubmit={handleAnalyze}
                className="relative group w-full"
              >
                {/* Animated Border Gradient Base */}
                <div className="absolute -inset-[1.5px] bg-gradient-to-r from-[#00FF88] via-[#00e5ff] to-[#3B82F6] rounded-full blur-[2px] opacity-20 group-hover:opacity-100 transition duration-1000 group-focus-within:opacity-100 animate-pulse"></div>

                <div
                  className="relative flex items-center bg-black/80 backdrop-blur-2xl rounded-full p-2 transition-all duration-300"
                  style={{
                    border: '1.5px solid transparent',
                    backgroundClip: 'padding-box',
                    boxShadow: '0 0 12px rgba(0, 229, 255, 0.4), 0 0 24px rgba(0, 229, 255, 0.15)'
                  }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 18px rgba(0, 229, 255, 0.7), 0 0 36px rgba(0, 229, 255, 0.25)'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.4), 0 0 24px rgba(0, 229, 255, 0.15)'}
                >
                  <div className="pl-5 pr-2 text-gray-400 relative">
                    <LinkIcon className="w-5 h-5" />
                    {repoUrl && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-0 w-2 h-2 bg-[#00FF88] rounded-full shadow-[0_0_10px_#00FF88]"
                      />
                    )}
                  </div>

                  {/* Fake Placeholder */}
                  {!isFocused && !repoUrl && (
                    <div className="absolute left-14 text-gray-500 pointer-events-none text-sm md:text-base select-none whitespace-nowrap">
                      {placeholderText}
                      <span
                        className={`inline-block w-[2px] h-[1.2em] bg-[#00e5ff] ml-1 align-middle ${isDeleting && placeholderText.length === 0 ? 'hidden' : 'animate-blink'}`}
                        style={{
                          display: (isDeleting && placeholderText.length === fullPlaceholder.length) ? 'none' : 'inline-block'
                        }}
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isAnalyzing}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-transparent text-sm md:text-base py-3 px-2 focus:ring-0 z-10"
                  />

                  <motion.button
                    type="submit"
                    disabled={isAnalyzing || !repoUrl}
                    layout
                    className={`relative overflow-hidden flex items-center justify-center gap-2 h-12 rounded-full font-bold transition-all ${isAnalyzing
                      ? 'w-full bg-white/5 cursor-default'
                      : 'px-8 bg-[#00FF88] text-black hover:shadow-[0_0_20px_#00FF88] active:scale-95'
                      }`}
                  >
                    <AnimatePresence mode="wait">
                      {!isAnalyzing ? (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                          <span>Visualize</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="active"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 6, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-[#00FF88] to-[#3B82F6] opacity-25"
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </form>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-4 text-[16px] text-white/40 font-light tracking-wide"
              >
                Works with React, Node, Python, Java…
              </motion.p>
            </motion.div>

            {/* Loading Sequence */}
            <AnimatePresence>
              {showProgress && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  className="max-w-md mx-auto pt-10 text-left"
                >
                  <div className="relative pl-8 space-y-6">
                    {/* Progress Line */}
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
                    <motion.div
                      className="absolute left-3 top-2 w-px bg-[#00FF88]"
                      initial={{ height: 0 }}
                      animate={{ height: `${(loadingStep / loadingSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />

                    {loadingSteps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={loadingStep >= idx ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        className="flex items-center gap-4 group"
                      >
                        <div className="relative z-10">
                          {loadingStep > idx ? (
                            <div className="w-6 h-6 rounded-full bg-[#00FF88] flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-black" />
                            </div>
                          ) : loadingStep === idx ? (
                            <div className="w-6 h-6 rounded-full bg-black border border-[#00FF88] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center">
                              <Circle className="w-2 h-2 text-white/10" />
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${loadingStep >= idx ? 'text-white' : 'text-gray-600'}`}>
                          {step}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feature Pills */}
            {!showProgress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap justify-center gap-3 pt-12"
              >
                {[
                  { icon: GitBranch, label: "Dependency Map", color: "#3B82F6" },
                  { icon: Terminal, label: "Flow Analysis", color: "#00FF88" },
                  { icon: Cpu, label: "Neural Engine", color: "#A855F7" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    whileHover={{ y: -5, boxShadow: `0 0 15px ${item.color}33` }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full cursor-default group animate-float"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  >
                    <item.icon className="w-4 h-4 transition-colors group-hover:text-white" style={{ color: item.color }} />
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
