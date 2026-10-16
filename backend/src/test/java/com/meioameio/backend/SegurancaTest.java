package com.meioameio.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de segurança da API: cada um tenta um ataque conhecido e confere que ele é barrado.
 * Rodam no CI a cada push (ver .github/workflows/ci.yml) e localmente com: mvnw test
 */
@SpringBootTest
@AutoConfigureMockMvc
class SegurancaTest {

    private static final String ADMIN_TELEFONE = "99999999999";
    private static final String ADMIN_SENHA = "senha-do-admin-nos-testes";
    private static final AtomicInteger SEQUENCIA = new AtomicInteger(100);

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    JdbcTemplate jdbc;

    // ---------- ajudantes ----------

    /** Cada teste usa um telefone diferente para os contadores de tentativa não se misturarem. */
    private static String novoTelefone() {
        return "9698" + String.format("%07d", SEQUENCIA.incrementAndGet());
    }

    private String registrar(String telefone, String extraJson) throws Exception {
        String corpo = """
                {"nome":"Cliente Teste","telefone":"%s","endereco":"Rua das Flores, 10, Centro",
                 "senha":"senhaforte1","maiorDeIdade":true%s}
                """.formatted(telefone, extraJson);
        MvcResult r = mvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk()).andReturn();
        return json.readTree(r.getResponse().getContentAsString()).get("token").asText();
    }

    private String login(String telefone, String senha) throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"telefone\":\"%s\",\"senha\":\"%s\"}".formatted(telefone, senha)))
                .andExpect(status().isOk()).andReturn();
        return json.readTree(r.getResponse().getContentAsString()).get("token").asText();
    }

    private JsonNode criarPedido(String token, String corpo) throws Exception {
        MvcResult r = mvc.perform(post("/api/pedidos").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk()).andReturn();
        return json.readTree(r.getResponse().getContentAsString());
    }

    private static String pedidoSimples() {
        return "{\"itens\":[{\"produtoId\":1,\"quantidade\":2}],\"formaPagamento\":\"pix\"}";
    }

    // ---------- autenticação ----------

    @Test
    @DisplayName("Rota protegida sem token responde 401 em JSON")
    void semTokenRecebe401() throws Exception {
        mvc.perform(get("/api/pedidos/meus"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Token assinado com outra chave é recusado, mesmo dizendo ser ADMIN")
    void tokenForjadoComOutraChave() throws Exception {
        String forjado = Jwts.builder()
                .setIssuer("meio-a-meio-api").setSubject("1").claim("role", "ADMIN")
                .setExpiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor("uma-chave-qualquer-que-o-atacante-inventou-123".getBytes(StandardCharsets.UTF_8)),
                        SignatureAlgorithm.HS256)
                .compact();
        mvc.perform(get("/api/pedidos/todos").header("Authorization", "Bearer " + forjado))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token sem assinatura (alg: none) é recusado")
    void tokenSemAssinatura() throws Exception {
        // {"alg":"none"} . {"iss":"meio-a-meio-api","sub":"1","role":"ADMIN"} . (sem assinatura)
        String semAssinatura = "eyJhbGciOiJub25lIn0.eyJpc3MiOiJtZWlvLWEtbWVpby1hcGkiLCJzdWIiOiIxIiwicm9sZSI6IkFETUlOIn0.";
        mvc.perform(get("/api/pedidos/todos").header("Authorization", "Bearer " + semAssinatura))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Login errado tem a mesma resposta para telefone inexistente e senha errada")
    void naoEntregaQuemTemConta() throws Exception {
        String telefone = novoTelefone();
        registrar(telefone, "");

        String senhaErrada = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"telefone\":\"%s\",\"senha\":\"errada123\"}".formatted(telefone)))
                .andExpect(status().isUnauthorized()).andReturn().getResponse().getContentAsString();
        String inexistente = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"telefone\":\"%s\",\"senha\":\"errada123\"}".formatted(novoTelefone())))
                .andExpect(status().isUnauthorized()).andReturn().getResponse().getContentAsString();

        assertThat(json.readTree(senhaErrada).get("mensagem").asText())
                .isEqualTo(json.readTree(inexistente).get("mensagem").asText());
    }

    @Test
    @DisplayName("Força bruta: depois de 5 senhas erradas o login fica bloqueado, mesmo com a senha certa")
    void bloqueiaForcaBruta() throws Exception {
        String telefone = novoTelefone();
        registrar(telefone, "");
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"telefone\":\"%s\",\"senha\":\"chute%d\"}".formatted(telefone, i)))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"telefone\":\"%s\",\"senha\":\"senhaforte1\"}".formatted(telefone)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    @DisplayName("SQL injection no login não autentica ninguém")
    void sqlInjectionNoLogin() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"telefone\":\"' OR '1'='1\",\"senha\":\"' OR '1'='1\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Senha fraca é recusada no cadastro")
    void senhaCurtaRecusada() throws Exception {
        mvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON).content("""
                        {"nome":"Ana","telefone":"%s","endereco":"Rua A, 1, Centro","senha":"123","maiorDeIdade":true}
                        """.formatted(novoTelefone())))
                .andExpect(status().isBadRequest());
    }

    // ---------- autorização e escalação de privilégio ----------

    @Test
    @DisplayName("Mandar \"role\": \"ADMIN\" no cadastro não cria um admin")
    void cadastroNaoAceitaPapel() throws Exception {
        String token = registrar(novoTelefone(), ",\"role\":\"ADMIN\"");
        mvc.perform(get("/api/usuarios/me").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.role").value("CLIENTE"));
        mvc.perform(get("/api/pedidos/todos").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cliente não muda status de pedido nem a localização da loja")
    void clienteNaoUsaRotasDeAdmin() throws Exception {
        String token = registrar(novoTelefone(), "");
        long id = criarPedido(token, pedidoSimples()).get("id").asLong();
        mvc.perform(patch("/api/pedidos/" + id + "/status").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":1}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/loja/localizacao").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"latitude\":0,\"longitude\":0}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("IDOR: cliente não abre o pedido de outro cliente trocando o número na URL")
    void clienteNaoVePedidoDeOutro() throws Exception {
        String dono = registrar(novoTelefone(), "");
        String curioso = registrar(novoTelefone(), "");
        long id = criarPedido(dono, pedidoSimples()).get("id").asLong();

        mvc.perform(get("/api/pedidos/" + id).header("Authorization", "Bearer " + curioso))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/pedidos/" + id).header("Authorization", "Bearer " + dono))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Admin só avança o pedido uma etapa por vez")
    void statusSoAvancaUmaEtapa() throws Exception {
        String cliente = registrar(novoTelefone(), "");
        long id = criarPedido(cliente, pedidoSimples()).get("id").asLong();
        String admin = login(ADMIN_TELEFONE, ADMIN_SENHA);

        mvc.perform(patch("/api/pedidos/" + id + "/status").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":3}"))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/pedidos/" + id + "/status").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":1}"))
                .andExpect(status().isOk());
    }

    // ---------- validação de entrada e regra de negócio ----------

    @Test
    @DisplayName("Quantidade negativa e forma de pagamento inventada são recusadas")
    void entradaInvalidaRecusada() throws Exception {
        String token = registrar(novoTelefone(), "");
        mvc.perform(post("/api/pedidos").header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itens\":[{\"produtoId\":1,\"quantidade\":-5}],\"formaPagamento\":\"pix\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/pedidos").header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itens\":[{\"produtoId\":1,\"quantidade\":1}],\"formaPagamento\":\"<script>alert(1)</script>\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Preço mandado pelo app é ignorado: vale o do banco")
    void precoVemDoBanco() throws Exception {
        String token = registrar(novoTelefone(), "");
        JsonNode pedido = criarPedido(token,
                "{\"itens\":[{\"produtoId\":1,\"quantidade\":2,\"preco\":0.01}],\"formaPagamento\":\"pix\",\"total\":0.01}");
        // Produto 1 custa R$ 4,50 no catálogo: 2 x 4,50 = 9,00 + R$ 20 de entrega.
        assertThat(pedido.get("subtotal").decimalValue()).isEqualByComparingTo("9.00");
        assertThat(pedido.get("total").decimalValue()).isEqualByComparingTo("29.00");
    }

    @Test
    @DisplayName("JSON quebrado responde 400 sem expor detalhes internos")
    void erroNaoVazaDetalheTecnico() throws Exception {
        String corpo = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"telefone\":"))
                .andExpect(status().isBadRequest()).andReturn().getResponse().getContentAsString();
        assertThat(corpo).doesNotContain("Jackson", "Exception", "com.meioameio", "\tat ");
    }

    // ---------- dados e cabeçalhos ----------

    @Test
    @DisplayName("Endereço fica cifrado no banco e legível pela API")
    void enderecoCifradoNoBanco() throws Exception {
        String telefone = novoTelefone();
        String token = registrar(telefone, "");
        String noBanco = jdbc.queryForObject("select endereco from usuarios where telefone = ?", String.class, telefone);
        assertThat(noBanco).startsWith("gcm1:").doesNotContain("Rua das Flores");
        mvc.perform(get("/api/usuarios/me").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.endereco").value("Rua das Flores, 10, Centro"));
    }

    @Test
    @DisplayName("Senha é guardada como hash BCrypt, nunca em texto")
    void senhaComHash() throws Exception {
        String telefone = novoTelefone();
        registrar(telefone, "");
        String noBanco = jdbc.queryForObject("select senha from usuarios where telefone = ?", String.class, telefone);
        assertThat(noBanco).startsWith("$2a$12$").doesNotContain("senhaforte1");
    }

    @Test
    @DisplayName("Respostas trazem os cabeçalhos de segurança")
    void cabecalhosDeSeguranca() throws Exception {
        mvc.perform(get("/api/produtos"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"));
    }
}
