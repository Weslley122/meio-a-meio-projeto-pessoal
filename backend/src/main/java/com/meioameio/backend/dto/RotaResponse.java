package com.meioameio.backend.dto;

public class RotaResponse {
    private double distanciaKm;
    private int tempoEstimadoMin;

    public RotaResponse(double distanciaKm, int tempoEstimadoMin) {
        this.distanciaKm = distanciaKm;
        this.tempoEstimadoMin = tempoEstimadoMin;
    }

    public double getDistanciaKm() {
        return distanciaKm;
    }

    public int getTempoEstimadoMin() {
        return tempoEstimadoMin;
    }
}
