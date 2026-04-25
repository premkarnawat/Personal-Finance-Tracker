import { useEffect, useRef } from 'react'

export default function SplashScreen({ onFinish }) {
  const calledRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true
        onFinish?.()
      }
    }, 3200)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: '#ffffff',
        animation: 'splashFadeOut 0.6s ease-in 2.6s forwards',
      }}
    >
      <style>{`
        @keyframes splashFadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.75) translateY(20px); }
          70%  { opacity: 1; transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes textIn {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes taglineIn {
          0%   { opacity: 0; letter-spacing: 0.1em; }
          100% { opacity: 1; letter-spacing: 0.25em; }
        }
        @keyframes barGrow {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>

      {/* FINTRA Logo — SVG replica of uploaded logo */}
      <div style={{ animation: 'logoIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) 0.2s both' }}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top horizontal bar of F — parallelogram shape */}
          <polygon
            points="155,95 430,95 415,140 155,140"
            fill="#1e2535"
          />
          {/* Middle horizontal bar of F — smaller parallelogram */}
          <polygon
            points="155,195 320,195 305,238 155,238"
            fill="#1e2535"
          />
          {/* Vertical stem of F */}
          <polygon
            points="155,95 200,95 200,405 155,405"
            fill="#1e2535"
          />
          {/* Diagonal cut accent piece — bottom left triangle */}
          <polygon
            points="155,290 200,290 155,405"
            fill="#1e2535"
          />
        </svg>
      </div>

      {/* FINTRA text */}
      <div
        style={{
          animation: 'textIn 0.5s ease-out 0.8s both',
          fontFamily: 'Sora, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: '2.4rem',
          letterSpacing: '0.08em',
          color: '#1e2535',
          marginTop: '-8px',
        }}
      >
        FINTRA
      </div>

      {/* Tagline */}
      <div
        style={{
          animation: 'taglineIn 0.8s ease-out 1.1s both',
          fontFamily: 'Sora, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: '0.72rem',
          color: '#94a3b8',
          marginTop: '6px',
        }}
      >
        TRACK YOUR FINANCE
      </div>

      {/* Loading bar */}
      <div
        style={{
          marginTop: '48px',
          width: '120px',
          height: '3px',
          background: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
          animation: 'textIn 0.3s ease-out 1.3s both',
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#1e2535',
            borderRadius: '9999px',
            transformOrigin: 'left',
            animation: 'barGrow 1.6s cubic-bezier(0.4,0,0.2,1) 1.4s both',
          }}
        />
      </div>
    </div>
  )
}
