package com.meioameio.backend.exception;

import com.meioameio.backend.dto.ErroResponse;
import com.meioameio.backend.security.Auditoria;
import com.meioameio.backend.security.LimiteDeTamanhoFilter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.UUID;

/**
 * Transforma exceções em respostas JSON curtas.
 *
 * Regra de segurança (OWASP A05, má configuração / exposição de detalhes): a resposta nunca leva
 * mensagem técnica, nome de classe, SQL ou stack trace. Erro inesperado devolve só uma referência;
 * o detalhe completo fica no log interno com essa mesma referência, para quem for investigar.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final Auditoria auditoria;

    public GlobalExceptionHandler(Auditoria auditoria) {
        this.auditoria = auditoria;
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> tratarNaoEncontrado(RecursoNaoEncontradoException ex) {
        return erro(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ErroResponse> tratarRegraDeNegocio(RegraDeNegocioException ex) {
        return erro(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MuitasTentativasException.class)
    public ResponseEntity<ErroResponse> tratarMuitasTentativas(MuitasTentativasException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(ex.getSegundos()))
                .body(new ErroResponse(429, ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> tratarCredenciaisInvalidas(BadCredentialsException ex) {
        return erro(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    /** Barrado pelo @PreAuthorize (segunda camada de autorização). */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> tratarAcessoNegado(AccessDeniedException ex) {
        return erro(HttpStatus.FORBIDDEN, "Você não tem permissão para isso.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> tratarValidacao(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Dados inválidos.");
        return erro(HttpStatus.BAD_REQUEST, mensagem);
    }

    /** Corpo acima do teto (LimiteDeTamanhoFilter): pode vir direto ou embrulhado pelo Jackson. */
    @ExceptionHandler(LimiteDeTamanhoFilter.CorpoGrandeDemaisException.class)
    public ResponseEntity<ErroResponse> tratarCorpoGrande(Exception ex) {
        return erro(HttpStatus.PAYLOAD_TOO_LARGE, "Requisição grande demais.");
    }

    /** JSON quebrado ou com tipo errado: não devolvemos o erro do parser (ele revela classes internas). */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErroResponse> tratarCorpoInvalido(Exception ex) {
        // Se por baixo foi corpo grande demais (o Jackson lia o stream quando o teto estourou), é 413.
        for (Throwable causa = ex; causa != null; causa = causa.getCause()) {
            if (causa instanceof LimiteDeTamanhoFilter.CorpoGrandeDemaisException) {
                return erro(HttpStatus.PAYLOAD_TOO_LARGE, "Requisição grande demais.");
            }
        }
        return erro(HttpStatus.BAD_REQUEST, "Requisição em formato inválido.");
    }

    /** Duas gravações com o mesmo telefone ao mesmo tempo: o índice único do banco segura a segunda. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> tratarConflito(DataIntegrityViolationException ex) {
        return erro(HttpStatus.CONFLICT, "Esse dado já está em uso.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResponse> tratarMetodo(HttpRequestMethodNotSupportedException ex) {
        return erro(HttpStatus.METHOD_NOT_ALLOWED, "Método não permitido.");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResponse> tratarRotaInexistente(NoResourceFoundException ex) {
        return erro(HttpStatus.NOT_FOUND, "Endereço não encontrado.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> tratarGenerico(Exception ex) {
        String referencia = UUID.randomUUID().toString().substring(0, 8);
        auditoria.erroInterno(referencia, ex);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR,
                "Algo deu errado do nosso lado. Se continuar, informe a referência " + referencia + ".");
    }

    private static ResponseEntity<ErroResponse> erro(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(new ErroResponse(status.value(), mensagem));
    }
}
