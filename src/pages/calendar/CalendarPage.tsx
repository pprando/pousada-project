import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import RoomCalendar from '@/components/RoomCalendar';
import { Building2, List, PlusCircle } from 'lucide-react';

interface Room {
  id: string;
  number: string;
  room_type: string;
}

interface Booking {
  id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_name: string;
  status: string;
}

interface BookingRequest {
  id: string;
  room_id: string;
  guest_name: string;
  status: string;
  created_at: string;
}

interface Stats {
  pendingRequests: number;
  occupiedRooms: number;
  occupancyRate: number;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats>({
    pendingRequests: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<BookingRequest[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, number, room_type')
        .order('number');

      if (roomsError) throw roomsError;

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');

      if (bookingsError) throw bookingsError;

      const { data: requestsData, error: requestsError } = await supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (requestsError) throw requestsError;

      const pendingRequests = requestsData?.filter(r => r.status === 'pending').length || 0;
      const occupiedRooms = bookingsData?.filter(b => b.status === 'confirmed').length || 0;
      const occupancyRate = roomsData ? Math.round((occupiedRooms / roomsData.length) * 100) : 0;

      setRooms(roomsData || []);
      setBookings(bookingsData || []);
      setRecentActivity(requestsData || []);
      setStats({
        pendingRequests,
        occupiedRooms,
        occupancyRate,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Navigation title="Calendário de Reservas" />

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
            {/* Main Calendar */}
            <div>
              <RoomCalendar
                rooms={rooms}
                bookings={bookings}
                onDateSelect={(date, roomId) => {
                  console.log('Selected:', { date, roomId });
                }}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Building2 className="h-6 w-6 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">Ações Rápidas</h2>
                </div>
                <div className="space-y-3">
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
              <div className="bg-white rounded-xl p-6  shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Solicitações Pendentes</p>
                    <p className="text-2xl font-bold text-primary">{stats.pendingRequests}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Quartos Ocupados</p>
                    <p className="text-2xl font-bold text-primary">
                      {stats.occupiedRooms}/{rooms.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Taxa de Ocupação</p>
                    <p className="text-2xl font-bold text-primary">{stats.occupancyRate}%</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-l-4 border-primary pl-4"
                    >
                      <p className="text-sm text-gray-600">Nova Solicitação</p>
                      <p className="font-medium">{activity.guest_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}