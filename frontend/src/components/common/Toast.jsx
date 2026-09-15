import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const icons = {
  success: { Icon: CheckCircle, cls: 'text-emerald-500' },
  error: { Icon: AlertCircle, cls: 'text-red-500' },
  warning: { Icon: AlertTriangle, cls: 'text-amber-500' },
  info: { Icon: Info, cls: 'text-blue-500' },
}

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  const { Icon, cls } = icons[type] || icons.success
  return (
    <div className="fixed top-4 right-4 z-[9999] animate-fade-in">
      <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 max-w-sm">
        <Icon size={18} className={`mt-0.5 shrink-0 ${cls}`} />
        <p className="text-sm text-gray-800 font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
