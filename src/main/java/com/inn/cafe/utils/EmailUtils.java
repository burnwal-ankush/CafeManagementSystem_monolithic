package com.inn.cafe.utils;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class EmailUtils {

    @Autowired
    JavaMailSender emailSender;
    Logger log = LoggerFactory.getLogger(EmailUtils.class);

    public void sendSimpleMessage(String to, String subject, String text, List<String> list)
    {
        try
        {
            SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
            simpleMailMessage.setFrom("burn.ank1809@gmail.com");
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

    private String[] getCcArray(List<String> ccList)
    {
        String[] cc = new String[ccList.size()];
        for(int i =0;i< ccList.size();i++)
        {
            cc[i] = ccList.get(i);
        }
        return cc;
    }



}
