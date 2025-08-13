import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

// ------------------------------------------------------------------
// TypeScript Interface for the Shader object
// ------------------------------------------------------------------
// This interface defines the structure of the shader object passed to onBeforeCompile
// to resolve potential type definition issues with different library versions.
interface ShaderObject {
    uniforms: { [key: string]: THREE.IUniform };
    vertexShader: string;
    fragmentShader: string;
}

// ------------------------------------------------------------------
// Custom Shader Material (Wave Effect)
// ------------------------------------------------------------------
// This class extends THREE.MeshBasicMaterial to create a wave effect on a texture.
// It injects custom GLSL code into the vertex shader.
class MeshSineMaterial extends THREE.MeshBasicMaterial {
  public time: { value: number };

  constructor(parameters: any = {}) {
    super(parameters);
    this.setValues(parameters);
    this.time = { value: 0 };
  }

  // This method is called by Three.js before compiling the shader.
  // We use our custom ShaderObject interface for type safety.
  onBeforeCompile(shader: ShaderObject) {
    // Pass the 'time' uniform to the shader.
    shader.uniforms.time = this.time;
    // Add the uniform declaration to the vertex shader.
    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;
    // Modify the vertex position to create a sine wave effect.
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      // The vertex's y-position is animated using a sine function based on time and UV coordinates.
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
    );
  }
}


// ------------------------------------------------------------------
// Login Modal Component (Standard React)
// ------------------------------------------------------------------
// This is a standard React component for the login form modal.
// It does not involve any Three.js logic.
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardIndex: number;
}

function LoginModal({ isOpen, onClose, cardIndex }: LoginModalProps) {
  const [userId, setUserId] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = () => {
    if (userId && password) {
      // In a real app, you would perform authentication here.
      // Using a custom modal instead of alert for better UX.
      console.log(`Login attempt for card ${cardIndex + 1} with UserID: ${userId}`);
      handleClose();
    } else {
      console.warn('User ID and Password are required.');
    }
  };

  const handleClose = () => {
    setUserId('');
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  // The modal is styled with inline CSS for simplicity.
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'white', padding: '30px', borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', minWidth: '350px',
          maxWidth: '400px', fontFamily: 'sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#333', fontSize: '24px' }}>
          ログイン (カード {cardIndex + 1})
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            ユーザーID:
          </label>
          <input
            type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
            placeholder="ユーザーIDを入力" autoFocus
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            パスワード:
          </label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
            placeholder="パスワードを入力"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button onClick={handleLogin} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            ログイン
          </button>
          <button onClick={handleClose} style={{ background: '#f44336', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}


// ------------------------------------------------------------------
// Main Three.js Scene Component
// ------------------------------------------------------------------
interface ThreeSceneProps {
    onCardClick: (index: number) => void;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ onCardClick }) => {
    const mountRef = React.useRef<HTMLDivElement>(null);
    const scrollRef = React.useRef(0);

    // useEffect hook for setup and cleanup of the Three.js scene.
    React.useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // --- Core Three.js Setup ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog('#a79', 8.5, 12);
        scene.background = new THREE.Color('#1a1a1a');

        const camera = new THREE.PerspectiveCamera(15, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        
        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(2, 5, 5);
        scene.add(pointLight);

        // --- Raycasting for Interaction ---
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let hoveredCard: THREE.Object3D | null = null;

        // --- Scene Objects ---
        const rig = new THREE.Group();
        rig.rotation.z = 0.15;
        scene.add(rig);

        const carousel = new THREE.Group();
        rig.add(carousel);

        const cards: THREE.Object3D[] = [];
        const cardCount = 8;
        const radius = 1.4;

        // --- Helper for Creating Text Textures ---
        const createTextTexture = (text: string, options: any = {}) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            const fontSize = options.fontSize || 48;
            const font = `${fontSize}px sans-serif`;
            context.font = font;
            const textMetrics = context.measureText(text);
            canvas.width = textMetrics.width;
            canvas.height = fontSize * 1.2;

            context.font = font; // Re-set font after resize
            context.fillStyle = options.color || 'black';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        // --- Create Carousel Cards ---
        for (let i = 0; i < cardCount; i++) {
            const cardGroup = new THREE.Group();
            
            // Main card plane
            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 'white', transparent: true, opacity: 0.9, side: THREE.DoubleSide });
            const cardMesh = new THREE.Mesh(geometry, material);
            cardMesh.name = 'main-card'; // Add name for identification
            cardGroup.add(cardMesh);

            // Store original color
            (cardMesh.userData as any).originalColor = new THREE.Color('white');
            (cardMesh.userData as any).hoverColor = new THREE.Color('lightblue');

            // --- Text and UI Elements on the card ---
            const createTextPlane = (text: string, pos: [number, number, number], size: number, color: string) => {
                const texture = createTextTexture(text, { fontSize: 64, color });
                const aspect = texture.image.width / texture.image.height;
                const planeGeom = new THREE.PlaneGeometry(size * aspect, size);
                const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const planeMesh = new THREE.Mesh(planeGeom, planeMat);
                planeMesh.position.set(pos[0], pos[1], pos[2]);
                return planeMesh;
            };

            cardGroup.add(createTextPlane(`カード ${i + 1}`, [0, 0.35, 0.01], 0.06, 'darkblue'));
            cardGroup.add(createTextPlane('ユーザーID:', [0, 0.2, 0.01], 0.08, 'black'));
            cardGroup.add(createTextPlane('パスワード:', [0, -0.1, 0.01], 0.08, 'black'));
            
            // Input field visuals
            const inputGeom = new THREE.PlaneGeometry(0.8, 0.12);
            const inputMat = new THREE.MeshBasicMaterial({ color: 'lightgray' });
            const userIdInput = new THREE.Mesh(inputGeom, inputMat);
            userIdInput.position.set(0, 0.05, 0.01);
            cardGroup.add(userIdInput);
            
            const passInput = new THREE.Mesh(inputGeom.clone(), inputMat.clone());
            passInput.position.set(0, -0.25, 0.01);
            cardGroup.add(passInput);

            // Login button visual
            const buttonGeom = new THREE.PlaneGeometry(0.5, 0.12);
            const buttonMat = new THREE.MeshBasicMaterial({ color: 'green' });
            const loginButton = new THREE.Mesh(buttonGeom, buttonMat);
            loginButton.position.set(0, -0.4, 0.01);
            // Add the "ログイン" text on top of the button
            loginButton.add(createTextPlane('ログイン', [0, 0, 0.01], 0.06, 'white'));
            cardGroup.add(loginButton);
            
            // Position and rotate the card group
            const angle = (i / cardCount) * Math.PI * 2;
            cardGroup.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
            cardGroup.rotation.y = angle;
            
            // Add userData to identify the card index
            cardGroup.userData.index = i;
            
            carousel.add(cardGroup);
            cards.push(cardGroup);
        }

        // --- Banner ---
        const bannerGeom = new THREE.CylinderGeometry(1.6, 1.6, 0.14, 128, 16, true);
        const bannerTexture = new THREE.TextureLoader().load(
          'https://placehold.co/3000x100/000000/FFFFFF/png?text=SCROLL+ANIMATION',
          (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(30, 1);
            texture.needsUpdate = true;
          }
        );
        const bannerMat = new MeshSineMaterial({
            map: bannerTexture,
            side: THREE.DoubleSide,
            toneMapped: false,
        });
        const banner = new THREE.Mesh(bannerGeom, bannerMat);
        banner.position.y = -0.15;
        scene.add(banner);

        // --- Event Listeners ---
        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            // Normalize scroll value to be between 0 and 1, handle division by zero
            scrollRef.current = scrollHeight > 0 ? scrollY / scrollHeight : 0;
        };
        window.addEventListener('scroll', handleScroll);

        const handlePointerMove = (event: PointerEvent) => {
            // Normalize pointer position to [-1, 1] range
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('pointermove', handlePointerMove);
        
        const handleClick = () => {
            if (hoveredCard && hoveredCard.userData.index !== undefined) {
                onCardClick(hoveredCard.userData.index);
            }
        };
        window.addEventListener('click', handleClick);

        // --- Animation Loop ---
        const clock = new THREE.Clock();
        let scrollDelta = 0;
        let lastScroll = 0;

        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

            // Update scroll delta
            scrollDelta = scrollRef.current - lastScroll;
            lastScroll = scrollRef.current;

            // 1. Update rig rotation based on scroll
            rig.rotation.y = -scrollRef.current * (Math.PI * 2);

            // 2. Update camera position based on pointer (easing)
            const targetCameraPos = new THREE.Vector3(-pointer.x * 2, pointer.y + 1.5, 10);
            camera.position.lerp(targetCameraPos, 0.1);
            camera.lookAt(0, 0, 0);

            // 3. Update banner animation
            bannerMat.time.value += Math.abs(scrollDelta) * 4;
            if (bannerMat.map) {
                bannerMat.map.offset.x += delta / 2;
            }

            // 4. Raycasting for hover effects
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(carousel.children, true);
            
            const firstIntersectedCardGroup = intersects.find(intersect => intersect.object.parent?.userData.index !== undefined)?.object.parent;

            if (firstIntersectedCardGroup && firstIntersectedCardGroup !== hoveredCard) {
                // Clear previous hover
                if (hoveredCard) {
                    const mainMesh = hoveredCard.getObjectByName('main-card') as THREE.Mesh;
                    (mainMesh.material as THREE.MeshStandardMaterial).color.copy((mainMesh.userData as any).originalColor);
                }
                
                // Set new hover
                hoveredCard = firstIntersectedCardGroup;
                const mainMesh = hoveredCard.getObjectByName('main-card') as THREE.Mesh;
                (mainMesh.material as THREE.MeshStandardMaterial).color.copy((mainMesh.userData as any).hoverColor);

            } else if (!firstIntersectedCardGroup && hoveredCard) {
                // Mouse out
                const mainMesh = hoveredCard.getObjectByName('main-card') as THREE.Mesh;
                (mainMesh.material as THREE.MeshStandardMaterial).color.copy((mainMesh.userData as any).originalColor);
                hoveredCard = null;
            }
            
            // 5. Animate card scale on hover
            cards.forEach(card => {
                const targetScale = (hoveredCard === card) ? 1.15 : 1;
                card.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
            });

            renderer.render(scene, camera);
        };
        animate();

        // --- Cleanup ---
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('click', handleClick);
            if (currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }, [onCardClick]); // Re-run effect if onCardClick changes

    return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0 }} />;
};


// ------------------------------------------------------------------
// Main App Component
// ------------------------------------------------------------------
export default function App() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState(0);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    setModalOpen(true);
  };

  return (
    // The main container needs a fixed size.
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {/* This div creates the scrollable area. Its height determines how much you can scroll. */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '400vh' }} />

        {/* The Three.js scene is rendered here. */}
        <ThreeScene onCardClick={handleCardClick} />
      
        {/* The React-based modal is rendered on top. */}
        <LoginModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)}
            cardIndex={selectedCard}
        />
        
        {/* Global styles */}
        <style>{`
            html, body, #root {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                background: #1a1a1a;
            }
            /* Make the main app container scrollable */
            body {
                overflow-y: scroll;
            }
        `}</style>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}