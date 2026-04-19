import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingSpline({ color, radius, speed, yOffset, tubeRadius }) {
  const meshRef = useRef();

  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(t) * radius + Math.sin(t * 3) * 0.5,
          Math.sin(t) * radius * 0.5 + yOffset + Math.cos(t * 5) * 0.2,
          Math.sin(t * 2) * 2
        )
      );
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, [radius, yOffset]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 200, tubeRadius, 8, true);
  }, [curve, tubeRadius]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += speed * 0.002;
      meshRef.current.rotation.y += speed * 0.001;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef();
  const count = 400;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    const orange = new THREE.Color('#F97316');
    const purple = new THREE.Color('#A855F7');
    for (let i = 0; i < count; i++) {
      const color = Math.random() > 0.5 ? orange : purple;
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return cols;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function SplineBackground() {
  return (
    // ⚠️ KEY FIX: Explicit z-index and pointer-events-none
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: 0 }}
    >
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} color="#F97316" intensity={3} />
        <pointLight position={[-5, -5, 5]} color="#A855F7" intensity={3} />
        <pointLight position={[0, 3, 3]} color="#FB923C" intensity={1.5} />

        {/* Orange Splines */}
        <RotatingSpline color="#F97316" radius={3} speed={1} yOffset={0} tubeRadius={0.025} />
        <RotatingSpline color="#FB923C" radius={4} speed={0.7} yOffset={1} tubeRadius={0.018} />
        <RotatingSpline color="#EA580C" radius={2.5} speed={1.3} yOffset={-0.5} tubeRadius={0.02} />

        {/* Purple Splines */}
        <RotatingSpline color="#A855F7" radius={3.5} speed={-0.8} yOffset={0.5} tubeRadius={0.025} />
        <RotatingSpline color="#C084FC" radius={2.8} speed={-1.1} yOffset={-1} tubeRadius={0.018} />
        <RotatingSpline color="#7C3AED" radius={4.2} speed={-0.6} yOffset={0.3} tubeRadius={0.02} />

        <FloatingParticles />
      </Canvas>
    </div>
  );
}