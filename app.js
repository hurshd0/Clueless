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
var taken = {};
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

	// When someone creates a game
	client.on('join', function() {
		gameStatus = "Created";
		client.emit('newPlayer', {"id": client.id, "count": PLAYER_LIST.length, "characters": players, "gameStatus": gameStatus});
		client.broadcast.emit('gameStatus', gameStatus);
	});

	// The Client has chosen a character
    // Receives the name of the character chosen
	client.on('character', function(data) {
		if (gameStatus !== 'Started') {
            PLAYER_LIST.push(client.id);
			taken[data] = players[data];
			client.broadcast.emit('playerCount', PLAYER_LIST.length);
			delete players[data];
			CLIENT_LIST[client.id].character = data;
			client.broadcast.emit('characters', players);
			if (PLAYER_LIST.length >= 3) {
				if (gameReady()) {
					client.emit('gameReady');
					client.broadcast.emit('gameReady');
				}
			}
		} else {
			client.emit('joinError');
		}
	});

	// A player has chosen a name
    // Make sure that name is not already taken
    // Receives the name that was chosen
	client.on('checkName', function(data) {
		client.emit('nameResponse', checkName(data));
		names.push(data);
		CLIENT_LIST[client.id].name = data;
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
			// Save the player's hand
			player.hand = data[i];
			player.emit('drawboard', [data[i], players]);
		}
		// Choose a player to start
		var id = setTurn();
		CLIENT_LIST[id].emit('startTurn');
	});

	// A player has moved
    // Receives the new position of the player
	client.on('newPosition', function(data) {
		client.broadcast.emit('move', data);
	});

	// A player has made a suggestion
    // Receives the suspect, weapon, room in suggestion
    // Might also receive a board with new position
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

	// An active player has been moved
    // Receives the new position and the suggestion
	client.on('moved', function(data) {
		client.broadcast.emit('suggestion', data);
		var id = setChallenger();
		CLIENT_LIST[id].emit('prove');
		challengerCount++;
	});

	// A player has proven a suggestion false
	client.on('sendProof', function(data) {
		// Find the current player and let them know
        // the suggestion has been proven false
		CLIENT_LIST[PLAYER_LIST[currentTurn]].emit('proven', {"proof": data, "name": client.character});
	});

	// Selects the next player to prove a suggestion
	client.on('nextChallenger', function(data) {
        var id = setChallenger();
        challengerCount++;
        if (challengerCount > others.length) {
            CLIENT_LIST[PLAYER_LIST[currentTurn]].emit('notProven');
        } else {
            CLIENT_LIST[id].emit('prove');
        }
    });

	// Selects the next player to play
	client.on('nextTurn', function(data) {
		var id = setTurn();
		CLIENT_LIST[id].emit('startTurn');
		challengerCount = null;
	});

	// A player has made an accusation
    // Receives the suspect, weapon, room in accusation
	client.on('accuse', function(data) {
        client.emit('accusationResponse', [checkAccusation(data), secretEnvelope]);
    });

    // Mark game as ended
    client.on("endGame", function(data){
        if (data) {
          client.broadcast.emit("gameOver", [client.character, secretEnvelope]);  
        } else {
            client.broadcast.emit("gameOver");
        }
        resetGame();
        client.broadcast.emit('gameStatus', gameStatus);
    });

    // Sends the current status of the game
    client.on('getStatus', function(data) {
        client.emit('gameStatus', gameStatus);
    });

    client.on('disconnect', function(data) {
    	// If the client was playing the game
    	if (PLAYER_LIST.includes(client.id)) {
            leaveGame(client.id, client.character, client.hand);
            client.broadcast.emit('playerCount', PLAYER_LIST.length);
            client.broadcast.emit('gameStatus', gameStatus);
        }
        // If the game has been created and the player had
        // already chosen a character, replace the character that was chosen
    	if (gameStatus === 'Created' && client.character) {
    		players[client.character] = taken[client.character];
    		client.broadcast.emit('characters', players);
    	}
    	delete CLIENT_LIST[client.id];
    });

    // Player-initiated action to leave the current game
    client.on("exitGame", function(data) {
        leaveGame(client.id, client.character, client.hand);
        client.broadcast.emit('playerCount', PLAYER_LIST.length);
        client.broadcast.emit('gameStatus', gameStatus);
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

// Checks if a name is already taken
function checkName(name) {
	var idx = -1;
	if (names.length > 0) {
		idx = names.indexOf(name);
	}
	return {"idx": idx, "name": name};
}

// Checks if the game is ready to be started
// The game can only be started once all the players
// currently in lobby have chosen a character
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

// Finds a specific client
function findClient(character) {
    for(var client in CLIENT_LIST) {
        if (CLIENT_LIST[client].character === character) {
            return CLIENT_LIST[client];
        }
    }
}

// Controls whose turn it is
function setTurn() {
	if(currentTurn === null) {
		currentTurn = 0;
	} else {
		currentTurn = (currentTurn + 1) % PLAYER_LIST.length;
	}
	others = getOthers(PLAYER_LIST[currentTurn]);
    return PLAYER_LIST[currentTurn];
}

// Returns all client ids in PLAYER_LIST
// except the id that was passed.
function getOthers(id) {
	var arr = [];
	for(var i = 0; i < PLAYER_LIST.length; i++) {
		if (PLAYER_LIST[i] !== id) {
			arr.push(PLAYER_LIST[i]);
		}
	}
	return arr;
}

// Controls who is proving a suggestion
function setChallenger() {
    if (challenger === null) {
        challenger = 0;
    } else {
        challenger = (challenger + 1) % others.length;
    }
    return others[challenger];
}

// Checks if an accusation is correct
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

function resetGame() {
	gameStatus = 'Not Started';
    // Reset game parameters
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
}

function emitToPlayers(msg, data=null) {
	for(var i = 0; i < PLAYER_LIST.length; i++) {
		var id = PLAYER_LIST[i];
		if (data !== null) {
			CLIENT_LIST[id].emit(msg, data);
		} else {
			CLIENT_LIST[id].emit(msg);
		}
	}
}

function leaveGame(id, character, hand) {
    // Check if it was the turn of the player who left
    if (currentTurn === PLAYER_LIST.indexOf(id)) {
        var nxt = setTurn();
        CLIENT_LIST[nxt].emit('startTurn');
        challengerCount = null;
    }
    PLAYER_LIST.splice(PLAYER_LIST.indexOf(id), 1);
    emitToPlayers('receiveMessage', character + " has left the game");
    // Redistribute the player's hand if there are 3 or more players left
    if (PLAYER_LIST.length >= 3 && gameStatus === 'Started') {
        for(var i = 0; i < hand.length; i++) {
            var client = PLAYER_LIST[i % PLAYER_LIST.length];
            CLIENT_LIST[client].emit('addCard', hand[i]);
            CLIENT_LIST[client].emit('inactivate', character);
        }
    } else if (PLAYER_LIST.length < 3 && gameStatus === 'Started') {
        emitToPlayers('insufficient');
        resetGame();
    }
}