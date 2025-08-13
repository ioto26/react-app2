import { StrictMode, useState, type FC, type ChangeEvent, type FormEvent, type MouseEvent, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// @ts-ignore
const THREE = window.THREE;

// 2. THREEが正しく読み込めたか確認します。
if (!THREE) {
  throw new Error("Three.js has not been loaded. Please check the script tag in your index.html.");
}

const EffectComposer = THREE.EffectComposer;
const RenderPass = THREE.RenderPass;
const UnrealBloomPass = THREE.UnrealBloomPass;
const SMAAPass = THREE.SMAAPass;
const SSAOPass = THREE.SSAOPass;


// --- CSS Styles (Updated) ---
const GlobalStyles = () => (
  <style>{`
    :root {
      font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      font-weight: 400;
      color-scheme: light dark;
      color: rgba(255, 255, 255, 0.87);
      background-color: #242424;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }
    body {
      margin: 0;
      display: flex;
      place-items: center;
      min-width: 320px;
      min-height: 100vh;
    }
    h1 {
      font-size: 3.2em;
      line-height: 1.1;
    }
    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }
    @media (prefers-color-scheme: light) {
      :root {
        color: #213547;
        background-color: #ffffff;
      }
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
    #root {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
    }
    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.react:hover {
      filter: drop-shadow(0 0 2em #61dafbaa);
    }
    @keyframes logo-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      a:nth-of-type(2) .logo {
        animation: logo-spin infinite 20s linear;
      }
    }
    .card {
      padding: 2em;
    }
    .read-the-docs {
      color: #888;
    }
    * {
      box-sizing: border-box;
    }
    html,
    body,
    #root {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: linear-gradient(180deg, #e6eaf5 0%, #f6f6f6 80%);
    }
    body {
      position: fixed;
      overflow: hidden;
      overscroll-behavior-y: none;
      font-family: "Inter var", sans-serif;
      /* FIX: Removed cursor: none; to make the cursor visible */
    }
    p {
      margin: 0;
      padding: 0;
    }
    a {
      padding-right: 10px;
      cursor: pointer;
      pointer-events: all;
      color: black;
      text-decoration: none; /* no underline */
    }
    @media screen and (max-width: 568px) {
      .full {
        visibility: hidden;
        display: none;
      }
    }
  `}</style>
);


// --- LoginForm Component (No changes) ---
interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleUserIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLoginClick = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('ログインしました！');

    if (onLoginSuccess) {
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    }
  };
  
  const handleMouseOver = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#0056b3';
  };
  
  const handleMouseOut = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#007bff';
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      zIndex: 10,
      width: '90%',
      maxWidth: '400px',
      textAlign: 'center',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>ARENAへようこそ</h2>
      <form onSubmit={handleLoginClick}>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label htmlFor="userId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>ユーザーID</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={handleUserIdChange}
            placeholder="ユーザーIDを入力"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="パスワードを入力"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)'
          }}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          ログイン
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', color: '#28a745', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

// --- Three.js Canvas Component (Updated) ---
const ThreeCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const { clientWidth: width, clientHeight: height } = currentMount;

    // 1. Scene, Camera, and Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#dfdfdf");
    const camera = new THREE.PerspectiveCamera(35, width / height, 1, 40);
    camera.position.z = 20;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // 2. Lighting
    scene.add(new THREE.AmbientLight(0xcccccc, 0.8));
    const spotLight = new THREE.SpotLight(0xffffff, 1.5, 0, Math.PI / 5, 1);
    spotLight.position.set(30, 30, 30);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    scene.add(spotLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(-10, 10, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3. Objects and Physics Data
    const sphereCount = 40;
    const sphereRadius = 1;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const baubleMaterial = new THREE.MeshStandardMaterial({ color: "white", roughness: 0.2, metalness: 0.8 });
    const instancedMesh = new THREE.InstancedMesh(sphereGeometry, baubleMaterial, sphereCount);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    scene.add(instancedMesh);

    const spheres = Array.from({ length: sphereCount }, () => ({
      position: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(20),
        THREE.MathUtils.randFloatSpread(20),
        THREE.MathUtils.randFloatSpread(20)
      ),
      velocity: new THREE.Vector3(),
    }));
    const dummy = new THREE.Object3D();

    // 4. Pointer Light
    const pointerLight = new THREE.PointLight(0xffffff, 8, 10);
    scene.add(pointerLight);

    // 5. Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1, 0.4, 0.85);
    composer.addPass(bloomPass);
    const ssaoPass = new SSAOPass(scene, camera, width, height);
    ssaoPass.kernelRadius = 2;
    ssaoPass.minDistance = 0.005;
    ssaoPass.maxDistance = 0.1;
    composer.addPass(ssaoPass);
    const smaaPass = new SMAAPass();
    composer.addPass(smaaPass);

    // 6. Event Listeners
    const handleMouseMove = (event: globalThis.MouseEvent) => {
        mousePos.current.x = (event.clientX / width) * 2 - 1;
        mousePos.current.y = -(event.clientY / height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
        const { clientWidth: newWidth, clientHeight: newHeight } = currentMount;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
        composer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
        const delta = clock.getDelta();

        // Update pointer light
        const vector = new THREE.Vector3(mousePos.current.x, mousePos.current.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        pointerLight.position.copy(pos);

        // Physics simulation
        const force = new THREE.Vector3();
        const gravity = new THREE.Vector3(0, 2, 0);
        const linearDamping = 0.65;

        // Apply forces and update velocities
        spheres.forEach((sphere) => {
            force.copy(sphere.position).sub(pointerLight.position);
            if (force.lengthSq() < 9) {
                sphere.velocity.add(force.normalize().multiplyScalar(delta * 200));
            }
            // FIX: Increased force pulling towards the center
            force.copy(sphere.position).normalize().multiplyScalar(-80);
            sphere.velocity.add(force.multiplyScalar(delta * 0.1));
            sphere.velocity.add(gravity.clone().multiplyScalar(delta));
            sphere.velocity.multiplyScalar(1 - (linearDamping * delta));
        });

        // Collision detection and response
        for (let i = 0; i < sphereCount; i++) {
            for (let j = i + 1; j < sphereCount; j++) {
                const sphereA = spheres[i];
                const sphereB = spheres[j];

                const distVec = sphereA.position.clone().sub(sphereB.position);
                const dist = distVec.length();

                if (dist < sphereRadius * 2) {
                    // 1. Resolve overlap
                    const overlap = (sphereRadius * 2) - dist;
                    const correction = distVec.normalize().multiplyScalar(overlap / 2);
                    sphereA.position.add(correction);
                    sphereB.position.sub(correction);

                    // 2. Elastic collision response (velocity change)
                    const collisionNormal = sphereA.position.clone().sub(sphereB.position).normalize();
                    const v1 = sphereA.velocity;
                    const v2 = sphereB.velocity;
                    
                    const v1nScalar = v1.dot(collisionNormal);
                    const v2nScalar = v2.dot(collisionNormal);
                    
                    const v1nNewScalar = v2nScalar;
                    const v2nNewScalar = v1nScalar;

                    v1.add(collisionNormal.clone().multiplyScalar(v1nNewScalar - v1nScalar));
                    v2.add(collisionNormal.clone().multiplyScalar(v2nNewScalar - v2nScalar));
                }
            }
        }

        // Update positions and instance matrices
        spheres.forEach((sphere, i) => {
            sphere.position.add(sphere.velocity.clone().multiplyScalar(delta));
            dummy.position.copy(sphere.position);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
        composer.render();
        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 8. Cleanup
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (currentMount && renderer.domElement) {
            currentMount.removeChild(renderer.domElement);
        }
        scene.traverse((object: { geometry: { dispose: () => void; }; material: { forEach: (arg0: (material: any) => any) => void; dispose: () => void; }; }) => {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material: { dispose: () => any; }) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
        renderer.dispose();
        composer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};


// --- App Component (Updated) ---
export const App: FC = () => {
  const [showLoginForm, setShowLoginForm] = useState<boolean>(true);

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GlobalStyles />
      <ThreeCanvas />
      {showLoginForm && <LoginForm onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

// --- Rendering (No changes) ---
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export default App;
