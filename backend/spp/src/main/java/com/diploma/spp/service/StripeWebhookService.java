package com.diploma.spp.service;

import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Payment;
import com.diploma.spp.model.PaymentEvent;
import com.diploma.spp.repository.PaymentEventRepository;
import com.diploma.spp.repository.PaymentRepository;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;
import com.stripe.model.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookService {

    private final StripePaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;

    public Event constructAndVerify(String payload, String sigHeader, String webhookSecret)
            throws SignatureVerificationException {
        return Webhook.constructEvent(payload, sigHeader, webhookSecret);
    }

    @Transactional
    public void handleEvent(Event event) {
        // Idempotency — skip if already processed
        if (paymentEventRepository.existsByStripeEventId(event.getId())) {
            log.info("Skipping duplicate Stripe event {}", event.getId());
            return;
        }

        String type = event.getType();
        String paymentIntentId = extractPaymentIntentId(event);

        switch (type) {
            case "payment_intent.succeeded" -> {
                if (paymentIntentId != null) {
                    paymentService.confirmPaymentSucceeded(paymentIntentId);
                    recordEvent(event, paymentIntentId);
                }
            }
            case "payment_intent.payment_failed" -> {
                if (paymentIntentId != null) {
                    paymentService.markPaymentFailed(paymentIntentId);
                    recordEvent(event, paymentIntentId);
                }
            }
            case "charge.refunded" -> {
                String piId = extractPaymentIntentIdFromCharge(event);
                if (piId != null) {
                    paymentService.markRefunded(piId);
                    recordEventByCharge(event, piId);
                }
            }
            default -> log.debug("Unhandled Stripe event type: {}", type);
        }
    }

    private JsonObject getDataObject(Event event) {
        try {
            JsonObject root = JsonParser.parseString(event.toJson()).getAsJsonObject();
            return root.getAsJsonObject("data").getAsJsonObject("object");
        } catch (Exception e) {
            log.warn("Could not parse event JSON for {}", event.getId());
            return null;
        }
    }

    private String extractPaymentIntentId(Event event) {
        JsonObject obj = getDataObject(event);
        if (obj == null) return null;
        try {
            return obj.getAsJsonPrimitive("id").getAsString();
        } catch (Exception e) {
            log.warn("Could not extract id from event {}", event.getId());
            return null;
        }
    }

    private String extractPaymentIntentIdFromCharge(Event event) {
        JsonObject obj = getDataObject(event);
        if (obj == null) return null;
        try {
            return obj.getAsJsonPrimitive("payment_intent").getAsString();
        } catch (Exception e) {
            log.warn("Could not extract payment_intent from charge event {}", event.getId());
            return null;
        }
    }

    private void recordEvent(Event event, String paymentIntentId) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .ifPresent(payment -> savePaymentEvent(event, payment));
    }

    private void recordEventByCharge(Event event, String paymentIntentId) {
        if (paymentIntentId == null) return;
        paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .ifPresent(payment -> savePaymentEvent(event, payment));
    }

    private void savePaymentEvent(Event event, Payment payment) {
        PaymentEvent pe = PaymentEvent.builder()
                .payment(payment)
                .eventType(event.getType())
                .stripeEventId(event.getId())
                .payload(event.toJson())
                .receivedAt(LocalDateTime.now())
                .build();
        paymentEventRepository.save(pe);
    }
}
