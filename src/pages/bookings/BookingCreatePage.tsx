import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get the booking request details
      const { data: request, error: requestError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            room_id: request.room_id,
            check_in_date: request.check_in_date,
            check_out_date: request.check_out_date,
            guest_name: request.guest_name,
            guest_email: request.guest_email,
            guest_phone: request.guest_phone,
            status: 'confirmed',
            booking_request_id: requestId,
            deposit_amount: parseFloat(paymentAmount),
            payment_status: 'pending',
            total_amount: 0, // Calculate based on daily rate and stay duration
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create the payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            booking_id: booking.id,
            amount: parseFloat(paymentAmount),
            payment_method: paymentMethod,
            status: 'pending',
          },
        ]);

      if (paymentError) throw paymentError;

      // Update the booking request status
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({ status: 'completed' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      navigate('/bookings/requests');
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Navigation title="Criar Reserva" />

          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
                  Valor do Pagamento (Entrada 50%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    id="paymentAmount"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  Forma de Pagamento
                </label>
                <select
                  id="paymentMethod"
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Selecione uma forma de pagamento</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Criando reserva...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}