import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ScrollControls, useScroll, useTexture, Text } from '@react-three/drei' // Import Text
import { easing } from 'maath'
import './util'

export const App = () => (
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
)

function Rig(props) {
  const ref = useRef()
  const scroll = useScroll()
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2) // Rotate contents
    state.events.update() // Raycasts every frame rather than on pointer-move
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5, 10], 0.3, delta) // Move camera
    state.camera.lookAt(0, 0, 0) // Look at center
  })
  return <group ref={ref} {...props} />
}

function Carousel({ radius = 1.4, count = 8 }) {
  return Array.from({ length: count }, (_, i) => (
    <LoginFormCard
      key={i}
      position={[Math.sin((i / count) * Math.PI * 2) * radius, 0, Math.cos((i / count) * Math.PI * 2) * radius]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
    />
  ))
}

function LoginFormCard(props) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const pointerOver = (e) => (e.stopPropagation(), hover(true))
  const pointerOut = () => hover(false)

  useFrame((state, delta) => {
    // Apply animation to the mesh (the plane displaying the form)
    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta)

    // Optional: If you want to animate the text directly, you would target its scale
    // This example animates the parent mesh for a subtle effect
  })

  return (
    <mesh ref={ref} onPointerOver={pointerOver} onPointerOut={pointerOut} {...props}>
      <planeGeometry args={[1, 1]} /> {/* A simple plane to serve as the "card" */}
      <meshStandardMaterial color={hovered ? 'lightblue' : 'white'} transparent opacity={0.9} />
      {/* User ID Text Field */}
      <Text
        position={[0, 0.2, 0.01]} // Slightly in front of the plane
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        ユーザーID:
      </Text>
      {/* Placeholder for User ID Input Area */}
      <mesh position={[0, 0.05, 0.01]}>
        <planeGeometry args={[0.8, 0.15]} />
        <meshBasicMaterial color="lightgray" />
      </mesh>

      {/* Password Text Field */}
      <Text
        position={[0, -0.1, 0.01]} // Slightly in front of the plane
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        パスワード:
      </Text>
      {/* Placeholder for Password Input Area */}
      <mesh position={[0, -0.25, 0.01]}>
        <planeGeometry args={[0.8, 0.15]} />
        <meshBasicMaterial color="lightgray" />
      </mesh>

      {/* Login Button Placeholder */}
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

function Banner(props) {
  const ref = useRef()
  const texture = useTexture('/EG.png')
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  const scroll = useScroll()
  useFrame((state, delta) => {
    ref.current.material.time.value += Math.abs(scroll.delta) * 4
    ref.current.material.map.offset.x += delta / 2
  })
  return (
    <mesh ref={ref} {...props}>
      <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
      <meshSineMaterial map={texture} map-anisotropy={16} map-repeat={[30, 1]} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}