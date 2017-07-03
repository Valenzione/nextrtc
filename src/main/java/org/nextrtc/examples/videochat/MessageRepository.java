package org.nextrtc.examples.videochat;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Created by valen on 27.06.2017.
 */

public interface MessageRepository extends MongoRepository<Message, String> {
    public List<Message> findByRoom(String room);
}
