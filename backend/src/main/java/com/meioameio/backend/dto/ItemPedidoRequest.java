package com.meioameio.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ItemPedidoRequest {

    @NotNull(message = "Informe o produto")
    private Long produtoId;

    @NotNull(message = "Informe a quantidade")
    @Min(value = 1, message = "Quantidade mínima é 1")
    @Max(value = 99, message = "Quantidade máxima é 99 por produto.")
    private Integer quantidade;

    public Long getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
}
