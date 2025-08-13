import React, { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, type EventHandlers, type InstanceProps, type MathProps, type ReactProps, type Vector3  } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles } from '@react-three/drei';
import { Html } from '@react-three/drei';
import { useSpring, animated, type AnimatedProps } from '@react-spring/three';
import type { Mutable, Overwrite } from '@react-three/fiber/dist/declarations/src/core/utils';
import type { JSX } from 'react/jsx-runtime';
import type { Group, Object3DEventMap } from 'three';



export function Book(props: { [x: string]: any; color: any; size?: [width: number, height: number, depth: number] | undefined; }) {
  const { color, size = [0.25, 0.8, 0.2], ...rest } = props;

  return (
    <mesh {...rest}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

type ShelfProps = {
  position: Vector3 | [number, number, number];
  args: [width: number, height: number, depth: number];
};

const Shelf = ({ position, args }: ShelfProps) => (
  <mesh position={position}>  
    <boxGeometry args={args} />
    <meshStandardMaterial color="#8B4513" />
  </mesh>
);

const generateBooks = (shelfYPosition: number, shelfWidth: number, shelfDepth: number) => {
  const books = [];
  const bookColors = ['#e6e6fa', '#ffb6c1', '#add8e6', '#90ee90', '#f0e68c', '#d3d3d3'];
  let currentX = -shelfWidth / 2 + 0.15;

  while (currentX < shelfWidth / 2 - 0.15) {
    const bookThickness = 0.2 + Math.random() * 0.1;
    const bookHeight = 0.75 + Math.random() * 0.2;
    const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];

    books.push(
      <Book
        key={`book-${shelfYPosition}-${currentX}`}
        position={[currentX + bookThickness / 2, shelfYPosition + bookHeight / 2, 0]}
        size={[bookThickness, bookHeight, shelfDepth * 0.8]}
        color={bookColor}
      />
    );
    currentX += bookThickness + 0.02;
  }
  return books;
};

type BookshelfProps = React.ComponentProps<'group'> & {
  width: number;
  height: number;
  depth: number;
  thickness: number;
};

export function Bookshelf_Full(props: BookshelfProps) {
  const { width, height, depth, thickness, ...groupProps } = props;

  const shelvesY = [
    thickness / 2,
    height / 5,
    2 * (height / 5),
    3 * (height / 5),
    4 * (height / 5),
    height - thickness / 2
  ];

  return (
    <group {...groupProps}>
      <Shelf position={[0, height / 2, -depth / 2 + thickness / 2]} args={[width, height, thickness]} />
      <Shelf position={[-width / 2 + thickness / 2, height / 2, 0]} args={[thickness, height, depth]} />
      <Shelf position={[width / 2 - thickness / 2, height / 2, 0]} args={[thickness, height, depth]} />
      
      {shelvesY.map((y, index) => {
        const isTopShelf = index === shelvesY.length - 1;
        const shelfWidth = width - thickness * 2;
        
        return (
          <React.Fragment key={`shelf-group-${y}`}>
            <Shelf position={[0, y, 0]} args={[shelfWidth, thickness, depth]} />
            {!isTopShelf && generateBooks(y + thickness / 2, shelfWidth, depth)}
          </React.Fragment>
        );
      })}
    </group>
  );
}

type LoginCardProps = React.ComponentProps<typeof animated.group> & {
  // もし他にあれば、ここに独自のPropsを追加
};

export function LoginPanel(props: LoginCardProps & JSX.IntrinsicAttributes & AnimatedProps<Mutable<Overwrite<Partial<Overwrite<Group<Object3DEventMap>, MathProps<Group<Object3DEventMap>> & ReactProps<Group<Object3DEventMap>> & Partial<EventHandlers>>>, Omit<InstanceProps<Group<Object3DEventMap>, Group>, "object">>>>) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { args, ...groupProps } = props;

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log('入力されたユーザーID:', userId);
    console.log('入力されたパスワード:', password);
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const { rotationY } = useSpring({
    rotationY: submitted ? Math.PI : 0,
    config: { mass: 1, tension: 120, friction: 20 }
  });

  return (
    <animated.group {...groupProps} rotation-y={rotationY}>
      <mesh>
        <boxGeometry args={[6, 9, 0.2]} />
        <meshStandardMaterial color={'#f4f0e8'} />

        <Html position={[0, 1, 0.101]} center transform occlude>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '30px',
            borderRadius: '5px',
            width: '180px',
            height: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#3D2B1F',
            fontFamily: 'serif',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ fontSize: '40px', marginBottom: '10px', textAlign: 'center' }}>ARENA</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <label htmlFor="userId" style={{ fontSize: '14px', marginBottom: '5px' }}>User ID</label>
              <input
                id="userId" type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
                style={{ width: '80%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                aria-label="ユーザーID"
              />
              <label htmlFor="password" style={{ fontSize: '14px', marginBottom: '5px' }}>Password</label>
              <input
                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: '80%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                aria-label="パスワード"
              />
              <button type="submit" style={{
                padding: '10px 20px', backgroundColor: '#704241', color: 'white', border: 'none',
                borderRadius: '5px', cursor: 'pointer', fontSize: '18px', transition: 'background-color 0.3s ease'
              }}>
                Enter
              </button>
            </form>
          </div>
        </Html>
      </mesh>

      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[6, 9, 0.2]} />
        <meshStandardMaterial color={'#4a2c2a'} />
      </mesh>
    </animated.group>
  );
}

export default function App() {
  const bookshelfCount = 6;
  const bookshelfWidth = 3;
  const bookshelfHeight = 6;
  const bookshelfDepth = 0.8;
  const bookshelfThickness = 0.1;
  const totalBookshelvesWidth = bookshelfCount * bookshelfWidth;
  const startPos = -totalBookshelvesWidth / 2 + bookshelfWidth / 2;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [1, 2, 12], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 10, 7]} 
          intensity={1.0} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Environment preset="city" />
        <Sparkles count={100} scale={15} size={1} speed={0.4} color="#ffe6a7" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#807060" />
        </mesh>
        <mesh position={[0, 1, -10]} receiveShadow>
          <planeGeometry args={[20, 7]} />
          <meshStandardMaterial color="#c0b0a0" />
        </mesh>

        <LoginPanel position={[0, 0.5, 2]} args={[]} />

        {Array.from({ length: bookshelfCount }).map((_, i) => (
          <Bookshelf_Full
            key={`back-shelf-${i}`}
            position={[startPos + i * bookshelfWidth, -2.5, -9]}
            // 👇 必須のpropsを渡す
            width={bookshelfWidth}
            height={bookshelfHeight}
            depth={bookshelfDepth}
            thickness={bookshelfThickness}
            // 👆 args={[]} は削除する
          />
        ))}
        {Array.from({ length: bookshelfCount }).map((_, i) => (
          <Bookshelf_Full
            key={`left-shelf-${i}`}
            position={[-9.2, -2.5, startPos + i * bookshelfWidth]}
            rotation={[0, Math.PI / 2, 0]}
            // 👇 必須のpropsを渡す
            width={bookshelfWidth}
            height={bookshelfHeight}
            depth={bookshelfDepth}
            thickness={bookshelfThickness}
          />
        ))}
        {Array.from({ length: bookshelfCount }).map((_, i) => (
          <Bookshelf_Full
            key={`right-shelf-${i}`}
            position={[9.2, -2.5, startPos + i * bookshelfWidth]}
            rotation={[0, -Math.PI / 2, 0]}
            // 👇 必須のpropsを渡す
            width={bookshelfWidth}
            height={bookshelfHeight}
            depth={bookshelfDepth}
            thickness={bookshelfThickness}
          />
        ))}

        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
    </div>
  );
}

const rootElement = document.getElementById('root');
// rootElementが存在することを確認してから描画する
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
