import React from "react"
import { Link } from "react-router-dom"

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="SBI Companion Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                SBI <span className="text-primary dark:text-blue-400">Companion</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Your intelligent agentic AI companion for State Bank of India services. Companion makes banking personal, conversational, and highly secure.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#features" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/agent" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors">
                  AI Agent Chat
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Legal & Security</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-slate-500 dark:text-slate-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-slate-500 dark:text-slate-400">Terms of Service</span>
              </li>
              <li>
                <span className="text-sm text-slate-500 dark:text-slate-400">Secure Banking Guidelines</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} SBI Companion. This is an agentic AI banking interface demonstration. All mock transactions are processed within a simulated sandbox environment.
          </p>
          <div className="flex gap-4">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
              Sandbox Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
