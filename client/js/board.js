function Board(images) {
    this.images = images;
    this.positions = [
        [
            {"room": "study", "characters": ["", "", "", "", "", ""]}, 
            {"room": "SH", "characters": [""]}, 
            {"room": "hall", "characters": ["", "", "", "", "", ""]}, 
            {"room": "HL", "characters": ["Miss Scarlet"]}, 
            {"room": "lounge", "characters": ["", "", "", "", "", ""]}
        ],
        [
            {"room": "SL", "characters": ["Professor Plum"]}, 
            {"room": null, "characters": []}, 
            {"room": "HB", "characters": [""]}, 
            {"room": null, "characters": []}, 
            {"room": "LD", "characters": ["Colonel Mustard"]}
        ],
        [
            {"room": "library", "characters": ["", "", "", "", "", ""]}, 
            {"room": "LB", "characters": [""]}, 
            {"room": "billiard", "characters": ["", "", "", "", "", ""]}, 
            {"room": "BD", "characters": [""]}, 
            {"room": "dining", "characters": ["", "", "", "", "", ""]}
        ],
        [
            {"room": "LC", "characters": ["Mrs Peacock"]}, 
            {"room": null, "characters": []}, 
            {"room": "BB", "characters": [""]}, 
            {"room": null, "characters": []}, 
            {"room": "DK", "characters": [""]}
        ],
        [
            {"room": "conservatory", "characters": ["", "", "", "", "", ""]}, 
            {"room": "CB", "characters": ["Mr Green"]}, 
            {"room": "ballroom", "characters": ["", "", "", "", "", ""]}, 
            {"room": "BK", "characters": ["Mrs White"]}, 
            {"room": "kitchen", "characters": ["", "", "", "", "", ""]}
        ]
    ];
}

Board.prototype.checkPosition = function(pos, name) {
    var row = pos[0];
    var col = pos[1];
    var oldPos = [];
    if (row >= 0 && row < 5 && col >= 0 && col < 5
        && this.positions[row][col].room !== null) {
        for(var i = 0; i < this.positions.length; i++) {
            for(var j = 0; j < this.positions[i].length; j++) {
                var myarr = this.positions[i][j].characters;
                if(myarr.includes(name)) {
                    for(var k = 0; k < this.positions[row][col].characters.length; k++) {
                        if (this.positions[row][col].characters[k] === "") {
                            oldPos = [i, j];
                            oldPos.push(myarr.indexOf(name) + 1);
                            myarr.splice(myarr.indexOf(name), 1, '');
                            this.positions[row][col].characters[k] = name;
                            return [true, oldPos];
                        }
                    }
                    return [false, oldPos];
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
    var img;
    for (var i = 0; i < this.positions.length; i++) {
        for (var j = 0; j < this.positions[i].length; j++) {
            var temp = this.positions[i][j];
            if(temp.room != null) {
                for(var k = 0; k < temp.characters.length; k++) {
                    if (temp.characters[k] !== "") {
                        img = this.selectCharacter(temp.characters[k]);
                        document.getElementById(temp.room + (k + 1).toString()).src = img;
                    }
                }
            }
        }
    }
};