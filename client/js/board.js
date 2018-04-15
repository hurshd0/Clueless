function Board(images) {
    this.images = images;
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
            {"room": "LD", "character1": "Colonel Mustard", "character2": null}
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

Board.prototype.checkPosition = function(pos, name) {
    var row = pos[0];
    var col = pos[1];
    var oldPos = [];
    if (row >= 0 && row < 5 && col >= 0 && col < 5
        && this.positions[row][col].character1 === "") {
        for(var i = 0; i < this.positions.length; i++) {
            for(var j = 0; j < this.positions[i].length; j++) {
                if (this.positions[i][j].character1 === name) {
                    oldPos = [i, j];
                    this.positions[i][j].character1 = "";
                    this.positions[row][col].character1 = name;
                    return [true, oldPos];
                }
            }
        }
    } else {
        return [false, oldPos];
    }
};

Board.prototype.selectCharacter = function(name) {
    switch (name){
        case "Colonel Mustard":
            return this.images[1];
            break;
        case "Miss Scarlet":
            return this.images[0];
            break;
        case "Professor Plum":
            return this.images[5];
            break;
        case "Mrs Peacock":
            return this.images[4];
            break;
        case "Mr Green":
            return this.images[3];
            break;
        case "Mrs White":
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
                    img = this.selectCharacter(temp.character1);
                    document.getElementById(temp.room + "1").src = img;
                }
                if(temp.character2 != null && temp.character2 != "") {
                    img = this.selectCharacter(temp.character2 + "2");
                    document.getElementById(temp.room).src = img;
                }
            }
        }
    }
};