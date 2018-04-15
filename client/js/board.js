function Board(images) {
    this.width = 800;
    this.height = 600;
    this.images = images;
    this.leftBorder = this.width / 4 + 57;
    this.rightBorder = 3 * this.width / 4 - 55;
    this.topBorder = this.height / 4 + 7;
    this.bottomBorder = 3 * this.height / 4 - 5;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.position = [
        [
            " ", " ", " ", "Miss Scarlet", " "
        ],
        [
            "Professor Plum", null, " ", null, "Col. Mustard"
        ],
        [
            " ", " ", " ", " ", " "
        ],
        [
            "Mrs. Peacock", null, " ", null, " "
        ],
        [
            " ", "Mr. Green", " ", "Mrs. White", " "
        ]
    ];
    this.positions = [
        [
            {"room": "study", "character1": "", "character2": ""}, 
            {"room": "SH", "character1": "", "character2": null}, 
            {"room": "hall", "character1": "", "character2": ""}, 
            {"room": "HL", "character1": "Miss Scarlet", "character2": null}, 
            {"room": "lounge", "character1": "", "character2": ""}
        ],
        [
            {"room": "SL", "character1": "Professor Plum", "character2": null}, 
            {"room": null, "character1": null, "character2": null}, 
            {"room": "HB", "character1": "", "character2": null}, 
            {"room": null, "character1": null, "character2": null}, 
            {"room": "LD", "character1": "Col Mustard", "character2": null}
        ],
        [
            {"room": "library", "character1": "", "character2": ""}, 
            {"room": "LB", "character1": "", "character2": null}, 
            {"room": "billiard", "character1": "", "character2": ""}, 
            {"room": "BD", "character1": "", "character2": null}, 
            {"room": "dining", "character1": "", "character2": ""}
        ],
        [
            {"room": "LC", "character1": "Mrs Peacock", "character2": null}, 
            {"room": null, "character1": null, "character2": null}, 
            {"room": "BB", "character1": "", "character2": null}, 
            {"room": null, "character1": null, "character2": null}, 
            {"room": "DK", "character1": "", "character2": null}
        ],
        [
            {"room": "conservatory", "character1": "", "character2": ""}, 
            {"room": "CB", "character1": "Mr Green", "character2": null}, 
            {"room": "ballroom", "character1": "", "character2": ""}, 
            {"room": "BK", "character1": "Mrs White", "character2": null}, 
            {"room": "kitchen", "character1": "", "character2": ""}
        ]
    ];
}

Board.prototype.selectCharacter = function(name) {
    switch (name){
        case "Col. Mustard":
            return this.images[1];
            break;
        case "Miss Scarlet":
            return this.images[0];
            break;
        case "Professor Plum":
            return this.images[5];
            break;
        case "Mrs. Peacock":
            return this.images[4];
            break;
        case "Mr. Green":
            return this.images[3];
            break;
        case "Mrs. White":
            return this.images[2];
            break;
    }
};

Board.prototype.placeCharacters = function() {
    for (var i = 0; i < this.positions.length; i++) {
        for (var j = 0; j < this.positions[i].length; j++) {
            var temp = this.positions[i][j];
            if(temp.room != null) {
                if(temp.character1 != null && temp.character1 != "") {
                    img = this.getImage(temp.character1);
                    document.getElementById(temp.room + "1").src = img;
                }
                if(temp.character2 != null && temp.character2 != "") {
                    img = this.getImage(temp.character2 + "2");
                    document.getElementById(temp.room).src = img;
                }
            }
        }
    }
};

// Board.prototype.setup = function() {
//     var canvas = document.getElementById('gameboard');
//     var ctx = canvas.getContext("2d");
//     var image = this.selectCharacter(0, 0, "background");
//     ctx.clearRect(0, 0, this.width, this.height);
//     ctx.drawImage(image, this.width/2 - image.width/2, this.height/2 - image.height/2);

//     // Place the characters
//     for (var row = 0; row < this.position.length; row++) {
//         for (var col = 0; col < this.position[row].length; col++) {
//             if (this.position[row][col] != null && this.position[row][col] != " ") {
//                 image = this.selectCharacter(row, col, "character");
//                 ctx.drawImage(image, this.board[row][col].x - image.width / 2 + 12, 
//                     this.board[row][col].y - image.height / 2 + 12, 40, 40);
//             }
//         }
//     }
// };