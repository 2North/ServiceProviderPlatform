package com.diploma.spp.repository;

import com.diploma.spp.model.Order;
import com.diploma.spp.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus (OrderStatus status);

    List<Order> findByClient_Id(Long clientId);

    List<Order> findByCategory_Id(Long categoryId);
}
