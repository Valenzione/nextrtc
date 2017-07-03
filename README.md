This example is available at page
[https://examples.nextrtc.org/](https://examples.nextrtc.org/)

Changes to original NextRTC:
* Signals initRequest and initResponse added
* Signals chatMsg and chatHst added
* Application changed to 1-to-1 video call from 1-to-many

Custom signals description:
1. newJoined signal invoke username exchange between users with initRequest signal
2. initRequest signal sends host username to another party
3. On receiving initRequest:
    * initResponse with username sent back to host
    * chatHst signal sent to server
4. After receiving initResponse host sends chatHst signal to server
5. chatHst signal fetch messages between two parties based on their usernames

ChatMsg:
* Server will forward chatMsg to recipient
Message format for chatMsg 
```
{
    from: 1,
    to: 2,
    signal: "chatMsg",
    content:
        {
          from: "user1",
          to: "user2",
          content: "Sample message",
          room: "user1:user2"
        }
}
```