package com.meioameio.backend.service;

import com.meioameio.backend.dto.*;
import com.meioameio.backend.exception.MuitasTentativasException;
import com.meioameio.backend.exception.RegraDeNegocioException;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.UsuarioRepository;
import com.meioameio.backend.security.Auditoria;
import com.meioameio.backend.security.JwtUtil;
import com.meioameio.backend.security.LimiteDeTentativas;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    /**
     * Mesma mensagem para "telefone não existe" e "senha errada": mensagens diferentes deixariam
     * qualquer um descobrir quais telefones têm conta (enumeração de usuários, OWASP A07).
     */
    static final String CREDENCIAIS_INVALIDAS = "Telefone ou senha incorretos.";

    /**
     * Hash BCrypt de uma senha qualquer, usado quando o telefone não existe: assim a resposta
     * demora o mesmo tanto nos dois casos e o tempo de resposta também não entrega quem tem conta.
     */
    private final String hashFalso;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LimiteDeTentativas limite;
    private final Auditoria auditoria;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       LimiteDeTentativas limite, Auditoria auditoria) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.limite = limite;
        this.auditoria = auditoria;
        this.hashFalso = passwordEncoder.encode("senha-que-nao-existe-para-igualar-o-tempo");
    }

    public AuthResponse registrar(RegistroRequest req) {
        String telefone = telefoneValido(req.getTelefone());

        if (usuarioRepository.existsByTelefone(telefone)) {
            throw new RegraDeNegocioException("Esse telefone já tem cadastro. Faça login.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.getNome().trim());
        usuario.setTelefone(telefone);
        usuario.setEndereco(req.getEndereco().trim());
        usuario.setSenha(passwordEncoder.encode(req.getSenha()));
        // Menor privilégio: toda conta criada pelo app é CLIENTE. Não existe campo "role" no
        // RegistroRequest, então mandar "role": "ADMIN" no JSON é simplesmente ignorado.
        usuario.setRole("CLIENTE");
        usuarioRepository.save(usuario);

        auditoria.contaCriada(usuario.getId());
        String token = jwtUtil.gerarToken(usuario.getId(), usuario.getRole());
        return new AuthResponse(token, new UsuarioResponse(usuario));
    }

    public AuthResponse login(LoginRequest req) {
        String telefone = normalizarTelefone(req.getTelefone());

        long minutos = limite.minutosBloqueado(telefone);
        if (minutos > 0) {
            auditoria.loginBloqueado(telefone);
            throw new MuitasTentativasException(minutos);
        }

        Usuario usuario = usuarioRepository.findByTelefone(telefone).orElse(null);
        String hash = usuario != null ? usuario.getSenha() : hashFalso;
        boolean senhaConfere = passwordEncoder.matches(req.getSenha(), hash);

        if (usuario == null || !senhaConfere) {
            auditoria.loginFalhou(telefone, usuario == null ? "telefone_inexistente" : "senha_errada");
            if (limite.registrarFalha(telefone)) {
                auditoria.loginBloqueado(telefone);
            }
            throw new BadCredentialsException(CREDENCIAIS_INVALIDAS);
        }

        limite.registrarSucesso(telefone);
        auditoria.loginOk(usuario.getId());
        String token = jwtUtil.gerarToken(usuario.getId(), usuario.getRole());
        return new AuthResponse(token, new UsuarioResponse(usuario));
    }

    public static String normalizarTelefone(String telefone) {
        return telefone == null ? "" : telefone.replaceAll("\\D", "");
    }

    /** Telefone brasileiro com DDD: 10 (fixo) ou 11 (celular) dígitos. */
    public static String telefoneValido(String telefone) {
        String digitos = normalizarTelefone(telefone);
        if (digitos.length() < 10 || digitos.length() > 11) {
            throw new RegraDeNegocioException("Digite o telefone com DDD, como (96) 98123-4567.");
        }
        return digitos;
    }
}
