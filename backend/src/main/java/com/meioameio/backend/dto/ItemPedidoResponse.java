package com.meioameio.backend.dto;

import com.meioameio.backend.model.ItemPedido;
import java.math.BigDecimal;

public class ItemPedidoResponse {
    private Long produtoId;
    private String nome;
    private Integer quantidade;
    private BigDecimal precoUnitario;

    public ItemPedidoResponse(ItemPedido item) {
        this.produtoId = item.getProduto().getId();
        this.nome = item.getProduto().getNome();
        this.quantidade = item.getQuantidade();
        this.precoUnitario = item.getPrecoUnitario();
    }

    public Long getProdutoId() {
        return produtoId;
    }

    public String getNome() {
        return nome;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }
}
