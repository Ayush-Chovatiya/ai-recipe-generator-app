/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'

const TOAST_EVENT = 'app-toast'
const DEFAULT_DURATION = 3000

function emitToast(type, message) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
        type,
      },
    }),
  )
}

const toast = {
  success(message) {
    emitToast('success', message)
  },
  error(message) {
    emitToast('error', message)
  },
}

export function Toaster({ position = 'top-right', toastOptions = {} }) {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    function handleToast(event) {
      const nextToast = event.detail
      setToasts((currentToasts) => [...currentToasts, nextToast])

      window.setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((item) => item.id !== nextToast.id),
        )
      }, toastOptions.duration ?? DEFAULT_DURATION)
    }

    window.addEventListener(TOAST_EVENT, handleToast)

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast)
    }
  }, [toastOptions.duration])

  const isTop = position.startsWith('top')
  const isRight = position.endsWith('right')
  const isLeft = position.endsWith('left')

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: 'calc(100vw - 2rem)',
        width: '22rem',
        pointerEvents: 'none',
        top: isTop ? '1rem' : 'auto',
        bottom: isTop ? 'auto' : '1rem',
        right: isRight ? '1rem' : 'auto',
        left: isLeft ? '1rem' : isRight ? 'auto' : '50%',
        transform: isLeft || isRight ? 'none' : 'translateX(-50%)',
      }}
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          style={{
            ...(toastOptions.style || {}),
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            pointerEvents: 'auto',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '0.6rem',
              height: '0.6rem',
              borderRadius: '999px',
              flex: '0 0 auto',
              background: item.type === 'success' ? '#10b981' : '#ef4444',
            }}
          />
          <span style={{ lineHeight: 1.4 }}>{item.message}</span>
        </div>
      ))}
    </div>
  )
}

export default toast
