package com.meioameio.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Regressão do achado do pentest: chave de desenvolvimento pública permitia forjar token de ADMIN. */
class JwtUtilTest {

    private static final long DEZ_MINUTOS = 600_000;

    @Test
    @DisplayName("Sem JWT_SECRET, a chave antiga publicada no GitHub não assina mais tokens válidos")
    void chaveAntigaDoRepositorioNaoVale() {
        JwtUtil api = new JwtUtil("", DEZ_MINUTOS, false);
        String forjado = Jwts.builder()
                .setIssuer(JwtUtil.EMISSOR).setSubject("1").claim("role", "ADMIN")
                .setExpiration(new Date(System.currentTimeMillis() + DEZ_MINUTOS))
                .signWith(Keys.hmacShaKeyFor("meio-a-meio-do-carlinho-chave-secreta-de-desenvolvimento-32"
                        .getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                .compact();
        assertThat(api.tokenValido(forjado)).isFalse();
    }

    @Test
    @DisplayName("Sem JWT_SECRET, cada subida sorteia uma chave diferente")
    void chaveAleatoriaPorSubida() {
        JwtUtil primeira = new JwtUtil(null, DEZ_MINUTOS, false);
        JwtUtil segunda = new JwtUtil(" ", DEZ_MINUTOS, false);
        String token = primeira.gerarToken(7L, "CLIENTE");
        assertThat(primeira.tokenValido(token)).isTrue();
        assertThat(segunda.tokenValido(token)).isFalse();
    }

    @Test
    @DisplayName("Em produção, subir sem JWT_SECRET é erro")
    void producaoExigeSegredo() {
        assertThatThrownBy(() -> new JwtUtil("", DEZ_MINUTOS, true))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Segredo curto demais para HS256 é recusado")
    void segredoCurtoRecusado() {
        assertThatThrownBy(() -> new JwtUtil("curta", DEZ_MINUTOS, false))
                .isInstanceOf(RuntimeException.class);
    }
}
