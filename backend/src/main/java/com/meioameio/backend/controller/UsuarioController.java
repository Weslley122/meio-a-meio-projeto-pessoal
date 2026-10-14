package com.meioameio.backend.controller;

import com.meioameio.backend.dto.AtualizarPerfilRequest;
import com.meioameio.backend.dto.UsuarioResponse;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.security.UsuarioAutenticadoProvider;
import com.meioameio.backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    public UsuarioController(UsuarioService usuarioService, UsuarioAutenticadoProvider usuarioAutenticadoProvider) {
        this.usuarioService = usuarioService;
        this.usuarioAutenticadoProvider = usuarioAutenticadoProvider;
    }

    @GetMapping("/me")
    public UsuarioResponse meuPerfil() {
        Usuario usuario = usuarioAutenticadoProvider.obterUsuarioLogado();
        return new UsuarioResponse(usuario);
    }

    @PutMapping("/me")
    public UsuarioResponse atualizarPerfil(@Valid @RequestBody AtualizarPerfilRequest req) {
        Usuario usuario = usuarioAutenticadoProvider.obterUsuarioLogado();
        return usuarioService.atualizarPerfil(usuario, req);
    }
}
