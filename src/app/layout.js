import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'FA Training Hub',
  description: 'Plataforma de Alto Desempenho para Futebol Americano',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800;900&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('SW Registered', reg.scope);
              }).catch(function(err) {
                console.log('SW Registration failed', err);
              });
            });
          }
        `}} />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
