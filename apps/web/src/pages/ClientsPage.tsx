import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { getErrorMessage, optionLabel } from '../lib/format';
import type { Client, TransportType } from '../types/ovgs';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    active: true,
    transportTypeIds: [] as string[],
  });

  async function loadClients() {
    setLoading(true);
    try {
      const [clientData, transportData] = await Promise.all([
        apiClient.clients.list(),
        apiClient.transportTypes.list(),
      ]);
      setClients(clientData);
      setTransportTypes(transportData);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  function resetForm() {
    setForm({
      name: '',
      document: '',
      email: '',
      phone: '',
      active: true,
      transportTypeIds: [],
    });
    setEditingId(null);
  }

  function startEdit(client: Client) {
    setForm({
      name: client.name,
      document: client.document ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      active: client.active,
      transportTypeIds: client.authorizedTransport?.map((at) => at.transportTypeId) ?? [],
    });
    setEditingId(client.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      if (editingId) {
        await apiClient.clients.update(editingId, {
          ...form,
          transportTypeIds: form.transportTypeIds,
        });
        setMessage('Cliente atualizado com sucesso.');
      } else {
        await apiClient.clients.create({
          ...form,
          transportTypeIds: form.transportTypeIds,
        });
        setMessage('Cliente cadastrado com sucesso.');
      }
      resetForm();
      await loadClients();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await apiClient.clients.remove(id);
      await loadClients();
      setMessage('Cliente excluído com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  function toggleTransportType(transportTypeId: string) {
    setForm((current) => ({
      ...current,
      transportTypeIds: current.transportTypeIds.includes(transportTypeId)
        ? current.transportTypeIds.filter((id) => id !== transportTypeId)
        : [...current.transportTypeIds, transportTypeId],
    }));
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <h1>Clientes</h1>
        <p>Cadastre clientes e defina quais tipos de transporte estão autorizados para uso em ordens de venda.</p>
      </div>

      {message ? <div className="alert">{message}</div> : null}

      <div className="clients-layout">
        <div className="two-columns">
          <form className="card form-card clients-form-card" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Editar cliente' : 'Novo cliente'}</h2>

            <label>
              Nome *
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                maxLength={200}
              />
            </label>

            <label>
              Documento
              <input
                value={form.document}
                onChange={(event) => setForm({ ...form, document: event.target.value })}
                maxLength={30}
              />
            </label>

            <label>
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>

            <label>
              Telefone
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                maxLength={30}
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

            <fieldset>
              <legend>Transportes autorizados</legend>
              <div className="checkbox-grid">
                {transportTypes.map((transportType) => (
                  <label key={transportType.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.transportTypeIds.includes(transportType.id)}
                      onChange={() => toggleTransportType(transportType.id)}
                    />
                    {transportType.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : editingId ? 'Atualizar cliente' : 'Salvar cliente'}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="card clients-list-card">
            <h2>Clientes cadastrados</h2>
            {clients.length === 0 ? (
              <p className="empty">Nenhum cliente cadastrado.</p>
            ) : (
              <ul className="list clients-list">
                {clients.map((client) => (
                  <li key={client.id}>
                    <div>
                      <strong>{client.name}</strong>
                      <span>{client.document ?? 'Sem documento'}</span>
                    </div>
                    <div className="clients-actions">
                      <span className={client.active ? 'badge-active' : 'badge-inactive'}>
                        {client.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <button className="secondary" onClick={() => startEdit(client)}>Editar</button>
                      <button className="secondary" onClick={() => handleDelete(client.id)}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card clients-transport-card">
          <h2>Tipos de transporte disponíveis</h2>
          <div className="chip-list">
            {transportTypes.map((transportType) => (
              <span key={transportType.id} className="chip">{optionLabel(transportType)}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
