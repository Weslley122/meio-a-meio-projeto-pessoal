package com.meioameio.backend.model;

import com.meioameio.backend.security.CriptografiaCampo;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 30)
    private String telefone;

    // Dado pessoal: cifrado com AES-256-GCM antes de ir para o banco (ver CriptografiaCampo).
    @Convert(converter = CriptografiaCampo.class)
    @Column(nullable = false, length = 600)
    private String endereco;

    // Hash BCrypt (com salt aleatório embutido), nunca a senha em si.
    @Column(nullable = false, length = 255)
    private String senha;

    @Column(nullable = false, length = 20)
    private String role; // "CLIENTE" ou "ADMIN"

    public Usuario() {
    }

    public Usuario(String nome, String telefone, String endereco, String senha, String role) {
        this.nome = nome;
        this.telefone = telefone;
        this.endereco = endereco;
        this.senha = senha;
        this.role = role;
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

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
