import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Mail, Phone, MapPin, Search, BedDouble } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  bookings: {
    id: string;
    check_in_date: string;
    check_out_date: string;
    room: {
      number: string;
      room_type: string;
    };
  }[];
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuests();
  }, []);

  async function fetchGuests() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          bookings (
            id,
            check_in_date,
            check_out_date,
            room:rooms (
              number,
              room_type
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Navigation title="Hóspedes" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar hóspedes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="border border-gray-100 rounded-xl p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Guest Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{guest.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(guest.birth_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-gray-600">{guest.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-gray-600">{guest.phone}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-gray-600">{guest.address}</p>
                    </div>
                  </div>

                  {/* Bookings */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">
                      Histórico de Reservas
                    </h3>
                    <div className="space-y-3">
                      {guest.bookings?.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BedDouble className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Quarto {booking.room.number}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(booking.check_in_date), "d MMM", { locale: ptBR })} - {format(new Date(booking.check_out_date), "d MMM", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      ))}

                      {(!guest.bookings || guest.bookings.length === 0) && (
                        <p className="text-sm text-gray-500">
                          Nenhuma reserva encontrada
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredGuests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhum hóspede encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}