var socket;
var playerInfo = {"name": ""};
var myPlayer = null;
var gameboard = null;
var chatForm = document.getElementById('chatForm');
var chatInput = document.getElementById('chatInput');
var myCards = document.getElementById('myCards');
var myCharacter = document.getElementById('myPlayer');
// var secretEnvelope = null;
// var clueDeck = null;

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
    imageSrc[0] = "/client/img/gamepieces/pieceRed_border00.png";
    imageSrc[1] = "/client/img/gamepieces/pieceYellow_border00.png";
    imageSrc[2] = "/client/img/gamepieces/pieceWhite_border00.png";
    imageSrc[3] = "/client/img/gamepieces/pieceGreen_border00.png";
    imageSrc[4] = "/client/img/gamepieces/pieceBlue_border00.png";
    imageSrc[5] = "/client/img/gamepieces/piecePurple_border00.png";
    imageSrc[6] = "/client/img/gameboard.png";

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
        });


        socket.on('drawboard', function(data) {
        	document.getElementById('lobby').style.display = 'none';
        	document.getElementById('gamearea').style.display = 'inline-block';
        	myCharacter.innerHTML = myPlayer.character;
        	myPlayer.hand = data;
        	var html = "";
        	for(var i = 0; i < data.length; i++) {
        		html += "<div>" + data[i].name + "</div>";
        	}
        	myCards.innerHTML = html;
        	gameboard = new Board(imageSrc);
        });

        socket.on('setupGame', function(data) {
        	var response = setupGame(data);
        	socket.emit('setupComplete', response);
        });
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