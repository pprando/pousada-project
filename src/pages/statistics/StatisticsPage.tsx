import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, BedDouble, CreditCard } from 'lucide-react';

interface Stats {
  totalBookings: number;
  totalGuests: number;
  totalRevenue: number;
  occupancyRate: number;
  monthlyData: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalGuests: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  async function fetchStatistics() {
    try {
      // Fetch bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*');

      // Fetch rooms
      const { data: rooms } = await supabase
        .from('rooms')
        .select('*');

      // Calculate statistics
      const totalBookings = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;
      const occupancyRate = rooms?.length ? (totalBookings / rooms.length) * 100 : 0;

      // Generate monthly data
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('pt-BR', { month: 'short' });
        
        const monthBookings = bookings?.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getMonth() === date.getMonth() &&
                 bookingDate.getFullYear() === date.getFullYear();
        });

        return {
          month,
          bookings: monthBookings?.length || 0,
          revenue: monthBookings?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0,
        };
      }).reverse();

      setStats({
        totalBookings,
        totalGuests: totalBookings, // Assuming 1 guest per booking for simplicity
        totalRevenue,
        occupancyRate,
        monthlyData,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Navigation title="Estatísticas" />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Reservas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Hóspedes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BedDouble className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.occupancyRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Reservas por Mês</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="hsl(221.2 83.2% 53.3%)" name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Receita por Mês</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(221.2 83.2% 53.3%)"
                  name="Receita"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}