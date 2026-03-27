import { Syne, DM_Sans } from 'next/font/google'
  // ← add
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/globals.css'
import NavBar from './components/NavBar';
import { NavProvider, useNav } from './context/NavContext';
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })

 
export const metadata = {
  title: 'ModelHug',
  description: 'Explore Hugging Face AI models in one place',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en" className={`${syne.variable} ${dm.variable}`}>
      <body>
        <NavProvider>
   <NavBar />

        <main>{children}</main>
        </NavProvider>
      </body>
    </html>
  )
}
