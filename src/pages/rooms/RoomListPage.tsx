import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navigation from '@/components/Navigation';
import { Edit2, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Room {
  id: string;
  number: string;
  room_type: string;
  daily_rate: number;
  features: string[];
  notes: string;
  created_at: string;
}

export default function RoomListPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Erro ao carregar quartos');
      toast.error('Erro ao carregar quartos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este quarto? Isso também excluirá todas as reservas e pagamentos associados.')) return;

    setDeleting(id);
    try {
      // 1. Get all bookings for this room
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', id);

      if (bookingsError) throw bookingsError;

      if (bookings && bookings.length > 0) {
        const bookingIds = bookings.map(booking => booking.id);

        // 2. Delete all payments associated with these bookings
        const { error: paymentsError } = await supabase
          .from('payments')
          .delete()
          .in('booking_id', bookingIds);

        if (paymentsError) throw paymentsError;

        // 3. Delete all bookings for this room
        const { error: bookingsDeletionError } = await supabase
          .from('bookings')
          .delete()
          .eq('room_id', id);

        if (bookingsDeletionError) throw bookingsDeletionError;
      }

      // 4. Finally delete the room
      const { error: roomDeletionError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (roomDeletionError) throw roomDeletionError;
      
      setRooms(rooms.filter(room => room.id !== id));
      toast.success('Quarto e todas as suas reservas foram excluídos com sucesso');
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Erro ao excluir quarto. Verifique se existem reservas ou pagamentos associados.');
    } finally {
      setDeleting(null);
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
          <div className="flex justify-between items-center">
            <Navigation title="Quartos" />
            <button
              onClick={() => navigate('/rooms')}
              className="primary-button flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Quarto
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum quarto encontrado. Crie seu primeiro quarto!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {rooms.map((room) => (
                <div key={room.id} className="room-card bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Quarto {room.number}</h2>
                        <p className="text-sm text-gray-500 capitalize">{room.room_type}</p>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(room.daily_rate)}/dia
                      </p>
                    </div>
                    
                    {room.features && room.features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Comodidades:</p>
                        <div className="flex flex-wrap gap-2">
                          {room.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {room.notes && (
                      <p className="text-sm text-gray-600 mb-4">{room.notes}</p>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => navigate(`/rooms/${room.id}/edit`)}
                        className="secondary-button"
                        title="Editar Quarto"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        disabled={deleting === room.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 w-9 inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Excluir Quarto"
                      >
                        {deleting === room.id ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}