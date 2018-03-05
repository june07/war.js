'use strict';

angular.module('warApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$window', '$http', function ($scope, $window, $http) {
	$scope.deck = [];
	$scope.playconfig = {"players":[{"name":"adrian"},{"name":"aaliyah"},{"name":"vivian"},{"name":"michael"}],"rounds":99};
	$scope.messages;

	function setup() {
		$http.post('http://localhost:3000/war/setup', $scope.playconfig)
        .then(function(response) {
			$http.get('http://localhost:3000/war/shuffle').
	        then(function(response) {
	            $scope.deck = response.data;
	            getCardImages();
	        });
        });
	}
	function getCardImages() {
		$scope.deck.cards.forEach(function(card, i, cards) {
			card.imgsrc = 'view1/image/' + card.valsuit + '.png';
			cards[i] = card;
		});
	}
	function deal() {
		$http.get('http://localhost:3000/war/deal')
        .then(function(response) {
			$scope.players = response.data;
        });
	}

	setup();
	$scope.messages = 'The dealer will deal the cards now.';
	setTimeout(function() {
		deal();
	}, 3);
}]);