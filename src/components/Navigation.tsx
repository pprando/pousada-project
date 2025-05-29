import { useNavigate } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navigation({ title }: { title: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
          title="Voltar para Início"
        >
          <Home className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
        title="Sair"
      >
        <span className="text-sm font-medium">Sair</span>
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}