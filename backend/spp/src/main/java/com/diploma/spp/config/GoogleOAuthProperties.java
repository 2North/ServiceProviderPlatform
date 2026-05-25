package com.diploma.spp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.google")
@Data
public class GoogleOAuthProperties {

    private Oauth oauth = new Oauth();
    private Encryption encryption = new Encryption();

    @Data
    public static class Oauth {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    @Data
    public static class Encryption {
        private String secret;
    }
}
