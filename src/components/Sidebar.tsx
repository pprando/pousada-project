import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  BedDouble, 
  ClipboardList, 
  LogOut, 
  Menu,
  BarChart2,
  History,
  Settings,
  Users,
  Coffee,
  List
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pousadaName, setPousadaName] = useState('');

  useEffect(() => {
    fetchPousadaName();
  }, []);

  const fetchPousadaName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('pousada_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.pousada_name) {
          setPousadaName(data.pousada_name);
        }
      }
    } catch (error) {
      console.error('Error fetching pousada name:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const menuItems = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Calendário',
      path: '/calendar',
    },
    {
      icon: <BedDouble className="h-5 w-5" />,
      label: 'Quartos',
      path: '/rooms/list',
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: 'Solicitações',
      path: '/bookings/requests',
    },
    {
      icon: <Coffee className="h-5 w-5" />,
      label: 'Cardápio',
      path: '/menu',
    },
    {
      icon: <List className="h-5 w-5" />,
      label: 'Pedidos',
      path: '/menu/orders',
    },
  ];

  const managementItems = [
    {
      icon: <BarChart2 className="h-5 w-5" />,
      label: 'Estatísticas',
      path: '/statistics',
    },
    {
      icon: <History className="h-5 w-5" />,
      label: 'Histórico',
      path: '/history',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Hóspedes',
      path: '/guests',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Configurações',
      path: '/settings',
    },
  ];

  return (
    <div
      className={`bg-white border-r border-gray-100 h-screen transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">{pousadaName || 'Pousada'}</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {/* Main Menu */}
          <div className="mb-8">
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
                Principal
              </h2>
            )}
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <div
                      className={`${
                        location.pathname === item.path ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Management Menu */}
          <div>
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
                Gerenciamento
              </h2>
            )}
            <ul className="space-y-2">
              {managementItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <div
                      className={`${
                        location.pathname === item.path ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </div>
    </div>
  );
}