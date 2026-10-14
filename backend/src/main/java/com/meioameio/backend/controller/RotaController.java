package com.meioameio.backend.controller;

import com.meioameio.backend.dto.RotaRequest;
import com.meioameio.backend.dto.RotaResponse;
import com.meioameio.backend.service.RotaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rota")
public class RotaController {

    private final RotaService rotaService;

    public RotaController(RotaService rotaService) {
        this.rotaService = rotaService;
    }

    @PostMapping("/calcular")
    public RotaResponse calcular(@Valid @RequestBody RotaRequest req) {
        return rotaService.calcular(req);
    }
}
