package com.inn.cafe.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class EmailUtils {

    private static final Logger log = LoggerFactory.getLogger(EmailUtils.class);

    @Autowired
    JavaMailSender emailSender;



    public void sendSimpleMessage(String to, String subject, String text, List<String> list)
    {
        try
        {
            SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
            simpleMailMessage.setFrom("javapython37@gmail.com");
            simpleMailMessage.setTo(to);
            simpleMailMessage.setSubject(subject);
            simpleMailMessage.setText(text);
            if(list!=null && !list.isEmpty())
                simpleMailMessage.setCc(getCcArray(list));
            emailSender.send(simpleMailMessage);
            log.info( "Email sent");
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }

    }

    private String[] getCcArray(List<String> ccList) {
        return ccList.toArray(new String[0]);
    }


    public void forgotMail(String to, String subject, String password) throws MessagingException {
        log.info("Trying to retrieve password for forgotten password for email :- {}", to);
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true); // Set multipart to true
        helper.setFrom("javapython37@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);
        String htmlMsg = "<p><b>Your Login details for Cafe Management System</b><br>"
                + "<b>Email: </b>" + to + "<br>"
                + "<b>Password: </b>" + password + "<br>"
                + "<a href=\"http://localhost:4200/\">Click here to login</a></p>";
        message.setContent(htmlMsg, "text/html");
        emailSender.send(message);
        log.info("Forgot password email sent to {}", to);
    }


}
