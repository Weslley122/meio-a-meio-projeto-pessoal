package com.meioameio.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginRequest {

    @NotBlank(message = "Informe o telefone")
    @Size(max = 20, message = "Telefone inválido.")
    private String telefone;

    // Limite também no login: senha gigante faria o BCrypt trabalhar à toa (e passaria dos 72 bytes).
    @NotBlank(message = "Informe a senha")
    @Size(max = 64, message = "Telefone ou senha incorretos.")
    private String senha;

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
