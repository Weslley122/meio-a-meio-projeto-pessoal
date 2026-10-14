import { api } from './client';

export function criarPedido({ itens, formaPagamento }) {
  return api.post('/pedidos', { itens, formaPagamento }, { auth: true });
}

export function meusPedidos() {
  return api.get('/pedidos/meus', { auth: true });
}

export function buscarPedido(id) {
  return api.get(`/pedidos/${id}`, { auth: true });
}

export function todosPedidos() {
  return api.get('/pedidos/todos', { auth: true });
}

export function atualizarStatusPedido(id, status) {
  return api.patch(`/pedidos/${id}/status`, { status }, { auth: true });
}
