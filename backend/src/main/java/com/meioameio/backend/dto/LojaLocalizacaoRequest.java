package com.meioameio.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class LojaLocalizacaoRequest {

    @NotNull(message = "Informe a latitude")
    @DecimalMin(value = "-90", message = "Latitude inválida")
    @DecimalMax(value = "90", message = "Latitude inválida")
    private Double latitude;

    @NotNull(message = "Informe a longitude")
    @DecimalMin(value = "-180", message = "Longitude inválida")
    @DecimalMax(value = "180", message = "Longitude inválida")
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
