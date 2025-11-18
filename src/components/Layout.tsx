import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  AlertTriangle, 
  Building2,
  FileText,
  Activity,
  Menu,
  X,
  Database,
  Trash2
} from 'lucide-react';
import { initializeSampleData, clearAllData } from '../lib/sampleData';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Personel', href: '/personnel', icon: Users },
  { name: 'Entry Check', href: '/entry-check', icon: ClipboardCheck },
  { name: 'Insiden', href: '/incidents', icon: AlertTriangle },
  { name: 'Pos Kesehatan', href: '/medical-posts', icon: Building2 },
  { name: 'Laporan', href: '/reports', icon: FileText },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-primary-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 lg:h-8 lg:w-8" />
              <div>
                <h1 className="text-lg lg:text-xl font-bold">MBG Health</h1>
                <p className="text-xs text-primary-200">Security System</p>
              </div>
            </div>
            <button 
              onClick={closeSidebar}
              className="lg:hidden text-white hover:bg-primary-800 p-2 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-primary-800">
            <div className="space-y-2">
              <button
                onClick={async () => {
                  if (confirm('Load sample data untuk demo? (Data akan di-reset)')) {
                    await initializeSampleData();
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-primary-100 hover:bg-primary-800 rounded-lg transition-colors"
              >
                <Database className="h-4 w-4" />
                <span>Load Demo Data</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Hapus semua data? Tindakan ini tidak bisa dibatalkan!')) {
                    clearAllData();
                    window.location.reload();
                  }
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 p-2 -ml-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 ml-3">
              <Activity className="h-6 w-6 text-primary-600" />
              <h1 className="text-lg font-bold text-gray-900">MBG Health</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
