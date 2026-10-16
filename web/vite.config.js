import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Content-Security-Policy do app (defesa extra contra XSS).
 * Só entra no build de produção: o servidor de desenvolvimento do Vite injeta scripts inline
 * para o recarregamento automático, que esta política bloquearia.
 * O app não carrega nada de fora: scripts, estilos e fontes saem do próprio build.
 * Em meta tag, frame-ancestors é ignorado; quem hospedar o site deve mandar
 * "Content-Security-Policy: frame-ancestors 'none'" como cabeçalho (ver SECURITY.md).
 */
function politicaDeSeguranca(apiUrl) {
  let api = ''
  try {
    if (apiUrl) api = ' ' + new URL(apiUrl).origin
  } catch {
    // VITE_API_URL relativo (ex.: /api): mesma origem, já coberto por 'self'.
  }
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${api}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return {
    name: 'meio-a-meio-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n  <meta http-equiv="Content-Security-Policy" content="${csp}" />\n  <meta name="referrer" content="no-referrer" />`,
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), politicaDeSeguranca(env.VITE_API_URL)],
    build: {
      // Sem source map em produção: não entrega o código-fonte comentado de bandeja.
      sourcemap: false,
    },
    server: {
      port: 5173,
      // /api vai para o Spring Boot. Para o navegador é o mesmo endereço, então não há CORS.
      proxy: {
        '/api': 'http://127.0.0.1:8080',
      },
    },
  }
})
