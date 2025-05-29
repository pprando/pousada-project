import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Clock, BedDouble, User, Calendar, CreditCard } from 'lucide-react';

interface Booking {
  id: string;
  room_id: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_amount: number;
  created_at: string;
  room: {
    number: string;
    room_type: string;
  };
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(number, room_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Navigation title="Histórico" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Histórico de Reservas
          </h2>

          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-100 rounded-xl p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    {/* Guest Info */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.guest_name}</p>
                        <p className="text-sm text-gray-500">
                          Reserva feita em {format(new Date(booking.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BedDouble className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Quarto {booking.room.number}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {booking.room.room_type}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(booking.check_in_date), "d 'de' MMMM", { locale: ptBR })} - {format(new Date(booking.check_out_date), "d 'de' MMMM", { locale: ptBR })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Período da estadia
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-right">
                    {/* Status */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-3 justify-end">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(booking.total_amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Valor total
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhuma reserva encontrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}