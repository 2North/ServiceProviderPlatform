package com.diploma.spp.controller;

import com.diploma.spp.dto.OrderDto;
import com.diploma.spp.dto.OrderResponseDto;
import com.diploma.spp.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<OrderDto> create(@RequestBody OrderDto dto) {
        return ResponseEntity.ok(orderService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getOpenOrders() {
        return ResponseEntity.ok(orderService.getOpenOrders());
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<List<OrderDto>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(orderService.getByClient(clientId));
    }

    @PostMapping("/respond")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public ResponseEntity<OrderResponseDto> respond(@RequestBody OrderResponseDto dto) {
        return ResponseEntity.ok(orderService.respond(dto));
    }

    @GetMapping("/{orderId}/responses")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<List<OrderResponseDto>> getResponses(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getResponsesByOrder(orderId));
    }

    @PatchMapping("/responses/{responseId}/accept")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<OrderResponseDto> acceptResponse(@PathVariable Long responseId) {
        return ResponseEntity.ok(orderService.acceptResponse(responseId));
    }
}