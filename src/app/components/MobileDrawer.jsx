'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileDrawer({ navCategories }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className={`hamburger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`mobile-drawer ${open ? 'open' : ''}`}>
        {navCategories.map((cat) => (
          <div key={cat.id} className="mobile-section">
            <span className="mobile-section-header">{cat.label}</span>
            {cat.items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="mobile-item"
                onClick={() => setOpen(false)}
              >
                <span className="mobile-item-icon">{item.icon}</span>
                <span className="mobile-item-text">
                  <span className="mobile-item-name">{item.name}</span>
                  <span className="mobile-item-desc">{item.desc}</span>
                </span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}

        <div className="mobile-divider" />

        <div className="mobile-actions">
          <button className="btn-ghost">Sign in</button>
          <button className="btn-primary">Get started</button>
        </div>
      </div>
    </>
  )
}