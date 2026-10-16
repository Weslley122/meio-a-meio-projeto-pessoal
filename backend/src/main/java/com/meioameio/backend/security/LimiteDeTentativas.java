package com.meioameio.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Proteção contra força bruta e excesso de requisições (OWASP A07 e API4: consumo de recursos).
 *
 * 1. Por telefone: depois de N senhas erradas seguidas, aquele login fica bloqueado por um tempo,
 *    mesmo que a próxima senha esteja certa. Acertar zera a contagem.
 * 2. Por IP: no máximo X chamadas por minuto às rotas de login e cadastro.
 *
 * Fica em memória porque a API roda numa instância só. Com várias instâncias, o mesmo contador
 * precisaria ir para um lugar compartilhado (Redis, por exemplo), senão cada uma contaria sozinha.
 */
@Component
public class LimiteDeTentativas {

    private record Falhas(int quantidade, Instant primeira, Instant bloqueadoAte) {}

    private record Janela(int quantidade, Instant inicio) {}

    private final Map<String, Falhas> falhasPorTelefone = new ConcurrentHashMap<>();
    private final Map<String, Janela> chamadasPorIp = new ConcurrentHashMap<>();

    private final int maxFalhas;
    private final Duration bloqueio;
    private final int maxPorMinuto;

    public LimiteDeTentativas(@Value("${app.seguranca.login.max-falhas:5}") int maxFalhas,
                              @Value("${app.seguranca.login.bloqueio-minutos:15}") long bloqueioMinutos,
                              @Value("${app.seguranca.auth.max-por-minuto:20}") int maxPorMinuto) {
        this.maxFalhas = maxFalhas;
        this.bloqueio = Duration.ofMinutes(bloqueioMinutos);
        this.maxPorMinuto = maxPorMinuto;
    }

    /** Minutos que faltam para liberar o login desse telefone (0 = liberado). */
    public long minutosBloqueado(String telefone) {
        Falhas f = falhasPorTelefone.get(telefone);
        if (f == null || f.bloqueadoAte() == null) return 0;
        Duration resta = Duration.between(Instant.now(), f.bloqueadoAte());
        if (resta.isNegative() || resta.isZero()) {
            falhasPorTelefone.remove(telefone);
            return 0;
        }
        return Math.max(1, (resta.toSeconds() + 59) / 60);
    }

    /** Registra uma senha errada. Retorna true se esta falha causou o bloqueio. */
    public boolean registrarFalha(String telefone) {
        Instant agora = Instant.now();
        Falhas nova = falhasPorTelefone.compute(telefone, (k, atual) -> {
            // Falhas antigas (fora da janela de bloqueio) não contam mais.
            if (atual == null || atual.primeira().plus(bloqueio).isBefore(agora)) {
                return new Falhas(1, agora, null);
            }
            int q = atual.quantidade() + 1;
            return new Falhas(q, atual.primeira(), q >= maxFalhas ? agora.plus(bloqueio) : null);
        });
        limparSeCrescerDemais();
        return nova.bloqueadoAte() != null && nova.quantidade() == maxFalhas;
    }

    public void registrarSucesso(String telefone) {
        falhasPorTelefone.remove(telefone);
    }

    /** Conta uma chamada do IP. Retorna false quando ele passou do limite do minuto. */
    public boolean permitirChamada(String ip) {
        Instant agora = Instant.now();
        Janela j = chamadasPorIp.compute(ip, (k, atual) -> {
            if (atual == null || atual.inicio().plusSeconds(60).isBefore(agora)) {
                return new Janela(1, agora);
            }
            return new Janela(atual.quantidade() + 1, atual.inicio());
        });
        limparSeCrescerDemais();
        return j.quantidade() <= maxPorMinuto;
    }

    /** Sem isso, um ataque com milhões de telefones/IPs diferentes encheria a memória. */
    private void limparSeCrescerDemais() {
        if (falhasPorTelefone.size() > 10_000) {
            Instant limite = Instant.now().minus(bloqueio);
            falhasPorTelefone.entrySet().removeIf(e -> e.getValue().primeira().isBefore(limite));
        }
        if (chamadasPorIp.size() > 10_000) {
            Instant limite = Instant.now().minusSeconds(60);
            chamadasPorIp.entrySet().removeIf(e -> e.getValue().inicio().isBefore(limite));
        }
    }
}
