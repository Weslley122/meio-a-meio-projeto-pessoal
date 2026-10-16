package com.meioameio.backend.exception;

/** Login bloqueado por excesso de senhas erradas (vira HTTP 429 com Retry-After). */
public class MuitasTentativasException extends RuntimeException {

    private final long segundos;

    public MuitasTentativasException(long minutos) {
        super("Muitas tentativas de login. Tente de novo em " + minutos + (minutos == 1 ? " minuto." : " minutos."));
        this.segundos = minutos * 60;
    }

    public long getSegundos() {
        return segundos;
    }
}
