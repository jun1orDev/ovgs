import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { formatDateTime, getErrorMessage } from '../lib/format';
import type { AuditEvent } from '../types/ovgs';

export default function AuditEventsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function loadEvents() {
    setLoading(true);
    try {
      setEvents(await apiClient.audit.list('SalesOrder'));
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <section className="page-shell">
      <div className="section-heading">
        <h1>Auditoria</h1>
        <p>Acompanhe eventos relevantes de criação, mudança de status, transporte e agendamento.</p>
      </div>

      {message ? <div className="alert">{message}</div> : null}

      <div className="audit-layout">
        <div className="card audit-card">
          <div className="section-heading compact">
            <h2>Eventos de ordens</h2>
            <button className="secondary" onClick={loadEvents} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {events.length === 0 ? (
            <p className="empty">Nenhum evento de auditoria encontrado.</p>
          ) : (
            <ul className="list audit-list">
              {events.map((event) => (
                <li key={event.id}>
                  <div>
                    <strong>{event.action}</strong>
                    <span>Entidade: {event.entityType} / {event.entityId}</span>
                    <span>{formatDateTime(event.createdAt)}</span>
                  </div>
                  <span className="chip">{event.action}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
