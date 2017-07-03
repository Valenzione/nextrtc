package org.nextrtc.examples.videochat;

import com.google.gson.Gson;
import org.json.JSONObject;
import org.nextrtc.signalingserver.NextRTCConfig;
import org.nextrtc.signalingserver.domain.InternalMessage;
import org.nextrtc.signalingserver.domain.Signal;
import org.nextrtc.signalingserver.domain.SignalResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

import java.util.ArrayList;
import java.util.List;


@Configuration
@Import(NextRTCConfig.class)
public class EndpointConfig {

    @Autowired
    private SignalResolver resolver;

    @Autowired
    private MessageRepository repository;

    @Bean
    public List<Signal> addCustomNextRTCHandlers() {
        List<Signal> handlers = new ArrayList<>();


        Signal chatMsg = Signal.fromString("chatMsg");
        Signal chatHst = Signal.fromString("chatHst");
        Signal initRequest = Signal.fromString("initRequest");
        Signal initResponse = Signal.fromString("initResponse");

        resolver.addCustomHandler(initRequest, (msg) -> {
            InternalMessage.create()
                    .to(msg.getTo()).from(msg.getFrom())
                    .content(msg.getContent())
                    .signal(initRequest)
                    .build()
                    .send();
        });
        resolver.addCustomHandler(initResponse, (msg) -> {
            InternalMessage.create()
                    .to(msg.getTo()).from(msg.getFrom())
                    .content(msg.getContent())
                    .signal(initResponse)
                    .build()
                    .send();
        });
        resolver.addCustomHandler(chatHst, (msg) -> {
            String room = getRoom(msg.getContent());
            List<Message> messages = repository.findByRoom(room);
            InternalMessage.create()
                    .to(msg.getFrom())
                    .content(new Gson().toJson(messages))
                    .signal(chatHst)
                    .build()
                    .send();


        });
        resolver.addCustomHandler(chatMsg, (msg) -> {
            JSONObject jsonMessage = new JSONObject(msg.getContent());
            String from = jsonMessage.get("from").toString();
            String to = jsonMessage.get("to").toString();
            Message message = new Message(from, to, getRoom(from, to), jsonMessage.get("content").toString());// new DateTime());
            repository.save(message);

            //Send message to recipient
            InternalMessage.create()
                    .to(msg.getTo()).from(msg.getFrom())
                    .content(message.toJson().toString())
                    .signal(chatMsg)
                    .build()
                    .send();

            //Send message as echo back
            InternalMessage.create()
                    .to(msg.getFrom()).from(msg.getFrom())
                    .content(message.toJson().toString())
                    .signal(chatMsg)
                    .build()
                    .send();
        });

        handlers.add(chatHst);
        handlers.add(chatMsg);
        handlers.add(initRequest);
        handlers.add(initResponse);

        return handlers;
    }

    private String getRoom(String content) {
        String username1 = content.split(":")[0];
        String username2 = content.split(":")[1];
        return getRoom(username1, username2);
    }

    private String getRoom(String username1, String username2) {
        return (username1.compareTo(username2) > 0) ? (username1 + ":" + username2) : (username2 + ":" + username1);
    }

    private String getUsername() {
        String username = "aaa";
//
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String currentPrincipalName = authentication.getName();

        return username;
    }

    @Bean
    public MyEndpoint myEndpoint() {
        return new MyEndpoint();
    }

    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}