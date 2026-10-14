package com.meioameio.backend.service;

import com.meioameio.backend.dto.LojaLocalizacaoRequest;
import com.meioameio.backend.dto.LojaLocalizacaoResponse;
import com.meioameio.backend.model.LojaConfig;
import com.meioameio.backend.repository.LojaConfigRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LojaConfigService {

    private final LojaConfigRepository lojaConfigRepository;

    public LojaConfigService(LojaConfigRepository lojaConfigRepository) {
        this.lojaConfigRepository = lojaConfigRepository;
    }

    public LojaLocalizacaoResponse obterLocalizacao() {
        return lojaConfigRepository.findById(1L)
                .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
                .map(c -> new LojaLocalizacaoResponse(true, c.getLatitude(), c.getLongitude()))
                .orElse(new LojaLocalizacaoResponse(false, null, null));
    }

    public LojaLocalizacaoResponse atualizarLocalizacao(LojaLocalizacaoRequest req) {
        LojaConfig config = lojaConfigRepository.findById(1L).orElse(new LojaConfig());
        config.setId(1L);
        config.setLatitude(req.getLatitude());
        config.setLongitude(req.getLongitude());
        config.setAtualizadoEm(LocalDateTime.now());
        lojaConfigRepository.save(config);
        return new LojaLocalizacaoResponse(true, config.getLatitude(), config.getLongitude());
    }

    /** Usado internamente pelo RotaService; retorna null se a loja ainda não configurou a localização. */
    public LojaConfig obterConfigOuNulo() {
        return lojaConfigRepository.findById(1L).orElse(null);
    }
}
