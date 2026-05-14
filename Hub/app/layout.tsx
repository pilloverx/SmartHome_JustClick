'use client'

import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { Moon, Sun, Github, Menu, X } from 'lucide-react'
import Link from 'next/link'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('theme')
    const shouldBeDark = saved ? saved === 'dark' : prefersDark
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newValue = !isDark
    setIsDark(newValue)
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SmartHome_JustClick - Local-first smart home automation platform" />
        <title>SmartHome_JustClick</title>
      </head>
      <body className={isDark ? 'dark' : ''}>
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-ha-border dark:border-ha-border-dark bg-white/80 dark:bg-ha-surface-dark/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-ha rounded-lg flex items-center justify-center font-bold text-white group-hover:shadow-lg transition-all">
                  🏠
                </div>
                <span className="font-bold text-lg hidden sm:inline text-gray-900 dark:text-white">
                  SmartHome<span className="text-ha-primary">_JustClick</span>
                </span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex gap-8">
                <Link href="/builder" className="text-gray-700 dark:text-gray-300 hover:text-ha-primary transition-colors">
                  Builder
                </Link>
                <Link href="#gallery" className="text-gray-700 dark:text-gray-300 hover:text-ha-primary transition-colors">
                  Gallery
                </Link>
                <Link href="#docs" className="text-gray-700 dark:text-gray-300 hover:text-ha-primary transition-colors">
                  Docs
                </Link>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                {isMounted && (
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ha-surface-dark transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {isDark ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-700" />
                    )}
                  </button>
                )}

                {/* GitHub Link */}
                <a
                  href="https://github.com/pilloverx/SmartHome_JustClick"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ha-surface-dark transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ha-surface-dark"
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden pb-4 space-y-2">
                <Link
                  href="/builder"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ha-surface-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Builder
                </Link>
                <Link
                  href="#gallery"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ha-surface-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gallery
                </Link>
                <Link
                  href="#docs"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ha-surface-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Docs
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-ha-border dark:border-ha-border-dark bg-gray-50 dark:bg-ha-surface-dark mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div>
                <h3 className="font-bold text-lg mb-4">SmartHome_JustClick</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Local-first smart home automation. Control your devices, build your future.
                </p>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://github.com/pilloverx/SmartHome_JustClick"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ha-primary hover:underline"
                    >
                      GitHub Repository
                    </a>
                  </li>
                  <li>
                    <a href="#docs" className="text-ha-primary hover:underline">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#examples" className="text-ha-primary hover:underline">
                      Examples
                    </a>
                  </li>
                </ul>
              </div>

              {/* Community */}
              <div>
                <h4 className="font-semibold mb-3">Community</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#discussions" className="text-ha-primary hover:underline">
                      GitHub Discussions
                    </a>
                  </li>
                  <li>
                    <a href="#issues" className="text-ha-primary hover:underline">
                      Report Issues
                    </a>
                  </li>
                  <li>
                    <a href="#contribute" className="text-ha-primary hover:underline">
                      Contribute
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#license" className="text-ha-primary hover:underline">
                      MIT License
                    </a>
                  </li>
                  <li>
                    <a href="#privacy" className="text-ha-primary hover:underline">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-ha-border dark:border-ha-border-dark mt-8 pt-8 flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2026 SmartHome_JustClick. All rights reserved.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Made with ❤️ for automation enthusiasts
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
