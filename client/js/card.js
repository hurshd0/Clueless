/*
	Represents a standard clue card
*/
function Card(type, name) {
	this.type = type;			// The type of card (weapon, suspect, or room)
	this.name = name;			// The name on the card
	this.dealt = false;
}

/*
	Represents a deck of cards
*/
function Deck(cards=[]) {
	this.cards = cards;			// A list of Card objects
}

// Adds one or more cards to the deck
Deck.prototype.add_card = function(card) {
	if (Array.isArray(card)) {
		this.cards = this.cards.concat(card);
	} else {
		this.cards.push(card);
	}
};

// Find a card by number 
// or name and returns it from the deck
Deck.prototype.get_card = function(card) {
	if (typeof card === 'number') {
		this.cards[card].dealt = true;
		return this.cards[card];
	} else {
		for(var i = 0; i < this.cards.length; i++) {
			if (this.cards[i].name === card) {
				this.cards[i].dealt = true;
				return this.cards[i];
			}
		}
	}
};

// Return the list of cards that have not been dealt
Deck.prototype.not_dealt = function() {
	var temp = [];
	for (var i = 0; i < this.cards.length; i++) {
		if(!this.cards[i].dealt) {
			temp.push(this.cards[i]);
		}
	}

	return temp;
};

// Shuffles the cards in the deck
Deck.prototype.shuffle = function() {
	for (var i = 0; i < this.cards.length; i++) {
		var random = i + Math.floor(Math.random() * (this.cards.length - i));
		var temp = this.cards[i];
		this.cards[i] = this.cards[random];
		this.cards[random] = temp;
	}
};

// Return a number of cards from the deck
Deck.prototype.deal_cards = function(count) {
	var hand = [];
	var i = 0;
	do {
		if(!this.cards[i].dealt) {
			hand.push(this.cards[i]);
			this.cards[i].dealt = true;
		}
		i++;
	}while(hand.length < count);
	return hand;
};