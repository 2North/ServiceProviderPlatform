package com.diploma.spp.repository;

import com.diploma.spp.model.PaymentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentEventRepository extends JpaRepository<PaymentEvent, Long> {

    boolean existsByStripeEventId(String stripeEventId);
}
