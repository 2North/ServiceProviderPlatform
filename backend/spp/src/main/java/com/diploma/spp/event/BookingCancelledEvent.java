package com.diploma.spp.event;

import com.diploma.spp.model.Booking;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BookingCancelledEvent extends ApplicationEvent {

    private final Booking booking;

    public BookingCancelledEvent(Object source, Booking booking) {
        super(source);
        this.booking = booking;
    }
}
