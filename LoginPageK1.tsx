import { StrictMode, useState, type FC, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

// START: react-circular-progressbar implementation
//
// react-circular-progressbarをインストールせずに使用するため、
// ライブラリのソースコードを直接ここに記述しています。
// これにより、外部依存なくコンポーネントが機能します。
// Source: https://github.com/kevinsqi/react-circular-progressbar

/**
 * ライブラリ内で使用される型定義
 */
type CircularProgressbarStyles = {
  root?: CSSProperties;
  trail?: CSSProperties;
  path?: CSSProperties;
  text?: CSSProperties;
  background?: CSSProperties;
};

/**
 * SVGパスの比率を計算します。
 * @param {number} pathRatio - 0から1の間のパスの比率。
 * @param {number} circleRatio - 円全体の比率。
 * @returns {number} - 調整されたパスの比率。
 */
function getPathRatio(pathRatio: number, circleRatio: number): number {
  const result = Math.min(Math.max(pathRatio, 0), 1);
  return result * circleRatio;
}

/**
 * SVGパスのd属性を生成します。
 * @param {{ pathRadius: number; counterClockwise: boolean }} options - パス生成のオプション。
 * @returns {string} - SVGパスの記述。
 */
function getPathDescription({
  pathRadius,
  counterClockwise,
}: {
  pathRadius: number;
  counterClockwise: boolean;
}): string {
  const radius = pathRadius;
  const sweepFlag = counterClockwise ? 0 : 1;
  return `
    M 50,50
    m 0,-${radius}
    a ${radius},${radius} 0 1 ${sweepFlag} 0,${radius * 2}
    a ${radius},${radius} 0 1 ${sweepFlag} 0,-${radius * 2}
  `;
}

/**
 * CircularProgressbarに適用するインラインスタイルを生成します。
 * @param {object} options - スタイルオプション。
 * @returns {CircularProgressbarStyles} - スタイルオブジェクト。
 */
function buildStyles({
  rotation,
  strokeLinecap,
  textColor,
  textSize,
  pathColor,
  pathTransition,
  pathTransitionDuration,
  trailColor,
  backgroundColor,
}: {
  rotation?: number;
  strokeLinecap?: 'butt' | 'round';
  textColor?: string;
  textSize?: string | number;
  pathColor?: string;
  pathTransition?: string;
  pathTransitionDuration?: number;
  trailColor?: string;
  backgroundColor?: string;
}): CircularProgressbarStyles {
  const rotationTransform = rotation ? `rotate(${rotation}turn)` : '';
  const rotationTransformOrigin = rotation ? 'center center' : '';

  return {
    root: {},
    path: {
      stroke: pathColor,
      strokeLinecap: strokeLinecap,
      transform: rotationTransform,
      transformOrigin: rotationTransformOrigin,
      transition: pathTransition || 'stroke-dashoffset 0.5s ease 0s',
      ...(pathTransitionDuration && { transitionDuration: `${pathTransitionDuration}s` }),
    },
    trail: {
      stroke: trailColor,
      strokeLinecap: strokeLinecap,
      transform: rotationTransform,
      transformOrigin: rotationTransformOrigin,
    },
    text: {
      fill: textColor,
      fontSize: textSize,
      dominantBaseline: 'central',
      textAnchor: 'middle',
    },
    background: {
      fill: backgroundColor,
    },
  };
}


/**
 * 円形のプログレスバーを表示するReactコンポーネント。
 */
interface CircularProgressbarProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  className?: string;
  styles?: CircularProgressbarStyles;
  strokeWidth?: number;
  background?: boolean;
  backgroundPadding?: number;
  circleRatio?: number;
  text?: string;
  counterClockwise?: boolean;
}

const CircularProgressbar: FC<CircularProgressbarProps> = (props) => {
  const {
    value,
    minValue = 0,
    maxValue = 100,
    className = '',
    styles = {},
    strokeWidth = 8,
    background = false,
    backgroundPadding = 0,
    circleRatio = 1,
    text = '',
    counterClockwise = false,
  } = props;

  const getPathRadius = () => {
    return 50 - strokeWidth / 2;
  };

  const getPathRatioValue = () => {
    const range = maxValue - minValue;
    const correctedValue = value - minValue;
    return Math.min(Math.max(correctedValue / range, 0), 1);
  };

  const pathRadius = getPathRadius();
  const pathDescription = getPathDescription({ pathRadius, counterClockwise });
  const pathRatio = getPathRatio(getPathRatioValue(), circleRatio);
  const pathCircumference = 2 * Math.PI * pathRadius;
  const pathDashoffset = (1 - pathRatio) * pathCircumference;

  const pathStyle: CSSProperties = {
    strokeDasharray: `${pathCircumference}px ${pathCircumference}px`,
    strokeDashoffset: `${pathDashoffset}px`,
    ...styles.path,
  };

  const trailStyle: CSSProperties = {
    strokeDasharray: `${pathCircumference}px ${pathCircumference}px`,
    ...styles.trail,
  };
  
  const textStyle: CSSProperties = {
    ...styles.text
  }

  const backgroundStyle: CSSProperties = {
    ...styles.background
  }

  return (
    <svg
      className={`CircularProgressbar ${className}`}
      viewBox="0 0 100 100"
      style={styles.root}
    >
      {background && (
        <circle
          className="CircularProgressbar-background"
          cx={50}
          cy={50}
          r={50 - backgroundPadding}
          style={backgroundStyle}
        />
      )}
      <path
        className="CircularProgressbar-trail"
        d={pathDescription}
        strokeWidth={strokeWidth}
        fillOpacity={0}
        style={trailStyle}
      />
      <path
        className="CircularProgressbar-path"
        d={pathDescription}
        strokeWidth={strokeWidth}
        fillOpacity={0}
        style={pathStyle}
      />
      {text && (
        <text
          className="CircularProgressbar-text"
          x={50}
          y={50}
          style={textStyle}
        >
          {text}
        </text>
      )}
    </svg>
  );
};

// END: react-circular-progressbar implementation


// --- 以下は元のアプリケーションコードです ---

// CSSを文字列として定義
const styles = `
  /* General Body and Layout Styles */
  body {
    background: linear-gradient(135deg, #f06, #4a90e2);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #333;
  }

  #root {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  /* Login Form Container Styles */
  .login-container {
    background: rgba(255, 255, 255, 0.9);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    max-width: 400px;
    width: 90%;
    position: relative;
    z-index: 1;
  }

  .login-container::before,
  .login-container::after {
    content: '';
    position: absolute;
    z-index: -1;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 10s ease-in-out infinite;
  }

  .login-container::before {
    top: -50px;
    left: -50px;
  }

  .login-container::after {
    bottom: -50px;
    right: -50px;
    background: rgba(74, 144, 226, 0.2);
    animation-delay: -5s;
  }

  @keyframes float {
    0% { transform: translate(0, 0); }
    50% { transform: translate(-20px, 20px); }
    100% { transform: translate(0, 0); }
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2em;
    letter-spacing: 2px;
  }

  /* Input Fields Styles */
  .input-group {
    margin-bottom: 20px;
    text-align: left;
  }

  .input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }

  .input-group input {
    box-sizing: border-box;
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .input-group input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 8px rgba(74, 144, 226, 0.3);
  }

  /* Login Button Styles */
  .login-button {
    width: 100%;
    padding: 15px;
    background: linear-gradient(45deg, #4a90e2, #6a82fb);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .login-button:hover {
    background: linear-gradient(45deg, #3a7bd5, #5a6cf6);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  /* Circular Progress Bar Styles */
  .progress-bar-container {
    margin: 0 auto 30px auto;
    display: block;
    width: 150px;
    height: 150px;
  }

  .CircularProgressbar .CircularProgressbar-path {
    stroke-linecap: round;
  }

  .CircularProgressbar .CircularProgressbar-trail {
    stroke: #d6d6d6;
    stroke-linecap: round;
  }

  .CircularProgressbar .CircularProgressbar-text {
    fill: #3e98c7;
    font-size: 20px;
  }
  
  /* Message Styles */
  .message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
  }
  .message-success {
    background-color: #e0f8e9;
    color: #28a745;
  }
  .message-error {
    background-color: #f8d7da;
    color: #721c24;
  }
`;

// スタイルを埋め込むためのコンポーネント
const StyleInjector = () => <style>{styles}</style>;

export function FormWithProgress() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [message, setMessage] = useState('');

  const updatePercentage = (user: string, pass: string) => {
    let newPercentage = 0;
    if (user.length >= 2) {
      newPercentage += 50;
    }
    if (pass.length >= 5) {
      newPercentage += 50;
    }
    setPercentage(newPercentage);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUserId = e.target.value;
    setUserId(newUserId);
    updatePercentage(newUserId, password);
    setMessage(''); // 入力中はメッセージをクリア
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    updatePercentage(userId, newPassword);
    setMessage(''); // 入力中はメッセージをクリア
  };

  const handleLoginClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (percentage === 100) {
      setMessage('ログインしました！');
    } else {
      setMessage('ユーザーIDとパスワードを正しく入力してください。');
    }
  };

  return (
    <div className="login-container">
      <h2>ARENAへようこそ</h2>
      <div className="progress-bar-container">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
            textColor: '#3e98c7',
            trailColor: '#d6d6d6',
            strokeLinecap: 'round',
          })}
        />
      </div>

      <form onSubmit={handleLoginClick}>
        <div className="input-group">
          <label htmlFor="userId">ユーザーID</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={handleUserIdChange}
            placeholder="ユーザーIDを入力"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="パスワードを入力"
          />
        </div>

        <button type="submit" className="login-button">
          ログイン
        </button>
      </form>
      
      {message && (
        <div className={`message ${percentage === 100 ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <>
      <StyleInjector /> {/* スタイルを注入 */}
      <FormWithProgress />
    </>
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
