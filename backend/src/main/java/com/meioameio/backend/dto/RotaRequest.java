package com.meioameio.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RotaRequest {

    @NotNull(message = "Informe a latitude do cliente")
    private Double latitude;

    @NotNull(message = "Informe a longitude do cliente")
    private Double longitude;

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
