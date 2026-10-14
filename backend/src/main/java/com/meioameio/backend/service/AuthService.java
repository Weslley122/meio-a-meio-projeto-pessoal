package com.meioameio.backend.service;

import com.meioameio.backend.dto.*;
import com.meioameio.backend.exception.RegraDeNegocioException;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.UsuarioRepository;
import com.meioameio.backend.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse registrar(RegistroRequest req) {
        String telefone = normalizarTelefone(req.getTelefone());

        if (usuarioRepository.existsByTelefone(telefone)) {
            throw new RegraDeNegocioException("Esse telefone já tem cadastro. Faça login.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.getNome());
        usuario.setTelefone(telefone);
        usuario.setEndereco(req.getEndereco());
        usuario.setSenha(passwordEncoder.encode(req.getSenha()));
        usuario.setRole("CLIENTE");
        usuarioRepository.save(usuario);

        String token = jwtUtil.gerarToken(usuario.getId(), usuario.getRole());
        return new AuthResponse(token, new UsuarioResponse(usuario));
    }

    public AuthResponse login(LoginRequest req) {
        String telefone = normalizarTelefone(req.getTelefone());

        Usuario usuario = usuarioRepository.findByTelefone(telefone)
                .orElseThrow(() -> new BadCredentialsException(
                        "Não encontramos esse telefone. Confira o número ou crie uma conta."));

        if (!passwordEncoder.matches(req.getSenha(), usuario.getSenha())) {
            throw new BadCredentialsException("Senha incorreta.");
        }

        String token = jwtUtil.gerarToken(usuario.getId(), usuario.getRole());
        return new AuthResponse(token, new UsuarioResponse(usuario));
    }

    public static String normalizarTelefone(String telefone) {
        return telefone == null ? "" : telefone.replaceAll("\\D", "");
    }
}
