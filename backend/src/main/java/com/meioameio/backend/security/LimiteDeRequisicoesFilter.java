package com.meioameio.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Limita quantas vezes por minuto o mesmo IP chama login e cadastro.
 * Passou do limite: 429 Too Many Requests com o cabeçalho Retry-After.
 *
 * O IP é o que o servidor enxerga (getRemoteAddr). Atrás de um proxy reverso, o perfil "prod"
 * liga server.forward-headers-strategy para o Spring ler o IP real de forma segura,
 * em vez de confiarmos num cabeçalho X-Forwarded-For que qualquer um pode inventar.
 */
@Component
public class LimiteDeRequisicoesFilter extends OncePerRequestFilter {

    private final LimiteDeTentativas limite;
    private final Auditoria auditoria;

    public LimiteDeRequisicoesFilter(LimiteDeTentativas limite, Auditoria auditoria) {
        this.limite = limite;
        this.auditoria = auditoria;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String ip = request.getRemoteAddr();
        if (!limite.permitirChamada(ip)) {
            auditoria.limiteExcedido(request.getRequestURI(), ip);
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"status\":429,\"mensagem\":\"Muitas tentativas. Espere um minuto e tente de novo.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
