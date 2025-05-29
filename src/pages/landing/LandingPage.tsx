import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroDashboard from '@/components/HeroDashboard';
import { Calendar, Users, CreditCard, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-moss" />,
      title: 'Gestão de Reservas',
      description: 'Sistema completo para gerenciar reservas, check-ins e check-outs.',
    },
    {
      icon: <Users className="h-6 w-6 text-moss" />,
      title: 'Cadastro de Hóspedes',
      description: 'Mantenha um histórico completo dos seus hóspedes e preferências.',
    },
    {
      icon: <CreditCard className="h-6 w-6 text-moss" />,
      title: 'Controle Financeiro',
      description: 'Acompanhe pagamentos, despesas e gere relatórios detalhados.',
    },
    {
      icon: <Shield className="h-6 w-6 text-moss" />,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com a mais alta tecnologia em segurança.',
    },
  ];

  const benefits = [
    'Aumente a taxa de ocupação',
    'Reduza custos operacionais',
    'Melhore a satisfação dos hóspedes',
    'Automatize processos manuais',
    'Tenha controle total do seu negócio',
    'Tome decisões baseadas em dados',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-moss via-sage to-sand">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            {/* <Building2 className="h-8 w-8 text-moss" /> */}
            <span className="text-xl font-bold text-black">InnScheduler</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-black hover:text-moss">Funcionalidades</a>
            <a href="#pricing" className="text-black hover:text-moss">Preços</a>
            <a href="#contact" className="text-black hover:text-moss">Contato</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-black hover:text-moss"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-moss text-black hover:bg-moss/90 px-4 py-2 rounded-lg transition-colors"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl md:text-6xl">
                <span className="block">Sistema completo para</span>
                <span className="block text-moss">gestão de pousadas</span>
              </h1>
              <p className="mt-6 text-lg text-black">
                Simplifique a administração da sua pousada com nossa plataforma all-in-one.
                Gerencie reservas, hóspedes e pagamentos em um só lugar.
              </p>
              <div className="mt-8">
                <form className="sm:flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="w-full rounded-lg border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-moss focus:ring-moss sm:max-w-xs"
                  />
                  <div className="mt-3 rounded-lg sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-lg bg-moss px-4 py-3 font-medium text-black hover:bg-moss/90 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
                    >
                      Teste Grátis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </form>
                <p className="mt-3 text-sm text-black">
                  14 dias grátis, sem necessidade de cartão de crédito.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <HeroDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-black">
              Nossa plataforma foi desenvolvida pensando nas necessidades específicas de pousadas.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-black">{feature.title}</h3>
                <p className="text-black">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                Por que escolher nossa plataforma?
              </h2>
              <p className="mt-4 text-black">
                Desenvolvida especialmente para pousadas, nossa solução oferece tudo que você precisa
                para crescer seu negócio.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-moss" />
                    <span className="text-black">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"
                alt="Pousada"
                className="rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-moss/10 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-moss py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Comece a transformar sua pousada hoje
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-black">
              Junte-se a centenas de pousadas que já estão usando nossa plataforma para crescer seus negócios.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate('/register')}
                className="rounded-lg bg-white px-6 py-3 font-medium text-moss hover:bg-white/90"
              >
                Começar Agora
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="rounded-lg border border-white px-6 py-3 font-medium text-black hover:bg-white/10"
              >
                Falar com Consultor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-black">Produto</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#features" className="text-black hover:text-moss">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-black hover:text-moss">
                    Preços
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black">Empresa</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#about" className="text-black hover:text-moss">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-black hover:text-moss">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#privacy" className="text-black hover:text-moss">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-black hover:text-moss">
                    Termos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black">Redes Sociais</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#linkedin" className="text-black hover:text-moss">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#instagram" className="text-black hover:text-moss">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="text-center text-sm text-black">
              © 2025 InnScheduler. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}