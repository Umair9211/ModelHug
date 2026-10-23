'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div className="nav-category" ref={ref}>
      <button
        className={`nav-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={`dropdown ${open ? 'show' : ''}`}>
        <span className="dropdown-label">{label} models</span>
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="dropdown-item"
            onClick={() => setOpen(false)}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-text">
              <span className="item-name">{item.name}</span>
              <span className="item-desc">{item.desc}</span>
            </span>
            {item.badge && <span className="badge">{item.badge}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}