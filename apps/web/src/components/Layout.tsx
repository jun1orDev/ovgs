import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Visão geral' },
  { to: '/sales-orders', label: 'Ordens' },
  { to: '/monitoring', label: 'Monitoramento' },
  {
    to: '/cadastros',
    label: 'Cadastros',
    children: [
      { to: '/cadastros/clientes', label: 'Clientes' },
      { to: '/cadastros/itens', label: 'Itens' },
      { to: '/cadastros/transportes', label: 'Transportes' },
    ],
  },
  { to: '/audit', label: 'Auditoria' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleSidebar() {
    setSidebarOpen((current) => !current);
  }

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={sidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        aria-expanded={sidebarOpen}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <svg
            className="sidebar-toggle-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" />
          </svg>
        ) : (
          <svg
            className="sidebar-toggle-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M3 18v-2h18v2zm0-5v-2h18v2zm0-5V6h18v2z" />
          </svg>
        )}
      </button>

      <div className="sidebar-backdrop" onClick={toggleSidebar} />

      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-icon" aria-hidden="true">🚚</span>
          <span className="brand-text">OVGS</span>
          <small>Ordens de Venda</small>
        </Link>

        <nav>
          {navigation.map((item) => (
            <div key={item.to} className="nav-group">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>

              {item.children ? (
                <div className="submenu">
                  {item.children.map((child) => (
                    <NavLink key={child.to} to={child.to} onClick={() => setSidebarOpen(false)}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
