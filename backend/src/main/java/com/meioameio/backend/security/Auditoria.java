package com.meioameio.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Trilha de auditoria de segurança.
 *
 * Cada evento vira UMA linha no formato chave=valor no logger "SEGURANCA", que o logback-spring.xml
 * grava também em logs/seguranca.log. É o formato que ferramentas de SIEM (Wazuh, Elastic, Splunk)
 * leem sem configuração extra: dá para montar alerta de "muitas falhas de login do mesmo IP",
 * "acesso negado repetido" ou "status de pedido alterado fora do horário".
 *
 * Nunca registra senha, token ou endereço. Telefone sai mascarado (só os 4 últimos dígitos).
 */
@Component
public class Auditoria {

    private static final Logger LOG = LoggerFactory.getLogger("SEGURANCA");

    public void contaCriada(Long usuarioId) {
        LOG.info("evento=conta_criada usuario={} ip={}", usuarioId, ip());
    }

    public void loginOk(Long usuarioId) {
        LOG.info("evento=login_ok usuario={} ip={}", usuarioId, ip());
    }

    public void loginFalhou(String telefone, String motivo) {
        LOG.warn("evento=login_falha telefone={} motivo={} ip={}", mascarar(telefone), motivo, ip());
    }

    public void loginBloqueado(String telefone) {
        LOG.warn("evento=login_bloqueado telefone={} ip={}", mascarar(telefone), ip());
    }

    public void limiteExcedido(String caminho, String ip) {
        LOG.warn("evento=limite_excedido caminho={} ip={}", limpar(caminho), ip);
    }

    public void naoAutenticado(HttpServletRequest req) {
        LOG.info("evento=nao_autenticado metodo={} caminho={} ip={}", req.getMethod(), limpar(req.getRequestURI()), req.getRemoteAddr());
    }

    public void acessoNegado(Object usuario, HttpServletRequest req) {
        LOG.warn("evento=acesso_negado usuario={} metodo={} caminho={} ip={}",
                usuario, req.getMethod(), limpar(req.getRequestURI()), req.getRemoteAddr());
    }

    public void perfilAlterado(Long usuarioId, boolean telefoneMudou) {
        LOG.info("evento=perfil_alterado usuario={} telefone_mudou={} ip={}", usuarioId, telefoneMudou, ip());
    }

    public void statusAlterado(Long adminId, Long pedidoId, int de, int para) {
        LOG.info("evento=status_alterado admin={} pedido={} de={} para={} ip={}", adminId, pedidoId, de, para, ip());
    }

    public void localizacaoLojaAlterada(Long adminId) {
        LOG.info("evento=loja_localizacao_alterada admin={} ip={}", adminId, ip());
    }

    public void erroInterno(String referencia, Throwable erro) {
        // O detalhe técnico fica só no log interno; o cliente recebe apenas a referência.
        LOG.error("evento=erro_interno ref={} tipo={}", referencia, erro.getClass().getName(), erro);
    }

    /** "96981234567" -> "*******4567" */
    static String mascarar(String telefone) {
        if (telefone == null) return "-";
        String d = telefone.replaceAll("\\D", "");
        if (d.length() <= 4) return "****";
        return "*".repeat(d.length() - 4) + d.substring(d.length() - 4);
    }

    /** Impede "log injection": quebra de linha num valor vindo da rua criaria um evento falso no log. */
    static String limpar(String valor) {
        if (valor == null) return "-";
        String semQuebra = valor.replaceAll("[\\r\\n\\t]", "_");
        return semQuebra.length() > 200 ? semQuebra.substring(0, 200) : semQuebra;
    }

    private static String ip() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            return attrs.getRequest().getRemoteAddr();
        }
        return "-";
    }
}
