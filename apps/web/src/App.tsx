import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AuditEventsPage from './pages/AuditEventsPage';
import CadastrosPage from './pages/CadastrosPage';
import ClientsPage from './pages/ClientsPage';
import ItemsPage from './pages/ItemsPage';
import MonitoringPage from './pages/MonitoringPage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import TransportTypesPage from './pages/TransportTypesPage';
import './index.css';

const heroImages = [
  '/images/hero-logistics-1.jpg',
  '/images/hero-logistics-2.jpg',
  '/images/hero-logistics-3.jpg',
];

function Dashboard() {
  const dashboardCards = [
    {
      to: '/sales-orders',
      title: 'Ordens de venda',
      description: 'Crie ordens, avance etapas, altere transporte autorizado e acompanhe o ciclo completo da operação.',
      icon: '📦',
    },
    {
      to: '/monitoring',
      title: 'Monitoramento operacional',
      description: 'Visualize totais e distribuição por status, cliente, transporte e data para tomada de decisão.',
      icon: '📊',
    },
    {
      to: '/cadastros',
      title: 'Cadastros',
      description: 'Gerencie clientes, tipos de transporte e itens usados na composição das ordens de venda.',
      icon: '🏢',
    },
    {
      to: '/audit',
      title: 'Auditoria',
      description: 'Acompanhe os eventos registrados em criações, status, transportes e agendamentos.',
      icon: '🔎',
    },
  ];
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentHeroImage((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <h1>Sistema de Gestão de Ordens de Venda</h1>
          <p>
            O OVGS centraliza o controle de ordens de venda no ciclo logístico, validando cliente, transporte autorizado,
            itens, status, janelas de atendimento e registros de auditoria para dar previsibilidade às operações de entrega.
          </p>
        </div>

        <div className="hero-carousel" aria-label="Imagens relacionadas à gestão logística">
          {heroImages.map((imageUrl, index) => (
            <img
              key={imageUrl}
              className={`hero-slide ${index === currentHeroImage ? 'active' : ''}`}
              src={imageUrl}
              alt={`Cenário logístico relacionado à gestão de ordens de venda ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
          <div className="hero-carousel-overlay" />
          <div className="hero-carousel-caption">
            <span>Operações logísticas integradas</span>
            <strong>Controle ponta a ponta</strong>
          </div>
          <div className="hero-carousel-dots" aria-label="Alternar imagem do carousel">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === currentHeroImage ? 'active' : ''}
                onClick={() => setCurrentHeroImage(index)}
                aria-label={`Ver imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Funcionalidades principais">
        {dashboardCards.map((card) => (
          <Link key={card.to} className="dashboard-card" to={card.to}>
            <span className="dashboard-card-icon" aria-hidden="true">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span className="dashboard-card-action">Acessar</span>
          </Link>
        ))}
      </section>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="sales-orders" element={<SalesOrdersPage />} />
        <Route path="cadastros" element={<CadastrosPage />}>
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="itens" element={<ItemsPage />} />
          <Route path="transportes" element={<TransportTypesPage />} />
        </Route>
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="audit" element={<AuditEventsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
