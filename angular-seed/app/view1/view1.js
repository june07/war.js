'use strict';

angular.module('warApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
	$scope.getPlayersCards = function(player) {
		if ($scope.players === undefined) return;
		return $scope.players.find(function(p) {
			if (player.name === p.name) return true;
		}).cards;
	}
	$scope.startgame = startgame;
	$scope.play = play;

	function setup() {
		$http.post('http://localhost:3000/war/setup', $scope.playconfig)
        .then(function(response) {
			$http.get('http://localhost:3000/war/shuffle').
	        then(function(response) {
	            $scope.deck = response.data;
	            getCardImages($scope.deck.cards);
	        });
        });
	}
	function getCardImages(cards) {
		cards.forEach(function(card, i, cards) {
			card.imgsrc = 'view1/image/' + card.valsuit + '.png';
			cards[i] = card;
		});
	}
	function deal() {
		$http.get('http://localhost:3000/war/deal')
        .then(function(response) {
			$scope.players = response.data;
			$scope.players.forEach(function(player, i) {
				getCardImages(player.cards);
			})
        });
	}
	function play() {
		$http.get('http://localhost:3000/war/play')
        .then(function(response) {
			$scope.pot = response.data;
			$scope.messages = $scope.pot.winner.name + ' won!';
			$scope.again = true;
        });
	}
	function startgame() {
		$scope.deck = [];
		$scope.players = [];
		$scope.playconfig = {"players":[{"name":"adrian"},{"name":"aaliyah"},{"name":"vivian"},{"name":"michael"}],"rounds":99};
		$scope.messages = 'Shuffling the deck...';
		$scope.again = false;

		setup();
		$timeout(function() {
			$scope.messages = 'The dealer will deal the cards now.';
			$timeout(function() {
				deal();
			}, 1000);
		}, 3000);
	};
	startgame();
}]);