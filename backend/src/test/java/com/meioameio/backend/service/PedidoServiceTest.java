package com.meioameio.backend.service;

import com.meioameio.backend.dto.ItemPedidoRequest;
import com.meioameio.backend.dto.PedidoRequest;
import com.meioameio.backend.dto.PedidoResponse;
import com.meioameio.backend.exception.RecursoNaoEncontradoException;
import com.meioameio.backend.exception.RegraDeNegocioException;
import com.meioameio.backend.model.Pedido;
import com.meioameio.backend.model.Produto;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.PedidoRepository;
import com.meioameio.backend.repository.ProdutoRepository;
import com.meioameio.backend.security.Auditoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Testes de UNIDADE das regras de negócio do pedido.
 *
 * "Unidade" quer dizer: só a classe PedidoService, sem subir o Spring e sem banco de dados.
 * Os repositórios e a auditoria são substituídos por "dublês" do Mockito (@Mock): eu digo o que
 * eles devolvem e depois confiro se foram chamados. Por isso estes testes rodam em milissegundos.
 *
 * Padrão usado em cada teste — AAA:
 *   Arrange (prepara os dados) → Act (chama o método) → Assert (confere o resultado).
 */
@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    PedidoRepository pedidoRepository;

    @Mock
    ProdutoRepository produtoRepository;

    @Mock
    Auditoria auditoria;

    // Cria o PedidoService de verdade e injeta os três dublês acima no construtor.
    @InjectMocks
    PedidoService service;

    private Usuario cliente;

    @BeforeEach
    void prepararCliente() {
        cliente = new Usuario("Cliente Teste", "96981234567", "Rua das Flores, 10", "hash", "CLIENTE");
        cliente.setId(10L);
    }

    // ---------- ajudantes ----------

    private static Produto produto(long id, String preco) {
        return new Produto(id, "cervejas", "Produto " + id, "desc", new BigDecimal(preco), "can", "#000", "#fff");
    }

    private static ItemPedidoRequest item(long produtoId, int quantidade) {
        ItemPedidoRequest i = new ItemPedidoRequest();
        i.setProdutoId(produtoId);
        i.setQuantidade(quantidade);
        return i;
    }

    private static PedidoRequest pedidoCom(ItemPedidoRequest... itens) {
        PedidoRequest req = new PedidoRequest();
        req.setFormaPagamento("pix");
        req.setItens(List.of(itens));
        return req;
    }

    private Pedido pedidoNoStatus(int status, Usuario dono) {
        Pedido p = new Pedido();
        p.setId(1L);
        p.setUsuario(dono);
        p.setStatus(status);
        p.setSubtotal(BigDecimal.TEN);
        p.setTaxaEntrega(BigDecimal.ZERO);
        p.setTotal(BigDecimal.TEN);
        p.setFormaPagamento("pix");
        return p;
    }

    // =====================================================================
    @Nested
    @DisplayName("Taxa de entrega (R$20 abaixo de R$150, grátis a partir de R$150)")
    class TaxaDeEntrega {

        // Teste parametrizado: o mesmo teste roda uma vez para cada linha.
        // Os valores de fronteira (149.99 / 150.00 / 150.01) são onde esse tipo de regra costuma quebrar.
        @ParameterizedTest(name = "subtotal R$ {0} → taxa R$ {1}")
        @CsvSource({
                "0.01,   20.00",
                "100.00, 20.00",
                "149.99, 20.00",
                "150.00, 0.00",
                "150.01, 0.00",
                "500.00, 0.00"
        })
        void calculaTaxaPelaFaixaDeValor(String subtotal, String taxaEsperada) {
            BigDecimal taxa = service.calcularTaxaEntrega(new BigDecimal(subtotal));

            // BigDecimal: compare pelo VALOR (isEqualByComparingTo), não com equals,
            // porque new BigDecimal("0") e new BigDecimal("0.00") não são "equals".
            assertThat(taxa).isEqualByComparingTo(taxaEsperada);
        }
    }

    // =====================================================================
    @Nested
    @DisplayName("Criar pedido")
    class CriarPedido {

        @BeforeEach
        void repositorioDevolveOQueRecebeu() {
            // Simula o save do JPA: devolve o próprio pedido que recebeu.
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));
        }

        @Test
        @DisplayName("abaixo de R$150 soma a taxa de R$20 no total")
        void pedidoPequenoPagaFrete() {
            when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto(1, "4.50")));

            PedidoResponse r = service.criarPedido(cliente, pedidoCom(item(1, 10))); // 10 x 4,50 = 45,00

            assertThat(r.getSubtotal()).isEqualByComparingTo("45.00");
            assertThat(r.getTaxaEntrega()).isEqualByComparingTo("20.00");
            assertThat(r.getTotal()).isEqualByComparingTo("65.00");
            assertThat(r.getStatus()).isZero();
        }

        @Test
        @DisplayName("a partir de R$150 o frete é grátis")
        void pedidoGrandeNaoPagaFrete() {
            when(produtoRepository.findById(3L)).thenReturn(Optional.of(produto(3, "48.00")));
            when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto(1, "4.50")));

            // 3 x 48,00 + 2 x 4,50 = 144,00 + 9,00 = 153,00
            PedidoResponse r = service.criarPedido(cliente, pedidoCom(item(3, 3), item(1, 2)));

            assertThat(r.getSubtotal()).isEqualByComparingTo("153.00");
            assertThat(r.getTaxaEntrega()).isEqualByComparingTo("0.00");
            assertThat(r.getTotal()).isEqualByComparingTo("153.00");
            assertThat(r.getItens()).hasSize(2);
        }

        @Test
        @DisplayName("o preço vem do banco, nunca do cliente")
        void precoVemDoBanco() {
            when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto(1, "4.50")));

            PedidoResponse r = service.criarPedido(cliente, pedidoCom(item(1, 2)));

            // O request nem tem campo de preço; o item guarda o preço que estava no banco.
            assertThat(r.getItens().get(0).getPrecoUnitario()).isEqualByComparingTo("4.50");
        }
    }

    @Test
    @DisplayName("produto inexistente: recusa o pedido e não salva nada")
    void produtoInexistente() {
        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criarPedido(cliente, pedidoCom(item(999, 1))))
                .isInstanceOf(RecursoNaoEncontradoException.class);

        verify(pedidoRepository, never()).save(any());
    }

    // =====================================================================
    @Nested
    @DisplayName("Atualizar status (só avança uma etapa por vez)")
    class AtualizarStatus {

        private final Usuario admin = new Usuario("Carlinho", "99999999999", "Loja", "hash", "ADMIN");

        @Test
        @DisplayName("avança de 0 para 1 e registra na auditoria")
        void avancaUmaEtapa() {
            admin.setId(1L);
            when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoNoStatus(0, cliente)));
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

            PedidoResponse r = service.atualizarStatus(1L, 1, admin);

            assertThat(r.getStatus()).isEqualTo(1);
            verify(auditoria).statusAlterado(1L, 1L, 0, 1);
        }

        @Test
        @DisplayName("não pula etapa (0 → 2)")
        void naoPulaEtapa() {
            when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoNoStatus(0, cliente)));

            assertThatThrownBy(() -> service.atualizarStatus(1L, 2, admin))
                    .isInstanceOf(RegraDeNegocioException.class);
            verify(pedidoRepository, never()).save(any());
        }

        @Test
        @DisplayName("não volta etapa (2 → 1)")
        void naoVoltaEtapa() {
            when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoNoStatus(2, cliente)));

            assertThatThrownBy(() -> service.atualizarStatus(1L, 1, admin))
                    .isInstanceOf(RegraDeNegocioException.class);
        }

        @Test
        @DisplayName("pedido entregue não muda mais")
        void entregueEhFinal() {
            when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoNoStatus(3, cliente)));

            assertThatThrownBy(() -> service.atualizarStatus(1L, 4, admin))
                    .isInstanceOf(RegraDeNegocioException.class)
                    .hasMessageContaining("entregue");
        }
    }

    // =====================================================================
    @Nested
    @DisplayName("Buscar pedido por id (cliente só vê o próprio)")
    class BuscarPorId {

        @Test
        @DisplayName("o dono vê o pedido")
        void donoVe() {
            when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoNoStatus(0, cliente)));

            assertThat(service.buscarPorId(1L, cliente).getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("outro cliente recebe 'não encontrado' (proteção contra IDOR)")
        void outroClienteNaoVe() {
            Usuario intruso = new Usuario("Outro", "96980000000", "Rua X", "hash", "CLIENTE");
            intruso.setId(99L);
            when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoNoStatus(0, cliente)));

            assertThatThrownBy(() -> service.buscarPorId(1L, intruso))
                    .isInstanceOf(RecursoNaoEncontradoException.class);
        }
    }
}
