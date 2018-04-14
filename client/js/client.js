var socket;
var playerInfo = {"name": ""};
var myPlayer = null;

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