"use client"
import { useNav } from '../context/NavContext';
import Link from 'next/link'
import NavDropdown from './NavDropdown';
import MobileDrawer from './MobileDrawer'
export default function NavBar() {
const { navCategories } = useNav(); // <-- get categories from context

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        <span className="logo-icon">🤗</span>
        ModelHug
      </Link>

      {/* Desktop nav */}
      <div className="nav-items">
        {navCategories.map((cat) => (
          <NavDropdown key={cat.id} label={cat.label} items={cat.items} />
        ))}
        <div className="nav-sep" />
        <Link href="/explore" className="nav-btn">Explore</Link>
      </div>

      <div className="nav-right">
        <button className="btn-ghost">Sign in</button>
        <button className="btn-primary">Get started</button>
      </div>

      {/* Mobile hamburger + drawer */}
      <MobileDrawer navCategories={navCategories} />
    </nav>
  )


}