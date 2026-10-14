package com.meioameio.backend.service;

import com.meioameio.backend.dto.ItemPedidoRequest;
import com.meioameio.backend.dto.PedidoRequest;
import com.meioameio.backend.dto.PedidoResponse;
import com.meioameio.backend.exception.RecursoNaoEncontradoException;
import com.meioameio.backend.model.ItemPedido;
import com.meioameio.backend.model.Pedido;
import com.meioameio.backend.model.Produto;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.PedidoRepository;
import com.meioameio.backend.repository.ProdutoRepository;
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

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProdutoRepository produtoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
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

    @Transactional
    public PedidoResponse atualizarStatus(Long id, Integer novoStatus) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado"));
        pedido.setStatus(novoStatus);
        Pedido salvo = pedidoRepository.save(pedido);
        return new PedidoResponse(salvo);
    }
}
