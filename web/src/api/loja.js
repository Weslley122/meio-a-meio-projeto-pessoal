import { api } from './client';

export function obterLocalizacaoLoja() {
  return api.get('/loja/localizacao');
}

export function atualizarLocalizacaoLoja({ latitude, longitude }) {
  return api.put('/loja/localizacao', { latitude, longitude }, { auth: true });
}
