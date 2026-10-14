package com.meioameio.backend.dto;

import com.meioameio.backend.model.Produto;
import java.math.BigDecimal;

public class ProdutoResponse {
    private Long id;
    private String categoria;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private String arteTipo;
    private String arteCor;
    private String arteFaixa;

    public ProdutoResponse(Produto p) {
        this.id = p.getId();
        this.categoria = p.getCategoria();
        this.nome = p.getNome();
        this.descricao = p.getDescricao();
        this.preco = p.getPreco();
        this.arteTipo = p.getArteTipo();
        this.arteCor = p.getArteCor();
        this.arteFaixa = p.getArteFaixa();
    }

    public Long getId() {
        return id;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public String getArteTipo() {
        return arteTipo;
    }

    public String getArteCor() {
        return arteCor;
    }

    public String getArteFaixa() {
        return arteFaixa;
    }
}
