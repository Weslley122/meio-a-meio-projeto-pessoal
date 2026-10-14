import { api } from './client';

export function calcularRota({ latitude, longitude }) {
  return api.post('/rota/calcular', { latitude, longitude }, { auth: true });
}
