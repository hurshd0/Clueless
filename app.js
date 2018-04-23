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
// Holds the names chosen by the players
var names = [];
// Holds the answer to the mystery
var secretEnvelope = null;
// Keepks track of whose turn it is
var currentTurn = null;
// A list of the other players
var others = null;
// Keeps track of who has a chnace to prove the suggestion
var challenger = null;
// Keeps track of how many players got a chance
// to prove the suggestion
var challengerCount = null;

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

	// Mark game as started
    // Instruct client to get the cards ready
    // Sends the number of players
    // Receive nothing
	client.on('startGame', function() {
		client.emit('setupGame', PLAYER_LIST.length);
		gameStatus = 'Started';
		client.broadcast.emit('gameStatus', gameStatus);
	});

	// Client has shuffled and separated the cards
    // Receives the secret envelope, and a number of
    // different sets of cards equal to the amount of players
	client.on('setupComplete', function(data) {
		secretEnvelope = data.secret;
		for(var i = 0; i < PLAYER_LIST.length; i++) {
			var id = PLAYER_LIST[i];
			var player = CLIENT_LIST[id];
			player.emit('drawboard', [data[i], players]);
		}
		var id = setTurn();
		CLIENT_LIST[id].emit('startTurn');
	});

	client.on('newPosition', function(data) {
		client.broadcast.emit('move', data);
	});

	client.on('suggest', function(data) {
		if(data[0].board) {
			client.broadcast.emit('suggestion', {"suggestion": data, "name": client.character});
			var id = setChallenger();
			CLIENT_LIST[id].emit('prove');
			challengerCount++;
		} else {
			var player = findClient(data[0].suspect);
			player.emit('beMoved', {"suggestion": data, "name": client.character});
		}
	});

	client.on('moved', function(data) {
		client.broadcast.emit('suggestion', data);
		var id = setChallenger();
		CLIENT_LIST[id].emit('prove');
		challengerCount++;
	});

	client.on('sendProof', function(data) {
		CLIENT_LIST[PLAYER_LIST[currentTurn]].emit('proven', {"proof": data, "name": client.character});
	});

	client.on('nextChallenger', function(data) {
        var id = setChallenger();
        challengerCount++;
        if (challengerCount > others.length) {
            CLIENT_LIST[PLAYER_LIST[currentTurn]].emit('notProven');
        } else {
            CLIENT_LIST[id].emit('prove');
        }
    });

	client.on('nextTurn', function(data) {
		var id = setTurn();
		CLIENT_LIST[id].emit('startTurn');
		challengerCount = null;
	});

	client.on('accuse', function(data) {
        client.emit('accusationResponse', [checkAccusation(data), secretEnvelope]);
    });

    // Mark game as ended
    client.on("endGame", function(data){
        client.broadcast.emit("gameOver", [client.character, secretEnvelope]);
        gameStatus = 'Not Started';
        client.broadcast.emit('gameStatus', gameStatus);
        // Reset game parameters?
        players = {"Miss Scarlet": {"id": 0, "position": [0, 3]}, 
                "Professor Plum": {"id": 1, "position": [1, 0]}, 
                "Colonel Mustard": {"id": 2, "position": [1, 4]}, 
                "Mrs Peacock": {"id": 3, "position": [3, 0]}, 
                "Mr Green": {"id": 4, "position": [4, 1]}, 
                "Mrs White": {"id": 5, "position": [4, 3]}};
        PLAYER_LIST = [];
        names = [];
        secretEnvelope = null;
        currentTurn = null;
        others = null;
        challenger = null;
        challengerCount = null;
        // io = null;
    });

	client.on('sendMessage', function(data) {
        client.broadcast.emit('receiveMessage', data);
	});

	// For Debugging server
	client.on('evalServer', function(data) {
		var res = eval(data);
		client.emit('evalAns', res);
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

function findClient(character) {
    for(var client in CLIENT_LIST) {
        if (CLIENT_LIST[client].character === character) {
            return CLIENT_LIST[client];
        }
    }
}

function setTurn() {
	if(currentTurn === null) {
		currentTurn = 0;
	} else {
		currentTurn = (currentTurn + 1) % PLAYER_LIST.length;
	}
	others = getOthers(PLAYER_LIST[currentTurn]);
    return PLAYER_LIST[currentTurn];
}

function getOthers(id) {
	var arr = [];
	for(var i = 0; i < PLAYER_LIST.length; i++) {
		if (PLAYER_LIST[i] !== id) {
			arr.push(PLAYER_LIST[i]);
		}
	}
	return arr;
}

function setChallenger() {
    if (challenger === null) {
        challenger = 0;
    } else {
        challenger = (challenger + 1) % others.length;
    }
    return others[challenger];
}

function checkAccusation(data) {
    var envelope = [];
    for(var i = 0; i < secretEnvelope.cards.length; i++) {
        envelope.push(secretEnvelope.cards[i].name);
    }
    if (envelope.includes(data.suspect) &&
        envelope.includes(data.weapon) &&
        envelope.includes(data.room)) {
        return true;
    } else {
        return false;
    }
}