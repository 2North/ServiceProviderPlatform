package com.diploma.spp.security;

import com.diploma.spp.config.GoogleOAuthProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AesTokenEncryptorTest {

    private AesTokenEncryptor encryptor;

    @BeforeEach
    void setUp() {
        GoogleOAuthProperties properties = new GoogleOAuthProperties();
        GoogleOAuthProperties.Encryption enc = new GoogleOAuthProperties.Encryption();
        enc.setSecret("test-secret-for-unit-tests-32char");
        properties.setEncryption(enc);
        encryptor = new AesTokenEncryptor(properties);
    }

    @Test
    void encryptDecrypt_roundTrip() {
        String plain = "ya29.some_google_access_token";
        String encrypted = encryptor.encrypt(plain);

        assertThat(encrypted).isNotEqualTo(plain);
        assertThat(encryptor.decrypt(encrypted)).isEqualTo(plain);
    }

    @Test
    void encrypt_producesDifferentCiphertextEachTime() {
        String plain = "1//0g_refresh_token_value";
        String first = encryptor.encrypt(plain);
        String second = encryptor.encrypt(plain);

        // Random IV means each call produces a different ciphertext
        assertThat(first).isNotEqualTo(second);
        assertThat(encryptor.decrypt(first)).isEqualTo(plain);
        assertThat(encryptor.decrypt(second)).isEqualTo(plain);
    }

    @Test
    void encrypt_null_returnsNull() {
        assertThat(encryptor.encrypt(null)).isNull();
        assertThat(encryptor.decrypt(null)).isNull();
    }
}
