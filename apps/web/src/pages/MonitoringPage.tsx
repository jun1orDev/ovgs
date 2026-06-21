import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { getErrorMessage, statusLabel } from '../lib/format';
import type { MonitoringSummary, OrderStatus } from '../types/ovgs';

const statusOptions: OrderStatus[] = ['CRIADA', 'PLANEJADA', 'AGENDADA', 'EM_TRANSPORTE', 'ENTREGUE'];

export default function MonitoringPage() {
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [message, setMessage] = useState('');

  async function loadSummary() {
    try {
      setSummary(await apiClient.monitoring.summary(statusFilter ? { status: statusFilter } : undefined));
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  useEffect(() => {
    loadSummary();
  }, [statusFilter]);

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
            <h2>Resumo por status</h2>
            <label className="monitoring-filter">
              Filtrar por status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | '')}>
                <option value="">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{statusLabel(status)}</option>
                ))}
              </select>
            </label>
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
          ) : null}
        </div>
      </div>
    </section>
  );
}
