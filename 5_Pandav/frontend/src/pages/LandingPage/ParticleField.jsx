import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import './ParticleField.css'

const PARTICLE_COUNT = 2000;

function getSphere(count, radius) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    pos[i * 3 + 2] = radius * Math.cos(phi)
  }
  return pos
}

function getCube(count, size) {
  const pos = new Float32Array(count * 3)
  const half = size / 2
  for (let i = 0; i < count; i++) {
    const face = Math.floor(Math.random() * 6)
    let x = (Math.random() - 0.5) * size
    let y = (Math.random() - 0.5) * size
    let z = (Math.random() - 0.5) * size
    if (face === 0) x = half
    if (face === 1) x = -half
    if (face === 2) y = half
    if (face === 3) y = -half
    if (face === 4) z = half
    if (face === 5) z = -half
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }
  return pos
}

function getOctahedron(count, size) {
  const pos = new Float32Array(count * 3)
  const vertices = [
    [size, 0, 0], [-size, 0, 0],
    [0, size, 0], [0, -size, 0],
    [0, 0, size], [0, 0, -size]
  ]
  const faces = [
    [0, 2, 4], [0, 2, 5], [0, 3, 4], [0, 3, 5],
    [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5]
  ]
  for (let i = 0; i < count; i++) {
    const face = faces[Math.floor(Math.random() * faces.length)]
    const v1 = vertices[face[0]]
    const v2 = vertices[face[1]]
    const v3 = vertices[face[2]]
    let r1 = Math.random()
    let r2 = Math.random()
    if (r1 + r2 > 1) {
      r1 = 1 - r1
      r2 = 1 - r2
    }
    const r3 = 1 - r1 - r2
    pos[i * 3] = v1[0] * r1 + v2[0] * r2 + v3[0] * r3
    pos[i * 3 + 1] = v1[1] * r1 + v2[1] * r2 + v3[1] * r3
    pos[i * 3 + 2] = v1[2] * r1 + v2[2] * r2 + v3[2] * r3
  }
  return pos
}

function getTorus(count, radius, tube) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2
    const v = Math.random() * Math.PI * 2
    pos[i * 3] = (radius + tube * Math.cos(v)) * Math.cos(u)
    pos[i * 3 + 1] = (radius + tube * Math.cos(v)) * Math.sin(u)
    pos[i * 3 + 2] = tube * Math.sin(v)
  }
  return pos
}

function getDNA(count, height, radius) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const isStrand1 = Math.random() > 0.5;
        const y = (Math.random() - 0.5) * height;
        const angle = y * 2.5 + (isStrand1 ? 0 : Math.PI);
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
        
        // Add some noise
        pos[i * 3] += (Math.random() - 0.5) * 0.2;
        pos[i * 3 + 1] += (Math.random() - 0.5) * 0.2;
        pos[i * 3 + 2] += (Math.random() - 0.5) * 0.2;
    }
    return pos;
}

const shapes = [
  getSphere(PARTICLE_COUNT, 2.2),
  getCube(PARTICLE_COUNT, 3),
  getOctahedron(PARTICLE_COUNT, 2.8),
  getTorus(PARTICLE_COUNT, 2.0, 0.8),
  getDNA(PARTICLE_COUNT, 4.5, 1.2)
]

function MorphingParticles({ scrollProgress, mousePos }) {
  const meshRef = useRef()
  const currentPositions = useMemo(() => new Float32Array(shapes[0]), [])
  const particleOffsets = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])

  const { camera, size } = useThree()
  
  const mouseWorldPos = useRef(new THREE.Vector3())
  const raycaster = useRef(new THREE.Raycaster())

  // Reusable objects to prevent garbage collection spikes in useFrame
  const tempPos = useMemo(() => new THREE.Vector3(), [])
  const tempDir = useMemo(() => new THREE.Vector3(), [])
  const groupRot = useMemo(() => new THREE.Euler(), [])
  const invRot = useMemo(() => new THREE.Euler(), [])

  useFrame((state) => {
    if (!meshRef.current) return

    // 1. Determine target shape based on scroll
    const numShapes = shapes.length
    const progressPerShape = 1 / (numShapes - 1)
    
    // Clamp scroll progress
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress))
    
    let shapeIndex1 = Math.floor(clampedProgress / progressPerShape)
    let shapeIndex2 = shapeIndex1 + 1
    
    if (shapeIndex1 >= numShapes - 1) {
      shapeIndex1 = numShapes - 1
      shapeIndex2 = numShapes - 1
    }

    const localProgress = (clampedProgress - shapeIndex1 * progressPerShape) / progressPerShape

    const shape1 = shapes[shapeIndex1]
    const shape2 = shapes[shapeIndex2]

    // 2. Raycast mouse to world plane (Z=0)
    raycaster.current.setFromCamera(mousePos, camera)
    const targetZ = 0
    const distance = (targetZ - camera.position.z) / raycaster.current.ray.direction.z
    // Reuse tempDir instead of clone() to avoid per-frame allocation
    tempDir.copy(raycaster.current.ray.direction).multiplyScalar(distance)
    mouseWorldPos.current.copy(camera.position).add(tempDir)

    // 3. Pre-calculate rotation variables outside the loop
    const parentRotation = meshRef.current.parent.rotation;
    groupRot.copy(parentRotation);
    invRot.set(-parentRotation.x, -parentRotation.y, -parentRotation.z, parentRotation.order);

    const positions = meshRef.current.geometry.attributes.position.array
    const time = state.clock.elapsedTime
    const repelRadius = 2.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      
      // Interpolate between the two current shapes
      const targetX = shape1[i3] + (shape2[i3] - shape1[i3]) * localProgress
      const targetY = shape1[i3 + 1] + (shape2[i3 + 1] - shape1[i3 + 1]) * localProgress
      const targetZ = shape1[i3 + 2] + (shape2[i3 + 2] - shape1[i3 + 2]) * localProgress

      // Mouse repel logic
      tempPos.set(
          targetX + particleOffsets[i3],
          targetY + particleOffsets[i3 + 1],
          targetZ + particleOffsets[i3 + 2]
      )
      
      // Apply rotation to match group rotation to get world-ish pos
      tempPos.applyEuler(groupRot)

      const distToMouse = tempPos.distanceTo(mouseWorldPos.current)
      
      if (distToMouse < repelRadius) {
        const force = (1 - distToMouse / repelRadius) * 0.15
        
        // Calculate direction without creating new objects
        tempDir.copy(tempPos).sub(mouseWorldPos.current).normalize()
        tempDir.applyEuler(invRot)

        particleOffsets[i3] += tempDir.x * force
        particleOffsets[i3 + 1] += tempDir.y * force
        particleOffsets[i3 + 2] += tempDir.z * force
      }

      // Spring back offset to zero
      particleOffsets[i3] *= 0.92
      particleOffsets[i3 + 1] *= 0.92
      particleOffsets[i3 + 2] *= 0.92

      // Add gentle sine wave float
      const floatY = Math.sin(time * 2 + i) * 0.05
      
      // Final lerp
      positions[i3] += (targetX + particleOffsets[i3] - positions[i3]) * 0.1
      positions[i3 + 1] += (targetY + particleOffsets[i3 + 1] + floatY - positions[i3 + 1]) * 0.1
      positions[i3 + 2] += (targetZ + particleOffsets[i3 + 2] - positions[i3 + 2]) * 0.1
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#818cf8"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function Scene({ scrollProgress, mousePos }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      // Auto-rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      
      // Tilt towards mouse
      groupRef.current.rotation.x += mousePos.y * 0.2
      groupRef.current.rotation.y += mousePos.x * 0.2

      // Scroll-based movement: move left when scrolling past Hero
      // scrollProgress goes from 0 to 1 over 4 sections.
      const p = scrollProgress * 4;
      let targetX = 0;
      if (p > 0) {
        // As soon as we start scrolling past Hero, move left and stay left
        targetX = -2.5 * Math.min(p, 1); // interpolates 0 to -2.5 between p=0 and p=1, then stays at -2.5
      }
      
      // Smooth lerp to target position
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.1;
    }
  })

  return (
    <group ref={groupRef}>
      <MorphingParticles scrollProgress={scrollProgress} mousePos={mousePos} />
    </group>
  )
}

export default function ParticleField() {
  const [scrollProgress, setScrollProgress] = useState(0)
  // Use a plain object for state; reuse a single Vector2 ref to avoid per-event allocation
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mousePosVec = useRef(new THREE.Vector2())

  useEffect(() => {
    const handleScroll = () => {
      // Calculate progress from 0 to 1 across the whole document
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      // Guard against division by zero when page is not scrollable
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0
      setScrollProgress(progress)
    }

    const handleMouseMove = (event) => {
      // Update the reusable Vector2 and update state with a plain object
      mousePosVec.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      )
      setMousePos({ x: mousePosVec.current.x, y: mousePosVec.current.y })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="particle-field-container">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Scene scrollProgress={scrollProgress} mousePos={mousePos} />
      </Canvas>
    </div>
  )
}
