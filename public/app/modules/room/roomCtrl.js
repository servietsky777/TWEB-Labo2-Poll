(function () {
	'use strict';

	/**
	 * @ngdoc function
	 * @name app.controller:roomCtrl
	 * @description
	 * # roomCtrl
	 * Controller of the room Module
	 * @author Antoine Drabble
	 * @author Guillaume Serneels
	 *
	 */

	angular
		.module('room')
		.controller('RoomCtrl', Room);

	Room.$inject = ['$scope', '$stateParams', 'socketio', '$cookies', '$rootScope'];

	/*
	 * @summary room interactions implemented with the Socket.IO real-time bidirectional
	 event-based communication library
	 */
	function Room($scope, $stateParams, socketio, $cookies, $rootScope) {
		$scope.id = $stateParams.id;
		$scope.questions = [];
		$scope.comments = {};
		$scope.success = false;

		// Settings for doughnut chart
		$scope.colors = [ '#2ECC40', '#FF4136'];
		$scope.labels = ["Like", "Dislike"];

		// Show mroe comments button
		$scope.showMore = function(question){
			question.quantity += 5;
		};

		// Check if the user is admin of the room
		$scope.userIsAdmin = function(){
			for(var room in $rootScope.rooms){
				if($rootScope.rooms[room]._id === $scope.id){
					return true;
				}
			}
			return false;
		};

		// Initialise socketio and join the room
		socketio.init();
		socketio.emit("joinRoom", {room: $scope.id});
		// Handle join room success and fail in case it doesn't exist
		socketio.on("success", function(room){
			$scope.success = true;
			$scope.room = room;
		});
		socketio.on("fail", function(){
			$scope.success = false;
		});

		// Get the list of questions
		socketio.on("listQuestions", function(questions){
			console.log("new listQuestions");
			console.log(questions);
			for(var question in questions){
				questions[question].quantity = 5;
				questions[question].like = $cookies.get("like_" + questions[question]._id);
			}
			$scope.questions = questions;
		});

		// Add a new question
		socketio.on("addQuestion", function(question){
			console.log("new addQuestion");
			console.log(question);
			question.quantity = 5;
			$scope.questions.push(question);
		});

		// Add a new comment
		socketio.on("addComment", function(comment){
			console.log("new addComment");
			console.log(comment);
			for(var i in $scope.questions){
				if($scope.questions[i]._id === comment.question){
					$scope.questions[i].comments.push(comment);
					break;
				}
			}
		});

		// Handle like and dislikes
		socketio.on("addPlus", function(question){
			console.log("new addPlus");
			console.log(question);
			for(var i in $scope.questions){
				if($scope.questions[i]._id === question._id){
					$scope.questions[i].plus = question.plus;
					break;
				}
			}
		});
		socketio.on("addMinus", function(question){
			console.log("new addMinus");
			console.log(question);
			for(var i in $scope.questions){
				if($scope.questions[i]._id === question._id){
					$scope.questions[i].minus = question.minus;
					break;
				}
			}
		});

		// Handle like and dislike removal
		socketio.on("removePlus", function(question){
			console.log("new removePlus");
			console.log(question);
			for(var i in $scope.questions){
				if($scope.questions[i]._id === question._id){
					$scope.questions[i].plus = question.plus;
					break;
				}
			}
		});
		socketio.on("removeMinus", function(question){
			console.log("new removeMinus");
			console.log(question);
			for(var i in $scope.questions){
				if($scope.questions[i]._id === question._id){
					$scope.questions[i].minus = question.minus;
					break;
				}
			}
		});

		// Handle question and comment removal
		socketio.on("removeQuestion", function(question){
			console.log("new removeQuestion");
			console.log(question);
			for(var i in $scope.questions){
				if($scope.questions[i]._id === question._id){
					$scope.questions.splice(i,1);
					break;
				}
			}
		});
		socketio.on("removeComment", function(comment){
			console.log("new removeComment");
			console.log(comment);
			for(var i in $scope.questions){
				for(var j in $scope.questions[i].comments) {
					if ($scope.questions[i].comments[j]._id === comment._id) {
						console.log($scope.questions[i].comments);
						$scope.questions[i].comments.splice(j, 1);
						console.log($scope.questions[i].comments);
						return;
					}
				}
			}
		});

		// Handle question form submission
		$scope.questionSubmit = function(){
			console.log("create question");
			socketio.emit("addQuestion", {room: $scope.id, title: $scope.title, question: $scope.question});
			$scope.title = "";
			$scope.question = "";
		};

		// Handle comment form submission
		$scope.commentSubmit = function(questionId){
			console.log("create comment");
			console.log($scope.comments[questionId]);
			socketio.emit("addComment", {room: $scope.id, question: questionId, comment: $scope.comments[questionId]});
			$scope.comments[questionId] = "";
		};

		// Handle like and dislike button clicks
		$scope.plusClick = function(questionId){
			console.log(questionId);
			console.log("plus");
			if(!$cookies.get("like_" + questionId)) {
				socketio.emit("addPlus", {room: $scope.id, question: questionId});
			} else if($cookies.get("like_" + questionId) === "minus"){
				socketio.emit("removeMinus", {room: $scope.id, question: questionId});
				socketio.emit("addPlus", {room: $scope.id, question: questionId});
			}
			$cookies.put("like_" + questionId, "plus");
			for(var question in $scope.questions){
				$scope.questions[question].like = $cookies.get("like_" + $scope.questions[question]._id);
			}
		};
		$scope.minusClick = function(questionId){
			console.log("minus");
			if(!$cookies.get("like_" + questionId)) {
				socketio.emit("addMinus", {room: $scope.id, question: questionId});
			} else if($cookies.get("like_" + questionId) === "plus"){
				socketio.emit("removePlus", {room: $scope.id, question: questionId});
				socketio.emit("addMinus", {room: $scope.id, question: questionId});
			}
			$cookies.put("like_" + questionId, "minus");
			for(var question in $scope.questions){
				$scope.questions[question].like = $cookies.get("like_" + $scope.questions[question]._id);
			}
		};

		// Handle question and comment removal click
		$scope.removeQuestion = function(question){
			console.log("Remove question");
			socketio.emit("removeQuestion", {token: $cookies.get("token"), question: question._id, room: $scope.id});
		};
		$scope.removeComment = function(comment){
			console.log("Remove comment");
			socketio.emit("removeComment", {token: $cookies.get("token"), comment: comment._id, room: $scope.id});
		};
	}
})();
