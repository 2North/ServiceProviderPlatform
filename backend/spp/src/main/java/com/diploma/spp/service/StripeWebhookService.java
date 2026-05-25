package com.diploma.spp.service;

import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Payment;
import com.diploma.spp.model.PaymentEvent;
import com.diploma.spp.repository.PaymentEventRepository;
import com.diploma.spp.repository.PaymentRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
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
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        Optional<StripeObject> stripeObject = deserializer.getObject();

        switch (type) {
            case "payment_intent.succeeded" -> stripeObject
                    .filter(o -> o instanceof PaymentIntent)
                    .map(o -> (PaymentIntent) o)
                    .ifPresent(pi -> {
                        paymentService.confirmPaymentSucceeded(pi.getId());
                        recordEvent(event, pi.getId());
                    });

            case "payment_intent.payment_failed" -> stripeObject
                    .filter(o -> o instanceof PaymentIntent)
                    .map(o -> (PaymentIntent) o)
                    .ifPresent(pi -> {
                        paymentService.markPaymentFailed(pi.getId());
                        recordEvent(event, pi.getId());
                    });

            case "charge.refunded" -> {
                // charge.refunded carries a Charge object; get payment intent id from metadata
                stripeObject.ifPresent(o -> {
                    if (o instanceof com.stripe.model.Charge charge) {
                        paymentService.markRefunded(charge.getPaymentIntent());
                        recordEventByCharge(event, charge.getPaymentIntent());
                    }
                });
            }

            default -> log.debug("Unhandled Stripe event type: {}", type);
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
