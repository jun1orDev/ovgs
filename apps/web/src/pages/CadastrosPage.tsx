import { Link, Outlet, useLocation } from 'react-router-dom';

const cadastroCards = [
  {
    to: '/cadastros/clientes',
    title: 'Clientes',
    description: 'Cadastre clientes e autorize os tipos de transporte permitidos para criação de ordens.',
    icon: '🏢',
  },
  {
    to: '/cadastros/itens',
    title: 'Itens',
    description: 'Gerencie produtos ou itens disponíveis para compor as ordens de venda.',
    icon: '📦',
  },
  {
    to: '/cadastros/transportes',
    title: 'Transportes',
    description: 'Defina os tipos de transporte disponíveis na operação logística.',
    icon: '🚚',
  },
];

export default function CadastrosPage() {
  const location = useLocation();
  const isCadastroRoot = location.pathname === '/cadastros';

  return (
    <section className="page-shell">
      {isCadastroRoot ? (
        <div className="section-heading">
          <h1>Cadastros</h1>
          <p>Gerencie clientes, itens e tipos de transporte usados na composição e autorização das ordens de venda.</p>
        </div>
      ) : null}

      {isCadastroRoot ? (
        <section className="dashboard-grid" aria-label="Cadastros disponíveis">
          {cadastroCards.map((card) => (
            <Link key={card.to} className="dashboard-card" to={card.to}>
              <span className="dashboard-card-icon" aria-hidden="true">{card.icon}</span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <span className="dashboard-card-action">Acessar</span>
            </Link>
          ))}
        </section>
      ) : null}

      <Outlet />
    </section>
  );
}
