import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { canTransition, formatCurrency, formatDateTime, getErrorMessage, optionLabel, statusLabel } from '../lib/format';
import type { Client, CreateSalesOrderDto, Item, OrderStatus, RescheduleSalesOrderDto, SalesOrder, ScheduleSalesOrderDto, TransportType } from '../types/ovgs';

type OrderLine = {
  itemId: string;
  quantity: number;
};

type ScheduleForm = {
  deliveryDate: string;
  scheduleStart: string;
  scheduleEnd: string;
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    deliveryDate: '',
    scheduleStart: '08:00',
    scheduleEnd: '12:00',
  });
  const [form, setForm] = useState({
    clientId: '',
    transportTypeId: '',
    lines: [{ itemId: '', quantity: 1 }] as OrderLine[],
  });

  const statusOptions: OrderStatus[] = ['CRIADA', 'PLANEJADA', 'AGENDADA', 'EM_TRANSPORTE', 'ENTREGUE'];
  const statusTimeline = [
    { status: 'CRIADA' as OrderStatus, label: 'Criada', icon: '📝' },
    { status: 'PLANEJADA' as OrderStatus, label: 'Planejada', icon: '🗓️' },
    { status: 'AGENDADA' as OrderStatus, label: 'Agendada', icon: '✅' },
    { status: 'EM_TRANSPORTE' as OrderStatus, label: 'Em transporte', icon: '🚚' },
    { status: 'ENTREGUE' as OrderStatus, label: 'Entregue', icon: '🏁' },
  ];
  const authorizedTransportTypes = useMemo(() => {
    if (!form.clientId) return transportTypes;
    const client = clients.find((item) => item.id === form.clientId);
    if (!client) return transportTypes;

    const authorizedIds = new Set(client.authorizedTransport.map((item) => item.transportTypeId));
    return transportTypes.filter((transportType) => authorizedIds.has(transportType.id));
  }, [clients, form.clientId, transportTypes]);

  async function loadDependencies() {
    setLoading(true);
    try {
      const [clientsData, transportData, itemsData] = await Promise.all([
        apiClient.clients.list(),
        apiClient.transportTypes.list(),
        apiClient.items.list(),
      ]);
      setClients(clientsData);
      setTransportTypes(transportData);
      setItems(itemsData);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await apiClient.salesOrders.list(statusFilter ? { status: statusFilter } : undefined);
      setOrders(response.data);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDependencies();
    loadOrders();
  }, [statusFilter]);

  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const validLines = form.lines.filter((line) => line.itemId);

    if (validLines.length === 0) {
      setMessage('A ordem de venda deve conter ao menos um item');
      return;
    }

    const dto: CreateSalesOrderDto = {
      clientId: form.clientId,
      transportTypeId: form.transportTypeId,
      items: validLines.map((line) => ({
        itemId: line.itemId,
        quantity: line.quantity,
      })),
    };

    try {
      await apiClient.salesOrders.create(dto);
      setForm({ clientId: '', transportTypeId: '', lines: [{ itemId: '', quantity: 1 }] });
      await loadOrders();
      setMessage('Ordem criada com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function handleStatusChange(order: SalesOrder, nextStatus: OrderStatus) {
    if (!canTransition(order.status, nextStatus)) return;

    try {
      const updated = await apiClient.salesOrders.updateStatus(order.id, { status: nextStatus });
      setSelectedOrder(updated);
      await loadOrders();
      setMessage(`Ordem avançada para ${statusLabel(nextStatus)}.`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function handleSchedule(order: SalesOrder) {
    const dto: ScheduleSalesOrderDto = {
      deliveryDate: scheduleForm.deliveryDate,
      scheduleStart: scheduleForm.scheduleStart,
      scheduleEnd: scheduleForm.scheduleEnd,
    };

    try {
      const updated = order.status === 'PLANEJADA'
        ? await apiClient.scheduling.schedule(order.id, dto)
        : await apiClient.scheduling.reschedule(order.id, dto as RescheduleSalesOrderDto);
      setSelectedOrder(updated);
      await loadOrders();
      setMessage(order.status === 'PLANEJADA' ? 'Ordem agendada com sucesso.' : 'Ordem reagendada com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  function openModal(order: SalesOrder) {
    setSelectedOrder(order);
    setScheduleForm({
      deliveryDate: order.deliveryDate ? order.deliveryDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      scheduleStart: order.scheduleStart ? order.scheduleStart.slice(11, 16) : '08:00',
      scheduleEnd: order.scheduleEnd ? order.scheduleEnd.slice(11, 16) : '12:00',
    });
  }

  const total = orders.reduce((sum, order) => {
    return sum + order.items.reduce((lineSum, item) => {
      const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice ?? 0);
      return lineSum + unitPrice * item.quantity;
    }, 0);
  }, 0);

  function selectedItemPrice(itemId: string) {
    const item = items.find((candidate) => candidate.id === itemId);
    return Number(item?.unitPrice ?? 0);
  }

  function orderTotal(order: SalesOrder) {
    return order.items.reduce((sum, item) => sum + Number(item.unitPrice ?? 0) * item.quantity, 0);
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <h1>Ordens de venda</h1>
        <p>Crie ordens, acompanhe status, avance etapas e visualize o valor total por ordem.</p>
      </div>

      {message ? <div className="alert">{message}</div> : null}

      <div className="summary-grid">
        <div className="metric-card">
          <span>Total de ordens</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="metric-card">
          <span>Valor total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      <form className="card form-card order-form-card" onSubmit={handleCreateOrder}>
        <div className="order-form-header">
          <h2>Nova ordem de venda</h2>
          <p className="order-form-subtitle">Preencha os dados abaixo para criar uma nova ordem de venda.</p>
        </div>

        <div className="order-form-fields">
          <div className="field-group field-group--client">
            <label className="field-label">
              Cliente <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              className="field-select"
              value={form.clientId}
              onChange={(event) => setForm({ ...form, clientId: event.target.value, transportTypeId: '' })}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{optionLabel(client)}</option>
              ))}
            </select>
          </div>

          <div className="field-group field-group--transport">
            <label className="field-label">
              Tipo de transporte <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              className="field-select"
              value={form.transportTypeId}
              onChange={(event) => setForm({ ...form, transportTypeId: event.target.value })}
              required
              disabled={!form.clientId}
            >
              <option value="" disabled={!form.clientId}>
                {form.clientId ? 'Selecione um transporte autorizado' : 'Selecione um cliente primeiro'}
              </option>
              {form.clientId && authorizedTransportTypes.map((transportType) => (
                <option key={transportType.id} value={transportType.id}>{transportType.name}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="order-items-fieldset">
          <legend>Itens da ordem</legend>
          {form.lines.map((line, index) => (
            <div className="order-line" key={index}>
              <div className="order-line-fields">
                <label className="field-group field-group--grow">
                  <span className="field-label">Item <span className="required" aria-hidden="true">*</span></span>
                  <select
                    className="field-select"
                    value={line.itemId}
                    onChange={(event) => {
                      const nextLines = [...form.lines];
                      nextLines[index] = { ...line, itemId: event.target.value };
                      setForm({ ...form, lines: nextLines });
                    }}
                    required
                  >
                    <option value="">Selecione um item</option>
                    {items.filter((item) => item.active).map((item) => (
                      <option key={item.id} value={item.id}>{optionLabel(item)}</option>
                    ))}
                  </select>
                </label>

                <label className="field-group field-group--fixed">
                  <span className="field-label">Quantidade <span className="required" aria-hidden="true">*</span></span>
                  <input
                    className="field-input"
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(event) => {
                      const nextLines = [...form.lines];
                      nextLines[index] = { ...line, quantity: Number(event.target.value || 1) };
                      setForm({ ...form, lines: nextLines });
                    }}
                  />
                </label>
              </div>

              <div className="order-line-totals">
                {line.itemId && (
                  <>
                    <div className="unit-price">
                      <span className="label">Preço unit.</span>
                      <strong>{formatCurrency(selectedItemPrice(line.itemId))}</strong>
                    </div>
                    <div className="line-total">
                      <span className="label">Total</span>
                      <strong>{formatCurrency(selectedItemPrice(line.itemId) * line.quantity)}</strong>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  className="secondary btn-remove"
                  onClick={() => setForm({ ...form, lines: form.lines.filter((_, lineIndex) => lineIndex !== index) })}
                  disabled={form.lines.length === 1}
                  aria-label="Remover item"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="secondary btn-add-item"
            onClick={() => setForm({ ...form, lines: [...form.lines, { itemId: '', quantity: 1 }] })}
          >
            + Adicionar item
          </button>
        </fieldset>

        <div className="order-form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Criar ordem'}
          </button>
        </div>
      </form>

      <div className="card orders-card">
        <div className="section-heading compact">
          <h2>Ordens cadastradas</h2>
          <label>
            Filtrar por status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | '')}>
              <option value="">Todos</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
          </label>
        </div>

        {orders.length === 0 ? (
          <p className="empty">Nenhuma ordem encontrada.</p>
        ) : (
          <ul className="list order-list">
            {orders.map((order) => (
              <li key={order.id} className="order-item">
                <div>
                  <strong>{order.number}</strong>
                  <span>{order.client.name}</span>
                  <span>{order.transportType.name}</span>
                  <span>Valor: {formatCurrency(orderTotal(order))}</span>
                </div>
                <div className="order-actions">
                  <span className={`status-badge ${statusLabel(order.status).toLowerCase().replace(/\s/g, '-')}`}>
                    {statusLabel(order.status)}
                  </span>
                  <button className="secondary" onClick={() => openModal(order)}>Detalhes</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedOrder ? (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{selectedOrder.number}</h2>
              </div>
              <button className="secondary" onClick={() => setSelectedOrder(null)}>Fechar</button>
            </div>

            <div className="detail-grid">
              <div>
                <span>Cliente</span>
                <strong>{selectedOrder.client.name}</strong>
              </div>
              <div>
                <span>Transporte</span>
                <strong>{selectedOrder.transportType.name}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{statusLabel(selectedOrder.status)}</strong>
              </div>
              <div>
                <span>Entrega</span>
                <strong>{formatDateTime(selectedOrder.deliveryDate)}</strong>
              </div>
              <div>
                <span>Janela</span>
                <strong>{formatDateTime(selectedOrder.scheduleStart)} - {formatDateTime(selectedOrder.scheduleEnd)}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{formatCurrency(selectedOrder.items.reduce((sum, item) => sum + Number(item.unitPrice ?? 0) * item.quantity, 0))}</strong>
              </div>
            </div>

            <h3>Fluxo operacional</h3>
            <ol className="status-timeline">
              {statusTimeline.map((step, index) => {
                const currentIndex = statusTimeline.findIndex((item) => item.status === selectedOrder.status);
                const isComplete = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <li key={step.status} className={isCurrent ? 'current' : ''}>
                    <span className="timeline-icon" aria-hidden="true">{step.icon}</span>
                    <span>{step.label}</span>
                    {index < statusTimeline.length - 1 ? (
                      <span className={`timeline-line ${isComplete ? 'complete' : ''}`} aria-hidden="true" />
                    ) : null}
                  </li>
                );
              })}
            </ol>

            <div className="modal-actions">
              {canTransition(selectedOrder.status, 'PLANEJADA') ? (
                <button className="secondary" onClick={() => handleStatusChange(selectedOrder, 'PLANEJADA')}>Planejar</button>
              ) : null}
              {canTransition(selectedOrder.status, 'EM_TRANSPORTE') ? (
                <button className="secondary" onClick={() => handleStatusChange(selectedOrder, 'EM_TRANSPORTE')}>Embarcar</button>
              ) : null}
              {canTransition(selectedOrder.status, 'ENTREGUE') ? (
                <button className="secondary" onClick={() => handleStatusChange(selectedOrder, 'ENTREGUE')}>Entregar</button>
              ) : null}
              {selectedOrder.status === 'ENTREGUE' ? (
                <span className="helper-text">Esta ordem está concluída e não permite novas transições.</span>
              ) : null}
            </div>

            <h3>Agendamento</h3>
            {(selectedOrder.status === 'PLANEJADA' || selectedOrder.status === 'AGENDADA' || selectedOrder.status === 'EM_TRANSPORTE') ? (
              <form className="card form-card" onSubmit={(event) => {
                event.preventDefault();
                void handleSchedule(selectedOrder);
              }}>
                <label>
                  Data de entrega *
                  <input
                    type="date"
                    value={scheduleForm.deliveryDate}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, deliveryDate: event.target.value })}
                    required
                  />
                </label>

                <div className="inline-form">
                  <label>
                    Início *
                    <input
                      type="time"
                      value={scheduleForm.scheduleStart}
                      onChange={(event) => setScheduleForm({ ...scheduleForm, scheduleStart: event.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Fim *
                    <input
                      type="time"
                      value={scheduleForm.scheduleEnd}
                      onChange={(event) => setScheduleForm({ ...scheduleForm, scheduleEnd: event.target.value })}
                      required
                    />
                  </label>

                  <button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : selectedOrder.status === 'PLANEJADA' ? 'Agendar ordem' : 'Reagendar ordem'}
                  </button>
                </div>

                <p className="helper-text">
                  A janela deve respeitar o horário comercial: início a partir das 08:00 e fim até 18:00.
                </p>
              </form>
            ) : (
              <p className="empty">Esta ordem não pode ser agendada ou reagendada no status atual.</p>
            )}

            <h3>Itens</h3>
            <ul className="list">
              {selectedOrder.items.map((orderItem) => (
                <li key={orderItem.id}>
                  <div>
                    <strong>{orderItem.item.sku}</strong>
                    <span>{orderItem.item.name}</span>
                    <span>{orderItem.quantity} x {formatCurrency(orderItem.unitPrice)}</span>
                  </div>
                  <strong>Total: {formatCurrency(Number(orderItem.unitPrice ?? 0) * orderItem.quantity)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
