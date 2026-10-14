package com.meioameio.backend.controller;

import com.meioameio.backend.dto.LojaLocalizacaoRequest;
import com.meioameio.backend.dto.LojaLocalizacaoResponse;
import com.meioameio.backend.service.LojaConfigService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loja")
public class LojaController {

    private final LojaConfigService lojaConfigService;

    public LojaController(LojaConfigService lojaConfigService) {
        this.lojaConfigService = lojaConfigService;
    }

    @GetMapping("/localizacao")
    public LojaLocalizacaoResponse obterLocalizacao() {
        return lojaConfigService.obterLocalizacao();
    }

    @PutMapping("/localizacao")
    public LojaLocalizacaoResponse atualizarLocalizacao(@Valid @RequestBody LojaLocalizacaoRequest req) {
        return lojaConfigService.atualizarLocalizacao(req);
    }
}
