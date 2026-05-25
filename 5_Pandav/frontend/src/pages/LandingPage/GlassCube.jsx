import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import './GlassCube.css'

function Particles({ count = 80 }) {
  const mesh = useRef()
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = []
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.6
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6
      velocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005,
      })
    }
    return { positions, velocities }
  }, [count])

  useFrame(() => {
    if (!mesh.current) return
    const pos = mesh.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i].x
      pos[i * 3 + 1] += velocities[i].y
      pos[i * 3 + 2] += velocities[i].z

      // Bounce inside cube bounds
      if (Math.abs(pos[i * 3]) > 0.8) velocities[i].x *= -1
      if (Math.abs(pos[i * 3 + 1]) > 0.8) velocities[i].y *= -1
      if (Math.abs(pos[i * 3 + 2]) > 0.8) velocities[i].z *= -1
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#818cf8"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function ConnectionLines() {
  const linesRef = useRef()
  const lines = useMemo(() => {
    const paths = []
    for (let i = 0; i < 12; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4
      )
      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4
      )
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
      mid.x += (Math.random() - 0.5) * 0.5
      mid.y += (Math.random() - 0.5) * 0.5

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      paths.push(curve.getPoints(20))
    }
    return paths
  }, [])

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        line.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1
      })
    }
  })

  return (
    <group ref={linesRef}>
      {lines.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  )
}

function CubeObject() {
  const cubeRef = useRef()
  const edgesRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (cubeRef.current) {
      cubeRef.current.rotation.x = Math.sin(t * 0.2) * 0.15 + 0.4
      cubeRef.current.rotation.y = t * 0.15
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.x = Math.sin(t * 0.2) * 0.15 + 0.4
      edgesRef.current.rotation.y = t * 0.15
    }
    if (glowRef.current) {
      glowRef.current.rotation.x = Math.sin(t * 0.2) * 0.15 + 0.4
      glowRef.current.rotation.y = t * 0.15
      glowRef.current.scale.setScalar(1.02 + Math.sin(t * 0.8) * 0.02)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group>
        {/* Glass cube */}
        <mesh ref={cubeRef}>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.1}
            roughness={0.05}
            transmission={0.92}
            thickness={0.5}
            transparent
            opacity={0.3}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            ior={1.5}
          />
        </mesh>

        {/* Glowing edges */}
        <lineSegments ref={edgesRef}>
          <edgesGeometry args={[new THREE.BoxGeometry(1.82, 1.82, 1.82)]} />
          <lineBasicMaterial color="#6366f1" transparent opacity={0.6} />
        </lineSegments>

        {/* Outer glow shell */}
        <mesh ref={glowRef}>
          <boxGeometry args={[1.9, 1.9, 1.9]} />
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Internal particles */}
        <Particles count={80} />

        {/* Connection lines */}
        <ConnectionLines />
      </group>
    </Float>
  )
}

export default function GlassCube({ className = '' }) {
  return (
    <div className={`glass-cube-container ${className}`}>
      <div className="glass-cube-glow" />
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#6366f1" />
        <pointLight position={[-5, -5, 3]} intensity={0.4} color="#818cf8" />
        <pointLight position={[0, 3, -5]} intensity={0.3} color="#a5b4fc" />
        <CubeObject />
      </Canvas>
    </div>
  )
}
