import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { getErrorMessage } from '../lib/format';
import { SkeletonCard, SkeletonForm, SkeletonList } from '../components/Skeleton';
import type { TransportType } from '../types/ovgs';

export default function TransportTypesPage() {
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [loading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    active: true,
  });

  async function loadTransportTypes() {
    try {
      setTransportTypes(await apiClient.transportTypes.list());
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  useEffect(() => {
    let mounted = true;
    async function loadInitialData() {
      setInitialLoading(true);
      await loadTransportTypes();
      if (mounted) setInitialLoading(false);
    }
    loadInitialData();
    return () => { mounted = false; };
  }, []);

  function resetForm() {
    setForm({ name: '', description: '', active: true });
    setEditingId(null);
  }

  function startEdit(transportType: TransportType) {
    setForm({
      name: transportType.name,
      description: transportType.description ?? '',
      active: transportType.active,
    });
    setEditingId(transportType.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      if (editingId) {
        await apiClient.transportTypes.update(editingId, form);
        setMessage('Tipo de transporte atualizado com sucesso.');
      } else {
        await apiClient.transportTypes.create(form);
        setMessage('Tipo de transporte cadastrado com sucesso.');
      }
      resetForm();
      await loadTransportTypes();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de transporte?')) return;

    try {
      await apiClient.transportTypes.remove(id);
      await loadTransportTypes();
      setMessage('Tipo de transporte excluído com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  if (initialLoading) {
    return (
      <section className="page-shell">
        <div className="section-heading">
          <h1>Tipos de transporte</h1>
          <p>Defina os tipos de transporte disponíveis, como caminhão, carreta e bi-truck.</p>
        </div>

        <SkeletonForm fields={4} className="transport-types-form-card" />
        <SkeletonCard count={1} className="transport-types-list-card" />
        <SkeletonList count={5} />
      </section>
    );
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
            <h2>{editingId ? 'Editar tipo de transporte' : 'Novo tipo de transporte'}</h2>

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

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : editingId ? 'Atualizar tipo de transporte' : 'Salvar tipo de transporte'}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
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
                    <div className="transport-types-actions">
                      <span className={transportType.active ? 'badge-active' : 'badge-inactive'}>
                        {transportType.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <button className="secondary" onClick={() => startEdit(transportType)}>Editar</button>
                      <button className="secondary" onClick={() => handleDelete(transportType.id)}>Excluir</button>
                    </div>
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
