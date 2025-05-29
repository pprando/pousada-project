import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { BedDouble } from 'lucide-react';


interface FormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestDocument: string;
  guestAddress: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  paymentMethod: string;
  specialRequests: string;
}

export default function BookingRequestForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoom] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestDocument: '',
    guestAddress: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    paymentMethod: '',
    specialRequests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('booking_requests')
        .insert([{
          room_id: selectedRoom,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          check_in_date: formData.checkInDate,
          check_out_date: formData.checkOutDate,
          status: 'pending',
          notes: formData.specialRequests,
        }]);

      if (error) throw error;
      navigate('/bookings/requests');
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      setError('Erro ao enviar solicitação de reserva');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Navigation title="Nova Solicitação de Reserva" />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Dados Pessoais */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-primary" />
                  Dados Pessoais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      name="guestName"
                      required
                      value={formData.guestName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestDocument" className="block text-sm font-medium text-gray-700">
                      CPF
                    </label>
                    <input
                      type="text"
                      id="guestDocument"
                      name="guestDocument"
                      required
                      value={formData.guestDocument}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="guestEmail"
                      name="guestEmail"
                      required
                      value={formData.guestEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="guestPhone"
                      name="guestPhone"
                      required
                      value={formData.guestPhone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="guestAddress" className="block text-sm font-medium text-gray-700">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      id="guestAddress"
                      name="guestAddress"
                      required
                      value={formData.guestAddress}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Reserva */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-primary" />
                  Dados da Reserva
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700">
                      Data de Check-in
                    </label>
                    <input
                      type="date"
                      id="checkInDate"
                      name="checkInDate"
                      required
                      value={formData.checkInDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700">
                      Data de Check-out
                    </label>
                    <input
                      type="date"
                      id="checkOutDate"
                      name="checkOutDate"
                      required
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700">
                      Número de Hóspedes
                    </label>
                    <input
                      type="number"
                      id="numberOfGuests"
                      name="numberOfGuests"
                      min="1"
                      required
                      value={formData.numberOfGuests}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                      Forma de Pagamento
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      required
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="debit_card">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                      <option value="cash">Dinheiro</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                      Solicitações Especiais
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      rows={4}
                      value={formData.specialRequests}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="Ex: Quarto silencioso, berço para bebê, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="secondary-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}