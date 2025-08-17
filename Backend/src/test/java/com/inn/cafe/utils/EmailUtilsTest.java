package com.inn.cafe.utils;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailUtilsTest {

    @Mock
    private JavaMailSender emailSender;

    @InjectMocks
    private EmailUtils emailUtils;

    @Test
    void sendSimpleMessage_ValidInput_SendsEmail() {
        String to = "test@example.com";
        String subject = "Test Subject";
        String text = "Test message";
        List<String> ccList = Arrays.asList("cc1@example.com", "cc2@example.com");

        emailUtils.sendSimpleMessage(to, subject, text, ccList);

        verify(emailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendSimpleMessage_NoCcList_SendsEmail() {
        String to = "test@example.com";
        String subject = "Test Subject";
        String text = "Test message";

        emailUtils.sendSimpleMessage(to, subject, text, null);

        verify(emailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void emailUtils_instantiation() {
        // Just verify EmailUtils can be instantiated
        assertDoesNotThrow(() -> new EmailUtils());
    }

    @Test
    void sendSimpleMessage_EmailException_HandlesGracefully() {
        String to = "test@example.com";
        String subject = "Test Subject";
        String text = "Test message";

        doThrow(new RuntimeException("Email error")).when(emailSender).send(any(SimpleMailMessage.class));

        // Should not throw exception, just log it
        assertDoesNotThrow(() -> emailUtils.sendSimpleMessage(to, subject, text, null));

        verify(emailSender).send(any(SimpleMailMessage.class));
    }
}