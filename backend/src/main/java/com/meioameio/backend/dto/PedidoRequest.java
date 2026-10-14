package com.meioameio.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class PedidoRequest {

    @NotEmpty(message = "O pedido precisa ter pelo menos um item")
    @Valid
    private List<ItemPedidoRequest> itens;

    @NotBlank(message = "Escolha uma forma de pagamento")
    private String formaPagamento; // pix, cartao, dinheiro

    public List<ItemPedidoRequest> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoRequest> itens) {
        this.itens = itens;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}
