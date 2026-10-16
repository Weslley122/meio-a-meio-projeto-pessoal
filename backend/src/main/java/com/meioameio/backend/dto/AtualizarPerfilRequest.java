package com.meioameio.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AtualizarPerfilRequest {

    @NotBlank(message = "Informe o nome")
    @Size(max = 80, message = "O nome pode ter até 80 caracteres.")
    private String nome;

    @NotBlank(message = "Informe o telefone")
    @Pattern(regexp = "^[0-9()+\\-\\s]{10,20}$", message = "Digite o telefone com DDD, como (96) 98123-4567.")
    private String telefone;

    @NotBlank(message = "Informe o endereço")
    @Size(min = 5, max = 120, message = "O endereço precisa ter de 5 a 120 caracteres.")
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
