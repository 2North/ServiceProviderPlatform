package com.diploma.spp.repository;

import com.diploma.spp.model.OrderResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderResponseRepository extends JpaRepository<OrderResponse, Long> {
    List<OrderResponse> findByOrder_Id(Long orderId);
    List<OrderResponse> findBySpecialist_Id(Long specialistId);
}
