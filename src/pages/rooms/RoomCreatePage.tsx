import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navigation from '../../components/Navigation';
import { toast } from 'sonner';

export default function RoomCreatePage() {
  const navigate = useNavigate();
  const [number, setNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [features, setFeatures] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if room number already exists
      const { data: existingRoom } = await supabase
        .from('rooms')
        .select('number')
        .eq('number', number)
        .single();

      if (existingRoom) {
        toast.error(`O quarto ${number} já existe. Por favor, escolha outro número.`);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('rooms')
        .insert([{
          number,
          room_type: roomType,
          daily_rate: parseFloat(dailyRate),
          features: features.split(',').map(f => f.trim()).filter(f => f),
          notes,
        }]);

      if (insertError) {
        console.error('Error creating room:', insertError);
        toast.error('Erro ao criar quarto. Por favor, tente novamente.');
        return;
      }

      toast.success('Quarto criado com sucesso!');
      navigate('/rooms/list');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar quarto. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <Navigation title="Criar Quarto" />
            <button
              onClick={() => navigate('/rooms/list')}
              className="text-primary hover:text-primary/80"
            >
              Voltar para Quartos
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                  Número do Quarto
                </label>
                <input
                  type="text"
                  id="number"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Ex: 101"
                />
              </div>

              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
                  Tipo de Quarto
                </label>
                <input
                  type="text"
                  id="roomType"
                  required
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  placeholder="Ex: Chalé, Quarto com Ar Condicionado, Suite Master..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700">
                  Diária
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    id="dailyRate"
                    required
                    min="0"
                    step="0.01"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    className="mt-1 block w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="features" className="block text-sm font-medium text-gray-700">
                  Comodidades (separadas por vírgula)
                </label>
                <input
                  type="text"
                  id="features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Wi-Fi, TV, Ar Condicionado"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Ex: Wi-Fi, TV, Ar Condicionado, Frigobar
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Observações adicionais sobre o quarto..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/rooms/list')}
                  className="secondary-button px-4"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button px-4"
                >
                  {loading ? 'Criando...' : 'Criar Quarto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}