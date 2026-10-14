package com.meioameio.backend.security;

import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class UsuarioAutenticadoProvider {

    private final UsuarioRepository usuarioRepository;

    public UsuarioAutenticadoProvider(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Recupera o usuário logado a partir do ID salvo no token JWT
     * (o JwtAuthFilter coloca o ID como "principal" da autenticação).
     * Se o usuário não existir mais, responde 401 para o front-end pedir login de novo.
     */
    public Usuario obterUsuarioLogado() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            Long id = Long.valueOf(String.valueOf(principal));
            return usuarioRepository.findById(id)
                    .orElseThrow(() -> new BadCredentialsException("Sessão expirada. Faça login novamente."));
        } catch (NumberFormatException e) {
            throw new BadCredentialsException("Sessão expirada. Faça login novamente.");
        }
    }
}
