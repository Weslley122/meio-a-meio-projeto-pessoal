package com.meioameio.backend.dto;

import java.time.LocalDateTime;

public class ErroResponse {
    private LocalDateTime timestamp = LocalDateTime.now();
    private int status;
    private String mensagem;

    public ErroResponse(int status, String mensagem) {
        this.status = status;
        this.mensagem = mensagem;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getMensagem() {
        return mensagem;
    }
}
