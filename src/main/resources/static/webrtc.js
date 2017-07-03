var companionId;
var companionUsername;
var ownId;
var ownUsername;
var room;

var createConversation = function () {
    var convId = $('#convId').val();
    nextRTC.create(convId);
};

var createBroadcastConversation = function () {
    var convId = $('#convId').val();
    nextRTC.create(convId, {type: 'BROADCAST'});
};

var joinConversation = function () {
    setConnected(true);
    var convId = $('#convId').val();
    room = convId;
    nextRTC.join(convId);
};

var leaveConversation = function () {
    setConnected(false);
    // $('#container').empty();
    room = null;
    nextRTC.leave();
    $('#messages').empty();
};

var changeMicrophoneState = function () {
    var localStream = $("#local")[0];
    localStream.srcObject.getAudioTracks()[0].enabled = !localStream.srcObject.getAudioTracks()[0].enabled;
};

function setConnected(connected) {
    if (connected) {
        $('#messageContent').focus();
    }
}

var sendMessage = function () {
    var msgContent = $('#messageContent').val();
    var msg = {"from": ownUsername, "to": companionUsername, "content": msgContent};
    nextRTC.message(companionId, JSON.stringify(msg));
}

var nextRTC = new NextRTC({
    wsURL: 'wss://' + location.hostname + (location.port ? ':' + location.port : '') + '/signaling',
    mediaConfig: {
        video: true,
        audio: true,
    },
    peerConfig: {
        iceServers: [
            {urls: "stun:23.21.150.121"},
            {urls: "stun:stun.l.google.com:19302"},
            {urls: "turn:numb.viagenie.ca", credential: "webrtcdemo", username: "louis@mozilla.com"}
        ],
        iceTransportPolicy: 'all',
        rtcpMuxPolicy: 'negotiate'
    }
});

nextRTC.on('created', function (nextRTC, event) {
    ownId = event.to;
    room = event.content;
    console.log(JSON.stringify(event));
    $('#log').append('<li>Room with id ' + event.content + ' has been created, share it with your friend to start videochat</li>');
});

nextRTC.on('joined', function (nextRTC, event) {
    ownId = event.to;
    room = event.content;
    console.log(JSON.stringify(event));
    $('#log').append('<li>You have been joined to conversation ' + event.content + '</li>');
});

nextRTC.on('chatHst', function (nextRTC, event) {
    $('#send,#messageContent').prop("disabled", false);
    var messageList = $.parseJSON(event.content)
    for (var i in messageList) {
        var message = messageList[i];
        var color = "97D88A";
        if (ownUsername !== message.from) {
            color = "FF674D";
        }
        $('#messages').append('<tr bgcolor=' + color + '>' +
            '<td>' + message.from + '</td>' +
            '<td>' + message.room + '</td>' +
            '<td>' + message.content + '</td>' +
            // '<td>' + message.time + '</td>' +
            '</tr>');
    }
})

nextRTC.on('newJoined', function (nextRTC, event) {
    companionId = event.from;
    $.get("/username", function (data) {
        ownUsername = data;
        nextRTC.initRequest(companionId, data);// TODO add username by spring server.
    });
    $('#log').append('<li>Member with id ' + event.from + ' has joined conversation</li>');

});

nextRTC.on('initRequest', function (nextRTC, event) {
    companionId = event.from;
    companionUsername = event.content;
    $.get("/username", function (data) {
        ownUsername = data;
        nextRTC.initResponse(companionId, data);// TODO add username by spring server.
        nextRTC.chatHistory(ownId, ownUsername, companionUsername);
    });
    $('#log').append('<li>Member with id ' + event.from + ' has sent his credentials to access chat</li>');
});

nextRTC.on('initResponse', function (nextRTC, event) {
    companionId = event.from;
    companionUsername = event.content;
    nextRTC.chatHistory(ownId, ownUsername, companionUsername);
    $('#log').append('<li>Member with id ' + event.from + ' has sent his credentials to access chat</li>');
});

nextRTC.on('localStream', function (member, stream) {
    var dest = $("#local");
    dest[0].srcObject = stream.stream;
    dest[0].muted = true;
});

nextRTC.on('remoteStream', function (member, stream) {
    var dest = $("#remote");
    dest[0].srcObject = stream.stream;
});

nextRTC.on('left', function (nextRTC, event) {
    companionId = null;
    nextRTC.release(event.from);
    console.log(JSON.stringify(event));
    $('#messages').empty();
    // $('#remote').remove();
    $('#log').append('<li>' + event.from + " left!</li>");
});

nextRTC.on('error', function (nextRTC, event) {
    console.log(JSON.stringify(event));
    $('#log').append('<li>Something goes wrong! ' + event.content + '</li>')
});

nextRTC.on('chatMsg', function (nextRTC, event) {
    var color = "97D88A";
    var receivedMsg = JSON.parse(event.content);
    if (ownUsername !== receivedMsg.from) {
        companionId = event.from;
        color = "FF674D";
    }

    $('#messages').append('<tr bgcolor=' + color + ' opacity = 0.3>' +
        '<td>' + receivedMsg.from + '</td>' +
        '<td>' + receivedMsg.room + '</td>' +
        '<td>' + receivedMsg.content + '</td>' +
        // '<td>' + event.content.time + '</td>' +
        '</tr>');

    $('#log').append('<li>Recieved message: ' + event.content + '</li>')
});