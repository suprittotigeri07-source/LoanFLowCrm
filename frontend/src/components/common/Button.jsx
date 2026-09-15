import React from 'react'

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-7 py-3.5 text-base',
}

export default function Button({ variant = 'primary', size = 'md', children, className = '', disabled, loading, icon, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !loading && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
