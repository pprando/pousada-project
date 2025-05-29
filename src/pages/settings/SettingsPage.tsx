import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { Bell, Mail, Lock, Globe, CreditCard, Shield, User, Phone, Loader2, Moon, Sun, QrCode, Wallet, Receipt, BellRing, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UserSettings {
  id: string;
  name: string;
  email: string;
  phone: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  language: string;
  theme: string;
  default_payment_method?: string;
  payment_receipts_email?: boolean;
  payment_reminders?: boolean;
  auto_apply_discounts?: boolean;
  currency?: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  async function fetchUserSettings() {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) {
        navigate('/login');
        return;
      }

      // Get user settings
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, name, email, phone, notifications_email, notifications_push, notifications_sms, language, theme')
        .eq('id', user.id)
        .maybeSingle();

      if (dbError) throw dbError;
      
      if (!data) {
        // If no settings found, use default values without trying to create a new user
        setUserSettings({
          id: user.id,
          name: user.user_metadata.name || '',
          email: user.email || '',
          phone: user.user_metadata.phone || '',
          notifications_email: true,
          notifications_push: false,
          notifications_sms: true,
          language: 'pt-BR',
          theme: 'light'
        });
        toast.warning('Configurações padrão carregadas');
      } else {
        setUserSettings(data);
      }

      setError('');
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      setError(error.message || 'Erro ao carregar configurações');
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!userSettings) return;

    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          notifications_email: userSettings.notifications_email,
          notifications_push: userSettings.notifications_push,
          notifications_sms: userSettings.notifications_sms,
          language: userSettings.language,
          theme: userSettings.theme,
        })
        .eq('id', userSettings.id);

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
      await fetchUserSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Erro ao salvar configurações');
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificações por Email</p>
                  <p className="text-sm text-gray-500">
                    Receba atualizações em {userSettings?.email}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userSettings?.notifications_email}
                  onChange={(e) => setUserSettings(prev => prev ? {
                    ...prev,
                    notifications_email: e.target.checked
                  } : null)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificações Push</p>
                  <p className="text-sm text-gray-500">Receba notificações no navegador</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userSettings?.notifications_push}
                  onChange={(e) => setUserSettings(prev => prev ? {
                    ...prev,
                    notifications_push: e.target.checked
                  } : null)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificações SMS</p>
                  <p className="text-sm text-gray-500">
                    Receba notificações em {userSettings?.phone}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={userSettings?.notifications_sms}
                  onChange={(e) => setUserSettings(prev => prev ? {
                    ...prev,
                    notifications_sms: e.target.checked
                  } : null)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={userSettings?.name || ''}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={userSettings?.email || ''}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  value={userSettings?.phone || ''}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  disabled
                />
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
              <select
                value={userSettings?.language || 'pt-BR'}
                onChange={(e) => setUserSettings(prev => prev ? {
                  ...prev,
                  language: e.target.value
                } : null)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setUserSettings(prev => prev ? {
                    ...prev,
                    theme: 'light'
                  } : null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    userSettings?.theme === 'light'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Sun className="h-5 w-5" />
                  <span>Claro</span>
                </button>
                <button
                  onClick={() => setUserSettings(prev => prev ? {
                    ...prev,
                    theme: 'dark'
                  } : null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    userSettings?.theme === 'dark'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  <span>Escuro</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            {/* Default Payment Method */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Método de Pagamento Padrão</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setUserSettings(prev => prev ? {
                    ...prev,
                    default_payment_method: 'credit'
                  } : null)}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    userSettings?.default_payment_method === 'credit'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Cartão de Crédito</p>
                    <p className="text-sm text-gray-500">Parcelamento em até 12x</p>
                  </div>
                </button>

                <button
                  onClick={() => setUserSettings(prev => prev ? {
                    ...prev,
                    default_payment_method: 'pix'
                  } : null)}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    userSettings?.default_payment_method === 'pix'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">PIX</p>
                    <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                  </div>
                </button>

                <button
                  onClick={() => setUserSettings(prev => prev ? {
                    ...prev,
                    default_payment_method: 'cash'
                  } : null)}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    userSettings?.default_payment_method === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Dinheiro</p>
                    <p className="text-sm text-gray-500">Pagamento na recepção</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Preferences */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Preferências de Pagamento</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Recibos por Email</p>
                      <p className="text-sm text-gray-500">Receba comprovantes automaticamente</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={userSettings?.payment_receipts_email}
                      onChange={(e) => setUserSettings(prev => prev ? {
                        ...prev,
                        payment_receipts_email: e.target.checked
                      } : null)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BellRing className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Lembretes de Pagamento</p>
                      <p className="text-sm text-gray-500">Notificações de vencimento</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={userSettings?.payment_reminders}
                      onChange={(e) => setUserSettings(prev => prev ? {
                        ...prev,
                        payment_reminders: e.target.checked
                      } : null)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Descontos Automáticos</p>
                      <p className="text-sm text-gray-500">Aplicar descontos disponíveis</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={userSettings?.auto_apply_discounts}
                      onChange={(e) => setUserSettings(prev => prev ? {
                        ...prev,
                        auto_apply_discounts: e.target.checked
                      } : null)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Currency Preferences */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Moeda</h3>
              <select
                value={userSettings?.currency || 'BRL'}
                onChange={(e) => setUserSettings(prev => prev ? {
                  ...prev,
                  currency: e.target.value
                } : null)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Esta é a moeda que será exibida em todos os valores
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            Em desenvolvimento
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Navigation title="Configurações" />

      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          {[
            { id: 'notifications', icon: <Bell className="h-5 w-5" />, label: 'Notificações' },
            { id: 'profile', icon: <User className="h-5 w-5" />, label: 'Perfil' },
            { id: 'security', icon: <Lock className="h-5 w-5" />, label: 'Segurança' },
            { id: 'language', icon: <Globe className="h-5 w-5" />, label: 'Idioma e Tema' },
            { id: 'payments', icon: <CreditCard className="h-5 w-5" />, label: 'Pagamentos' },
            { id: 'privacy', icon: <Shield className="h-5 w-5" />, label: 'Privacidade' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                activeTab === item.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-primary hover:bg-primary/10'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                {activeTab === 'notifications' && <Bell className="h-6 w-6 text-primary" />}
                {activeTab === 'profile' && <User className="h-6 w-6 text-primary" />}
                {activeTab === 'security' && <Lock className="h-6 w-6 text-primary" />}
                {activeTab === 'language' && <Globe className="h-6 w-6 text-primary" />}
                {activeTab === 'payments' && <CreditCard className="h-6 w-6 text-primary" />}
                {activeTab === 'privacy' && <Shield className="h-6 w-6 text-primary" />}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'notifications' && 'Notificações'}
                {activeTab === 'profile' && 'Perfil'}
                {activeTab === 'security' && 'Segurança'}
                {activeTab === 'language' && 'Idioma e Tema'}
                {activeTab === 'payments' && 'Pagamentos'}
                {activeTab === 'privacy' && 'Privacidade'}
              </h2>
            </div>

            {renderContent()}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="primary-button"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </div>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}