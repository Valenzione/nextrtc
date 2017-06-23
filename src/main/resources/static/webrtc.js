var companionId = -1;
var ownId = -1;
var room = "";

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
    nextRTC.join(convId);
};

var leaveConversation = function () {
    setConnected(false);
    $('#container').empty();
    nextRTC.leave();
};

var changeMicrophoneState = function () {
    var localStream = $("#local")[0];
    localStream.srcObject.getAudioTracks()[0].enabled = !localStream.srcObject.getAudioTracks()[0].enabled;
};

function setConnected(connected) {
    $("#send").prop("disabled", !connected);
    $('#messageContent').prop('disabled', !connected);
    if (connected) {
        $('#messageContent').focus();
    }
}

var sendMessage = function () {
    var msgContent = $('#messageContent').val();
    if (companionId !== -1) {
        nextRTC.message(companionId, msgContent);
    }
    if (ownId !== -1) {
        nextRTC.message(ownId, msgContent);
    }
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
    console.log(JSON.stringify(event));
    $('#log').append('<li>Room with id ' + event.content + ' has been created, share it with your friend to start videochat</li>');
});

nextRTC.on('joined', function (nextRTC, event) {
    ownId = event.to;
    room = event.content;
    console.log(JSON.stringify(event));
    $('#log').append('<li>You have been joined to conversation ' + event.content + '</li>');
});

nextRTC.on('newJoined', function (nextRTC, event) {
    companionId = event.from;
    nextRTC.message(event.from, "User succesfully connected to chat!")
    nextRTC.message(ownId, "User succesfully connected to chat!")
    console.log(JSON.stringify(event));
    $('#log').append('<li>Member with id ' + event.from + ' has joined conversation</li>');
});

nextRTC.on('localStream', function (member, stream) {
    var dest = $("#template").clone().prop({id: 'local'});
    $("#container").append(dest);
    dest[0].srcObject = stream.stream;
    dest[0].muted = true;
});

nextRTC.on('remoteStream', function (member, stream) {
    var dest = $("#template").clone().prop({id: 'remote'});
    $("#container").append(dest);
    dest[0].srcObject = stream.stream;
});

nextRTC.on('left', function (nextRTC, event) {
    companionId = -1;
    nextRTC.release(event.from);
    console.log(JSON.stringify(event));
    $('#remote').remove();
    $('#log').append('<li>' + event.from + " left!</li>");
});

nextRTC.on('error', function (nextRTC, event) {
    console.log(JSON.stringify(event));
    $('#log').append('<li>Something goes wrong! ' + event.content + '</li>')
});

nextRTC.on('chatMsg', function (nextRTC, event) {
    var color = "97D88A";
    if (ownId !== event.from) {
        companionId = event.from;
        color = "FF674D";
    }

    var currentdate = new Date();

    $('#messages').append('<tr bgcolor=' + color + ' opacity = 0.3>' +
        '<td>' + event.from + '</td>' +
        '<td>' + room + '</td>' +
        '<td>' + event.content + '</td>' +
        '<td>' + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() + '</td>' +
        '</tr>');


    $('#log').append('<li>Recieved message: ' + event.content + '</li>')
});