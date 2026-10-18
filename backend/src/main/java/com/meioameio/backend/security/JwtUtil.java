package com.meioameio.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.SecureRandom;
import java.util.Date;

/**
 * Tokens JWT assinados com HMAC-SHA256 (HS256): criptografia SIMÉTRICA de assinatura.
 * A mesma chave secreta assina e confere, então ela só existe na API (variável JWT_SECRET).
 * Se outro serviço precisasse conferir tokens sem poder emiti-los, o certo seria trocar para
 * RS256 (assimétrica: chave privada só na API, pública para quem confere). Ver SECURITY.md.
 *
 * O token é assinado, não cifrado: qualquer um lê o conteúdo em Base64. Por isso ele leva só
 * o id do usuário e o emissor, nada de dado pessoal.
 */
@Component
public class JwtUtil {

    static final String EMISSOR = "meio-a-meio-api";

    private static final Logger LOG = LoggerFactory.getLogger("SEGURANCA");

    private final Key chave;
    private final long expiracaoMs;

    /**
     * Sem JWT_SECRET, a API sorteia uma chave nova a cada vez que sobe, em vez de usar uma chave fixa
     * escrita no repositório. Achado do pentest: com a chave de desenvolvimento pública no GitHub,
     * qualquer pessoa conseguia assinar um token de ADMIN válido para uma API que subisse sem a
     * variável. Efeito colateral aceitável em desenvolvimento: reiniciar a API desloga todo mundo.
     * No perfil "prod", app.jwt.exigir-segredo=true: sem JWT_SECRET a API nem sobe.
     */
    public JwtUtil(@Value("${app.jwt.secret:}") String segredo,
                   @Value("${app.jwt.expiration-ms}") long expiracaoMs,
                   @Value("${app.jwt.exigir-segredo:false}") boolean exigirSegredo) {
        if (segredo == null || segredo.isBlank()) {
            if (exigirSegredo) {
                throw new IllegalStateException("JWT_SECRET não definida: obrigatória neste ambiente.");
            }
            byte[] aleatoria = new byte[64];
            new SecureRandom().nextBytes(aleatoria);
            this.chave = Keys.hmacShaKeyFor(aleatoria);
            LOG.warn("evento=jwt_chave_temporaria aviso=\"JWT_SECRET ausente; chave aleatória gerada, sessões caem ao reiniciar\"");
        } else {
            // hmacShaKeyFor recusa chave com menos de 256 bits: segredo curto derruba a API na subida.
            this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        }
        this.expiracaoMs = expiracaoMs;
    }

    /** O "subject" do token é o ID do usuário (não o telefone, que pode mudar no perfil). */
    public String gerarToken(Long usuarioId, String role) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expiracaoMs);
        return Jwts.builder()
                .setIssuer(EMISSOR)
                .setSubject(String.valueOf(usuarioId))
                .claim("role", role)
                .setIssuedAt(agora)
                .setExpiration(expiracao)
                .signWith(chave, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extrairClaims(String token) {
        // parseClaimsJws exige assinatura válida: token com "alg": "none" ou assinado com outra chave é recusado.
        return Jwts.parserBuilder()
                .setSigningKey(chave)
                .requireIssuer(EMISSOR)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extrairUsuarioId(String token) {
        return extrairClaims(token).getSubject();
    }

    public String extrairRole(String token) {
        return extrairClaims(token).get("role", String.class);
    }

    public boolean tokenValido(String token) {
        try {
            Claims claims = extrairClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
