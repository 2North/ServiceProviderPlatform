package com.diploma.spp.service;

import com.diploma.spp.dto.OrderDto;
import com.diploma.spp.dto.OrderResponseDto;
import com.diploma.spp.exception.ConflictException;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.*;
import com.diploma.spp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderResponseRepository orderResponseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SpecialistProfileRepository specialistProfileRepository;

    public OrderDto create(OrderDto dto) {
        User client = userRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Order order = Order.builder()
                .client(client)
                .category(category)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .budget(dto.getBudget())
                .desiredDate(dto.getDesiredDate())
                .status(OrderStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toDto(orderRepository.save(order));
    }

    public List<OrderDto> getOpenOrders() {
        return orderRepository.findByStatus(OrderStatus.OPEN)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<OrderDto> getByClient(Long clientId) {
        return orderRepository.findByClient_Id(clientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public OrderResponseDto respond(OrderResponseDto dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new ConflictException("Order is not open for responses");
        }

        SpecialistProfile specialist = specialistProfileRepository.findById(dto.getSpecialistId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialist not found"));

        order.setStatus(OrderStatus.CLOSED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        if (orderResponseRepository.existsByOrder_IdAndSpecialist_Id(order.getId(), specialist.getId())) {
            return toResponseDto(orderResponseRepository.findByOrder_Id(order.getId()).stream()
                    .filter(r -> r.getSpecialist().getId().equals(specialist.getId()))
                    .findFirst().orElseThrow());
        }

        OrderResponse response = OrderResponse.builder()
                .order(order)
                .specialist(specialist)
                .proposedPrice(dto.getProposedPrice())
                .message(dto.getMessage())
                .status(ResponseStatus.ACCEPTED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toResponseDto(orderResponseRepository.save(response));
    }

    public List<OrderResponseDto> getResponsesByOrder(Long orderId) {
        return orderResponseRepository.findByOrder_Id(orderId)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Transactional
    public OrderResponseDto acceptResponse(Long responseId) {
        OrderResponse response = orderResponseRepository.findById(responseId)
                .orElseThrow(() -> new ResourceNotFoundException("Response not found"));

        response.setStatus(ResponseStatus.ACCEPTED);
        response.setUpdatedAt(LocalDateTime.now());

        response.getOrder().setStatus(OrderStatus.IN_PROGRESS);
        response.getOrder().setUpdatedAt(LocalDateTime.now());
        orderRepository.save(response.getOrder());

        return toResponseDto(orderResponseRepository.save(response));
    }

    private OrderDto toDto(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .clientId(order.getClient().getId())
                .categoryId(order.getCategory().getId())
                .title(order.getTitle())
                .description(order.getDescription())
                .budget(order.getBudget())
                .desiredDate(order.getDesiredDate())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderResponseDto toResponseDto(OrderResponse response) {
        return OrderResponseDto.builder()
                .id(response.getId())
                .orderId(response.getOrder().getId())
                .specialistId(response.getSpecialist().getId())
                .proposedPrice(response.getProposedPrice())
                .message(response.getMessage())
                .status(response.getStatus())
                .createdAt(response.getCreatedAt())
                .build();
    }
}