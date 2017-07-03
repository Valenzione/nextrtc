package org.nextrtc.examples.videochat;

import com.google.gson.JsonObject;
import org.springframework.data.annotation.Id;


public class Message {

    @Id
    private String id;

    //Not NextRTC values. Usernames stored in Mongo
    private String from;
    private String to;

    //Uniquely identify chat by room.
    private String room;
    //TODO add time

    private String content;


    public Message(String from, String to, String room, String content) {
        this.from = from;
        this.to = to;
        this.room = room;
        this.content = content;
    }


    @Override
    public String toString() {
        return "from: " + from + "; to: " + to + "; room: " + room + "; content: " + content;
    }

    public String getId() {
        return id;
    }

    public String getFrom() {
        return from;
    }

    public String getTo() {
        return to;
    }

    public String getRoom() {
        return room;
    }

    public String getContent() {
        return content;
    }

    JsonObject toJson() {
        JsonObject message = new JsonObject();
        message.addProperty("from", from);
        message.addProperty("to", from);
        message.addProperty("room", room);
        message.addProperty("content", content);
//        message.addProperty("time", String.valueOf(time));
        return message;
    }
}
