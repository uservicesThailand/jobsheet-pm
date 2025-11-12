import React, { useState } from 'react';
import { Printer, Download, RefreshCw, MoreVertical, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function FloatingActionButtons({
  onPrint,
  onDownloadPDF,
  onReload,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  currentZoom
}) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: ZoomIn,
      name: 'Zoom In',
      onClick: onZoomIn,
      color: '#10b981',
      delay: 0
    },
    {
      icon: ZoomOut,
      name: 'Zoom Out',
      onClick: onZoomOut,
      color: '#ef4444',
      delay: 50
    },
    {
      icon: Maximize2,
      name: `Reset (${Math.round(currentZoom * 100)}%)`,
      onClick: onResetZoom,
      color: '#8b5cf6',
      delay: 100
    },
    {
      icon: Printer,
      name: 'Print',
      onClick: onPrint,
      color: '#f59e0b',
      delay: 150
    },
    {
      icon: RefreshCw,
      name: 'Reload',
      onClick: onReload,
      color: '#6b7280',
      delay: 200
    },
  ];

  const handleActionClick = (action) => {
    action.onClick?.();
    // ไม่ปิดเมนู - ให้กด ... อีกครั้งถึงจะปิด
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
        }

        .speed-dial-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .main-fab {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 2;
        }

        .main-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.5);
        }

        .main-fab:active {
          transform: scale(0.95);
        }

        .main-fab svg {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-fab.open svg {
          transform: rotate(90deg);
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .action-item.closing {
          animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .action-label {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0.95;
        }

        .action-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .action-button:hover {
          transform: scale(1.15);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
        }

        .action-button:active {
          transform: scale(0.95);
        }
      `}</style>

      <div className="speed-dial-container">
        {open && actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.name}
              className="action-item"
              style={{
                animationDelay: `${action.delay}ms`,
              }}
            >
              <span className="action-label">{action.name}</span>
              <button
                className="action-button"
                onClick={() => handleActionClick(action)}
                style={{
                  background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                  animationDelay: `${action.delay}ms`
                }}
                title={action.name}
              >
                <Icon size={20} />
              </button>
            </div>
          );
        })}

        <button
          className={`main-fab ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Actions menu"
        >
          <MoreVertical size={24} />
        </button>
      </div>
    </>
  );
}