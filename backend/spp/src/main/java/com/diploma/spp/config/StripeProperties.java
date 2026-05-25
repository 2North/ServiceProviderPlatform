package com.diploma.spp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.stripe")
@Data
public class StripeProperties {

    private String apiKey;
    private String webhookSecret;
    private String currency = "eur";
}
