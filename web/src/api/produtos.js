import { api } from './client';

export function listarProdutos() {
  return api.get('/produtos');
}
