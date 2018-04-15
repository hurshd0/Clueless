function Player(id, name, character, position) {
    this.id = id;
	this.name = name;
	this.character = character;
    this.position = position;
    this.hand = [];
    this.isTurn = false;
    this.isActive = false;
}

// Player.prototype.getCurrentLocation = function() {
// 	for (var row = 0; row < this.board.length; row++) {
//         for (var col = 0; col < this.board[row].length; col++) {
//             if (this.board[row][col] === this.character){
//                 return [row,col]
//             }
//         }
//     }
// };

// Player.prototype.move = function(direction) {
// 	try {
//         var current = this.getCurrentLocation(this.character);
//         var updatedRow = null;
//         var updatedCol = null;

//         switch (direction){
//             case "left":
//                 updatedRow = current[0];
//                 updatedCol = current[1] - 1;
//                 break;
//             case "right":
//                 updatedRow = current[0];
//                 updatedCol = current[1] + 1;
//                 break;
//             case "up":
//                 updatedRow = current[0] - 1;
//                 updatedCol = current[1];
//                 break;
//             case "down":
//                 updatedRow = current[0] + 1;
//                 updatedCol = current[1];
//                 break;
//             case "secret":
//                 break;
//         }

//         // update position array
//         if (updatedRow >= 0 && updatedRow < 5
//             && updatedCol >= 0 && updatedCol < 5
//             && this.board[updatedRow][updatedCol] === " ") {

//             // Remove from old square and add to new
//             this.board[current[0]][current[1]] = " ";
//             this.board[updatedRow][updatedCol] = this.character;
//         }

//         socket.emit('move', this.board);
//     }
//     catch (e){
//         console.log("Error: " + e);
//     }
// };

// Player.prototype.suggest = function() {
// 	socket.emit('suggest', "This is a suggestion");
// };

// Player.prototype.accuse = function() {
// 	socket.emit('accuse', "This is an accusation");
// };