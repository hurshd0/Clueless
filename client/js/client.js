var socket;
var playerInfo = {"name": ""};
var myPlayer = null;
var gameboard = null;
var chatForm = document.getElementById('chatForm');
var chatInput = document.getElementById('chatInput');
var myCards = document.getElementById('myCards');
var myCharacter = document.getElementById('myPlayer');var suggestionModal = document.getElementById('suggestionModal');
var suspect = document.getElementById('suspect');
var weapon = document.getElementById('weapon');
var room = document.getElementById('room');
var suggestion = document.getElementById('suggestion');
var inactivePlayers = {};
var currSuggestion = null;

// Suspect Deck
var suspectDeck = new Deck();
suspectDeck.add_card(new Card("Suspect", "Miss Scarlet"));
suspectDeck.add_card(new Card("Suspect", "Professor Plum"));
suspectDeck.add_card(new Card("Suspect", "Colonel Mustard"));
suspectDeck.add_card(new Card("Suspect", "Mrs Peacock"));
suspectDeck.add_card(new Card("Suspect", "Mr Green"));
suspectDeck.add_card(new Card("Suspect", "Mrs White"));

// Weapon Deck
var weaponDeck = new Deck();
weaponDeck.add_card(new Card("Weapon", "Rope"));
weaponDeck.add_card(new Card("Weapon", "Lead Pipe"));
weaponDeck.add_card(new Card("Weapon", "Knife"));
weaponDeck.add_card(new Card("Weapon", "Wrench"));
weaponDeck.add_card(new Card("Weapon", "Candlestick"));
weaponDeck.add_card(new Card("Weapon", "Revolver"));

// Room Deck
var roomDeck = new Deck();
roomDeck.add_card(new Card("Room", "Study"));
roomDeck.add_card(new Card("Room", "Hall"));
roomDeck.add_card(new Card("Room", "Lounge"));
roomDeck.add_card(new Card("Room", "Library"));
roomDeck.add_card(new Card("Room", "Billiard Room"));
roomDeck.add_card(new Card("Room", "Dining Room"));
roomDeck.add_card(new Card("Room", "Conservatory"));
roomDeck.add_card(new Card("Room", "Ballroom"));
roomDeck.add_card(new Card("Room", "Kitchen"));

// Images
var imageSrc = new Array();
    imageSrc[0] = "/client/img/smallPieceRed_border00.png";
    imageSrc[1] = "/client/img/smallPieceYellow_border00.png";
    imageSrc[2] = "/client/img/smallPieceWhite_border00.png";
    imageSrc[3] = "/client/img/smallPieceGreen_border00.png";
    imageSrc[4] = "/client/img/smallPieceBlue_border00.png";
    imageSrc[5] = "/client/img/smallPiecePurple_border00.png";

var gamePieceImgs = [];
for (x = 0; x < imageSrc.length; x++) {
    var img = new Image();
    img.src = imageSrc[x];
    gamePieceImgs.push(img);
}

function newConnection() {
	return new Promise(
		function(resolve, reject) {
			socket = io.connect();

			socket.on('connect', function() {
				socket.emit('visit');
			});

			socket.on('visitor', function(data) {
				document.getElementById('gameStatus').innerHTML = "Game Status: " + data;
				if (data === 'Started') {
					document.getElementById('createBtn').style.display = 'none';
					document.getElementById('msgDiv').style.display = 'inline-block';
				}
				resolve();
			});

			socket.on('newPlayer', function(data) {
				document.getElementById('playerCount').innerHTML = data.count + "/6 players";
				playerInfo.id = data.id
                var characters = displayCharacters(data.characters);
                document.getElementById('characters').innerHTML = characters;
                resolve();
			});
		});
}

function main() {
	newConnection().then(function() {
		socket.on('gameStatus', function(data) {
			document.getElementById('gameStatus').innerHTML = "Game Status: " + data;
		});

		socket.on('playerCount', function(data) {
            document.getElementById('playerCount').innerHTML = data + "/6 players";
        });

        socket.on('nameResponse', function(data) {
        	var text;
			if (data.idx === -1) {
				if (data.name === "") {
					text = "You did not choose a name";
				} else {
					text = "Your name is " + data.name;
					playerInfo.name = data.name;
				}
				document.getElementById('playerInfo').innerHTML = "<h3 class='text-center'>" + text + "</h3>";
			} else {
				document.getElementById('nameErr').innerHTML = "This name is already taken";
			}
        });

        socket.on('characters', function(data) {
        	if (!playerInfo.character) {
        		var characters = displayCharacters(data);
            	document.getElementById('characters').innerHTML = characters;
        	}
        });

        socket.on('gameReady', function(data) {
        	document.getElementById('startBtn').disabled = false;
        	myPlayer = new Player(playerInfo.id, playerInfo.name, playerInfo.character, playerInfo.position);
        	myPlayer.isActive = true;
        });


        socket.on('drawboard', function(data) {
        	document.getElementById('lobby').style.display = 'none';
        	document.getElementById('gamearea').style.display = 'inline-block';
        	myCharacter.innerHTML = myPlayer.character;
        	myPlayer.hand = data[0];
        	for(var name in data[1]) {
                inactivePlayers[name] = new Player(0, "", name, data[1][name].position);
            }
        	var html = "";
        	for(var i = 0; i < data[0].length; i++) {
        		html += "<div>" + data[0][i].name + "</div>";
        	}
        	myCards.innerHTML = html;
        	gameboard = new Board(imageSrc);
        	gameboard.placeCharacters();
        });

        socket.on('setupGame', function(data) {
        	var response = setupGame(data);
        	socket.emit('setupComplete', response);
        });

        socket.on('move', function(data) {
        	gameboard.positions = data[0];
        	document.getElementById(gameboard.positions[data[1]][data[2]].room + data[3]).src = "";
        	gameboard.placeCharacters();
        });

        socket.on('suggestion', function(data) {
        	gameboard.positions = data.suggestion[0].board;
        	if (data.suggestion.length > 1) {
        		console.log(data);
        		var row = data.suggestion[1];
	        	var col = data.suggestion[2];
	        	var pos = data.suggestion[3];
	        	document.getElementById(gameboard.positions[row][col].room + pos).src = "";
        	}
    		currSuggestion = [data.suggestion[0].suspect, data.suggestion[0].weapon, data.suggestion[0].room];
        	document.getElementById('activityLog').innerHTML += "<div>" + data.name + " suggests " + data.suggestion[0].suspect + " with " +
                data.suggestion[0].weapon + " in " + data.suggestion[0].room + "</div>";
        	gameboard.placeCharacters();
        });

        socket.on('beMoved', function(data) {
        	var isvalid = gameboard.checkPosition(data.suggestion[0].room, myPlayer.character);
        	if (isvalid[0]) {
        		myPlayer.position = gameboard.getRoomPosition(data.suggestion[0].room);
        		data.suggestion.push(isvalid[1][0]);
        		data.suggestion.push(isvalid[1][1]);
        		data.suggestion.push(isvalid[1][2].toString());
        	}
        	data.suggestion[0].board = gameboard.positions;
        	console.log(data);
        	socket.emit('moved', data);
        });

        socket.on('startTurn', function(data) {
        	myPlayer.isTurn = true;
        });

        socket.on('prove', function(data) {
        	document.getElementById('proveBtn').disabled = false;
        	alert('You can now prove the suggestion false');
        });

        socket.on('proven', function(data) {
        	document.getElementById('activityLog').innerHTML += "<div>" + data.name + " says " + data.proof + " is not the answer";
        	document.getElementById('suggestion').disabled = true;
   	 		document.getElementById('accusation').disabled = true;
   	 		myPlayer.isTurn = false;
   	 		myPlayer.hasSuggested = false;
   	 		myPlayer.suggest = false;
        	socket.emit('nextTurn');
        });

        document.onkeydown = function(event) {
			if(event.keyCode === 39) {			// right arrow
				movePlayer("right");
			} else if(event.keyCode === 40) {  // down arrow
				movePlayer("down");
			} else if(event.keyCode === 37) {  // left arrow
				movePlayer("left");
			} else if(event.keyCode === 38) {  // up arrow
				movePlayer("up");
			}
		}
	},
	function(err) {
		console.log(err);
	});
}

main();

function createGame() {
	document.getElementById('main').style.display = 'none';
	document.getElementById('lobby').style.display = 'inline-block';
	socket.emit('join');
}

function setName() {
	var n = document.getElementById('playerName').value;
	socket.emit('checkName', n);
}

function startGame() {
	socket.emit('startGame');
}

function removeCharacter(id) {
	var text = "Your character is: ";
    switch(id) {
        case 0:
            playerInfo.character = "Miss Scarlet";
            playerInfo.position = [0, 3];
            socket.emit('character', "Miss Scarlet");
            text += "Miss Scarlet";
            break;
        case 1:
            playerInfo.character = "Professor Plum";
            playerInfo.position = [1, 0];
            socket.emit('character', "Professor Plum");
            text += "Professor Plum";
            break;
        case 2:
            playerInfo.character = "Colonel Mustard";
            playerInfo.position = [1, 4];
            socket.emit('character', "Colonel Mustard");
            text += "Colonel Mustard";
            break;
        case 3:
            playerInfo.character = "Mrs Peacock";
            playerInfo.position = [3, 0];
            socket.emit('character', "Mrs Peacock");
            text += "Mrs Peacock";
            break;
        case 4:
            playerInfo.character = "Mr Green";
            playerInfo.position = [4, 1];
            socket.emit('character', "Mr Green");
            text += "Mr Green";
            break;
        case 5:
            playerInfo.character = "Mrs White";
            playerInfo.position = [4, 3];
            socket.emit('character', "Mrs White");
            text += "Mrs White";
            break;
    }
    document.getElementById("characters").innerHTML = '<h3 class="text-center">' + text + '</h3>';
}

function displayCharacters(characters) {
	var character = '';
	for(var char in characters) {
        character += '<div class="left" onclick="removeCharacter(' + characters[char].id +
                    ')">' + char + '</div>';
    }
    return character;
}

function setupGame(playerNum) {
	var response = {};
	// Shuffle the decks
	suspectDeck.shuffle();
	weaponDeck.shuffle();
	roomDeck.shuffle();

	// Get Secret Envelope
	var secretEnvelope = new Deck();
	secretEnvelope.add_card(suspectDeck.get_card(0));
	secretEnvelope.add_card(weaponDeck.get_card(0));
	secretEnvelope.add_card(roomDeck.get_card(0));
	response.secret = secretEnvelope;

	// Make a deck with the rest of the cards
	// and distribute amongst active players
	var clueDeck = new Deck();
	clueDeck.add_card(suspectDeck.not_dealt());
	clueDeck.add_card(weaponDeck.not_dealt());
	clueDeck.add_card(roomDeck.not_dealt());
	clueDeck.shuffle();
	var cardCount = clueDeck.cards.length / playerNum;
	var leftOver = clueDeck.cards.length % playerNum;
	for(var i = 0; i < playerNum; i++) {
		response[i] = clueDeck.deal_cards(cardCount);
	}

	if (leftOver > 0) {
		for(var i = 0; i < leftOver; i++) {
			response[i].concat(clueDeck.deal_cards(1));
		}
	}

	return response;
}

function movePlayer(dir) {
	var newPosition = [], isvalid = [], msg = 'Invalid move';
	if (!myPlayer.isActive) {
		alert("You may no longer move in the game");
	} else if (!myPlayer.isTurn) {
		alert("It is not your turn");
	} else {
		// Get the new position to move to
		if (dir === 'secret') {
			if (gameboard.secretPassage(myPlayer.position)) {
				newPosition = myPlayer.moveThruPassage();
			} else {
				msg = 'There is no secret passage in this room';
			}
		} else {
			newPosition = myPlayer.move(dir);
		}

		// Stops player from reentering the same room in one turn
		if (myPlayer.lastRoom === gameboard.getRoomName(newPosition)) {
			alert('You cannot move to the same room in one turn');
		} else if (myPlayer.hasSuggested) {
			alert('Wait for other players to react to suggestion/accusation');
		} 
		else if (myPlayer.suggest) {
			alert('You must make a suggestion or accusation now');
		} else {
			isvalid = gameboard.checkPosition(newPosition, myPlayer.character);
			if (isvalid[0]) {
				var row = isvalid[1][0];
				var col = isvalid[1][1];
				var pos = isvalid[1][2].toString();
				var name = gameboard.getRoomName(newPosition);
				if (name !== 'Hallway') {
					myPlayer.lastRoom = name;
					myPlayer.suggest = true;
        			document.getElementById('suggestion').disabled = false;
        			document.getElementById('accusation').disabled = false;
				}
				myPlayer.position = newPosition;
				document.getElementById(gameboard.positions[row][col].room + pos).src = "";
				socket.emit('newPosition', [gameboard.positions, row,  col, pos]);
			} else {
				alert(msg);
			}
		}
	}
}

function makeSuggestion() {
	suggestionModal.style.display = 'block';
	var currRoom = gameboard.getRoomName(myPlayer.position);
	room.innerHTML = "<option value='" + currRoom + "'>" + currRoom + "</option>";
}

function getSuggestion() {
	var isvalid = [];
	suggestionModal.style.display = 'none';
	document.getElementById('suggestion').disabled = true;
    document.getElementById('accusation').disabled = true;
    myPlayer.hasSuggested = true;
    // Check if the suspect in the suggestion is inactive
	if (inactivePlayers[suspect.value]) {
		var target = inactivePlayers[suspect.value];
		isvalid = gameboard.checkPosition(room.value, target.character);
		var row = isvalid[1][0];
		var col = isvalid[1][1];
		var pos = isvalid[1][2].toString();
		socket.emit('suggest', [{"suspect": suspect.value, "weapon": weapon.value, "room": room.value, "board": gameboard.positions},
								row, col, pos]);
	} else if (suspect.value !== myPlayer.character) { // Check if the suspect in the suggestion is another active player
		socket.emit('suggest', [{"suspect": suspect.value, "weapon": weapon.value, "room": room.value}]);
	} else { // The suspect in the suggestion is the current player
		socket.emit('suggest', [{"suspect": suspect.value, "weapon": weapon.value, "room": room.value, "board": gameboard.positions}])
	}
}

function prove() {
	document.getElementById('proveBtn').disabled = true;
	document.getElementById('proofModal').style.display = 'block';
	var html = "";
	for(var i = 0; i < currSuggestion.length; i++) {
		html += "<option value='" + currSuggestion[i] + "'>" + currSuggestion[i] + "</option>";
	}
	document.getElementById('suggestionContent').innerHTML = html;
}

function getProof() {
	document.getElementById('proofModal').style.display = 'none'
	var proof = document.getElementById('suggestionContent').value;
	// Make sure the player has the card selected
	for(var i = 0; i < myPlayer.hand.length; i++) {
		if (myPlayer.hand[i].name === proof) {
			socket.emit('sendProof', proof);
		}
	}
}