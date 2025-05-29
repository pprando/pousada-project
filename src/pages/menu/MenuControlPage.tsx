import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { Coffee, Wine, Soup, Cookie, Check, Plus, BedDouble, User } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

interface Room {
  number: string;
  guest_name: string | null;
}

interface OrderSummary {
  items: MenuItem[];
  total: number;
  roomNumber?: string;
  guestName?: string;
}

const menuItems: Record<string, MenuItem[]> = {
  porcoes: [
    { id: 'p1', name: 'Batata Frita 500gr', price: 45.90, category: 'porcoes' },
    { id: 'p2', name: 'Bolinho de Bacalhau (12 unid)', price: 55.90, category: 'porcoes' },
    { id: 'p3', name: 'Bolinho de Queijo (12 unid)', price: 45.90, category: 'porcoes' },
    { id: 'p4', name: 'Carne de Sol 400gr', price: 65.90, category: 'porcoes' },
    { id: 'p5', name: 'Frango à Passarinho 500gr', price: 45.90, category: 'porcoes' },
    { id: 'p6', name: 'Filé de Frango 500gr', price: 45.90, category: 'porcoes' },
  ],
  caldos: [
    { id: 'c1', name: 'Caldo de Abóbora 400 ml', price: 45.90, category: 'caldos' },
    { id: 'c2', name: 'Caldo de Feijão com Costela 400 ml', price: 45.90, category: 'caldos' },
    { id: 'c3', name: 'Caldo Verde 400 ml', price: 45.90, category: 'caldos' },
  ],
  bebidas: [
    { id: 'b1', name: 'Água sem Gás 500ml', price: 4.90, category: 'bebidas' },
    { id: 'b2', name: 'Água com Gás 500ml', price: 5.90, category: 'bebidas' },
    { id: 'b3', name: 'Coca Cola Zero Lata', price: 5.90, category: 'bebidas' },
    { id: 'b4', name: 'Guaraná Antarctica Lata', price: 5.90, category: 'bebidas' },
  ],
  vinhos: [
    { id: 'v1', name: 'VH Cabernet Sauvignon', price: 89.90, category: 'vinhos' },
    { id: 'v2', name: 'VH Chardonnay', price: 89.90, category: 'vinhos' },
    { id: 'v3', name: 'VH Merlot', price: 89.90, category: 'vinhos' },
  ],
};

export default function MenuControlPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderSummary>({
    items: [],
    total: 0
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [clickedItems, setClickedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchOccupiedRooms();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.session.user.id)
        .maybeSingle();

      if (userError || !userData) {
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/login');
    }
  };

  const fetchOccupiedRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          room_id,
          guest_name,
          room:rooms(number)
        `)
        .eq('status', 'confirmed');

      if (error) throw error;

      const occupiedRooms = data
        .filter(booking => booking.room)
        .map(booking => ({
          number: booking.room[0]
          .number,
          guest_name: booking.guest_name
        }));

      setRooms(occupiedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Erro ao carregar quartos ocupados');
    }
  };

  const handleAddItem = (item: MenuItem) => {
    if (!selectedRoom) {
      toast.error('Selecione um quarto primeiro');
      return;
    }

    setClickedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setClickedItems(prev => ({ ...prev, [item.id]: false }));
    }, 500);

    setOrder(prev => {
      const existingItem = prev.items.find(i => i.id === item.id);

      if (existingItem) {
        toast.success(`${item.name} (${existingItem.quantity! + 1}x)`);
        return {
          ...prev,
          items: prev.items.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity! + 1 }
              : i
          ),
          total: prev.total + item.price
        };
      }

      toast.success(`${item.name} adicionado`);
      return {
        ...prev,
        items: [...prev.items, { ...item, quantity: 1 }],
        total: prev.total + item.price
      };
    });
  };

  const handleRemoveItem = (itemId: string, price: number, name: string) => {
    setOrder(prev => {
      const item = prev.items.find(i => i.id === itemId);
      if (item && item.quantity === 1) {
        toast.error(`${name} removido`);
      }

      return {
        ...prev,
        items: prev.items
          .map(item =>
            item.id === itemId && item.quantity! > 0
              ? { ...item, quantity: item.quantity! - 1 }
              : item
          )
          .filter(item => item.quantity! > 0),
        total: prev.total - price
      };
    });
  };

  const handleRoomSelect = (roomNumber: string) => {
    const room = rooms.find(r => r.number === roomNumber);
    if (!room) {
      toast.error('Quarto não encontrado');
      return;
    }

    setSelectedRoom(roomNumber);
    setGuestName(room.guest_name || '');
    setOrder(prev => ({
      ...prev,
      roomNumber,
      guestName: room.guest_name || ''
    }));

    toast.success(`Quarto ${roomNumber} selecionado`);
  };

  const handleSubmitOrder = async () => {
    if (!selectedRoom) {
      toast.error('Selecione um quarto');
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.session.user.id)
        .maybeSingle();

      if (userError || !userData) {
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      const { error: insertError } = await supabase
        .from('orders')
        .insert([{
          items: order.items,
          total: order.total,
          created_by: userData.id,
          status: 'pending',
          room_number: selectedRoom,
          guest_name: guestName
        }]);

      if (insertError) {
        console.error('Error inserting order:', insertError);
        toast.error('Erro ao registrar pedido');
        return;
      }

      setOrder({ items: [], total: 0 });
      setSelectedRoom('');
      setGuestName('');
      toast.success('Pedido registrado com sucesso!');

      navigate('/menu/orders');
    } catch (error) {
      console.error('Erro ao registrar pedido:', error);
      toast.error('Erro ao registrar pedido');
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-gray-500">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(item.price)}
        </p>
      </div>
      <button
        onClick={() => handleAddItem(item)}
        className={`p-2 rounded-lg transition-all transform ${
          clickedItems[item.id]
            ? 'bg-primary text-white scale-90'
            : 'text-primary hover:bg-primary/10'
        }`}
      >
        {clickedItems[item.id] ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-moss via-sage to-sand flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-moss via-sage to-sand">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Navigation title="Controle de Cardápio" />

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            <div className="space-y-6">
              {/* Room Selection */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <BedDouble className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Selecione o Quarto</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {rooms.map((room) => (
                    <button
                      key={room.number}
                      onClick={() => handleRoomSelect(room.number)}
                      className={`p-4 rounded-xl border transition-colors ${
                        selectedRoom === room.number
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-medium text-lg">Quarto {room.number}</p>
                        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>{room.guest_name}</span>
                        </div>
                      </div>
                    </button>
                  ))}

                  {rooms.length === 0 && (
                    <div className="col-span-full text-center py-4 text-gray-500">
                      Nenhum quarto ocupado no momento
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Soup className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Porções</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.porcoes.map(item => renderMenuItem(item))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Coffee className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Caldos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.caldos.map(item => renderMenuItem(item))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Cookie className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Bebidas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.bebidas.map(item => renderMenuItem(item))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Wine className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Vinhos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.vinhos.map(item => renderMenuItem(item))}
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-6 self-start">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)]">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-6">Resumo do Pedido</h2>
                  {selectedRoom && (
                    <div className="mb-4 p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Quarto {selectedRoom}</p>
                          <p className="text-sm text-gray-500">{guestName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-6">
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemoveItem(item.id, item.price, item.name)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            -
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}

                    {order.items.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Nenhum item selecionado
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(order.total)}
                    </span>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={order.items.length === 0 || !selectedRoom}
                    className="w-full primary-button disabled:opacity-50"
                  >
                    Registrar Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}