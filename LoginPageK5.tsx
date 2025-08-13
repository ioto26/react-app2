import React, { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// --- 3Dオブジェクト生成ヘルパー関数 ---

/**
 * 本のメッシュを作成します。
 * @param color - 本の色
 * @param size - 本のサイズ [幅, 高さ, 奥行き]
 */
const createBook = (color: THREE.ColorRepresentation, size: [number, number, number]): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(...size);
  const material = new THREE.MeshStandardMaterial({ color });
  const book = new THREE.Mesh(geometry, material);
  book.castShadow = true;
  return book;
};

/**
 * 棚板のメッシュを作成します。
 * @param args - 棚のサイズ [幅, 高さ, 奥行き]
 */
const createShelfMesh = (args: [number, number, number]): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(...args);
    const material = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    const shelf = new THREE.Mesh(geometry, material);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    return shelf;
}

/**
 * 本棚全体（枠と本）のグループを作成します。
 * @param width - 本棚の幅
 * @param height - 本棚の高さ
 * @param depth - 本棚の奥行き
 * @param thickness - 板の厚み
 */
const createBookshelf = (width: number, height: number, depth: number, thickness: number): THREE.Group => {
  const group = new THREE.Group();

  // 本棚の枠
  const backPanel = createShelfMesh([width, height, thickness]);
  backPanel.position.set(0, height / 2, -depth / 2 + thickness / 2);
  group.add(backPanel);

  const leftPanel = createShelfMesh([thickness, height, depth]);
  leftPanel.position.set(-width / 2 + thickness / 2, height / 2, 0);
  group.add(leftPanel);

  const rightPanel = createShelfMesh([thickness, height, depth]);
  rightPanel.position.set(width / 2 - thickness / 2, height / 2, 0);
  group.add(rightPanel);

  // 棚板と本
  const shelvesY = [
    thickness / 2,
    height / 5,
    2 * (height / 5),
    3 * (height / 5),
    4 * (height / 5),
    height - thickness / 2
  ];
  
  const shelfContentWidth = width - thickness * 2;

  shelvesY.forEach((y, index) => {
    const shelf = createShelfMesh([shelfContentWidth, thickness, depth]);
    shelf.position.set(0, y, 0);
    group.add(shelf);

    // 一番上の棚以外に本を生成
    if (index < shelvesY.length - 1) {
        const bookColors = ['#e6e6fa', '#ffb6c1', '#add8e6', '#90ee90', '#f0e68c', '#d3d3d3'];
        let currentX = -shelfContentWidth / 2 + 0.15;
        const shelfYPosition = y + thickness / 2;

        while (currentX < shelfContentWidth / 2 - 0.15) {
            const bookThickness = 0.2 + Math.random() * 0.1;
            const bookHeight = 0.75 + Math.random() * 0.2;
            const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];

            const book = createBook(bookColor, [bookThickness, bookHeight, depth * 0.8]);
            book.position.set(currentX + bookThickness / 2, shelfYPosition + bookHeight / 2, 0);
            group.add(book);
            
            currentX += bookThickness + 0.02; // 本の間の隙間
        }
    }
  });

  return group;
};

/**
 * キラキラ光るパーティクルを作成します。
 */
const createSparkles = (): THREE.Points => {
    const vertices = [];
    for (let i = 0; i < 100; i++) {
        const x = (Math.random() - 0.5) * 30;
        const y = Math.random() * 10;
        const z = (Math.random() - 0.5) * 30;
        vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: '#ffe6a7',
        size: 0.1,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    return points;
}

// --- Reactコンポーネント ---

// HTMLで描画するログインフォーム
const LoginFormComponent = ({ onSubmit, userId, setUserId, password, setPassword }: any) => (
  <div style={{
    backgroundColor: 'rgba(244, 240, 232, 0.9)',
    padding: '30px',
    borderRadius: '5px',
    width: '280px',
    height: '420px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#3D2B1F',
    fontFamily: 'serif',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    border: '1px solid #d3c5b4',
    transform: 'translate(-50%, -50%)', // 中央揃え
  }}>
    <h1 style={{ fontSize: '40px', marginBottom: '10px', textAlign: 'center' }}>ARENA</h1>
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
);


export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: -1000, y: -1000, visible: false });

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. シーン、カメラ、レンダラーの初期設定 ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(1, 2, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // --- 2. コントロール ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    // --- 3. ライト ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // --- 4. 環境マッピング ---
    new RGBELoader()
        .setPath('https://threejs.org/examples/textures/equirectangular/')
        .load('royal_esplanade_1k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
        });

    // --- 5. オブジェクトの作成と配置 ---
    // 床と壁
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#807060' });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.5;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallGeometry = new THREE.PlaneGeometry(20, 7);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: '#c0b0a0' });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 1, -10);
    wall.receiveShadow = true;
    scene.add(wall);

    // ログインパネル (3D部分)
    const loginPanelGroup = new THREE.Group();
    const panelFrontGeo = new THREE.BoxGeometry(6, 9, 0.2);
    const panelFrontMat = new THREE.MeshStandardMaterial({ color: '#f4f0e8' });
    const panelFront = new THREE.Mesh(panelFrontGeo, panelFrontMat);
    loginPanelGroup.add(panelFront);

    const panelBackGeo = new THREE.BoxGeometry(6, 9, 0.2);
    const panelBackMat = new THREE.MeshStandardMaterial({ color: '#4a2c2a' });
    const panelBack = new THREE.Mesh(panelBackGeo, panelBackMat);
    panelBack.position.z = -0.2;
    loginPanelGroup.add(panelBack);
    loginPanelGroup.position.set(0, 0.5, 2);
    scene.add(loginPanelGroup);

    // 本棚
    const bookshelfCount = 6;
    const bookshelfWidth = 3;
    const bookshelfHeight = 6;
    const bookshelfDepth = 0.8;
    const bookshelfThickness = 0.1;
    const totalBookshelvesWidth = bookshelfCount * bookshelfWidth;
    const startPos = -totalBookshelvesWidth / 2 + bookshelfWidth / 2;

    for (let i = 0; i < bookshelfCount; i++) {
        const backShelf = createBookshelf(bookshelfWidth, bookshelfHeight, bookshelfDepth, bookshelfThickness);
        backShelf.position.set(startPos + i * bookshelfWidth, -2.5, -9);
        scene.add(backShelf);

        const leftShelf = createBookshelf(bookshelfWidth, bookshelfHeight, bookshelfDepth, bookshelfThickness);
        leftShelf.position.set(-9.2, -2.5, startPos + i * bookshelfWidth);
        leftShelf.rotation.y = Math.PI / 2;
        scene.add(leftShelf);

        const rightShelf = createBookshelf(bookshelfWidth, bookshelfHeight, bookshelfDepth, bookshelfThickness);
        rightShelf.position.set(9.2, -2.5, startPos + i * bookshelfWidth);
        rightShelf.rotation.y = -Math.PI / 2;
        scene.add(rightShelf);
    }
    
    // パーティクル
    const sparkles = createSparkles();
    scene.add(sparkles);

    // --- 6. アニメーションループ ---
    const clock = new THREE.Clock();
    const panelWorldPosition = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();

    const animate = () => {
      requestAnimationFrame(animate);

      // ログインパネルの回転アニメーション
      const targetRotationY = submitted ? Math.PI : 0;
      loginPanelGroup.rotation.y = THREE.MathUtils.lerp(loginPanelGroup.rotation.y, targetRotationY, 0.08);

      // パーティクルのアニメーション
      const elapsedTime = clock.getElapsedTime();
      sparkles.rotation.y = elapsedTime * 0.1;

      // ログインパネル(HTML)の位置を更新
      loginPanelGroup.getWorldPosition(panelWorldPosition);
      
      // カメラからパネルへのベクトル
      const cameraToPanel = new THREE.Vector3().subVectors(panelWorldPosition, camera.position);
      
      // パネルがカメラの正面を向いているかチェック (内積を使用)
      const isFacingCamera = cameraToPanel.dot(camera.getWorldDirection(new THREE.Vector3())) < 0;

      let isVisible = false;
      if (isFacingCamera) {
        // パネルが他のオブジェクトに隠されていないかチェック
        raycaster.set(camera.position, cameraToPanel.normalize());
        const intersects = raycaster.intersectObjects(scene.children, true);
        // 最も近い交差オブジェクトがパネルの一部であるか確認
        if (intersects.length > 0 && (intersects[0].object === panelFront || intersects[0].object === panelBack)) {
            isVisible = true;
        }
      }

      if(isVisible) {
        const screenPosition = panelWorldPosition.clone().project(camera);
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;
        setPanelPosition({ x, y, visible: true });
      } else {
        setPanelPosition(p => ({ ...p, visible: false }));
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- 7. リサイズ処理 ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 8. クリーンアップ ---
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      // ジオメトリやマテリアルの破棄
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        }
      });
    };
  }, [submitted]); // submittedが変更されたらエフェクトを再実行（アニメーションのため）

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('入力されたユーザーID:', userId);
    console.log('入力されたパスワード:', password);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000); // 3秒後に回転を戻す
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#111' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {panelPosition.visible && (
        <div style={{
            position: 'absolute',
            top: `${panelPosition.y}px`,
            left: `${panelPosition.x}px`,
            transition: 'opacity 0.2s',
            opacity: panelPosition.visible ? 1 : 0,
            pointerEvents: panelPosition.visible ? 'auto' : 'none',
        }}>
            <LoginFormComponent 
                onSubmit={handleSubmit}
                userId={userId}
                setUserId={setUserId}
                password={password}
                setPassword={setPassword}
            />
        </div>
      )}
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