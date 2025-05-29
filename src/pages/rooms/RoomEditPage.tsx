import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';

interface Room {
  id: string;
  number: string;
  room_type: string;
  daily_rate: number;
  features: string[];
  notes: string;
  image_url: string | null;
  is_active: boolean;
}

export default function RoomEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoom();
  }, [id]);

  async function fetchRoom() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setRoom(data);
      }
    } catch (error) {
      setError('Erro ao carregar quarto');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!room) throw new Error('Room data is missing');

      const { error } = await supabase
        .from('rooms')
        .update({
          number: room.number,
          room_type: room.room_type,
          daily_rate: room.daily_rate,
          features: room.features,
          notes: room.notes,
          image_url: room.image_url,
          is_active: room.is_active
        })
        .eq('id', id);

      if (error) throw error;
      navigate('/rooms/list');
    } catch (error) {
      setError('Erro ao atualizar quarto');
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Quarto não encontrado</h2>
          <button
            onClick={() => navigate('/rooms/list')}
            className="mt-4 text-primary hover:text-primary/80"
          >
            Voltar para lista de quartos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <Navigation title="Editar Quarto" />
            <button
              onClick={() => navigate('/rooms/list')}
              className="text-primary hover:text-primary/80"
            >
              Voltar para Quartos
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                  Número do Quarto
                </label>
                <input
                  type="text"
                  id="number"
                  required
                  value={room.number}
                  onChange={(e) => setRoom({ ...room, number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                  value={room.room_type}
                  onChange={(e) => setRoom({ ...room, room_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                    value={room.daily_rate}
                    onChange={(e) => setRoom({ ...room, daily_rate: parseFloat(e.target.value) })}
                    className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                  value={room.features.join(', ')}
                  onChange={(e) => setRoom({ ...room, features: e.target.value.split(',').map(f => f.trim()) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={room.image_url || ''}
                  onChange={(e) => setRoom({ ...room, image_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={room.notes || ''}
                  onChange={(e) => setRoom({ ...room, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={room.is_active}
                  onChange={(e) => setRoom({ ...room, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Quarto Ativo
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}