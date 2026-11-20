package com.meioameio.backend.repository;

import com.meioameio.backend.model.ItemPedido;
import com.meioameio.backend.model.Pedido;
import com.meioameio.backend.model.Produto;
import com.meioameio.backend.model.Usuario;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes de INTEGRAÇÃO da camada de dados (JPA/Hibernate) contra um banco H2 de verdade.
 *
 * Diferente do PedidoServiceTest, aqui nada é dublê: o Spring sobe, o Hibernate cria as tabelas
 * a partir das anotações @Entity e as consultas rodam em SQL de verdade.
 *
 * @Transactional na classe: cada teste roda dentro de uma transação que é desfeita (rollback)
 * no final. Assim um teste não deixa lixo no banco para o próximo.
 *
 * Por que @SpringBootTest e não @DataJpaTest? O endereço do usuário passa por um conversor
 * (CriptografiaCampo) que é um bean do Spring e precisa da chave da configuração;
 * o @DataJpaTest sobe só a parte de JPA e não teria esse bean.
 */
@SpringBootTest
@Transactional
class PedidoRepositoryTest {

    @Autowired
    PedidoRepository pedidoRepository;

    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    ProdutoRepository produtoRepository;

    @Autowired
    EntityManager entityManager;

    @Autowired
    JdbcTemplate jdbc;

    private Usuario novoCliente(String telefone) {
        return usuarioRepository.save(
                new Usuario("Cliente " + telefone, telefone, "Rua das Flores, 10, Centro", "hash", "CLIENTE"));
    }

    private Pedido novoPedido(Usuario dono, LocalDateTime quando) {
        // O produto 1 é criado pela carga inicial da aplicação (seedDados).
        Produto produto = produtoRepository.findById(1L).orElseThrow();

        Pedido p = new Pedido();
        p.setUsuario(dono);
        p.setFormaPagamento("pix");
        p.setSubtotal(new BigDecimal("9.00"));
        p.setTaxaEntrega(new BigDecimal("20.00"));
        p.setTotal(new BigDecimal("29.00"));
        p.setCriadoEm(quando);

        ItemPedido item = new ItemPedido();
        item.setPedido(p);
        item.setProduto(produto);
        item.setQuantidade(2);
        item.setPrecoUnitario(produto.getPreco());
        p.getItens().add(item);

        return pedidoRepository.save(p);
    }

    /** Manda tudo para o banco e esvazia o cache do Hibernate: a próxima leitura vem do SQL. */
    private void gravarELimparCache() {
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("salvar o pedido salva os itens junto (cascade)")
    void cascadeSalvaItens() {
        Usuario cliente = novoCliente("96980000001");
        Long id = novoPedido(cliente, LocalDateTime.now()).getId();
        gravarELimparCache();

        Pedido lido = pedidoRepository.findById(id).orElseThrow();

        // Pedido.itens tem cascade = ALL: não existe ItemPedidoRepository e mesmo assim os itens foram gravados.
        assertThat(lido.getItens()).hasSize(1);
        assertThat(lido.getItens().get(0).getProduto().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("findByUsuarioOrderByCriadoEmDesc: só os pedidos do cliente, do mais novo para o mais antigo")
    void consultaDerivadaDoNomeDoMetodo() {
        Usuario ana = novoCliente("96980000002");
        Usuario bruno = novoCliente("96980000003");
        LocalDateTime agora = LocalDateTime.now();
        Long antigo = novoPedido(ana, agora.minusDays(2)).getId();
        Long recente = novoPedido(ana, agora).getId();
        novoPedido(bruno, agora.minusDays(1));
        gravarELimparCache();

        // O Spring Data gera o SQL a partir do NOME do método:
        // "findBy" + "Usuario" (WHERE usuario_id = ?) + "OrderBy" + "CriadoEm" + "Desc".
        List<Pedido> pedidosDaAna = pedidoRepository.findByUsuarioOrderByCriadoEmDesc(ana);

        assertThat(pedidosDaAna).extracting(Pedido::getId).containsExactly(recente, antigo);
    }

    @Test
    @DisplayName("o endereço vai cifrado para o banco e volta legível pelo JPA (@Convert)")
    void enderecoCifradoNoBanco() {
        Long id = novoCliente("96980000004").getId();
        gravarELimparCache();

        // Lendo direto no banco, por SQL, sem passar pelo JPA: o texto está cifrado.
        String noBanco = jdbc.queryForObject("select endereco from usuarios where id = ?", String.class, id);
        assertThat(noBanco).startsWith("gcm1:").doesNotContain("Rua das Flores");

        // Lendo pelo repositório: o conversor decifra e a aplicação vê o endereço normal.
        assertThat(usuarioRepository.findById(id).orElseThrow().getEndereco())
                .isEqualTo("Rua das Flores, 10, Centro");
    }
}
