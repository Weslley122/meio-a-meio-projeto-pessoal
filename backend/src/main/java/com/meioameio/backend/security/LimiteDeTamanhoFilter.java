package com.meioameio.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Teto de tamanho do corpo da requisição (negação de serviço por corpo gigante, OWASP API4).
 *
 * Achado do pentest de carga: um JSON de 12 MB era lido e desserializado inteiro na memória antes de
 * a validação @Size recusar o campo. Nas rotas abertas (login e cadastro), qualquer um podia gastar
 * memória, CPU e rede do servidor só mandando corpos enormes.
 *
 * Qualquer requisição legítima desta API é pequena (um pedido com 30 itens não passa de alguns KB),
 * então cortamos em 64 KB por padrão. Barra de duas formas, porque o cabeçalho pode mentir ou faltar:
 *  1. Se o Content-Length informado já passa do limite, recusa na hora (nem lê o corpo).
 *  2. Senão, conta os bytes de verdade enquanto são lidos e aborta se passarem (cobre corpo "chunked",
 *     que não manda Content-Length).
 * Nos dois casos responde 413 Payload Too Large.
 */
@Component
public class LimiteDeTamanhoFilter extends OncePerRequestFilter {

    private final long maxBytes;

    public LimiteDeTamanhoFilter(@Value("${app.seguranca.max-corpo-bytes:65536}") long maxBytes) {
        this.maxBytes = maxBytes;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        // Só vale para a API e só para métodos que têm corpo.
        String metodo = request.getMethod();
        boolean temCorpo = "POST".equals(metodo) || "PUT".equals(metodo) || "PATCH".equals(metodo);
        return !temCorpo || !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        if (request.getContentLengthLong() > maxBytes) {
            recusar(response);
            return;
        }
        filterChain.doFilter(new RequestComTeto(request, maxBytes), response);
    }

    private static void recusar(HttpServletResponse response) throws IOException {
        if (response.isCommitted()) return;
        response.reset();
        response.setStatus(413);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":413,\"mensagem\":\"Requisição grande demais.\"}");
    }

    /** Envolve a requisição para contar os bytes realmente lidos e abortar ao passar do teto. */
    private static class RequestComTeto extends HttpServletRequestWrapper {
        private final long max;

        RequestComTeto(HttpServletRequest request, long max) {
            super(request);
            this.max = max;
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            ServletInputStream original = super.getInputStream();
            return new ServletInputStream() {
                private long lidos = 0;

                private int contar(int lido) {
                    if (lido != -1 && ++lidos > max) {
                        throw new CorpoGrandeDemaisException();
                    }
                    return lido;
                }

                @Override
                public int read() throws IOException {
                    return contar(original.read());
                }

                @Override
                public int read(@NonNull byte[] b, int off, int len) throws IOException {
                    int n = original.read(b, off, len);
                    if (n != -1) {
                        lidos += n;
                        if (lidos > max) throw new CorpoGrandeDemaisException();
                    }
                    return n;
                }

                @Override
                public boolean isFinished() {
                    return original.isFinished();
                }

                @Override
                public boolean isReady() {
                    return original.isReady();
                }

                @Override
                public void setReadListener(ReadListener listener) {
                    original.setReadListener(listener);
                }
            };
        }
    }

    /** Sinaliza corpo acima do teto durante a leitura; vira 413 no GlobalExceptionHandler. */
    public static class CorpoGrandeDemaisException extends RuntimeException {
    }
}
