import { ref, h, render, defineComponent, TransitionGroup } from 'vue'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  type: ToastType
  message: string
  title?: string
}

const toasts = ref<ToastItem[]>([])
let _nextId = 1
let _mounted = false

const CONFIG: Record<ToastType, { bar: string; iconBg: string; iconColor: string; icon: any }> = {
  success: { bar: '#22c55e', iconBg: '#dcfce7', iconColor: '#16a34a', icon: CheckCircle2 },
  error:   { bar: '#ef4444', iconBg: '#fee2e2', iconColor: '#dc2626', icon: XCircle },
  warning: { bar: '#f59e0b', iconBg: '#fef3c7', iconColor: '#d97706', icon: AlertTriangle },
  info:    { bar: '#3b82f6', iconBg: '#dbeafe', iconColor: '#2563eb', icon: Info },
}


const ToastRenderer = defineComponent({
  setup() {
    function dismiss(id: number) {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return () =>
      h(
        'div',
        {
          style:
            'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:12px;width:340px;pointer-events:none;',
          'aria-live': 'polite',
        },
        [
          h(
            TransitionGroup,
            { name: 'toast', tag: 'div', style: 'display:contents;' },
            {
              default: () =>
                toasts.value.map(t =>
                  h(
                    'div',
                    {
                      key: t.id,
                      role: 'alert',
                      style:
                        'pointer-events:all;background:#fff;border-radius:16px;border:0.5px solid #e5e7eb;box-shadow:0 4px 24px rgba(0,0,0,.10),0 1px 4px rgba(0,0,0,.06);display:flex;align-items:stretch;overflow:hidden;',
                    },
                    [
                      // Barre colorée
                      h('div', { style: `width:4px;flex-shrink:0;background:${CONFIG[t.type].bar};` }),

                      // Icône
                      h(
                        'div',
                        {
                          style: `flex-shrink:0;margin:14px 0 14px 12px;width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${CONFIG[t.type].iconBg};`,
                        },
                        [h(CONFIG[t.type].icon, { style: `width:16px;height:16px;color:${CONFIG[t.type].iconColor};` })]
                      ),

                      // Texte
                      h('div', { style: 'flex:1;padding:14px 8px 14px 12px;min-width:0;' }, [
                        t.title
                          ? h('p', { style: 'font-size:13px;font-weight:700;color:#111827;line-height:1.3;margin:0 0 2px;' }, t.title)
                          : null,
                        h('p', { style: 'font-size:12px;color:#6b7280;line-height:1.5;margin:0;' }, t.message),
                      ]),

                      // Bouton fermer
                      h(
                        'button',
                        {
                          style:
                            'flex-shrink:0;margin:10px 10px 0 0;padding:4px;border:none;background:transparent;border-radius:6px;cursor:pointer;color:#9ca3af;display:flex;align-items:center;justify-content:center;',
                          onClick: () => dismiss(t.id),
                          'aria-label': 'Fermer',
                        },
                        [h(X, { style: 'width:14px;height:14px;' })]
                      ),
                    ]
                  )
                ),
            }
          ),
        ]
      )
  },
})

// ─── Injection CSS animations (une seule fois) ──────────────────
function injectStyles() {
  if (document.getElementById('toast-styles')) return
  const style = document.createElement('style')
  style.id = 'toast-styles'
  style.textContent = `
    .toast-enter-active { transition: all 0.32s cubic-bezier(0.16,1,0.3,1); }
    .toast-leave-active  { transition: all 0.2s ease-in; }
    .toast-enter-from    { opacity:0; transform:translateX(32px) translateY(-6px) scale(0.97); }
    .toast-leave-to      { opacity:0; transform:translateX(110%); }
    .toast-move          { transition: transform 0.28s ease; }
  `
  document.head.appendChild(style)
}

// ─── Montage unique dans <body> ─────────────────────────────────
function mountRenderer() {
  if (_mounted) return
  _mounted = true
  injectStyles()
  const container = document.createElement('div')
  document.body.appendChild(container)
  render(h(ToastRenderer), container)
}

// ─── Composable public ─────────────────────────────────────────
export function useToast() {
  if (typeof window !== 'undefined') mountRenderer()

  return (type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = _nextId++
    toasts.value.push({ id, type, message, title })
    if (duration > 0) setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }
}