import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Storken Next.js App Router',
  description: 'Complete Next.js App Router integration with Storken state management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center space-x-8">
                  <Link 
                    href="/" 
                    className="text-xl font-bold text-blue-600 hover:text-blue-800"
                  >
                    Storken Next.js
                  </Link>
                  
                  <div className="hidden md:flex space-x-6">
                    <Link 
                      href="/" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/posts" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Posts
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/about" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      About
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Link
                    href="/posts/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    New Post
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-800 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-gray-300">
                  Built with{' '}
                  <a 
                    href="https://github.com/keremnoras/storken" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Storken
                  </a>
                  {' '}and Next.js App Router
                </p>
                <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-400">
                  <span>🔄 Universal State Management</span>
                  <span>⚡ Server Components</span>
                  <span>🎯 TypeScript</span>
                  <span>🚀 App Router</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}