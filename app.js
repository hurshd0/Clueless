var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/views/index.html');
});
app.use('/', express.static(__dirname + '/'));

server.listen(8080);
console.log('Server Started...');

var CLIENT_LIST = {};
var PLAYER_LIST = [];
var gameStatus = 'Not Started';
var players = {"Miss Scarlet": {"id": 0, "position": [0, 3]}, 
			"Professor Plum": {"id": 1, "position": [1, 0]}, 
			"Colonel Mustard": {"id": 2, "position": [1, 4]}, 
			"Mrs Peacock": {"id": 3, "position": [3, 0]}, 
			"Mr Green": {"id": 4, "position": [4, 1]}, 
			"Mrs White": {"id": 5, "position": [4, 3]}};
var names = [];
var secretEnvelope = null;

var io = require('socket.io')(server, {});
io.on('connection', function(client) {
	console.log('New Client Connection...');
	// Choose a random id for the client
	// and save the client in list of clients
	client.id = Math.random();
	CLIENT_LIST[client.id] = client;

	client.on('visit', function() {
		client.emit('visitor', gameStatus);
	});

	client.on('join', function() {
		PLAYER_LIST.push(client.id);
		gameStatus = "Created";
		client.emit('newPlayer', {"id": client.id, "count": PLAYER_LIST.length, "characters": players, "gameStatus": gameStatus});
		client.broadcast.emit('gameStatus', gameStatus);
		client.broadcast.emit('playerCount', PLAYER_LIST.length);
	});

	client.on('character', function(data) {
		delete players[data];
		CLIENT_LIST[client.id].character = data;
		client.broadcast.emit('characters', players);
		// if (PLAYER_LIST.length >= 3) {
			if (gameReady()) {
				client.emit('gameReady');
				client.broadcast.emit('gameReady');
			}
		// }
	});

	client.on('checkName', function(data) {
		client.emit('nameResponse', checkName(data));
		names.push(data);
	});

	client.on('startGame', function() {
		client.emit('setupGame', PLAYER_LIST.length);
		gameStatus = 'Started';
		client.broadcast.emit('gameStatus', gameStatus);
	});

	client.on('setupComplete', function(data) {
		secretEnvelope = data.secret;
		for(var i = 0; i < PLAYER_LIST.length; i++) {
			var id = PLAYER_LIST[i];
			var player = CLIENT_LIST[id];
			player.emit('drawboard', [data[i], players]);
		}
	});

	client.on('newPosition', function(data) {
		client.broadcast.emit('move', data);
	});
});

function checkName(name) {
	var idx = -1;
	if (names.length > 0) {
		idx = names.indexOf(name);
	}
	return {"idx": idx, "name": name};
}

function gameReady() {
	var count = 0;
	for(var i = 0; i < PLAYER_LIST.length; i++) {
		var id = PLAYER_LIST[i];
		if (CLIENT_LIST[id].character) {
			count++;
		}
	}
	if (count === PLAYER_LIST.length) {
		return true;
	} else {
		return false;
	}
}