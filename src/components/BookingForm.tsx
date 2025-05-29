import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Calendar, X, MapPin, CreditCard, Hash, Home, Building } from 'lucide-react';
import { toast } from 'sonner';

interface BookingFormProps {
  roomId: string;
  roomNumber: string;
  selectedDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingForm({ roomId, roomNumber, selectedDate, onClose, onSuccess }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    cpf: '',
    birthDate: '',
    email: '',
    street: '',
    streetNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    additionalBeds: 0,
    checkIn: format(selectedDate, 'yyyy-MM-dd'),
    checkOut: format(selectedDate, 'yyyy-MM-dd'),
    numberOfDays: 1,
    depositAmount: '',
    depositDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'pix',
    amountToReceive: '',
    amountReceived: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error('Você precisa estar logado para agendar');
        return;
      }

      // Create booking request
      const { error: bookingError } = await supabase
        .from('booking_requests')
        .insert([{
          room_id: roomId,
          guest_name: formData.guestName,
          guest_email: formData.email,
          guest_phone: formData.phone,
          check_in_date: formData.checkIn,
          check_out_date: formData.checkOut,
          status: 'pending',
          notes: formData.notes
        }]);

      if (bookingError) throw bookingError;

      toast.success('Agendamento realizado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Formulário de Reserva</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quarto {roomNumber}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações do Hóspede */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Hóspede</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.guestName}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="Nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CPF
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data de Nascimento
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Rua
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="Nome da rua"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.streetNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, streetNumber: e.target.value }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    placeholder="Número"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bairro
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Home className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.neighborhood}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="Bairro"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cidade
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="Cidade"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CEP
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informações da Reserva */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Reserva</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Check-in
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Check-out
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantidade de Diárias
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.numberOfDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfDays: parseInt(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valor do Depósito
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.depositAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data do Depósito
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.depositDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositDate: e.target.value }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  >
                    <option value="credit">Crédito</option>
                    <option value="debit">Débito</option>
                    <option value="cash">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Camas Adicionais
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.additionalBeds}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalBeds: parseInt(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="secondary-button px-6"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="primary-button px-6"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}