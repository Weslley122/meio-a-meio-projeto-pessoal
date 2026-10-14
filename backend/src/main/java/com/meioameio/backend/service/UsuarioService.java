package com.meioameio.backend.service;

import com.meioameio.backend.dto.AtualizarPerfilRequest;
import com.meioameio.backend.dto.UsuarioResponse;
import com.meioameio.backend.exception.RegraDeNegocioException;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public UsuarioResponse atualizarPerfil(Usuario usuarioLogado, AtualizarPerfilRequest req) {
        String novoTelefone = AuthService.normalizarTelefone(req.getTelefone());

        boolean telefoneMudou = !novoTelefone.equals(usuarioLogado.getTelefone());
        if (telefoneMudou && usuarioRepository.existsByTelefone(novoTelefone)) {
            throw new RegraDeNegocioException("Já existe uma conta com esse telefone.");
        }

        usuarioLogado.setNome(req.getNome());
        usuarioLogado.setTelefone(novoTelefone);
        usuarioLogado.setEndereco(req.getEndereco());
        usuarioRepository.save(usuarioLogado);

        return new UsuarioResponse(usuarioLogado);
    }
}
