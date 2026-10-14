package com.meioameio.backend.dto;

public class LojaLocalizacaoResponse {
    private boolean configurada;
    private Double latitude;
    private Double longitude;

    public LojaLocalizacaoResponse(boolean configurada, Double latitude, Double longitude) {
        this.configurada = configurada;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public boolean isConfigurada() {
        return configurada;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }
}
