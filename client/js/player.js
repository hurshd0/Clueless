function Player(id, name, character, position) {
    this.id = id;
	this.name = name;
	this.character = character;
    this.position = position;
    this.hand = [];
    this.isTurn = false;
    this.isActive = false;
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
	} else if (direction === 'secret') {

	}
	return newPos;
};

// Player.prototype.suggest = function() {
// 	socket.emit('suggest', "This is a suggestion");
// };

// Player.prototype.accuse = function() {
// 	socket.emit('accuse', "This is an accusation");
// };