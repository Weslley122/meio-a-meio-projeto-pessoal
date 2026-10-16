package com.meioameio.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import jakarta.validation.Valid;

import java.util.List;

public class PedidoRequest {

    @NotEmpty(message = "O pedido precisa ter pelo menos um item")
    @Size(max = 30, message = "O pedido pode ter até 30 produtos diferentes.")
    @Valid
    private List<ItemPedidoRequest> itens;

    // Lista fechada: qualquer outro texto é recusado em vez de ser gravado e exibido no painel.
    @NotBlank(message = "Escolha uma forma de pagamento")
    @Pattern(regexp = "pix|cartao|dinheiro", message = "Forma de pagamento inválida.")
    private String formaPagamento;

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
