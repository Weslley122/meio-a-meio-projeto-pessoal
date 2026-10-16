package com.meioameio.backend.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Criptografia simétrica de dados pessoais "em repouso" (LGPD): AES-256 em modo GCM.
 *
 * Usado no endereço do cliente (@Convert em Usuario.endereco). No banco fica
 * "gcm1:" + Base64(IV de 12 bytes + texto cifrado + tag de 16 bytes). Quem copiar o arquivo do
 * banco ou um backup não lê os endereços sem a chave, que vem de variável de ambiente
 * (APP_CRIPTO_CHAVE) e nunca fica no banco.
 *
 * - GCM, além de esconder, detecta adulteração: se alguém mexer no texto cifrado, a leitura falha.
 * - O IV é aleatório a cada gravação: o mesmo endereço gera textos cifrados diferentes.
 * - Valores antigos, gravados antes da criptografia, são lidos como estão e cifrados na próxima gravação.
 *
 * Por que não o telefone? O login busca a conta pelo telefone, e um texto que muda a cada gravação
 * não dá para procurar. O caminho para isso seria guardar ao lado um HMAC do telefone só para busca
 * ("blind index") — ficou como próximo passo no SECURITY.md.
 */
@Component
@Converter
public class CriptografiaCampo implements AttributeConverter<String, String> {

    private static final String PREFIXO = "gcm1:";
    private static final int TAMANHO_IV = 12;
    private static final int TAMANHO_TAG_BITS = 128;

    private final SecretKey chave;
    private final SecureRandom aleatorio = new SecureRandom();

    public CriptografiaCampo(@Value("${app.cripto.chave}") String chaveBase64) {
        byte[] bytes = Base64.getDecoder().decode(chaveBase64);
        if (bytes.length != 32) {
            throw new IllegalStateException("app.cripto.chave precisa ter 32 bytes em Base64 (AES-256).");
        }
        this.chave = new SecretKeySpec(bytes, "AES");
    }

    @Override
    public String convertToDatabaseColumn(String texto) {
        if (texto == null) return null;
        try {
            byte[] iv = new byte[TAMANHO_IV];
            aleatorio.nextBytes(iv);
            Cipher cifra = Cipher.getInstance("AES/GCM/NoPadding");
            cifra.init(Cipher.ENCRYPT_MODE, chave, new GCMParameterSpec(TAMANHO_TAG_BITS, iv));
            byte[] cifrado = cifra.doFinal(texto.getBytes(StandardCharsets.UTF_8));
            byte[] tudo = ByteBuffer.allocate(iv.length + cifrado.length).put(iv).put(cifrado).array();
            return PREFIXO + Base64.getEncoder().encodeToString(tudo);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao cifrar dado pessoal", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String doBanco) {
        if (doBanco == null) return null;
        if (!doBanco.startsWith(PREFIXO)) return doBanco; // gravado antes da criptografia
        try {
            byte[] tudo = Base64.getDecoder().decode(doBanco.substring(PREFIXO.length()));
            ByteBuffer buffer = ByteBuffer.wrap(tudo);
            byte[] iv = new byte[TAMANHO_IV];
            buffer.get(iv);
            byte[] cifrado = new byte[buffer.remaining()];
            buffer.get(cifrado);
            Cipher cifra = Cipher.getInstance("AES/GCM/NoPadding");
            cifra.init(Cipher.DECRYPT_MODE, chave, new GCMParameterSpec(TAMANHO_TAG_BITS, iv));
            return new String(cifra.doFinal(cifrado), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            // Chave errada ou dado adulterado: melhor falhar do que devolver lixo.
            throw new IllegalStateException("Não foi possível decifrar um dado pessoal (chave errada ou dado alterado)", e);
        }
    }
}
