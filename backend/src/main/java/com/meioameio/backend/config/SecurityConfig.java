package com.meioameio.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meioameio.backend.dto.ErroResponse;
import com.meioameio.backend.security.Auditoria;
import com.meioameio.backend.security.JwtAuthFilter;
import com.meioameio.backend.security.LimiteDeRequisicoesFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

import java.io.IOException;

/**
 * Regras de segurança da API.
 *
 * - Autenticação: JWT no cabeçalho Authorization (sem sessão no servidor, sem cookie).
 * - Autorização em duas camadas: aqui por rota, e de novo com @PreAuthorize nos métodos de admin.
 *   Se alguém mudar uma rota e esquecer esta lista, a segunda camada ainda barra (defesa em profundidade).
 * - CSRF desligado DE PROPÓSITO: CSRF explora o navegador mandando cookie sozinho. Esta API não usa
 *   cookie de sessão; o token vai num cabeçalho que o navegador nunca envia por conta própria.
 *   Se um dia o login passar para cookie, o CSRF tem que voltar (ver SECURITY.md).
 * - Respostas 401/403 em JSON, no mesmo formato dos outros erros, e registradas na auditoria.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final LimiteDeRequisicoesFilter limiteFilter;
    private final LimiteDeTamanhoFilter tamanhoFilter;
    private final CorsConfig corsConfig;
    private final Auditoria auditoria;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, LimiteDeRequisicoesFilter limiteFilter,
                          LimiteDeTamanhoFilter tamanhoFilter, CorsConfig corsConfig,
                          Auditoria auditoria, ObjectMapper objectMapper) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.limiteFilter = limiteFilter;
        this.tamanhoFilter = tamanhoFilter;
        this.corsConfig = corsConfig;
        this.auditoria = auditoria;
        this.objectMapper = objectMapper;
    }

    /**
     * BCrypt: hash lento de propósito e com salt aleatório embutido em cada hash
     * (duas contas com a mesma senha ficam com hashes diferentes). Força 12 = 2^12 rodadas.
     * BCrypt só considera os primeiros 72 bytes da senha; por isso a senha tem limite de 64
     * caracteres na validação (RegistroRequest/LoginRequest).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(h -> h
                        // A API só devolve JSON: não há motivo para o navegador executar nada vindo dela.
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                        .referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        // HSTS: o Spring só envia em conexão HTTPS (atrás do proxy com TLS, em produção).
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31_536_000))
                        .addHeaderWriter(new StaticHeadersWriter("Permissions-Policy", "camera=(), microphone=(), geolocation=()"))
                        // X-Content-Type-Options: nosniff, X-Frame-Options: DENY e Cache-Control sem cache
                        // já vêm ligados por padrão no Spring Security.
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            auditoria.naoAutenticado(req);
                            escreverErro(res, 401, "Faça login para continuar.");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            var auth = SecurityContextHolder.getContext().getAuthentication();
                            auditoria.acessoNegado(auth != null ? auth.getPrincipal() : "-", req);
                            escreverErro(res, 403, "Você não tem permissão para isso.");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/registro", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/produtos", "/api/produtos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/loja/localizacao").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/loja/localizacao").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/todos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/pedidos/**").hasRole("ADMIN")
                        .requestMatchers("/error").permitAll()
                        // Menor privilégio: tudo que não foi liberado acima exige login.
                        .anyRequest().authenticated()
                )
                // Teto de tamanho primeiro: barra o corpo gigante antes de qualquer outro filtro lê-lo.
                .addFilterBefore(tamanhoFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(limiteFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void escreverErro(HttpServletResponse res, int status, String mensagem) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(res.getWriter(), new ErroResponse(status, mensagem));
    }
}
