package com.meioameio.backend.controller;

import com.meioameio.backend.dto.PedidoRequest;
import com.meioameio.backend.dto.PedidoResponse;
import com.meioameio.backend.dto.StatusUpdateRequest;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.security.UsuarioAutenticadoProvider;
import com.meioameio.backend.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    public PedidoController(PedidoService pedidoService, UsuarioAutenticadoProvider usuarioAutenticadoProvider) {
        this.pedidoService = pedidoService;
        this.usuarioAutenticadoProvider = usuarioAutenticadoProvider;
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> criar(@Valid @RequestBody PedidoRequest req) {
        Usuario usuario = usuarioAutenticadoProvider.obterUsuarioLogado();
        return ResponseEntity.ok(pedidoService.criarPedido(usuario, req));
    }

    @GetMapping("/meus")
    public List<PedidoResponse> meusPedidos() {
        Usuario usuario = usuarioAutenticadoProvider.obterUsuarioLogado();
        return pedidoService.listarMeusPedidos(usuario);
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PedidoResponse> todosPedidos() {
        return pedidoService.listarTodos();
    }

    @GetMapping("/{id}")
    public PedidoResponse buscarPorId(@PathVariable Long id) {
        Usuario usuario = usuarioAutenticadoProvider.obterUsuarioLogado();
        return pedidoService.buscarPorId(id, usuario);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public PedidoResponse atualizarStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest req) {
        Usuario admin = usuarioAutenticadoProvider.obterUsuarioLogado();
        return pedidoService.atualizarStatus(id, req.getStatus(), admin);
    }
}
