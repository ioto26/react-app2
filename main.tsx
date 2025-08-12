import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { Environment, ScrollControls, useScroll, useTexture, Text } from '@react-three/drei'
import { easing } from 'maath'

// Custom shader material for wave effect
class MeshSineMaterial extends THREE.MeshBasicMaterial {
  time: { value: number }

  constructor(parameters: any = {}) {
    super(parameters)
    this.setValues(parameters)
    this.time = { value: 0 }
  }

  onBeforeCompile(shader: any) {
    shader.uniforms.time = this.time
    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
    )
  }
}

// Extend Three.js with custom material
extend({ MeshSineMaterial })

// Types for Three.js extensions
declare module '@react-three/fiber' {
  interface ThreeElements {
    meshSineMaterial: any
  }
}

interface RigProps {
  children: React.ReactNode
  rotation?: [number, number, number]
}

function Rig({ children, rotation = [0, 0, 0] }: RigProps) {
  const ref = useRef<THREE.Group>(null)
  const scroll = useScroll()
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y = -scroll.offset * (Math.PI * 2)
    }
    state.events?.update?.()
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5, 10], 0.3, delta)
    state.camera.lookAt(0, 0, 0)
  })

  return <group ref={ref} rotation={rotation}>{children}</group>
}

interface CarouselProps {
  radius?: number
  count?: number
}

function Carousel({ radius = 1.4, count = 8 }: CarouselProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <LoginFormCard
          key={i}
          position={[
            Math.sin((i / count) * Math.PI * 2) * radius,
            0,
            Math.cos((i / count) * Math.PI * 2) * radius
          ]}
          rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
        />
      ))}
    </>
  )
}

interface LoginFormCardProps {
  position: [number, number, number]
  rotation: [number, number, number]
}

function LoginFormCard({ position, rotation }: LoginFormCardProps) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const pointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
  }
  
  const pointerOut = () => setHovered(false)

  useFrame((state, delta) => {
    if (ref.current) {
      easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta)
    }
  })

  return (
    <mesh 
      ref={ref} 
      position={position} 
      rotation={rotation}
      onPointerOver={pointerOver} 
      onPointerOut={pointerOut}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial 
        color={hovered ? 'lightblue' : 'white'} 
        transparent 
        opacity={0.9} 
      />
      
      {/* User ID Label */}
      <Text
        position={[0, 0.2, 0.01]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        ユーザーID:
      </Text>
      
      {/* User ID Input Field */}
      <mesh position={[0, 0.05, 0.01]}>
        <planeGeometry args={[0.8, 0.15]} />
        <meshBasicMaterial color="lightgray" />
      </mesh>

      {/* Password Label */}
      <Text
        position={[0, -0.1, 0.01]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        パスワード:
      </Text>
      
      {/* Password Input Field */}
      <mesh position={[0, -0.25, 0.01]}>
        <planeGeometry args={[0.8, 0.15]} />
        <meshBasicMaterial color="lightgray" />
      </mesh>

      {/* Login Button */}
      <mesh position={[0, -0.45, 0.01]}>
        <planeGeometry args={[0.5, 0.15]} />
        <meshBasicMaterial color="green" />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ログイン
        </Text>
      </mesh>
    </mesh>
  )
}

interface BannerProps {
  position: [number, number, number]
}

function Banner({ position }: BannerProps) {
  const ref = useRef<THREE.Mesh>(null)
  const scroll = useScroll()
  
  // Create a simple texture instead of loading from file
  const texture = new THREE.CanvasTexture(createEGTexture())
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  useFrame((state, delta) => {
    if (ref.current && ref.current.material) {
      const material = ref.current.material as any
      if (material.time) {
        material.time.value += Math.abs(scroll.delta) * 4
      }
      if (material.map) {
        material.map.offset.x += delta / 2
      }
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
      <meshSineMaterial 
        map={texture} 
        map-anisotropy={16} 
        map-repeat={[30, 1]} 
        side={THREE.DoubleSide} 
        toneMapped={false} 
      />
    </mesh>
  )
}

// Create a simple "EG" texture
function createEGTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  
  ctx.fillStyle = '#4a90e2'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  ctx.fillStyle = 'white'
  ctx.font = 'bold 40px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('EG', canvas.width / 2, canvas.height / 2)
  
  return canvas
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
        <fog attach="fog" args={['#a79', 8.5, 12]} />
        <ScrollControls pages={4} infinite>
          <Rig rotation={[0, 0, 0.15]}>
            <Carousel />
          </Rig>
          <Banner position={[0, -0.15, 0]} />
        </ScrollControls>
        <Environment preset="dawn" background blur={0.5} />
      </Canvas>
      
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        
        canvas {
          touch-action: none;
          animation: fade-in 2s ease 0s forwards;
          opacity: 0;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function Root() {
  return (
    <>
      <App />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)