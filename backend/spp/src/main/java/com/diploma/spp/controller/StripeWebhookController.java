package com.diploma.spp.controller;

import com.diploma.spp.config.StripeProperties;
import com.diploma.spp.service.StripeWebhookService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final StripeWebhookService webhookService;
    private final StripeProperties stripeProperties;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = webhookService.constructAndVerify(payload, sigHeader, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        try {
            webhookService.handleEvent(event);
        } catch (Exception e) {
            // Log but return 200 — Stripe must not retry processing errors
            log.error("Error processing Stripe event {}: {}", event.getId(), e.getMessage(), e);
        }

        return ResponseEntity.ok("OK");
    }
}
