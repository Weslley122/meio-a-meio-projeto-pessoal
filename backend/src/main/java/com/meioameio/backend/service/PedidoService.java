package com.meioameio.backend.service;

import com.meioameio.backend.dto.ItemPedidoRequest;
import com.meioameio.backend.dto.PedidoRequest;
import com.meioameio.backend.dto.PedidoResponse;
import com.meioameio.backend.exception.RecursoNaoEncontradoException;
import com.meioameio.backend.exception.RegraDeNegocioException;
import com.meioameio.backend.model.ItemPedido;
import com.meioameio.backend.model.Pedido;
import com.meioameio.backend.model.Produto;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.PedidoRepository;
import com.meioameio.backend.repository.ProdutoRepository;
import com.meioameio.backend.security.Auditoria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    // Regras de entrega do Meio a Meio do Carlinho
    private static final BigDecimal VALOR_MINIMO_FRETE_GRATIS = new BigDecimal("150.00");
    private static final BigDecimal TAXA_ENTREGA = new BigDecimal("20.00");
    private static final int ULTIMA_ETAPA = 3; // 0 recebido, 1 separando, 2 a caminho, 3 entregue

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final Auditoria auditoria;

    public PedidoService(PedidoRepository pedidoRepository, ProdutoRepository produtoRepository, Auditoria auditoria) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.auditoria = auditoria;
    }

    @Transactional
    public PedidoResponse criarPedido(Usuario usuario, PedidoRequest req) {
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFormaPagamento(req.getFormaPagamento());

        BigDecimal subtotal = BigDecimal.ZERO;

        for (ItemPedidoRequest itemReq : req.getItens()) {
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Produto não encontrado: " + itemReq.getProdutoId()));

            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemReq.getQuantidade());
            // O preço vem SEMPRE do banco. O app não manda preço, só id e quantidade:
            // não adianta editar o JavaScript para comprar mais barato.
            item.setPrecoUnitario(produto.getPreco());
            pedido.getItens().add(item);

            subtotal = subtotal.add(produto.getPreco().multiply(BigDecimal.valueOf(itemReq.getQuantidade())));
        }

        BigDecimal taxaEntrega = calcularTaxaEntrega(subtotal);

        pedido.setSubtotal(subtotal);
        pedido.setTaxaEntrega(taxaEntrega);
        pedido.setTotal(subtotal.add(taxaEntrega));
        pedido.setStatus(0);

        Pedido salvo = pedidoRepository.save(pedido);
        return new PedidoResponse(salvo);
    }

    /**
     * Taxa de entrega: R$20 para pedidos abaixo de R$150; frete grátis a partir de R$150.
     */
    public BigDecimal calcularTaxaEntrega(BigDecimal subtotal) {
        return subtotal.compareTo(VALOR_MINIMO_FRETE_GRATIS) >= 0 ? BigDecimal.ZERO : TAXA_ENTREGA;
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarMeusPedidos(Usuario usuario) {
        return pedidoRepository.findByUsuarioOrderByCriadoEmDesc(usuario).stream()
                .map(PedidoResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAllByOrderByCriadoEmDesc().stream()
                .map(PedidoResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Controle de acesso por objeto (evita IDOR, OWASP API1): o cliente só vê pedido dele.
     * Pedido de outra pessoa responde 404, e não 403, para nem confirmar que aquele número existe.
     */
    @Transactional(readOnly = true)
    public PedidoResponse buscarPorId(Long id, Usuario usuarioLogado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));

        boolean ehDono = pedido.getUsuario().getId().equals(usuarioLogado.getId());
        boolean ehAdmin = "ADMIN".equals(usuarioLogado.getRole());
        if (!ehDono && !ehAdmin) {
            throw new RecursoNaoEncontradoException("Pedido não encontrado");
        }

        return new PedidoResponse(pedido);
    }

    /**
     * O pedido só anda para a etapa seguinte (0 → 1 → 2 → 3). Não volta e não pula etapa,
     * nem mesmo para o admin: protege o histórico e deixa a trilha de auditoria coerente.
     */
    @Transactional
    public PedidoResponse atualizarStatus(Long id, Integer novoStatus, Usuario admin) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));
        int atual = pedido.getStatus();
        if (atual >= ULTIMA_ETAPA) {
            throw new RegraDeNegocioException("Esse pedido já foi entregue.");
        }
        if (novoStatus == null || novoStatus != atual + 1) {
            throw new RegraDeNegocioException("O pedido só pode avançar para a próxima etapa.");
        }
        pedido.setStatus(novoStatus);
        Pedido salvo = pedidoRepository.save(pedido);
        auditoria.statusAlterado(admin.getId(), salvo.getId(), atual, novoStatus);
        return new PedidoResponse(salvo);
    }
}
