// Em desenvolvimento, "/api" é repassado pelo Vite para o Spring Boot em localhost:8080
// (veja vite.config.js). Assim o navegador fala com um endereço só e não esbarra em CORS.
// Para apontar para outro servidor, defina VITE_API_URL num arquivo .env.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const SESSAO_EXPIRADA = 'mmc:sessao-expirada';

function getToken() {
  return localStorage.getItem('mmc_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('mmc_token', token);
  else localStorage.removeItem('mmc_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
  }

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    // fetch só "estoura" quando nem chega no servidor (servidor desligado, sem rede...)
    throw new Error('Não foi possível conectar ao servidor. Confira se o back-end está rodando.');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const mensagem = (data && data.mensagem) || 'Não foi possível completar a solicitação.';
    const erro = new Error(mensagem);
    erro.status = res.status;
    // Token vencido ou inválido numa chamada logada: avisa o app inteiro para encerrar a sessão
    // (AuthContext escuta). 403 não entra: é "sem permissão", não "sessão acabou".
    if (auth && res.status === 401) window.dispatchEvent(new Event(SESSAO_EXPIRADA));
    throw erro;
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
};
