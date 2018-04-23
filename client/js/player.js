function Player(id, name, character, position) {
    this.id = id;
	this.name = name;
	this.character = character;
    this.position = position;
    this.hand = [];
    this.isTurn = false;
    this.isActive = false;
    this.lastRoom = "";
    this.suggest = false;
    this.hasSuggested = false;
    this.wasMoved = false;
}

Player.prototype.move = function(direction) {
	var newPos = [];
	newPos = newPos.concat(this.position);
	if (direction === 'left') {
		newPos[1]--;	
	} else if (direction === 'right') {
		newPos[1]++;
	} else if (direction === 'up') {
		newPos[0]--;
	} else if (direction === 'down') {
		newPos[0]++;
	}
	return newPos;
};

Player.prototype.moveThruPassage = function() {
	var newPos = [];
	if (this.position[0] === 0 &&
		this.position[1] === 0) {
		newPos = [4, 4];
	} 
	else if (this.position[0] === 0 &&
			 this.position[1] === 4) {
		newPos = [4, 0];
	} 
	else if (this.position[0] === 4 &&
			 this.position[1] === 0) {
		newPos = [0, 4];
	} 
	else if (this.position[0] === 4 &&
			 this.position[1] === 4) {
		newPos = [0, 0];
	}
	return newPos;
};

Player.prototype.cardNames = function() {
	var names = [];
	for(var i = 0; i < this.hand.length; i++) {
		names.push(this.hand[i].name);
	}
	return names;
};

// Player.prototype.suggest = function() {
// 	socket.emit('suggest', "This is a suggestion");
// };

// Player.prototype.accuse = function() {
// 	socket.emit('accuse', "This is an accusation");
// };