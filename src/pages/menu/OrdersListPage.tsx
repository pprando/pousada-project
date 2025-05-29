import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { Clock, Check, X, Coffee, User, Calendar, CreditCard, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Order {
  id: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
  }[];
  total: number;
  status: string;
  created_at: string;
  created_by: string;
  room_number: string;
  guest_name: string;
  user: {
    name: string;
  };
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Status atualizado com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status');
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    setDeleting(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.filter(order => order.id !== orderId));
      setSelectedOrder(null);
      toast.success('Pedido excluído com sucesso');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido');
    } finally {
      setDeleting(null);
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
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
      <Navigation title="Pedidos" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Lista de Pedidos</h2>
              <span className="text-sm text-gray-500">
                Total: {orders.length} pedidos
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedOrder?.id === order.id ? 'border-primary' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Coffee className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Pedido #{order.id.slice(0, 8)}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.items.length} itens • Total: {
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(order.total)
                        }
                      </p>
                      {order.room_number && (
                        <p className="text-sm text-gray-500">
                          Quarto {order.room_number} • {order.guest_name}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusBadgeColor(order.status)
                        }`}
                      >
                        {order.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {order.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                        {order.status === 'cancelled' && <X className="h-3 w-3 mr-1" />}
                        {order.status === 'pending' && 'Pendente'}
                        {order.status === 'completed' && 'Concluído'}
                        {order.status === 'cancelled' && 'Cancelado'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhum pedido encontrado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6">
          {selectedOrder ? (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Detalhes do Pedido</h3>
              
              <div className="space-y-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedOrder.user.name}</p>
                      <p className="text-sm text-gray-500">Atendente</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-gray-500">Data do pedido</p>
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
                        }).format(selectedOrder.total)}
                      </p>
                      <p className="text-sm text-gray-500">Total do pedido</p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium mb-4">Itens do Pedido</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex gap-3">
                    {selectedOrder.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Concluir
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(selectedOrder.id)}
                      disabled={deleting === selectedOrder.id}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === selectedOrder.id ? (
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
              Selecione um pedido para ver os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}