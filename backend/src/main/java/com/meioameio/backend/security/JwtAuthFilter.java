package com.meioameio.backend.security;

import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Lê o "Authorization: Bearer ..." de cada requisição.
 *
 * Confiança zero: um token válido não basta. A cada requisição o usuário é buscado no banco,
 * e o papel (CLIENTE/ADMIN) vem do banco, não do que está escrito no token. Assim, se uma conta
 * for apagada ou perder o papel de ADMIN, o efeito é imediato, sem esperar o token vencer.
 *
 * Token ausente ou inválido: a requisição segue sem usuário, e o Spring Security responde 401
 * nas rotas protegidas (ver SecurityConfig).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ") && jwtUtil.tokenValido(header.substring(7))) {
            usuarioDoToken(header.substring(7)).ifPresent(usuario -> {
                var autoridades = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRole()));
                var autenticacao = new UsernamePasswordAuthenticationToken(String.valueOf(usuario.getId()), null, autoridades);
                autenticacao.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(autenticacao);
            });
        }

        filterChain.doFilter(request, response);
    }

    private Optional<Usuario> usuarioDoToken(String token) {
        try {
            return usuarioRepository.findById(Long.valueOf(jwtUtil.extrairUsuarioId(token)));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
