package com.meioameio.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegistroRequest {

    @NotBlank(message = "Informe o nome")
    @Size(max = 80, message = "O nome pode ter até 80 caracteres.")
    private String nome;

    @NotBlank(message = "Informe o telefone")
    @Pattern(regexp = "^[0-9()+\\-\\s]{10,20}$", message = "Digite o telefone com DDD, como (96) 98123-4567.")
    private String telefone;

    @NotBlank(message = "Informe o endereço de entrega")
    @Size(min = 5, max = 120, message = "O endereço precisa ter de 5 a 120 caracteres.")
    private String endereco;

    // Mínimo 8 (recomendação do NIST SP 800-63B). Máximo 64 porque o BCrypt ignora o que passa de 72 bytes.
    @NotBlank(message = "Informe uma senha")
    @Size(min = 8, max = 64, message = "A senha precisa ter de 8 a 64 caracteres.")
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
