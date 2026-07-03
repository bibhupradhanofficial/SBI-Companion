import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, Smartphone, CreditCard } from "lucide-react"

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="SBI Companion Logo"
                className="h-9 w-9 object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                SBI <span className="text-primary dark:text-blue-400">Companion</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                How It Works
              </a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                About
              </a>
            </div>
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/mobile-banking"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile Banking
                </Link>
                <Link
                  to="/cards"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  Credit Cards
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>
                {/* Theme toggler removed */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-900"
            >
              How It Works
            </a>
            <a
              href="#about"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-900"
            >
              About
            </a>
            <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2"></div>
            {user ? (
              <div className="flex flex-col gap-2 px-3">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-base font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  to="/mobile-banking"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-base font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                >
                  <Smartphone className="h-5 w-5" />
                  Mobile Banking
                </Link>
                <Link
                  to="/cards"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-base font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                >
                  <CreditCard className="h-5 w-5" />
                  Credit Cards
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-base font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                >
                  <UserIcon className="h-5 w-5" />
                  Profile
                </Link>
                {/* Theme toggler removed */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-2 py-2 text-left text-base font-medium text-slate-600 hover:text-red-600 dark:text-slate-300"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center rounded-md py-2 text-base font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block text-center rounded-md bg-primary py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
