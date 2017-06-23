package org.nextrtc.examples.videochat;

import org.nextrtc.signalingserver.NextRTCConfig;
import org.nextrtc.signalingserver.domain.InternalMessage;
import org.nextrtc.signalingserver.domain.Signal;
import org.nextrtc.signalingserver.domain.SignalResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@Configuration
@Import(NextRTCConfig.class)
public class EndpointConfig {

    @Autowired
    private SignalResolver resolver;

    @Bean
    public Signal addCustomNextRTCHandlers() {
        Signal chatMsg = Signal.fromString("chatMsg");
        resolver.addCustomHandler(chatMsg, (msg) -> {
            InternalMessage.create()
                    .to(msg.getTo()).from(msg.getFrom())
                    .content(msg.getContent())
                    .signal(chatMsg)
                    .build()
                    .send();
        });

        return chatMsg;
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