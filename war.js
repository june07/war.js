
var util = require('util');
var Promise = require("bluebird");

var players = [
  	new Player('adrian'),
  	new Player('aaliyah'),
  	new Player('vivian'),
  	new Player('michael')
  ],
  rounds = 0,
  pot = null,
  deck;

function Deck() {
	this.suits = ['heart', 'diamond', 'club', 'spade'];
	this.cards = [];

	var self = this;
	this.addCard = function(suit, value) {
		self.cards.push(new Card(suit, value));
	}
	return this;
}
function Card(suit, value) {
	this.suit = suit;
	this.value = value;
	this.valsuit = checkIfRoyal(value) + suit.substring(0,1).toUpperCase();
	this.ascii = null;
	this.pretty = null;

	switch (suit) {
		case 'heart': this.ascii = '0x2665'; break;
		case 'diamond': this.ascii = '0x2666'; break;
		case 'club': this.ascii = '0x2663'; break;
		case 'spade': this.ascii = '0x2660'; break;
	}
	this.pretty = checkIfRoyal(value) + String.fromCharCode(this.ascii);
	return this;
}
function checkIfRoyal(cardValue) {
	switch (cardValue) {
		case 11: return 'J'; break;
		case 12: return 'Q'; break;
		case 13: return 'K'; break;
		case 14: return 'A'; break;
		default: return cardValue;
	}
}
function Player(name) {
	this.name = name;
	this.cards = [];

	var self = this;

	self.showCards = function() {
		var hand = ''
		for (var i = 0; i < self.cards.length; i++) hand += self.cards[i].pretty;
		return (hand);
	}
	self.play = function() {
		var card = self.cards.shift();
		return { whos: self.name, card: card, remaining: self.cards.length };
	}
	self.getWinnings = function(pot) {
		if (pot.cards !== undefined) self.cards = self.cards.concat(pot.cards);
		if (pot.drawCards !== undefined) self.cards.concat(pot.drawCards);
		pot.drawCards = [];
	}
	return self;
}
function Pot() {
	this.plays = [];
	this.cards = [];
	this.drawCards = [];
	this.winner = { name: 'nobody', value: 0 };
	this.history = [];
	this.draw = false;

	var self = this;
	self.turn = function(userplay, last) {
		var name = userplay.whos;
		var card = userplay.card;

		self.plays.push(userplay);
		self.cards.push(card);

		if (card.value > self.winner.value) {
			self.winner.value = card.value;
			self.winner.name = name;
		} else if (card.value === self.winner.value) {
			self.winner.value = card.value;
			self.winner.name = 'draw';
			self.draw = true;
		}
		if (last) self.history.push({ round: rounds, plays: self.plays, taker: self.winner.name, taken: self.sumWinnings() })
	}
	self.sumWinnings = function() {
		return self.cards.concat(self.drawCards);
	}
	self.lastTurn = function(userplay) {
		self.turn(userplay, true);
		//self.history.push({ round: rounds, plays: self.plays, taker: self.winner.name })
		self.plays = [];
		if (self.draw) {
			self.drawCards = self.drawCards.concat(getCardsFromDrawPlay(self.plays));
			self.draw = false;
		} else {
			award(self);
		}
		winlose();
	}
	self.showHistory = function() {
		console.log('Game History: ');
		for (var i = 0; i < self.history.length; i++) {
			process.stdout.write('Round: ' + self.history[i].round);
			process.stdout.write('\tPot: ' + self.history[i].taker + '\t');
			displayPlays(self.history[i].plays);
			displayPot(self.history[i].taken);
			console.log();
		}
	}
}
var getCardsFromDrawPlay = function(plays) {
	var drawPlayCards = [];
	for (var i = 0; i < plays.length; i++) drawPlayCards.push(plays[i].cards);
	return drawPlayCards;
}
var displayHistory = function(history) {
	for (var i = 0; i < history.length; i++) {
		displayPlays(history[i].plays);
	}
}
var displayPlays = function(plays) {
	process.stdout.write('Plays: ');
	for (var i = 0; i < plays.length; i++) {
		process.stdout.write(plays[i].whos + ' ');
		process.stdout.write('cards: ' + plays[i].remaining + ' ');
		process.stdout.write('played: ' + plays[i].card.pretty + ', ');
	}
}
var displayPot = function(pot) {
	var winnings = '';
	for (var i = 0; i < pot.length; i++) winnings += pot[i].pretty + ' ';
	process.stdout.write('Pot contents: ' + winnings);
}
var winlose = function() {
	for (var i = 0; i < players.length; i++) {
		if (players[i].cards.length <= 3) {
			console.log('Player ' + players[i].name + ' lost.');
			players.splice(i, 1);
		}
	}
}
var gameOver = function() {
	console.log('Player ' + players[0].name + ' won!');
	pot.showHistory();
}
var award = function(pot) {
	players.find(function(player) {
		if (player.name == pot.winner.name) player.getWinnings(pot);
	});
	pot.cards = [];
	pot.drawCards = [];
	pot.winner = { name: 'nobody', value: 0 };
}
var createDeck = function() {
	var deck = new Deck();

	for (var i = 0; i < 4; i++) {
		var suit = deck.suits.pop();
		for (var i2 = 0; i2 < 13; i2++) {		
			var value = i2+2; 
			deck.addCard(suit, value);
		}
	}
	console.log('Created new deck of cards.');
	return deck;
}
var shuffle = function(deck) {
	return new Promise(function(resolve, reject) {
 		deck.cards = deck.cards.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
 		resolve(deck);
 	});
}
var deal = function(_deck, _players) {
	return new Promise(function(resolve, reject) {
		var p = 0;
		for (var i = 0; i < _deck.cards.length; i++) {
			_players[p].cards.push(_deck.cards.shift());
			p++;
			if (p == _players.length) p = 0;
		}
		for (var i = 0; i < _players.length; i++) {
			var player = _players[i];
			console.log('Player ' + player.name + '\'s hand: ' + player.showCards());
		}
		deck = _deck;
		players = _players;
 		resolve();
 	});
}
var play = function(players) {
	pot = new Pot();

	return new Promise(function(resolve, reject) {
		while (rounds < 100) {
			for (var i = 0; i < players.length; i++) {
				var player = players[i];
				if (i == players.length-1) {
					pot.lastTurn(player.play());
				} else {
					pot.turn(player.play(), false);
				}
			}
			if (players.length === 1 || rounds === 99) {
				gameOver();
				return resolve('Thanks for playing.');
			}
			rounds++;
		}
 		reject('WTF?!');
 	});
}
var consolePlay = function() {
	for (var i = 0; i < players.length; i++) {
			var player = players[i];
			console.log('Player ' + player.name + ': ' + player.cards);
	}

	shuffle(createDeck())
	.then(function(d) {
		return deal(d, players);
	})
	.then(function() {
		return play(players);
	})
	.then(function(gameOverMessage) {
		console.log(gameOverMessage);
	});
}();

function setupREST(config) {
	console.log('Config: ');
	console.dir(config);
	players = config.players;
	rounds = config.rounds;

	console.log('Setup game for ' + players.length + ' players.');
	console.log('Setup game to play ' + rounds + ' rounds.');
	return 'Setup complete.'
}
function shuffleREST() {
	var deckPromise = createDeck();
	deckPromise = shuffle(deckPromise);

	return deckPromise.then(function(_deck) {
		var json = JSON.stringify(_deck);
		deck = _deck;
		console.log('Created new deck of cards.');
		
		return json;
	});
}
function dealREST() {
	return deal(deck, players).then(function() {
		console.log('Dealt players cards.');
		console.dir(players);
		return JSON.stringify(players);
	});
}
function playREST() {
	return "playREST ran!";
}
module.exports = {
	setup: setupREST,
	shuffle: shuffleREST,
	deal: dealREST,
	play: playREST
}
