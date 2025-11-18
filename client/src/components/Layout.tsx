import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  AlertTriangle, 
  Building2,
  FileText,
  Activity
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <aside className="w-64 bg-primary-900 text-white">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">MBG Health</h1>
                <p className="text-xs text-primary-200">Security System</p>
              </div>
            </div>
          </div>
          
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
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
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
