package com.meioameio.backend.controller;

import com.meioameio.backend.dto.LojaLocalizacaoRequest;
import com.meioameio.backend.dto.LojaLocalizacaoResponse;
import com.meioameio.backend.security.Auditoria;
import com.meioameio.backend.security.UsuarioAutenticadoProvider;
import com.meioameio.backend.service.LojaConfigService;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loja")
public class LojaController {

    private final LojaConfigService lojaConfigService;
    private final UsuarioAutenticadoProvider usuarioAutenticadoProvider;
    private final Auditoria auditoria;

    public LojaController(LojaConfigService lojaConfigService, UsuarioAutenticadoProvider usuarioAutenticadoProvider,
                          Auditoria auditoria) {
        this.lojaConfigService = lojaConfigService;
        this.usuarioAutenticadoProvider = usuarioAutenticadoProvider;
        this.auditoria = auditoria;
    }

    @GetMapping("/localizacao")
    public LojaLocalizacaoResponse obterLocalizacao() {
        return lojaConfigService.obterLocalizacao();
    }

    @PutMapping("/localizacao")
    @PreAuthorize("hasRole('ADMIN')")
    public LojaLocalizacaoResponse atualizarLocalizacao(@Valid @RequestBody LojaLocalizacaoRequest req) {
        LojaLocalizacaoResponse resposta = lojaConfigService.atualizarLocalizacao(req);
        auditoria.localizacaoLojaAlterada(usuarioAutenticadoProvider.obterUsuarioLogado().getId());
        return resposta;
    }
}
