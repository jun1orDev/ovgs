import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { formatCurrency, formatDateTime, getErrorMessage, statusLabel, optionLabel } from '../lib/format';
import { SkeletonCard, SkeletonMetrics, SkeletonTable, SkeletonForm } from '../components/Skeleton';
import type { Client, MonitoringSummary, OrderStatus, PaginatedResponse, SalesOrder, TransportType } from '../types/ovgs';

const statusOptions: OrderStatus[] = ['CRIADA', 'PLANEJADA', 'AGENDADA', 'EM_TRANSPORTE', 'ENTREGUE'];

export default function MonitoringPage() {
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [ordersData, setOrdersData] = useState<PaginatedResponse<SalesOrder> | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [transportFilter, setTransportFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [dateField, setDateField] = useState<'createdAt' | 'deliveryDate'>('createdAt');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const queryParams = {
    status: statusFilter || undefined,
    clientId: clientFilter || undefined,
    transportTypeId: transportFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    dateField,
    page,
    pageSize,
  };

  async function loadDependencies() {
    try {
      const [clientData, transportData] = await Promise.all([
        apiClient.clients.list(),
        apiClient.transportTypes.list(),
      ]);
      setClients(clientData);
      setTransportTypes(transportData);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function loadSummary() {
    try {
      setSummary(await apiClient.monitoring.summary(queryParams));
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function loadOrders() {
    try {
      setOrdersData(await apiClient.monitoring.list(queryParams));
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  useEffect(() => {
    let mounted = true;
    async function loadInitialData() {
      setInitialLoading(true);
      await loadDependencies();
      await loadSummary();
      await loadOrders();
      if (mounted) setInitialLoading(false);
    }
    loadInitialData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    loadSummary();
    loadOrders();
  }, [statusFilter, clientFilter, transportFilter, dateFrom, dateTo, dateField, page]);

  function clearFilters() {
    setStatusFilter('');
    setClientFilter('');
    setTransportFilter('');
    setDateFrom('');
    setDateTo('');
    setDateField('createdAt');
    setPage(1);
  }

  const hasActiveFilters = statusFilter || clientFilter || transportFilter || dateFrom || dateTo;

  function orderTotal(order: SalesOrder) {
    return order.items.reduce((sum, item) => sum + Number(item.unitPrice ?? 0) * item.quantity, 0);
  }

  if (initialLoading) {
    return (
      <section className="page-shell">
        <div className="section-heading">
          <h1>Monitoramento operacional</h1>
          <p>Visualize o total de ordens e a distribuição por status para acompanhamento operacional.</p>
        </div>

        <SkeletonMetrics count={4} />
        <SkeletonCard count={1} className="monitoring-card" />
        <SkeletonForm fields={6} />
        <SkeletonTable rows={5} columns={6} />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <h1>Monitoramento operacional</h1>
        <p>Visualize o total de ordens e a distribuição por status para acompanhamento operacional.</p>
      </div>

      {message ? <div className="alert">{message}</div> : null}

      <div className="monitoring-layout">
        <div className="card monitoring-card">
          <div className="section-heading compact">
            <h2>Filtros</h2>
            {hasActiveFilters && (
              <button type="button" className="secondary" onClick={clearFilters}>
                Limpar filtros
              </button>
            )}
          </div>

          <div className="monitoring-filters">
            <div className="filter-group">
              <label>
                Status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | '')}>
                  <option value="">Todos</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{statusLabel(status)}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filter-group">
              <label>
                Cliente
                <select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)}>
                  <option value="">Todos</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{optionLabel(client)}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filter-group">
              <label>
                Tipo de transporte
                <select value={transportFilter} onChange={(event) => setTransportFilter(event.target.value)}>
                  <option value="">Todos</option>
                  {transportTypes.map((transport) => (
                    <option key={transport.id} value={transport.id}>{transport.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filter-group">
              <label>
                Campo de data
                <select value={dateField} onChange={(event) => setDateField(event.target.value as 'createdAt' | 'deliveryDate')}>
                  <option value="createdAt">Data de criação</option>
                  <option value="deliveryDate">Data de entrega</option>
                </select>
              </label>
            </div>

            <div className="filter-group">
              <label>
                Data inicial
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </label>
            </div>

            <div className="filter-group">
              <label>
                Data final
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="section-heading compact">
            <h2>Resumo por status</h2>
          </div>

          {summary ? (
            <>
              <div className="monitoring-summary">
                <div className="metric-card">
                  <span>Total de ordens</span>
                  <strong>{summary.totalOrders}</strong>
                </div>
              </div>

              <div className="monitoring-status-grid">
                {statusOptions.map((status) => (
                  <div key={status} className="monitoring-status-card">
                    <span>{statusLabel(status)}</span>
                    <strong>{summary.byStatus[status] ?? 0}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="empty">Carregando...</p>
          )}

          <div className="section-heading compact" style={{ marginTop: '24px' }}>
            <h2>Ordens filtradas ({ordersData?.meta.total ?? 0})</h2>
          </div>

          {!ordersData ? (
            <p className="empty">Carregando...</p>
          ) : ordersData.data.length === 0 ? (
            <p className="empty">Nenhuma ordem encontrada com os filtros atuais.</p>
          ) : (
            <>
              <ul className="list order-list">
                {ordersData.data.map((order) => (
                  <li key={order.id} className="order-item">
                    <div>
                      <strong>{order.number}</strong>
                      <span>{order.client.name}</span>
                      <span>{order.transportType.name}</span>
                      <span>{formatDateTime(order.createdAt)}</span>
                      <span>Valor: {formatCurrency(orderTotal(order))}</span>
                    </div>
                    <div className="order-actions">
                      <span className={`status-badge ${statusLabel(order.status).toLowerCase().replace(/\s/g, '-')}`}>
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {ordersData.meta.total > pageSize && (
                <div className="pagination">
                  <button
                    className="secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                  <span className="pagination-info">
                    Página {page} de {Math.ceil((ordersData.meta.total ?? 0) / pageSize)}
                  </span>
                  <button
                    className="secondary"
                    onClick={() => setPage((p) => Math.min(Math.ceil((ordersData.meta.total ?? 0) / pageSize), p + 1))}
                    disabled={page >= Math.ceil((ordersData.meta.total ?? 0) / pageSize)}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
