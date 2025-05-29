import { useNavigate } from 'react-router-dom';
import { Building2, PlusCircle, List, Calendar, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pousada Japere - Administração
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de gerenciamento de reservas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Building2 className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-2xl font-semibold">Ações Rápidas</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/calendar')}
                className="primary-button w-full flex items-center justify-center"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendário de Quartos
              </button>
              <button
                onClick={() => navigate('/bookings/requests')}
                className="primary-button w-full flex items-center justify-center"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Solicitações de Reserva
              </button>
              <button
                onClick={() => navigate('/rooms/list')}
                className="secondary-button w-full flex items-center justify-center"
              >
                <List className="mr-2 h-4 w-4" />
                Lista de Quartos
              </button>
              <button
                onClick={() => navigate('/rooms')}
                className="secondary-button w-full flex items-center justify-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Quarto
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Estatísticas</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Solicitações Pendentes</p>
                <p className="text-2xl font-bold text-primary">3</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Quartos Ocupados</p>
                <p className="text-2xl font-bold text-primary">8/12</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-primary">67%</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-gray-600">Nova Solicitação</p>
                <p className="font-medium">Quarto 101 - João Silva</p>
                <p className="text-sm text-gray-500">Há 5 minutos</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Reserva Confirmada</p>
                <p className="font-medium">Quarto 203 - Maria Santos</p>
                <p className="text-sm text-gray-500">Há 1 hora</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Pagamento Recebido</p>
                <p className="font-medium">Quarto 305 - Pedro Costa</p>
                <p className="text-sm text-gray-500">Há 2 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}