package com.meioameio.backend.dto;

import com.meioameio.backend.model.Usuario;

public class UsuarioResponse {
    private Long id;
    private String nome;
    private String telefone;
    private String endereco;
    private String role;

    public UsuarioResponse() {
    }

    public UsuarioResponse(Usuario u) {
        this.id = u.getId();
        this.nome = u.getNome();
        this.telefone = u.getTelefone();
        this.endereco = u.getEndereco();
        this.role = u.getRole();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
