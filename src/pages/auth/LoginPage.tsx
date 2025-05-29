import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First sign in the user
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Get user's pousada name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('pousada_name')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // If no pousada name is set, update it
      if (!userData?.pousada_name) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ pousada_name: `Pousada ${user?.email?.split('@')[0]}` })
          .eq('id', user?.id);

        if (updateError) throw updateError;
      }

      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4ee] via-[#f5eee4] to-[#f2e8dd] flex flex-col font-roboto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-100/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              opacity: Math.random() * 0.4 + 0.1,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
            }}
          />
        ))}
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-gray-800 px-4 lg:px-8">
            <div className="relative inline-block">
              <h1 className="text-7xl font-bold tracking-tight md:text-7xl leading-tight">
                Bem-vindo
                <br />
                de{" "}
                <span className="relative">
                  <ArrowRight className="inline h-10 w-10 md:h-12 md:w-12 text-black animate-float transition-transform duration-1000" />
                  <span className="absolute -left-1 -top-1 h-14 w-14 md:h-16 md:w-16 rounded-full"></span>
                </span>
                <span className="relative inline-block ml-2">
                  <span className="absolute -left-3 -top-1 h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-r from-purple-300 to-purple-300 animate-pulse-slow opacity-80"></span>
                  <span className="relative text-black">volta</span>
                </span>
              </h1>
              <div className="absolute -bottom-3 left-0 h-1 w-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </div>
            <p className="mt-6 text-lg text-gray-700 max-w-md leading-relaxed">
              Entre no seu painel para gerenciar agendamentos e elevar sua experiência hoteleira
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-12 rounded-xl shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-400/10 filter blur-3xl"></div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-10 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-400 bg-white/80 shadow-sm hover:shadow-md"
                      placeholder="seu@email.com"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Senha
                    </label>
                    <button
                      type="button"
                      className="text-xs text-purple-600 hover:text-purple-800 transition-colors duration-200 flex items-center"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-10 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-400 bg-white/80 shadow-sm hover:shadow-md"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors duration-200 p-1.5 rounded-lg hover:bg-purple-50"
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="stroke-1.5" />
                      ) : (
                        <Eye size={20} className="stroke-1.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-600 text-white hover:from-purple-700 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-400 py-4 rounded-xl font-medium tracking-wide relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <span>Acessar minha conta</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </form>

            <div className="mt-8 text-center relative">
              <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200/80 -z-0"></div>
              <p className="text-sm text-gray-600 inline-block bg-white/95 px-3 relative">
                Novo por aqui?{" "}
                <button
                  onClick={() => navigate('/register')}
                  className="font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200 group"
                >
                  Criar conta
                  <span className="block h-0.5 bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}