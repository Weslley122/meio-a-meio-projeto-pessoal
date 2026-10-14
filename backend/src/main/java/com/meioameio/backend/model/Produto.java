package com.meioameio.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    private Long id;

    @Column(nullable = false, length = 40)
    private String categoria;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 150)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    // Descreve a ilustração do produto (renderizada no front-end): tipo de embalagem + cores
    @Column(name = "arte_tipo", nullable = false, length = 20)
    private String arteTipo; // can, bottle, bottle-small, tin, bag, ice, icebar, tray, cups

    @Column(name = "arte_cor", length = 10)
    private String arteCor;

    @Column(name = "arte_faixa", length = 10)
    private String arteFaixa;

    public Produto() {
    }

    public Produto(Long id, String categoria, String nome, String descricao, BigDecimal preco,
                    String arteTipo, String arteCor, String arteFaixa) {
        this.id = id;
        this.categoria = categoria;
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.arteTipo = arteTipo;
        this.arteCor = arteCor;
        this.arteFaixa = arteFaixa;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public String getArteTipo() {
        return arteTipo;
    }

    public void setArteTipo(String arteTipo) {
        this.arteTipo = arteTipo;
    }

    public String getArteCor() {
        return arteCor;
    }

    public void setArteCor(String arteCor) {
        this.arteCor = arteCor;
    }

    public String getArteFaixa() {
        return arteFaixa;
    }

    public void setArteFaixa(String arteFaixa) {
        this.arteFaixa = arteFaixa;
    }
}
