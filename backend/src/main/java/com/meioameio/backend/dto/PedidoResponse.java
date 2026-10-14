package com.meioameio.backend.dto;

import com.meioameio.backend.model.Pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PedidoResponse {
    private Long id;
    private String clienteNome;
    private String clienteTelefone;
    private String clienteEndereco;
    private BigDecimal subtotal;
    private BigDecimal taxaEntrega;
    private BigDecimal total;
    private String formaPagamento;
    private Integer status;
    private LocalDateTime criadoEm;
    private List<ItemPedidoResponse> itens;

    public PedidoResponse(Pedido p) {
        this.id = p.getId();
        this.clienteNome = p.getUsuario().getNome();
        this.clienteTelefone = p.getUsuario().getTelefone();
        this.clienteEndereco = p.getUsuario().getEndereco();
        this.subtotal = p.getSubtotal();
        this.taxaEntrega = p.getTaxaEntrega();
        this.total = p.getTotal();
        this.formaPagamento = p.getFormaPagamento();
        this.status = p.getStatus();
        this.criadoEm = p.getCriadoEm();
        this.itens = p.getItens().stream().map(ItemPedidoResponse::new).collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public String getClienteTelefone() {
        return clienteTelefone;
    }

    public String getClienteEndereco() {
        return clienteEndereco;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getTaxaEntrega() {
        return taxaEntrega;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public Integer getStatus() {
        return status;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public List<ItemPedidoResponse> getItens() {
        return itens;
    }
}
