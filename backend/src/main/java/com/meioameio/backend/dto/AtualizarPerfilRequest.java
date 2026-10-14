package com.meioameio.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AtualizarPerfilRequest {

    @NotBlank(message = "Informe o nome")
    private String nome;

    @NotBlank(message = "Informe o telefone")
    private String telefone;

    @NotBlank(message = "Informe o endereço")
    private String endereco;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }
}
