package com.meioameio.backend.service;

import com.meioameio.backend.dto.AtualizarPerfilRequest;
import com.meioameio.backend.dto.UsuarioResponse;
import com.meioameio.backend.exception.RegraDeNegocioException;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.UsuarioRepository;
import com.meioameio.backend.security.Auditoria;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final Auditoria auditoria;

    public UsuarioService(UsuarioRepository usuarioRepository, Auditoria auditoria) {
        this.usuarioRepository = usuarioRepository;
        this.auditoria = auditoria;
    }

    public UsuarioResponse atualizarPerfil(Usuario usuarioLogado, AtualizarPerfilRequest req) {
        String novoTelefone = AuthService.telefoneValido(req.getTelefone());

        boolean telefoneMudou = !novoTelefone.equals(usuarioLogado.getTelefone());
        if (telefoneMudou && usuarioRepository.existsByTelefone(novoTelefone)) {
            throw new RegraDeNegocioException("Já existe uma conta com esse telefone.");
        }

        // Só nome, telefone e endereço mudam aqui. Papel (CLIENTE/ADMIN) e senha não estão no
        // AtualizarPerfilRequest, então não há como um cliente se promover a admin por esta rota.
        usuarioLogado.setNome(req.getNome().trim());
        usuarioLogado.setTelefone(novoTelefone);
        usuarioLogado.setEndereco(req.getEndereco().trim());
        usuarioRepository.save(usuarioLogado);
        auditoria.perfilAlterado(usuarioLogado.getId(), telefoneMudou);

        return new UsuarioResponse(usuarioLogado);
    }
}
