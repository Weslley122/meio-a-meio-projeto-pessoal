package com.meioameio.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;

public class RegistroRequest {

    @NotBlank(message = "Informe o nome")
    private String nome;

    @NotBlank(message = "Informe o telefone")
    private String telefone;

    @NotBlank(message = "Informe o endereço de entrega")
    private String endereco;

    @NotBlank(message = "Informe uma senha")
    private String senha;

    @AssertTrue(message = "É necessário confirmar que você é maior de 18 anos")
    private boolean maiorDeIdade;

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

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public boolean isMaiorDeIdade() {
        return maiorDeIdade;
    }

    public void setMaiorDeIdade(boolean maiorDeIdade) {
        this.maiorDeIdade = maiorDeIdade;
    }
}
