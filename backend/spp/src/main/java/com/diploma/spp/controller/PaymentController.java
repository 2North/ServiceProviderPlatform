package com.diploma.spp.controller;

import com.diploma.spp.dto.PaymentDto;
import com.diploma.spp.dto.PaymentIntentResponse;
import com.diploma.spp.exception.ConflictException;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Booking;
import com.diploma.spp.model.Payment;
import com.diploma.spp.model.PaymentStatus;
import com.diploma.spp.model.User;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.repository.PaymentRepository;
import com.diploma.spp.service.StripePaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final StripePaymentService paymentService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @PostMapping("/api/bookings/{id}/payment")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) throws StripeException {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getClient().getId().equals(currentUser.getId())) {
            throw new com.diploma.spp.exception.ForbiddenException("Not your booking");
        }
        if (booking.getPayment() != null) {
            throw new ConflictException("Payment already exists for this booking");
        }

        return ResponseEntity.ok(paymentService.createPaymentIntent(booking));
    }

    @GetMapping("/api/payments/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentDto> getPayment(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return ResponseEntity.ok(paymentService.toDto(payment));
    }

    @PostMapping("/api/payments/{id}/refund")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('CLIENT')")
    public ResponseEntity<PaymentDto> refund(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal User currentUser) throws StripeException {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        boolean isOwner = payment.getBooking().getClient().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new com.diploma.spp.exception.ForbiddenException("Not authorized to refund this payment");
        }
        if (payment.getStatus() != PaymentStatus.SUCCEEDED) {
            throw new ConflictException("Only succeeded payments can be refunded");
        }

        paymentService.refundPayment(payment, reason);
        return ResponseEntity.ok(paymentService.toDto(payment));
    }
}
