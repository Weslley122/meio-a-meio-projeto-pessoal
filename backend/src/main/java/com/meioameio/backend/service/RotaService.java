package com.meioameio.backend.service;

import com.meioameio.backend.dto.RotaRequest;
import com.meioameio.backend.dto.RotaResponse;
import com.meioameio.backend.exception.RegraDeNegocioException;
import com.meioameio.backend.model.LojaConfig;
import org.springframework.stereotype.Service;

@Service
public class RotaService {

    // Fator para aproximar a distância em linha reta de uma distância real de ruas
    private static final double FATOR_DESVIO_RUAS = 1.35;
    // Velocidade média assumida para entrega urbana (moto/carro, com paradas)
    private static final double VELOCIDADE_MEDIA_KMH = 22.0;
    // Tempo médio de preparo do pedido antes de sair para entrega
    private static final int TEMPO_PREPARO_MIN = 12;
    private static final int TEMPO_MINIMO_MIN = 15;

    private final LojaConfigService lojaConfigService;

    public RotaService(LojaConfigService lojaConfigService) {
        this.lojaConfigService = lojaConfigService;
    }

    public RotaResponse calcular(RotaRequest req) {
        LojaConfig loja = lojaConfigService.obterConfigOuNulo();
        if (loja == null || loja.getLatitude() == null || loja.getLongitude() == null) {
            throw new RegraDeNegocioException("A localização da loja ainda não foi configurada pelo administrador.");
        }

        double distanciaRetaKm = haversineKm(loja.getLatitude(), loja.getLongitude(), req.getLatitude(), req.getLongitude());
        double distanciaEstradaKm = distanciaRetaKm * FATOR_DESVIO_RUAS;
        double tempoViagemMin = (distanciaEstradaKm / VELOCIDADE_MEDIA_KMH) * 60.0;
        int tempoEstimadoMin = (int) Math.max(TEMPO_MINIMO_MIN, Math.round(tempoViagemMin + TEMPO_PREPARO_MIN));

        return new RotaResponse(round1(distanciaEstradaKm), tempoEstimadoMin);
    }

    /** Distância em linha reta entre duas coordenadas GPS, em quilômetros. */
    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double raioTerraKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return raioTerraKm * c;
    }

    private static double round1(double valor) {
        return Math.round(valor * 10.0) / 10.0;
    }
}
