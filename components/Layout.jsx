'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Wallet, Brain, Calendar, Lock, Settings, 
  LogOut, User, Sparkles 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import QuickAdd from './QuickAdd';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' }, // FIX: Ubah dari '/' ke '/dashboard'
  { name: 'Finance', icon: Wallet, path: '/dashboard/finance' },
  { name: '2nd Brain', icon: Brain, path: '/dashboard/brain' },
  { name: 'Agenda', icon: Calendar, path: '/dashboard/agenda' },
  { name: 'Vault', icon: Lock, path: '/dashboard/vault' },
];

export default function Layout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen p-4 md:p-6 gap-4 md:gap-6 relative">
      {/* Ambient Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full blur-[200px] opacity-20 animate-float pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-blue-600 rounded-full blur-[200px] opacity-15 animate-float pointer-events-none" style={{ animationDelay: '-4s' }}></div>

      {/* Sidebar */}
      <aside className="glass-card w-20 md:w-72 p-4 flex flex-col items-center md:items-start gap-2 h-[calc(100vh-3rem)] sticky top-4 z-40 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 px-2 w-full">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-white/10">
            <span className="text-white font-black text-xl">Ψ</span>
          </div>
          <h1 className="text-white font-bold text-xl hidden md:block tracking-tight">ADHD OS</h1>
          <span className="ml-auto text-[10px] font-mono text-gray-500 hidden md:block">v2.0</span>
        </div>

        <nav className="flex-1 w-full space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link href={item.path} key={item.path} className="block">
                <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer group ${
                  isActive 
                    ? 'bg-white/10 border border-white/10 shadow-lg shadow-purple-500/5' 
                    : 'hover:bg-white/5'
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-white'}`} />
                  <span className={`hidden md:block font-medium text-sm ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {item.name}
                  </span>
                  {isActive && <span className="ml-auto w-1.5 h-8 rounded-full bg-purple-500 hidden md:block"></span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="w-full border-t border-white/5 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-600 to-gray-800 flex items-center justify-center text-xs font-bold text-white ring-1 ring-white/10">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-xs text-white truncate">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-4 px-4 py-2 w-full rounded-2xl hover:bg-white/5 transition-colors">
            <LogOut size={18} className="text-gray-500" />
            <span className="hidden md:block text-sm text-gray-400 hover:text-white">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-3rem)] pb-24">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Quick Add - The ADHD Instant Capture */}
      <QuickAdd />
    </div>
  );
}