import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app: se há token salvo, pergunta ao servidor quem é.
  // Só apaga o token se o servidor RECUSAR (401/403). Se o servidor estiver fora do ar,
  // mantém o token: quando ele voltar, um recarregar da página já entra direto.
  useEffect(() => {
    if (!localStorage.getItem('mmc_token')) {
      setCarregando(false);
      return;
    }
    authApi
      .meuPerfil()
      .then(setUsuario)
      .catch((e) => {
        if (e.status === 401 || e.status === 403) setToken(null);
        setUsuario(null);
      })
      .finally(() => setCarregando(false));
  }, []);

  async function registrar(dados) {
    const resposta = await authApi.registrar(dados);
    setToken(resposta.token);
    setUsuario(resposta.usuario);
    return resposta;
  }

  async function login(dados) {
    const resposta = await authApi.login(dados);
    setToken(resposta.token);
    setUsuario(resposta.usuario);
    return resposta;
  }

  function logout() {
    setToken(null);
    setUsuario(null);
  }

  async function atualizarPerfil(dados) {
    const atualizado = await authApi.atualizarPerfil(dados);
    setUsuario(atualizado);
    return atualizado;
  }

  const value = {
    usuario,
    carregando,
    logado: Boolean(usuario),
    isAdmin: usuario?.role === 'ADMIN',
    registrar,
    login,
    logout,
    atualizarPerfil,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
