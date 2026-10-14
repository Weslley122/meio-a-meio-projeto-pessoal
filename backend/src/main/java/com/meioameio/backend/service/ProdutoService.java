package com.meioameio.backend.service;

import com.meioameio.backend.dto.ProdutoResponse;
import com.meioameio.backend.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public List<ProdutoResponse> listarTodos() {
        return produtoRepository.findAll().stream()
                .map(ProdutoResponse::new)
                .collect(Collectors.toList());
    }
}
