import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { getErrorMessage } from '../lib/format';
import type { TransportType } from '../types/ovgs';

export default function TransportTypesPage() {
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    active: true,
  });

  async function loadTransportTypes() {
    setLoading(true);
    try {
      setTransportTypes(await apiClient.transportTypes.list());
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransportTypes();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      await apiClient.transportTypes.create(form);
      setForm({ name: '', description: '', active: true });
      await loadTransportTypes();
      setMessage('Tipo de transporte cadastrado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <h1>Tipos de transporte</h1>
        <p>Defina os tipos de transporte disponíveis, como caminhão, carreta e bi-truck.</p>
      </div>

      {message ? <div className="alert">{message}</div> : null}

      <div className="transport-types-layout">
        <div className="two-columns">
          <form className="card form-card transport-types-form-card" onSubmit={handleSubmit}>
            <h2>Novo tipo de transporte</h2>

            <label>
              Nome *
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                maxLength={100}
              />
            </label>

            <label>
              Descrição
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                maxLength={500}
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              Ativo
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar tipo de transporte'}
            </button>
          </form>

          <div className="card transport-types-list-card">
          <h2>Tipos cadastrados</h2>
          {transportTypes.length === 0 ? (
            <p className="empty">Nenhum tipo de transporte cadastrado.</p>
          ) : (
            <ul className="list transport-types-list">
              {transportTypes.map((transportType) => (
                <li key={transportType.id}>
                  <div>
                    <strong>{transportType.name}</strong>
                    <span>{transportType.description ?? 'Sem descrição'}</span>
                  </div>
                  <span className={transportType.active ? 'badge-active' : 'badge-inactive'}>
                    {transportType.active ? 'Ativo' : 'Inativo'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </section>
  );
}
