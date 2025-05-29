import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { Check, X, Clock, BedDouble, User, Calendar, CreditCard, FileText, Trash2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface BookingRequest {
  id: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  created_at: string;
  room: {
    number: string;
    room_type: string;
    daily_rate: number;
  };
}

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  async function fetchBookingRequests() {
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          room:rooms(number, room_type, daily_rate)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      setError('Erro ao carregar solicitações de reserva');
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Create booking first
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          room_id: request.room_id,
          check_in_date: request.check_in_date,
          check_out_date: request.check_out_date,
          guest_name: request.guest_name,
          guest_email: request.guest_email,
          guest_phone: request.guest_phone,
          status: 'confirmed',
          total_amount: request.room.daily_rate,
          booking_request_id: requestId,
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Then update request status
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast.success('Reserva aprovada com sucesso');
      fetchBookingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Erro ao aprovar reserva');
    }
  }

  async function handleReject(requestId: string) {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Solicitação rejeitada com sucesso');
      fetchBookingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  }

  async function handleDelete(requestId: string) {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;

    setDeleting(requestId);
    try {
      const { error } = await supabase
        .from('booking_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.filter(request => request.id !== requestId));
      setSelectedRequest(null);
      toast.success('Solicitação excluída com sucesso');
    } catch (error) {
      console.error('Error deleting booking request:', error);
      toast.error('Erro ao excluir solicitação');
    } finally {
      setDeleting(null);
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <Navigation title="Solicitações de Reserva" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Solicitações Pendentes</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Total: {requests.length}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedRequest?.id === request.id ? 'border-primary' : 'border-gray-200'
                    }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{request.guest_name}</h3>
                      <p className="text-sm text-gray-500">{request.guest_email}</p>
                      <p className="text-sm text-gray-500">{request.guest_phone}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Quarto {request.room.number} - {request.room.room_type}
                      </p>
                      <div className="flex items-center mt-1 space-x-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(request.check_in_date), "dd/MM/yyyy")} até{' '}
                          {format(new Date(request.check_out_date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)
                          }`}
                      >
                        {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {request.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                        {request.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                        {request.status === 'pending' && 'Pendente'}
                        {request.status === 'approved' && 'Aprovado'}
                        {request.status === 'rejected' && 'Rejeitado'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma solicitação de reserva pendente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white rounded-xl shadow-lg h-fit sticky top-6">
          {selectedRequest ? (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Detalhes da Solicitação</h3>

              <div className="space-y-6">
                {/* Guest Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedRequest.guest_name}</p>
                      <p className="text-sm text-gray-500">Hóspede</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-gray-600">{selectedRequest.guest_email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-gray-600">{selectedRequest.guest_phone}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BedDouble className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Quarto {selectedRequest.room.number}</p>
                      <p className="text-sm text-gray-500 capitalize">{selectedRequest.room.room_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {format(new Date(selectedRequest.check_in_date), "dd 'de' MMMM", { locale: ptBR })} até{' '}
                        {format(new Date(selectedRequest.check_out_date), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-gray-500">Período da estadia</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(selectedRequest.room.daily_rate)}
                      </p>
                      <p className="text-sm text-gray-500">Diária</p>
                    </div>
                  </div>

                  {selectedRequest.notes && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Observações</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedRequest.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex gap-3">
                    {selectedRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(selectedRequest.id)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(selectedRequest.id)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rejeitar
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(selectedRequest.id)}
                      disabled={deleting === selectedRequest.id}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === selectedRequest.id ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Selecione uma solicitação para ver os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}