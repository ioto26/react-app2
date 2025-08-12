import React, { useRef, useState, useEffect } from 'react'
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
  onCardClick?: (index: number) => void
}

function Carousel({ radius = 1.4, count = 8, onCardClick }: CarouselProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <LoginFormCard
          key={i}
          index={i}
          position={[
            Math.sin((i / count) * Math.PI * 2) * radius,
            0,
            Math.cos((i / count) * Math.PI * 2) * radius
          ]}
          rotation={[0, (i / count) * Math.PI * 2, 0]}
          onCardClick={onCardClick}
        />
      ))}
    </>
  )
}

interface LoginFormCardProps {
  position: [number, number, number]
  rotation: [number, number, number]
  index: number
  onCardClick?: (index: number) => void
}

function LoginFormCard({ position, rotation, index, onCardClick }: LoginFormCardProps) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const pointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
  }
  
  const pointerOut = () => setHovered(false)

  const handleClick = (e: any) => {
    e.stopPropagation()
    if (onCardClick) {
      onCardClick(index)
    }
  }

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
      onClick={handleClick}
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
        fontSize={0.08}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        ユーザーID:
      </Text>
      
      {/* User ID Input Field Visual */}
      <mesh position={[0, 0.05, 0.01]}>
        <planeGeometry args={[0.8, 0.12]} />
        <meshBasicMaterial color="lightgray" />
      </mesh>

      {/* Password Label */}
      <Text
        position={[0, -0.1, 0.01]}
        fontSize={0.08}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        パスワード:
      </Text>
      
      {/* Password Input Field Visual */}
      <mesh position={[0, -0.25, 0.01]}>
        <planeGeometry args={[0.8, 0.12]} />
        <meshBasicMaterial color="lightgray" />
      </mesh>

      {/* Login Button */}
      <mesh position={[0, -0.4, 0.01]}>
        <planeGeometry args={[0.5, 0.12]} />
        <meshBasicMaterial color="green" />
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ログイン
        </Text>
      </mesh>

      {/* Card number */}
      <Text
        position={[0, 0.35, 0.01]}
        fontSize={0.06}
        color="darkblue"
        anchorX="center"
        anchorY="middle"
      >
        カード {index + 1}
      </Text>
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
  const texture = useTexture('/EG.png')
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

// Login Modal Component
interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  cardIndex: number
}

function LoginModal({ isOpen, onClose, cardIndex }: LoginModalProps) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (userId && password) {
      alert(`ログイン成功 (カード ${cardIndex + 1}):\nユーザーID: ${userId}\nパスワード: ${password}`)
      handleClose()
    } else {
      alert('ユーザーIDとパスワードを入力してください')
    }
  }

  const handleClose = () => {
    setUserId('')
    setPassword('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          minWidth: '350px',
          maxWidth: '400px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ 
          margin: '0 0 20px 0', 
          textAlign: 'center',
          color: '#333',
          fontSize: '24px'
        }}>
          ログイン (カード {cardIndex + 1})
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#555'
          }}>
            ユーザーID:
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            placeholder="ユーザーIDを入力"
            autoFocus
            onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#555'
          }}>
            パスワード:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            placeholder="パスワードを入力"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogin()
              }
            }}
            onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center' 
        }}>
          <button
            onClick={handleLogin}
            style={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
              minWidth: '100px'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ログイン
          </button>
          <button
            onClick={handleClose}
            style={{
              background: 'linear-gradient(45deg, #f44336, #da190b)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
              minWidth: '100px'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(0)

  const handleCardClick = (index: number) => {
    setSelectedCard(index)
    setModalOpen(true)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
        <fog attach="fog" args={['#a79', 8.5, 12]} />
        <ScrollControls pages={4} infinite>
          <Rig rotation={[0, 0, 0.15]}>
            <Carousel onCardClick={handleCardClick} />
          </Rig>
          <Banner position={[0, -0.15, 0]} />
        </ScrollControls>
        <Environment preset="dawn" background blur={0.5} />
      </Canvas>
      
      <LoginModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        cardIndex={selectedCard}
      />
      
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