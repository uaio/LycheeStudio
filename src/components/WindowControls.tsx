import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface WindowControlsProps {
  platform?: 'windows' | 'macos' | 'linux';
  className?: string;
  style?: React.CSSProperties;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  platform = 'macos',
  className = '',
  style = {}
}) => {
  const handleWindowControl = async (action: 'close' | 'minimize' | 'maximize') => {
    try {
      const window = getCurrentWindow();
      switch (action) {
        case 'close':
          await window.close();
          break;
        case 'minimize':
          await window.minimize();
          break;
        case 'maximize':
          if (await window.isMaximized()) {
            await window.unmaximize();
          } else {
            await window.maximize();
          }
          break;
      }
    } catch (error) {
      console.error('Window control error:', error);
    }
  };

  if (platform === 'macos') {
    return (
      <div
        className={`window-controls-macos ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 16px',
          height: '100%',
          WebkitAppRegion: 'no-drag' as any,
          ...style
        }}
      >
        <button
          onClick={() => handleWindowControl('close')}
          className="window-control window-control-close"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#ff5f57',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '1';
          }}
          title="关闭"
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'transparent',
              fontSize: '8px',
              fontWeight: 'bold'
            }}
          >
            ×
          </span>
        </button>

        <button
          onClick={() => handleWindowControl('minimize')}
          className="window-control window-control-minimize"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#ffbd2e',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '1';
          }}
          title="最小化"
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'transparent',
              fontSize: '8px',
              fontWeight: 'bold'
            }}
          >
            −
          </span>
        </button>

        <button
          onClick={() => handleWindowControl('maximize')}
          className="window-control window-control-maximize"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#28ca42',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '1';
          }}
          title="最大化"
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'transparent',
              fontSize: '8px',
              fontWeight: 'bold'
            }}
          >
            +
          </span>
        </button>
      </div>
    );
  }

  // Windows style controls (if needed in the future)
  if (platform === 'windows') {
    return (
      <div
        className={`window-controls-windows ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          WebkitAppRegion: 'no-drag' as any,
          ...style
        }}
      >
        <div style={{ flex: 1 }} data-tauri-drag-region />
        <button
          onClick={() => handleWindowControl('minimize')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#666'
          }}
          title="最小化"
        >
          −
        </button>
        <button
          onClick={() => handleWindowControl('maximize')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#666'
          }}
          title="最大化"
        >
          □
        </button>
        <button
          onClick={() => handleWindowControl('close')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#666'
          }}
          title="关闭"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
};

export default WindowControls;