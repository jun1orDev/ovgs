import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { formatCurrency, getErrorMessage } from '../lib/format';
import type { Item } from '../types/ovgs';

function formatCurrencyInput(value: string): string {
  const onlyDigits = value.replace(/\D/g, '');
  const numericValue = Number(onlyDigits || '0') / 100;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

function parseCurrency(value: string): number {
  const numericValue = Number(value.replace(/[^\d,]/g, '').replace(',', '.'));
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function normalizeSkuInput(value: string): string {
  const upper = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return upper.startsWith('SKU-') ? upper : `SKU-${upper}`;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    unitPrice: 'R$ 0,00',
    active: true,
  });

  async function loadItems() {
    setLoading(true);
    try {
      setItems(await apiClient.items.list());
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setForm({ sku: '', name: '', description: '', unitPrice: 'R$ 0,00', active: true });
    setEditingId(null);
  }

  function startEdit(item: Item) {
    const unitPriceNumber = typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice ?? 0);
    setForm({
      sku: normalizeSkuInput(item.sku),
      name: item.name,
      description: item.description ?? '',
      unitPrice: formatCurrencyInput(String(unitPriceNumber * 100)),
      active: item.active,
    });
    setEditingId(item.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      if (editingId) {
        await apiClient.items.update(editingId, {
          ...form,
          unitPrice: parseCurrency(form.unitPrice),
        });
        setMessage('Item atualizado com sucesso.');
      } else {
        await apiClient.items.create({
          ...form,
          unitPrice: parseCurrency(form.unitPrice),
        });
        setMessage('Item cadastrado com sucesso.');
      }
      resetForm();
      await loadItems();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      await apiClient.items.remove(id);
      await loadItems();
      setMessage('Item excluído com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <h1>Itens</h1>
        <p>Cadastre os itens que poderão compor uma ordem de venda.</p>
      </div>

      {message ? <div className="alert">{message}</div> : null}

      <div className="items-layout">
        <div className="two-columns">
          <form className="card form-card items-form-card" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Editar item' : 'Novo item'}</h2>

            <label>
              SKU *
              <input
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: normalizeSkuInput(event.target.value) })}
                required
                maxLength={50}
              />
            </label>

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
              Preço unitário *
              <input
                value={form.unitPrice}
                onChange={(event) => setForm({ ...form, unitPrice: formatCurrencyInput(event.target.value) })}
                required
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
                {loading ? 'Salvando...' : editingId ? 'Atualizar item' : 'Salvar item'}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="card items-list-card">
            <h2>Itens cadastrados</h2>
            {items.length === 0 ? (
              <p className="empty">Nenhum item cadastrado.</p>
            ) : (
              <ul className="list items-list">
                {items.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.sku}</strong>
                      <span>{item.name}</span>
                      <span className="items-price">{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <div className="items-actions">
                      <span className={item.active ? 'badge-active' : 'badge-inactive'}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <button className="secondary" onClick={() => startEdit(item)}>Editar</button>
                      <button className="secondary" onClick={() => handleDelete(item.id)}>Excluir</button>
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
