import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isWithinInterval, parseISO, isBefore, startOfToday, addDays } from 'date-fns';
import { Calendar as CalendarIcon, BedDouble, Search } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import BookingForm from './BookingForm';
import { toast } from 'sonner';

interface Booking {
  id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_name: string;
  status: string;
}

interface Room {
  id: string;
  number: string;
  room_type: string;
}

interface RoomCalendarProps {
  rooms: Room[];
  bookings: Booking[];
  onDateSelect?: (date: Date, roomId: string) => void;
}

export default function RoomCalendar({ rooms, bookings, onDateSelect }: RoomCalendarProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const today = startOfToday();

  const isDateBooked = (date: Date, roomId: string) => {
    return bookings.some((booking) => {
      if (booking.room_id !== roomId || booking.status !== 'confirmed') return false;
      
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      
      return isWithinInterval(date, { 
        start: checkIn, 
        end: addDays(checkOut, 1)
      });
    });
  };

  const isDateScheduled = (date: Date, roomId: string) => {
    return bookings.some((booking) => {
      if (booking.room_id !== roomId || booking.status !== 'scheduled') return false;
      
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      
      return isWithinInterval(date, { 
        start: checkIn, 
        end: addDays(checkOut, 1)
      });
    });
  };

  const getBookingInfo = (date: Date, roomId: string) => {
    return bookings.find((booking) => {
      if (booking.room_id !== roomId) return false;
      
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      
      return isWithinInterval(date, { 
        start: checkIn, 
        end: addDays(checkOut, 1)
      });
    });
  };

  const handleDateSelect = (date: Date | undefined, roomId: string) => {
    if (!date) return;

    // Check if the selected date is in the past
    if (isBefore(date, today)) {
      toast.error('Não é possível selecionar datas passadas');
      return;
    }

    // Check if the date is already booked
    if (isDateBooked(date, roomId)) {
      toast.error('Esta data já está reservada');
      return;
    }

    // Check if the date is already scheduled
    if (isDateScheduled(date, roomId)) {
      toast.error('Esta data já está agendada');
      return;
    }
    
    setSelectedDate(date);
    setSelectedRoom(roomId);
    setShowBookingForm(true);

    if (onDateSelect) {
      onDateSelect(date, roomId);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    if (onDateSelect && selectedDate && selectedRoom) {
      onDateSelect(selectedDate, selectedRoom);
    }
  };

  const modifiers = {
    booked: (date: Date) => selectedRoom ? isDateBooked(date, selectedRoom) : false,
    scheduled: (date: Date) => selectedRoom ? isDateScheduled(date, selectedRoom) : false,
    available: (date: Date) => selectedRoom ? !isDateBooked(date, selectedRoom) && !isDateScheduled(date, selectedRoom) : false,
    past: (date: Date) => isBefore(date, today),
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: 'rgb(254, 226, 226)',
      color: 'rgb(153, 27, 27)',
      fontWeight: 'bold',
      fontSize: '1rem',
    },
    scheduled: {
      backgroundColor: 'rgb(254, 249, 195)',
      color: 'rgb(161, 98, 7)',
      fontWeight: 'bold',
      fontSize: '1rem',
    },
    available: {
      backgroundColor: 'rgb(220, 252, 231)',
      color: 'rgb(22, 101, 52)',
      fontWeight: 'bold',
      fontSize: '1rem',
    },
    past: {
      backgroundColor: 'rgb(243, 244, 246)',
      color: 'rgb(156, 163, 175)',
      fontWeight: 'normal',
      fontSize: '1rem',
      cursor: 'not-allowed',
    },
  };

  const filteredRooms = rooms.filter(room => 
    room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoomData = rooms.find(room => room.id === selectedRoom);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-xl">
          <CalendarIcon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Calendário de Disponibilidade
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
        {/* Room List */}
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Selecione um Quarto
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar quarto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-3 mt-4 max-h-[calc(100vh-24rem)] overflow-y-auto">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                  selectedRoom === room.id
                    ? 'bg-primary text-white shadow-md'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedRoom === room.id ? 'bg-white/20' : 'bg-primary/10'}`}>
                  <BedDouble className={`h-5 w-5 ${selectedRoom === room.id ? 'text-white' : 'text-primary'}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium">Quarto {room.number}</div>
                  <div className={`text-sm ${selectedRoom === room.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {room.room_type}
                  </div>
                </div>
              </button>
            ))}

            {filteredRooms.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum quarto encontrado
              </p>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-gray-50 rounded-xl p-6">
          {selectedRoom ? (
            <div>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && handleDateSelect(date, selectedRoom)}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                locale={ptBR}
                showOutsideDays
                disabled={[{ before: today }]}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                styles={{
                  caption: { fontSize: '1.25rem' },
                  head_cell: { fontSize: '1rem' },
                  cell: { fontSize: '1rem' },
                  day: { width: '48px', height: '48px' },
                }}
              />

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div>
                  <span className="text-gray-700">Reservado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-200"></div>
                  <span className="text-gray-700">Agendado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-100 border border-green-200"></div>
                  <span className="text-gray-700">Disponível</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"></div>
                  <span className="text-gray-700">Data Passada</span>
                </div>
              </div>

              {selectedDate && (
                <div className="mt-8 bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  {isDateBooked(selectedDate, selectedRoom) || isDateScheduled(selectedDate, selectedRoom) ? (
                    <div className={`rounded-xl p-4 ${
                      isDateScheduled(selectedDate, selectedRoom)
                        ? 'bg-yellow-50 border border-yellow-100'
                        : 'bg-red-50 border border-red-100'
                    }`}>
                      <p className={`font-medium ${
                        isDateScheduled(selectedDate, selectedRoom)
                          ? 'text-yellow-800'
                          : 'text-red-800'
                      }`}>
                        {isDateScheduled(selectedDate, selectedRoom)
                          ? 'Este quarto está agendado para esta data'
                          : 'Este quarto está reservado para esta data'}
                      </p>
                      {getBookingInfo(selectedDate, selectedRoom) && (
                        <p className={`mt-2 text-sm ${
                          isDateScheduled(selectedDate, selectedRoom)
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          Hóspede: {getBookingInfo(selectedDate, selectedRoom)?.guest_name}
                        </p>
                      )}
                    </div>
                  ) : isBefore(selectedDate, today) ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-gray-700 font-medium">
                        Não é possível fazer reservas em datas passadas
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-green-800 font-medium">
                        Este quarto está disponível para reserva
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
              <BedDouble className="h-12 w-12 mb-4 text-gray-400" />
              <p>Selecione um quarto para ver sua disponibilidade</p>
            </div>
          )}
        </div>
      </div>

      {showBookingForm && selectedRoomData && selectedDate && (
        <BookingForm
          roomId={selectedRoomData.id}
          roomNumber={selectedRoomData.number}
          selectedDate={selectedDate}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}