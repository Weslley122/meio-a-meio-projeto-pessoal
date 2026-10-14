import { api } from './client';

export function registrar({ nome, telefone, endereco, senha, maiorDeIdade }) {
  return api.post('/auth/registro', { nome, telefone, endereco, senha, maiorDeIdade });
}

export function login({ telefone, senha }) {
  return api.post('/auth/login', { telefone, senha });
}

export function meuPerfil() {
  return api.get('/usuarios/me', { auth: true });
}

export function atualizarPerfil({ nome, telefone, endereco }) {
  return api.put('/usuarios/me', { nome, telefone, endereco }, { auth: true });
}
