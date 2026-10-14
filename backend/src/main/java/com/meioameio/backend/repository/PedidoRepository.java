package com.meioameio.backend.repository;

import com.meioameio.backend.model.Pedido;
import com.meioameio.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioOrderByCriadoEmDesc(Usuario usuario);
    List<Pedido> findAllByOrderByCriadoEmDesc();
}
