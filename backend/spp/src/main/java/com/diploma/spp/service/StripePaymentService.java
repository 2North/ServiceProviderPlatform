package com.diploma.spp.service;

import com.diploma.spp.config.StripeProperties;
import com.diploma.spp.dto.PaymentDto;
import com.diploma.spp.dto.PaymentIntentResponse;
import com.diploma.spp.event.BookingCancelledEvent;
import com.diploma.spp.event.BookingConfirmedEvent;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Booking;
import com.diploma.spp.model.BookingStatus;
import com.diploma.spp.model.Payment;
import com.diploma.spp.model.PaymentStatus;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.repository.PaymentRepository;
import org.springframework.context.ApplicationEventPublisher;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final StripeProperties stripeProperties;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PaymentIntentResponse createPaymentIntent(Booking booking) throws StripeException {
        // Stripe works in smallest currency unit (cents)
        long amountCents = booking.getService().getPrice()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(stripeProperties.getCurrency())
                .putMetadata("booking_id", String.valueOf(booking.getId()))
                .putMetadata("client_email", booking.getClient().getEmail())
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getService().getPrice())
                .currency(stripeProperties.getCurrency())
                .status(PaymentStatus.PENDING)
                .stripePaymentIntentId(intent.getId())
                .stripeClientSecret(intent.getClientSecret())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setPayment(saved);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return PaymentIntentResponse.builder()
                .paymentId(saved.getId())
                .clientSecret(intent.getClientSecret())
                .amount(saved.getAmount())
                .currency(saved.getCurrency())
                .build();
    }

    @Transactional
    public void confirmPaymentSucceeded(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for intent: " + paymentIntentId));

        payment.setStatus(PaymentStatus.SUCCEEDED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        eventPublisher.publishEvent(new BookingConfirmedEvent(this, booking));
        log.info("Payment {} succeeded for booking {}", payment.getId(), booking.getId());
    }

    @Transactional
    public void markPaymentFailed(String paymentIntentId) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Payment {} failed for booking {}", payment.getId(), payment.getBooking().getId());
        });
    }

    @Transactional
    public void refundPayment(Payment payment, String reason) throws StripeException {
        RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(payment.getStripePaymentIntentId())
                .setReason(RefundCreateParams.Reason.valueOf(
                        reason != null ? reason.toUpperCase() : "REQUESTED_BY_CUSTOMER"))
                .build();

        Refund.create(params);

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        log.info("Payment {} refunded for booking {}", payment.getId(), booking.getId());
    }

    @Transactional
    public void markRefunded(String paymentIntentId) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        });
    }

    public PaymentDto toDto(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .clientSecret(payment.getStripeClientSecret())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
