import { Syne, DM_Sans } from 'next/font/google'
import Link from 'next/link'
import NavDropdown from './components/NavDropdown'
import MobileDrawer from './components/MobileDrawer'   // ← add
import './styles/globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })

const navCategories = [
  {
    id: 'text',
    label: 'Text & Chat',
    items: [
      { name: 'Text Generation',      desc: 'Mistral 7B Instruct',   href: '/models/text-generation', icon: '✍️', badge: 'Hot' },
      { name: 'Language Translation', desc: 'Helsinki-NLP OPUS-MT',  href: '/models/translation',     icon: '🌐' },
      { name: 'Emotion Detection',    desc: 'DistilRoBERTa Emotion', href: '/models/emotion',          icon: '💜' },
    ],
  },
  {
    id: 'vision',
    label: 'Vision',
    items: [
      { name: 'Image Generation', desc: 'FLUX.1-schnell', href: '/models/image-gen',  icon: '🎨', badge: 'New' },
      { name: 'Object Detection', desc: 'DETR ResNet-50', href: '/models/detection',  icon: '🔍' },
      { name: 'Image Captioning', desc: 'BLIP Large',     href: '/models/captioning', icon: '💬' },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    items: [
      { name: 'Music Generation', desc: 'MusicGen Small',   href: '/models/music',   icon: '🎵' },
      { name: 'Speech to Text',   desc: 'Whisper Large v3', href: '/models/whisper', icon: '🎙️' },
    ],
  },
]

export const metadata = {
  title: 'ModelHug',
  description: 'Explore Hugging Face AI models in one place',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dm.variable}`}>
      <body>
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

        <main>{children}</main>
      </body>
    </html>
  )
}
