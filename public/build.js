var app = angular.module('arabicSite', ['ui.router', 'ngAnimate', 'verbApp']);

app.run(function ($rootScope, $state) {
    $rootScope._ = window._;

    $rootScope.$state = $state;
});

app.config(function($urlRouterProvider) {
    // This redirects to the conjugator app when the base url is entered
    $urlRouterProvider.when('', '/conjugation_practice');
})

;var verbApp = angular.module('verbApp', [])

;var app = angular.module('arabicSite');

app.controller('rootCtrl', function($scope) {
    $scope._ = _;

    $scope.globals = {};
    $scope.globals.count = 0;
})

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

;var verbApp = angular.module('verbApp');

verbApp.controller('typingTutorCtrl', function($scope, $document) {
    $scope.letterGroups = ["ا - ل", "ت - ب", "ن - ي", "م - س", "ط - ك - ش", "غ - ف", "ع - ق", "ه - ث", "خ - ص", "ح - ض",
        "د - ج", "ى - ذ", "ة - ر", "و - ؤ", "ز - ء", "ظ - ئ", "أ - إ - آ", "-َ -ِ -ُ"]

    $scope.range1 = _.range(1, 10);
    $scope.range2 = _.range(10, 18);

    angular.element($document).ready(function () {
        if ($("#gameCanvas").length === 1)
        {

            //$('span').tooltip();
            var startButton = $("#startButton");
            var stopButton = $("#stopButton");
            var showKeyboardButton = $("#show-keyboard");
            var hideKeyboardButton = $("#hide-keyboard");

            var canvas = $("#gameCanvas");
            var context = canvas.get(0).getContext("2d");
            // have to use monospace font for Arabic to work correctly
            context.font = "bold 30px 'courier new'"

            // Canvas dimensions
            var canvasWidth = canvas.width();
            var canvasHeight = canvas.height();
            var paused = true;
            // so that levels are selectable when game is paused but not when there is an alert box present
            // thus, create second boolean variable
            var clickableLevels = false;
            var sentenceY = 100;
            var sentenceClearBoundary = 110;

            // create a game object which keeps track of sentences, sentenceNumber, correctCount, etc
            var Game = function() {

                this.pauseGame = function()
                {
                    paused = true;
                    $(window).unbind("keypress");
                }

                this.getSentences = function(level) {
                    // lines is an array of sentences
                    var result = false;
                    var textFile = "/static/typing_tutor/level" + level + ".html";
                    $.ajax({
                        url: textFile,
                        success: function(text) { result = text; },
                        async: false
                    });
                    var sentences = result.split("\n");
                    // subtract 1 because it seems include an empty string
                    this.totalSentences = sentences.length - 1;
                    this.remainingSentences = this.totalSentences;
                    return sentences;
                }

                this.sentenceNumber = 0;
                this.currentLevel = 1;
                this.sentences = this.getSentences(1);
                this.correctSentences = 0;
                this.points = 0;
                this.totalSentences;
                this.remainingSentences;
                this.totalLevels = 16;

                this.getAllLevels = function() {
                    var levelList = [];
                    for (var j = 1; j <= this.totalLevels; j++)
                    {
                        levelList.push(j);
                    }
                    return levelList;
                }

                this.allLevels = this.getAllLevels();
                // no level have been completed upon starting the game
                this.completedLevels = [];

                // add points and update remaining sentences
                this.addPoints = function() {
                    this.correctSentences += 1;
                    this.points += 5
                    this.remainingSentences -= 1;
                    gameElements.gameDisplay.updateScore(this.points);
                    gameElements.gameDisplay.updateRemainingSentences();
                }

                this.getUserLetter = function(e) {
                    var charCode = e.which; // charCode will contain the code of the character inputted
                    var letter = String.fromCharCode(charCode); // theChar will contain the actual character
                    return letter;
                }

                this.clearCanvas = function() {
                    context.clearRect(0, 0, canvasWidth, sentenceClearBoundary);
                }

                this.showNextSentence = function(newLevel) {

                    if (newLevel === true) { this.sentenceNumber = 0; }
                    else
                    {
                        this.sentenceNumber += 1;
                    }

                    if (this.checkIfLastSentence() === true)
                    {
                        this.handleLastSentence();
                    }
                    else
                    {
                        if (paused !== true || clickableLevels === true)
                        {
                            gameElements.sentence = new Sentence(gameElements.game.sentences[gameElements.game.sentenceNumber]);
                            this.clearCanvas();
                            gameElements.cover.restartCover();
                            gameElements.sentence.redraw();
                        }
                    }
                }

                this.checkIfLastSentence = function() {
                    if (this.sentenceNumber > this.totalSentences - 1) { return true; }
                    else { return false; }
                }

                this.handleLastSentence = function() {
                    // if the user got everything correct, then move to the next incomplete level (if there are any more)
                    if (this.totalSentences === this.correctSentences)
                    {
                        var nextLevel = this.getNextLevel();
                        if (nextLevel === 0)
                        {
                            gameElements.gameDisplay.gameCompletionAlert();
                            newGame();
                        }
                        else
                        {
                            this.markLevelAsCompleted(this.currentLevel);
                            gameElements.gameDisplay.levelCompletionAlert(this.currentLevel);
                            this.newLevel(nextLevel)
                        }
                    }
                    else
                    {
                        // repeat the same level
                        gameElements.gameDisplay.levelRestartAlert(this.currentLevel);
                        this.newLevel(this.currentLevel);
                    }
                }

                this.markLevelAsCompleted = function() {
                    // if the completedLevel array doesn't already have the currentLevel in it, then and only then you can add it.
                    if ($.inArray(this.currentLevel, this.completedLevels) === -1)
                    {
                        this.completedLevels.push(this.currentLevel);
                        gameElements.gameDisplay.colorCompletedLevelBox();
                    }
                }

                this.newLevel = function(level) {
                    this.currentLevel = level;
                    gameElements.gameDisplay.updateLevel();
                    this.correctSentences = 0;
                    this.sentences = this.getSentences(level);
                    gameElements.gameDisplay.updateRemainingSentences();
                    this.showNextSentence(true);
                }

                this.getNextLevel = function() {
                    // including the current level, which this.completedLevels does not yet include
                    var allCompletedLevels = (this.completedLevels.concat(this.currentLevel)).sort(sortFunction);
                    if (this.allLevels.sort(sortFunction).join(",") === allCompletedLevels.join(","))
                    {
                        return 0;
                    }
                    else
                    {
                        // make a shallow copy of the the allLevels array
                        var incompleteLevels = this.allLevels.slice();
                        for (var i = 0; i < allCompletedLevels.length; i++)
                        {
                            var level = allCompletedLevels[i];
                            var indexToRemove = incompleteLevels.indexOf(level);
                            incompleteLevels.splice(indexToRemove, 1);
                        }
                        // go to the next possible level
                        var nextLevelIndex = incompleteLevels.indexOf(this.currentLevel + 1)
                        var nextLevel = incompleteLevels[nextLevelIndex]
                        // if there is no larger level, loop back to the beginning of the array
                        if (nextLevel === undefined)
                        {
                            nextLevel = incompleteLevels[0];
                        }
                        return nextLevel;
                    }
                }
            }

            /// for numerical sorting
            function sortFunction(a, b){
                return (a - b) //causes an array to be sorted numerically and ascending
            }

            var GameDisplay = function() {
                this.alertDiv = $("#game-start");
                this.keyboardImage = $("#arabic-keyboard")
                this.alertDelay = 2000;
                this.score = $("#score");
                var _this = this;
                this.updateScore = function(points) {
                    // update the UI to display the new score
                    this.score.html(points);
                }

                this.initializeScore = function() {
                    this.score.html(0);
                }

                this.updateRemainingSentences = function() {
                    $("#lines-remaining").html(gameElements.game.remainingSentences);
                }

                this.updateLevel = function() {
                    // make all other level boxes inactive
                    $(".levelBox").removeClass("currentLevel");
                    // make the new level box active
                    $("#levelBox_" + gameElements.game.currentLevel).addClass("currentLevel");
                }


                this.colorCompletedLevelBox = function() {
                    $("#levelBox_" + gameElements.game.currentLevel).addClass("completedLevel");
                }

                this.initializeCurrentLevel = function() {
                    $("#levelBox_1").addClass("currentLevel");
                }

                this.initializeRemainingSentences = function() {
                    $("#lines-remaining").html(gameElements.game.remainingSentences);
                }

                this.initializeDifficultyLevel = function() {
                    var difficultyOptions = '<a class="btn dropdown-toggle current-option" data-toggle="dropdown" href="#" id="Beginner">' +
                        'Beginner<span class="caret"></span></a><ul class="dropdown-menu" id="difficulty-option">' +
                        '<li><a href="#" id="Intermediate">Intermediate</a></li>' +
                        '<li><a href="#" id="Advanced">Advanced</a></li></ul>'
                    $("#difficulty-level-div").html(difficultyOptions);
                }

                this.levelCompletionAlert = function(level) {
                    var message = "Good job! You completed level " + level + ".";
                    this.displayMessage(message, "Okay");
                }

                // where user reaches the end of a level but didn't get all the sentences correct
                this.levelRestartAlert = function() {
                    var message = "Good try but you didn't pass the level. Try again!";
                    this.displayMessage(message, "Okay");
                }

                this.gameCompletionAlert = function() {
                    var message = "Congratulations! You have completed all of the levels!";
                    this.displayMessage(message, "Start New Game");
                }

                this.displayMessage = function(message, buttonMessage) {
                    var _this = this;
                    startButton.hide();
                    stopButton.hide();
                    var message = message + '<br /><br /><button class="btn btn-default" type="button" id="okay">' + buttonMessage + '</button>'
                    $('#message-div').show();
                    $('#message-div').html(message);
                    this.alertDiv.css("z-index", 10);
                    gameElements.game.pauseGame();
                    clickableLevels = false;
                    $("#okay").on("mouseup", function() {
                        // why is this being triggered in chrome? That's basically the issue here!!!
                        _this.moveAlertBack();
                    })
                }

                this.moveAlertBack = function() {
                    $('#message-div').hide();
                    this.alertDiv.css("z-index", -2);
                    paused = false;
                    clickableLevelLevels = true;
                    stopButton.show();
                    gameElements.game.showNextSentence(true);
                    runGame();
                }

                this.reinitializeUi = function() {
                    $(".levelBox").removeClass("currentLevel");
                    $(".levelBox").removeClass("completedLevel");
                    this.initializeCurrentLevel();
                    this.initializeRemainingSentences();
                    this.initializeScore();
                    this.initializeDifficultyLevel();
                }

                this.showKeyboard = function() {
                    showKeyboardButton.hide();
                    hideKeyboardButton.show();
                    this.keyboardImage.css("z-index", 1);
                }

                this.hideKeyboard = function() {
                    hideKeyboardButton.hide();
                    showKeyboardButton.show();
                    this.keyboardImage.css("z-index", -10);
                }

                this.initializeCurrentLevel();
            }


            var Cover = function() {
                this.x = 0;
                this.initialY = canvasHeight;
                this.y = this.initialY;
                this.boundary = sentenceClearBoundary;
                this.levelToSpeed = {"Beginner": 0.1, "Intermediate": 0.3, "Advanced": 0.6}
                this.speed = this.levelToSpeed["Beginner"];

                this.setState = function() {
                    //context.fillStyle = "rgba(0, 195, 209, 1)";
                    context.fillStyle = "rgba(192, 192, 192, 1)";
                }

                this.update = function() {
                    this.setState();
                    context.clearRect(0, this.boundary, canvasWidth, canvasHeight);
                    context.fillRect(this.x, this.y, 940, 500);
                    this.y = this.y - this.speed;
                    if (this.y < (gameElements.sentence.y - 20))
                    {
                        gameElements.game.showNextSentence();
                        this.restartCover();
                    }
                }

                this.restartCover = function() {
                    this.y = this.initialY;
                }

                this.changeSpeed = function(difficultyLevel) {
                    this.speed = this.levelToSpeed[difficultyLevel]
                }
            }

            var Sentence = function(sentenceString) {
                this.sentenceString = sentenceString;
                this.correctCount = 0;
                this.y = 100;
                this.x = canvasWidth - 30;

                this.getLetters = function() {
                    var letters = sentenceString.split("");
                    return letters;
                }

                this.letters = this.getLetters();

                this.setState = function() {
                    context.fillStyle = "rgba(45, 39, 97, 1)";
                }

                this.redraw = function() {
                    this.setState();
                    context.fillText (sentenceString, this.x, this.y);
                }

                this.getCurrentSnippet = function() {
                    return this.letters.slice(0, this.correctCount).join("");
                }
            }

            var Highlighter = function() {
                this.width = 0;

                this.setState = function() {
                    context.fillStyle = "rgba(255, 204, 0, 0.5)";
                }

                this.highlight = function(currentSnippet) {
                    this.width = -(context.measureText(currentSnippet).width);
                    this.setState();
                    context.fillRect(gameElements.sentence.x, 75, this.width, 30);
                }
            }

            var InputHandler = function() {
                this.handleCorrectInput = function() {
                    gameElements.game.clearCanvas();
                    gameElements.sentence.redraw();
                    gameElements.sentence.correctCount += 1;
                    currentSnippet = gameElements.sentence.getCurrentSnippet();
                    gameElements.highlighter.highlight(currentSnippet);
                }

                // check if user has completed the sentence such that a new sentence is necessary
                this.checkForNextSentence = function() {
                    if (gameElements.sentence.correctCount === gameElements.sentence.letters.length)
                    {
                        gameElements.game.addPoints();
                        gameElements.game.showNextSentence();
                    }
                    return gameElements.sentence;
                }

                this.handleIncorrectInput = function() {
                }


                $(".levelBox").click(function() {
                    if (paused !== true || clickableLevels === true)
                    {
                        var level = parseInt(this.id.split("_")[1]);
                        gameElements.game.newLevel(level);
                        gameElements.gameDisplay.updateLevel(level);
                    }
                });

                $("#difficulty-option a").click(function(e) {
                    e.preventDefault();
                    var newOptionElement = $(this);
                    var newOption = this.id;

                    // grab selected-option, change it's id and html to newOption
                    var currentOptionElement = $(".current-option")
                    var currentOption = currentOptionElement.attr("id");

                    currentOptionElement.html(newOption + ' <span class="caret"></span>');
                    currentOptionElement.attr("id", newOption);

                    newOptionElement.attr("id", currentOption);
                    newOptionElement.html(currentOption);

                    // change speed of cover
                    gameElements.cover.changeSpeed(newOption);
                });

                showKeyboardButton.click(function() {
                    gameElements.gameDisplay.showKeyboard();
                })

                hideKeyboardButton.click(function() {
                    gameElements.gameDisplay.hideKeyboard();
                })

            }

            Elements = function() {
                this.game = new Game();
                this.sentence = new Sentence(this.game.sentences[this.game.sentenceNumber]);
                this.inputHandler = new InputHandler();
                this.highlighter = new Highlighter();
                this.cover = new Cover();
                this.gameDisplay = new GameDisplay();
            }
            // global object which contains all of the game elements
            gameElements = new Elements();

            function newGame() {
                gameElements.game.pauseGame();
                gameElements.game.clearCanvas();
                // clear all the UI stuff -- score, lines remaining, difficulty level
                // foobar
                gameElements.gameDisplay.reinitializeUi();
                gameElements = new Elements();
                runGame();
            }

            function runGame() {
                function moveCover() {
                    gameElements.cover.update();
                    if (paused !== true) { setTimeout(moveCover, 33); }
                };

                moveCover();
                gameElements.gameDisplay.initializeRemainingSentences();

                if (!paused)
                {
                    gameElements.sentence.redraw();
                    $(window).keypress(function(e) {
                        var letter = gameElements.game.getUserLetter(e);

                        // prevent scrolling when space bar is hit
                        if (letter === " ")
                            e.preventDefault();
                        if (letter === gameElements.sentence.letters[gameElements.sentence.correctCount])
                        {
                            gameElements.inputHandler.handleCorrectInput();
                            gameElements.inputHandler.checkForNextSentence();
                        }
                        // if the wrong letter in input
                        else
                        {
                            gameElements.inputHandler.handleIncorrectInput();
                        }
                    });
                }
            }

            function init(){
                setUpUi();
                runGame();
            }

            function setUpUi(){
                var delay = 200

                startButton.hide();
                stopButton.hide();
                showKeyboardButton.hide();
                hideKeyboardButton.hide();
                $(window).unbind("keypress");

                // set paused to false
                $("#game-start").css("z-index", -1);
                $('#message-div').hide();
                //$("#game-start").hide();
                paused = false;
                clickableLevels = true;
                stopButton.show();
                showKeyboardButton.show();

                startButton.click(function(){
                    $(this).hide();
                    stopButton.show();
                    paused = false;
                    runGame();
                });

                stopButton.click(function(){
                    $(this).hide();
                    startButton.show();
                    paused = true;
                    // unbind the keydown listener
                    $(window).unbind("keypress");
                });
            }

            init();

        }

    });
})



;var verbApp = angular.module('verbApp');

verbApp.controller('conjugatorCtrl', function($scope, conjugator, hamzatedWord, helperData) {
    // hamzated example
    var verb = {
        letter1: 'ق',
        letter2: 'ر',
        letter3: 'ء',
        type: {
            name: 'sound'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ'
    }

    var options = {
        form: 1,
        person: 'thirdPerson',
        gender: 'feminine',
        number: 'plural',
        tense: 'perfect'
    }

    $scope.conjugator = conjugator;
    $scope.conjugator.initialize(verb, options);

    $scope.helperData = helperData;

    // selections made by the user
    $scope.userInput = {};

    $scope.generateVerbs = function(userInput) {
        if (userInput.letter1 && userInput.letter2 && userInput.letter3 && userInput.perfectVowel && userInput.type) {
            $scope.conjugator.setVerb(userInput);
        }
    }
})
;var app = angular.module('verbApp');

app.controller('exercisesCtrl', function($scope, questionsService, thackstonExercises, $http) {
    $scope.questionsService = questionsService;
    questionsService.initialize();

    $scope.chapterData = {}
    $scope.chapterData.chapters = thackstonExercises.chapters;
    $scope.chapterData.selectedChapter = $scope.chapterData.chapters[0];

    questionsService.questions = thackstonExercises.exercises;

    // Create a shallow copy so that changes to filteredQuestions do not affect the original conjugation list
    // filteredQuestions will be the deck used to display the questions
    questionsService.filteredQuestions = questionsService.questions;

    // Set the current question
    questionsService.questionIndex = 0;
    questionsService.currentQuestion = questionsService.filteredQuestions[questionsService.questionIndex];

    $scope.setFilter = function() {
        questionsService.filteredQuestions = _.filter(questionsService.questions, {'chapter': $scope.chapterData.selectedChapter.name});
        questionsService.updateQuestions();
    }

    $scope.setFilter();

    //$http.get('/static/thackston_exercises.txt')
    //    .success(function(data) {
    //        var lines = data.split("\n");
    //        $scope.lines = [];
    //
    //        for (var i = 0; i < lines.length; i = i + 2) {
    //            $scope.lines.push(JSON.stringify({
    //                question: lines[i],
    //                answer: lines[i+1],
    //                chapter: 1
    //            }))
    //        }
    //    })

})

;var verbApp = angular.module('verbApp');

verbApp.controller('verbAppCtrl', function($scope, conjugator, helperData, filterOptions, verbs, questionsService, alertService, verbAppConstants) {
    $scope.questions = questionsService;
    $scope.questions.initialize();

    $scope.alert = alertService;

    $scope.helperData = helperData;

    $scope.filterOptions = filterOptions;
    filterOptions.reset();

    $scope.verbs = verbs;

    $scope.conjugator = conjugator;

    $scope.templateDirectory = verbAppConstants.templateDirectory;

    _.forEach($scope.verbs, function(verb) {
        var conjugationSet = conjugator.getConjugations(verb);
        // Add the verb object to it's conjugation set
        _.forEach(conjugationSet, function(cSet) {
            cSet.verb = verb;
        })
        $scope.questions.questions = $scope.questions.questions.concat(conjugationSet);
    })

    // Create a shallow copy so that changes to filteredQuestions do not affect the original conjugation list
    // filteredQuestions will be the deck used to display the questions
    $scope.questions.filteredQuestions = $scope.questions.questions;

    // Set the current question
    $scope.questions.questionIndex = 0;
    $scope.questions.currentQuestion = $scope.questions.filteredQuestions[$scope.questions.questionIndex];

    // This is run if there is any change to any of the filters
    $scope.$watch('filterOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            filterQuestions();
        }
    }, true)

    // This is the function that basically filters the question set
    function filterQuestions() {
        var pronounIds = _.pluck(_.filter($scope.filterOptions.pronouns, {selected: true}), 'id');
        var types = _.pluck(_.filter($scope.filterOptions.types, {selected: true}), 'name');

        var filteredQuestions = _.filter($scope.questions.questions, function(conjugation) {
            if (_.contains(pronounIds, conjugation.id) && _.contains(types, conjugation.verb.type.name)) {
                return true;
            }
        })

        if (filteredQuestions.length === 0) {
            alertService.set('noMatches', 'There are no questions that match your selected filters. Modify your filters to see more questions.');
        }
        else {
            alertService.clear();
            $scope.questions.filteredQuestions = filteredQuestions;
            $scope.questions.updateQuestions();
        }
    }

})

//$scope.textToSpeech = function(text) {
//    var audio = $("#my-audio");
//    audio.attr('src', 'http://translate.google.com/translate_tts?tl=en&q=great&client=t');
//    audio.trigger('pause');
//    audio.trigger('load');
//    audio.trigger('play');
//}

;var verbApp = angular.module('verbApp');

// For checking user input against the correct answer. It compares every key the user enters with the correct answer
verbApp.directive('answerProgress', function($timeout) {
    return {
        restrict: 'A',
        //templateUrl: '',
        scope: {
            answer: '=',
            questionObj: '='
        },
        link: function(scope, elem, attrs) {
            //elem.bind('keyup', function(event) {
                //checkAnswer();
            //})
            scope.$watch('questionObj.userAnswer', function() {
                if (scope.questionObj.userAnswer) {
                    // Compare the number of chars input by the user with that many chars in the answer
                    var userLetters = scope.questionObj.userAnswer.split('');
                    var letters = scope.answer.split('').slice(0, userLetters.length);
                    $timeout(function() {
                        if (_.isEqual(userLetters, letters)) {
                            scope.questionObj.userError = false;
                        }
                        else {
                            scope.questionObj.userError = true;
                        }
                    })
                }
                else {
                    scope.questionObj.userError = false;
                }
            })
        }
    }
})
;var verbApp = angular.module('verbApp');

// For checking user input against the correct answer. It compares every key the user enters with the correct answer
verbApp.directive('filterSection', function($timeout, verbAppConstants, filterOptions, questionsService) {
    return {
        restrict: 'E',
        templateUrl: verbAppConstants.templateDirectory + '/filter_section.html' ,
        scope: {
            options: '=',
            title: '@',
            disabled: '='
        },
        link: function(scope, elem, attr) {
            scope.filterOptions = filterOptions;
            scope.questions = questionsService;
        }
    }
})

;var app = angular.module('verbApp');

verbApp.directive('prevNext', function(verbAppConstants, questionsService) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: verbAppConstants.templateDirectory + '/prev_next.html',
        link: function(scope, elem, attrs) {
            scope.questionsService = questionsService;

        }
    }
});var verbApp = angular.module('verbApp');

verbApp.factory('conjugator', function(helperData, hamzatedWord) {
    //c stands for conjugator
    var c = {};

    var tenses = ['perfect', 'imperfect', 'imperative', 'jussive', 'subjunctive'];
    var forms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var persons = ['firstPerson', 'secondPerson', 'thirdPerson'];
    var types = ['sound', 'hollow', 'geminate', 'weakLam', 'assimilated'];
    var genders = ['masculine', 'feminine'];
    var numbers = ['singular', 'dual', 'plural'];

    c.verb;
    c.options;
    c.list;

    c.initialize = function(verb, options) {
        c.verb = verb;
        c.list = getList();
    }

    c.setVerb = function(verb) {
        c.verb = verb;
        c.list = getList();
    }

    // get the complete name of the conjugation e.g. "first person masculine singular perfect" based on the options already specified
    c.getName = function(item) {
        var name = _.startCase(item.person);
        // first person does not have gender so account for that
        if (item.gender) {
            name += ' ' + item.gender;
        }
        name += ' ' + item.number
        return name.toLowerCase();
    }

    c.getConjugations = function(verb) {
        c.verb = verb;
        return getList();
    }

    // Just get a single verb
    c.getVerb = function(verb, id) {
        c.verb = verb;
        var conjugatedVerb;
        switch (c.verb.type.name) {
            case 'sound': conjugatedVerb = getSoundVerb(id); break;
            case 'geminate': conjugatedVerb = getGeminateVerb(id); break;
            case 'hollow': conjugatedVerb = getHollowVerb(id); break;
            case 'defective': conjugatedVerb = getDefectiveVerb(id); break;
            case 'hamzated': conjugatedVerb = getSoundVerb(id); break;
            case 'assimilated': conjugatedVerb = getSoundVerb(id); break;
        }
        if (anyHamzas()) {
            conjugatedVerb = hamzatedWord.getWord(conjugatedVerb);
        }
        return conjugatedVerb;
    }

    //*******************************************
    // Private methods
    //*******************************************
    function getList() {
        var list = angular.copy(helperData.pronounList);
        _.forEach(list, function(pronoun, index) {
            switch (c.verb.type.name) {
                case 'sound': pronoun.perfect = getSoundVerb(pronoun.id); break;
                case 'geminate': pronoun.perfect = getGeminateVerb(pronoun.id); break;
                case 'hollow': pronoun.perfect = getHollowVerb(pronoun.id); break;
                case 'defective': pronoun.perfect = getDefectiveVerb(pronoun.id); break;
                case 'hamzated': pronoun.perfect = getSoundVerb(pronoun.id); break;
                case 'assimilated': pronoun.perfect = getSoundVerb(pronoun.id); break;
            }
            if (anyHamzas()) {
                pronoun.perfect = hamzatedWord.getWord(pronoun.perfect);
            }
        })
        return list
    }

    function anyHamzas() {
        if (c.verb.letter1 === 'ء' || c.verb.letter2 === 'ء' || c.verb.letter3 === 'ء') {
            return true;
        }
        else {
            return false;
        }
    }

    function getDefectiveVerb(id) {
        var verb;
        var soundVerb = getSoundVerb(id);

        if (hasConsonantEnding(id)) {
            verb = soundVerb;
        }
        else if (c.verb.type.type === 'yaa (ya-aa)') {
            verb = getDefectiveType3(id, soundVerb);
        }
        else {
            verb = getDefectiveType1(id, soundVerb);
        }
        return verb;
    }

    function getDefectiveType3(id, soundVerb) {
        // nasiya type verbs are conjugated like sound verbs except for number 12
        var verb;
        if (id === 12) {
            verb = c.verb.letter1 + 'َ' + c.verb.letter2 + 'ُوْا';
        }
        else {
            verb = soundVerb;
        }
        return verb;
    }

    function getDefectiveType1(id, soundVerb) {
        var verb;
        switch (id) {
            case 5:
                var lastLetter = getDefectiveLastLetter();
                verb = c.verb.letter1 + 'َ' + c.verb.letter2 + c.verb.perfectVowel + lastLetter;
                break;
            case 7: verb = soundVerb; break;

            // Note, for 6, 8, 12 the waaw fathah/yaa fathah part of the root simply disappear so get the sound verb and just remove the waaw fathah using regex
            // But yaa fathah (ya-aa) acts like a sound verb here
            case 8:
            case 6:
            case 12:
                // Group 1: first 4 chars, group 2: the chars that need to be removed, group 3: the rest of verb which we'll keep
                var regex = new RegExp('(.{4})' + '(' + c.verb.letter3 + '.)' + '(.*)');
                // Remove the middle group which disappears
                verb = soundVerb.replace(regex, '$1$3');
        }
        return verb;
    }

    function getDefectiveLastLetter() {
        switch (c.verb.type.type) {
            case 'waaw': return 'ا'; break;
            case 'yaa (aa-ii)': return 'ى'; break;
            case 'yaa (ya-aa)': return 'يَ'; break;
        }
    }

    function getHollowVerb(id) {
        // These pronouns keep the alif
        var verb;
        if (hasConsonantEnding(id)) {
            var shortVowel1;
            // This is for نام and خاف type verbs
            if (c.verb.type.type === 'alif') {
                shortVowel1 = 'ِ';
            }
            // This is for hollow waaw or hollow yaa verbs where the short vowel is based on the second root letter
            else {
                shortVowel1 = helperData.longToShort[c.verb.letter2];
            }
            verb = c.verb.letter1 + shortVowel1 + c.verb.letter3 + helperData.endings[id - 1];
        }
        else {
            verb = c.verb.letter1 + 'َا' + c.verb.letter3 + helperData.endings[id - 1];
        }
        return verb;
    }

    function getSoundVerb(id) {
        return c.verb.letter1 + 'َ'+ c.verb.letter2 + c.verb.perfectVowel + c.verb.letter3 + helperData.endings[id - 1];
    }

    function getGeminateVerb(id) {
        if (hasConsonantEnding(id)) {
            return getSoundVerb(id);
        }
        else {
            return c.verb.letter1 + 'َ' + c.verb.letter2 + 'ّ' + helperData.endings[id - 1];
        }
    }

    // 1 - 4, 9, 10, 11, 13 have consonant endings
    function hasConsonantEnding(id) {
        if (_.includes([5,6,7,8,12], id)) {
            return false;
        }
        else {
            return true;
        }
    }

    return c;
})

;var verbApp = angular.module('verbApp');

verbApp.factory('filterOptions', function(helperData) {
    var filterOptions = {};

    filterOptions.types = [{name: 'assimilated'}, {name: 'geminate'}, {name: 'hamzated'}, {name: 'hollow'}, {name: 'defective'}, {name: 'sound'}]
    filterOptions.pronouns = angular.copy(helperData.pronounList);
    filterOptions.forms = [{name: '1', selected: true}, {name: '2'}, {name: '3'}, {name: '4'}, {name: '5'}, {name: '6'}, {name: '7'}, {name: '8'}, {name: '9'}, {name: '10'}]
    filterOptions.tenses = [{name: 'perfect', selected: true}, {name: 'imperfect'}];
    filterOptions.voices = [{name: 'active', selected: true}, {name: 'passive'}];
    filterOptions.moods = [{name: 'indicative', selected: true}, {name: 'subjunctive'}, {name: 'jussive'}, {name: 'imperative'}];

    filterOptions.allTypes = true;
    filterOptions.allPronouns = true;

    // Select or deselect all options of a particular filter
    filterOptions.toggleAll = function(type, value) {
        _.forEach(this[type], function(item) {
            item.selected = value;
        })
    }

    filterOptions.reset = function() {
        _.forEach(filterOptions.pronouns, function(pronoun) {
            pronoun.selected = true;
        })
        _.forEach(filterOptions.types, function(type) {
            type.selected = true;
        })
        filterOptions.allTypes = true;
        filterOptions.allPronouns = true;
    }

    return filterOptions;
})

;var verbApp = angular.module('verbApp');

// Take any word with hamza and put it on the its correct seat
verbApp.factory('hamzatedWord', function() {
    var factory = {};

    // Make wordArray and indexes available to all functions
    var wordArray;
    var indexes;

    factory.getWord = function(word) {
        // Get an array of indexes where hamza is present [0,3] for example
        wordArray = word.split('');
        indexes = getCharIndexes('ء', wordArray);

        checkFirstLetter();

        // Check if there hamzas beyond the first letter
        var moreHamzas = _.some(indexes, function(index) {
            return index > 0;
        })

        if (moreHamzas) {
            _.forEach(indexes, function(index) {
                // This represents the penultimate letter where the case ending is present (or last letter of you think of the case ending as a vowel)
                if (wordArray[wordArray.length - 2] === 'ء') {
                   checkFinalHamza(index);
                }

                else if (isMedialAloof(index)) {}

                else if (wordArray[index + 2] === 'ا') {
                    checkMadd(index);
                }
                else {
                    checkMedialRegular(index);
                }
            })
        }

        return wordArray.join('');
    }

    function checkMadd(index) {
        wordArray[index] = 'آ';
        _.pullAt(wordArray, (index + 1), (index + 2));
    }

    function checkFinalHamza(index) {
       // aloof
        var previousLetter1 = wordArray[index - 1];
        var previousLetter2 = wordArray[index - 2];

        if (previousLetter1 === 'ا' || previousLetter1 === 'ْْْ') {}
        else {
            switch (previousLetter1) {
                case 'َ': wordArray[index] = 'أ'; break;
                case 'ُ': wordArray[index] = 'ؤ'; break;
                case 'ِ': wordArray[index] = 'ئ'; break;
            }
        }
    }

    function checkFirstLetter() {
        // Check if first letter is hamza
        if (_.contains(indexes, 0)) {
            // Fathah or dammah means hamza on top of alif
            if (wordArray[1] === 'َ' || wordArray[1] === 'ُ') {
                wordArray[0] = 'أ';
            }
            // Kasrah means hamza on bottom of alif
            else {
                wordArray[0] = 'إ';
            }
        }
    }

    // Check regular medial rules
    function checkMedialRegular(index) {
        var previousLetter = wordArray[index - 1];
        var nextLetter = wordArray[index + 1];

        // if it's a sukoon, then look at the next one
        if (previousLetter ===  'ْ') {
            previousLetter = wordArray[index - 2];
        }
        // yaa seat
        if ( (previousLetter === 'ي' || previousLetter === 'ِ') || (nextLetter === 'ي' || nextLetter === 'ِ') ) {
            wordArray[index] = 'ئ';
        }
        // waaw seat
        else if ( (previousLetter === 'ُ' || previousLetter === 'و') || (nextLetter === 'ُ' || nextLetter === 'و') ) {
            wordArray[index] = 'ؤ';
        }
        // alif seat
        else {
            wordArray[index] = 'أ';
        }
    }

    function isMedialAloof(index) {
        var previousLetter1 = wordArray[index - 1];
        var previousLetter2 = wordArray[index - 2];
        var previousLetter3 = wordArray[index - 3];
        var nextLetter = wordArray[index + 1];

        // First case: previous, you have sukoon, waaw, then dammah
        // Second case: alif previous, and fathah next
        // If either case is true, then it's medial aloof
        if ( (previousLetter1 === 'ْ'&& previousLetter2 === 'و' && previousLetter3 === 'ُ') || (previousLetter1 === 'ا' && nextLetter === 'َ') ) {
            return true;
        }
        else {
            return false;
        }
    }

    function getCharIndexes(char, list) {
        var indexList = [];
        for(var i=0; i < list.length;i++) {
            if (list[i] === char) {
                indexList.push(i)
            };
        }
        return indexList;
    }
    return factory;
})

;var verbApp = angular.module('verbApp');

// General verb related helper data
verbApp.value('helperData', {
        pronounList: [
                { id: 1, pronoun: 'أنا', person: 'first person', number: 'singular', perfect: ''},
                { id: 2, pronoun: 'أنْتَ', person: 'second person', gender: 'masculine', number: 'singular', perfect: ''},
                { id: 3, pronoun: 'أنْتِ', person: 'second person', gender: 'feminine', number: 'singular', perfect: ''},
                { id: 4, pronoun: 'أنْتُما', person: 'second person', number: 'dual', perfect: ''},
                { id: 5, pronoun: 'هُوَ', person: 'third person', gender: 'masculine', number: 'singular', perfect: ''},
                { id: 6, pronoun: 'هِيَ', person: 'third person', gender: 'feminine', number: 'singular', perfect: ''},
                { id: 7, pronoun: 'هُما', person: 'third person', gender: 'masculine', number: 'dual', perfect: ''},
                { id: 8, pronoun: 'هُما', person: 'third person', gender: 'feminine', number: 'dual', perfect: '' },
                { id: 9, pronoun: 'نَحْنُ', person: 'first person', number: 'plural', perfect: '' },
                { id: 10, pronoun: 'أَنْتُم', person: 'second person', gender: 'masculine', number: 'plural', perfect: '' },
                { id: 11, pronoun: 'أَنْتُنَّ', person: 'second person', gender: 'feminine', number: 'plural', perfect: '' },
                { id: 12, pronoun: 'هُم', person: 'third person', gender: 'masculine', number: 'plural', perfect: '' },
                { id: 13, pronoun: 'هُنَّ', person: 'third person', gender: 'feminine', number: 'plural', perfect: '' }
        ],
        letters: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء'],

        endings: ['ْتُ', 'ْتَ', 'ْتِ', 'ْتُمَا', 'َ', 'َتْ', 'َا', 'َتَا', 'ْنَا', 'ْتُمْ', 'ْتُنَّ', 'ُوْا', 'ْنَ'],

        shortVowels: [{vowel: 'َ', name: 'fatha'}, {vowel: 'ُ', name: 'dammah'}, {vowel: 'ِ', name: 'kasrah'}],

        // hash for going from waaw to kasrah, alif to fatha, etc
        longToShort: {'و': 'ُ', 'ي': 'ِ', 'ا': 'َ'},

        verbTypes: [{name: 'assimilated'},
                {name: 'geminate'},
                {name: 'hamzated'},
                {name: 'hollow', type: 'waaw'}, {name: 'hollow', type: 'yaa'}, {name: 'hollow', type: 'alif'},
                {name: 'defective', type: 'waaw'}, {name: 'defective', type: 'yaa (aa-ii)'}, {name: 'defective', type: 'yaa (ya-aa)'},
                {name: 'sound'}]

    }
);var verbApp = angular.module('verbApp');

// The primary service which deals with handling questions, checking answers, etc
verbApp.factory('questionsService', function(alertService, filterOptions) {
    var service = {};

    // Index of current question
    service.questionIndex;

    // List of initial unfiltered questions
    service.questions = [];
    service.filteredQuestions = [];

    service.initialize = function() {
        service.questionIndex = 0;
        service.currentQuestion = undefined;
        service.questions = [];
        service.filteredQuestions = [];
    }

    service.resetQuestions = function() {
        alertService.clear();
        filterOptions.reset();
        this.questionIndex = 0;

        this.questions = _.map(this.questions, function(item) {
            // This gets rid the of those two properties which need to be cleared when user resets the questions
            return _.omit(item, ['isCorrect', 'userAnswer']);
        })

        this.filteredQuestions = this.questions;
        this.currentQuestion = this.filteredQuestions[this.questionIndex];
    }

    service.nextQuestion = function() {
        this.questionIndex += 1;
        if (this.questionIndex >= this.filteredQuestions.length) {
            this.questionIndex = 0;
        }
        this.currentQuestion = this.filteredQuestions[this.questionIndex];
    }

    service.previousQuestion = function() {
        this.questionIndex -= 1;
        if (this.questionIndex < 0) {
            this.questionIndex = this.filteredQuestions.length - 1;
        }
        this.currentQuestion = this.filteredQuestions[this.questionIndex];
    }

    // Reset question set to first question
    service.updateQuestions = function() {
        this.questionIndex = 0;
        this.currentQuestion = this.filteredQuestions[this.questionIndex];
    }

    service.showAnswer = function(question, answer) {
        question.userAnswer = answer;
    }

    service.checkAnswer = function(userAnswer, answer) {
        if (userAnswer === answer) {
            this.currentQuestion.isCorrect = true;
            this.currentQuestion.userError = false;
            // check if all are correct, if so, then show the alert!
            if (_.every(this.filteredQuestions, {isCorrect: true})) {
                alertService.set('setCompleted', 'You have completed all the questions in the set!');
            }
        }
        else {
            this.currentQuestion.isCorrect = false;
        }
    }

    service.showNextLetter = function(question) {
        // If nothing has been entered
        if (!question.userAnswer) {
            question.userAnswer = question.answer[0];
        }
        else {
            var userAnswer = question.userAnswer.split('');
            var answer = question.answer.split('');

            var userCorrect = [];
            _.forEach(userAnswer, function(userLetter, index) {
                if (userLetter === answer[index]) {
                    userCorrect.push(userLetter);
                }
            })

            userCorrect.push(answer[userCorrect.length]);
            question.userAnswer = userCorrect.join('');
        }
    }

    return service;
})
;var app = angular.module('verbApp');

// General verb related helper data
app.factory('thackstonExercises', function() {

    var data = {};

    data.exercises =   [
        {"question":"قال له إني آتيك بما أمرتني به قبل أن تقوم من مقامك","answer":"قَالَ لَهُ إِنِّي آتِيكَ بِمَا أَمَرْتَنِي بِهِ قَبْلَ أَنْ تُقُومَ مِنْ مَقَامِكَ","chapter":18},
        {"question":"ما كان لنفس أن تموت إلا بإذن الله","answer":"مَا كَانَ لِنفسٍ أَنْ تَمُوتَ إِلََّا بِإِذْنِ اللهِ","chapter":18},
        {"question":"فقال الملك لمريم أنا رسول ربك لأهب لك ولدًا","answer":"فَقَالَ الْمَلَكُ لِمَرْيَمَ أَنَا رَسُولُ رَبِّكِ لِأَهِبَ لَكِ وَلَدًا","chapter":18},
        {"question":"أيودّ أحدكم أن تكون له جنة من نخيل وأعناب","answer":"أَيَوَدُّ أَحَدُكُمْ أَنْ تَكُونَ لَهُ جَنَّةٌ مِنْ نَخِيلٍ وَأَعْنَابٍ","chapter":18},
        {"question":"أعبد ربي حتى يأتيني اليقين","answer":"أَعْبُدُ رَبِّي حَتَّىٰ يَأْتِيَنِيَ الْيَقِينُ","chapter":18},
        {"question":"يا ربنا وسعت كل شيء رحمة وعلما","answer":"يَا رَبَّنَا وَسِعْتَ كَلَّ شَيْءٍ رَحْمَةً وَعِلْمًا","chapter":18},
        {"question":"ما يكون لنا أن نعدكم بذلك","answer":"مَا يَكُونُ لَنَا أَنْ نَعِدَكُمْ بِذٰلِكَ","chapter":18},
        {"question":"فإن الأخوين جاءا ليرثا أباهما","answer":"فَإِنَّ الْأَخَوَينِ جَاءَا لِيَرِثَا أَبَاهُمَا","chapter":18},
        {"question":"أمرني الشيطان أن أقرب الكفار","answer":"أَمَرَنِي الشَّيطَانُ أَنْ أقْرَبَ الْكُفَّارَ","chapter":18},
        {"question":"قالت بنو إسرائيل يا موسى لن نصبر على طعام واحد","answer":"قَالَتْ بَنُو إِسْرَائِيلَ يَا مُوسَىٰ لَنْ نَصْبِرَ عَلَىٰ طَعَامٍ وَاحِدٍ","chapter":18},
        {"question":"أمرني أن أكون من المؤمنين","answer":"أَمَرَنِي أَنْ أَكُونَ مِنَ َالْمُؤْمِنِينَ","chapter":18},
        {"question":"أتنهانا أن نعبد ما يعبد آباؤنا","answer":"أَتَنْهَانَا أَنْ نَعْبُدَ مَا يَعْبُدُ آبَاؤُنَا","chapter":18},
        {"question":"قال الله لإبليس ما منعك ألا تسجد لما خلقت بيدي","answer":"قَالَ اللهُ لِإِبْلِيسَ مَا مَنَعَكَ أَلَّا تَسْجُدَ لِمَا خَلَقْتُ بِيَدِي","chapter":18},
        {"question":"نهونا أن نأكل من فواكه أشجار حدائقهم فنكون من الظالمين","answer":"نَهَونَا أَنْ نَأْكُلَ مِنْ فَوَاكِهِ أَشْجَارِ حَدَائِقِهِمْ فَنَكُونَ مِنَ الظَّالِمِينَ","chapter":18},
        {"question":"وقلنا لهم اسكنوا هذه القرية وكلوا منها حيث شئتم","answer":"وَقُلْنَا لَهُمْ اُسْكُنُوَا هَذِهِ الْقَرْيَةَ وَكُلُوَا مِنْهَا حَيْثُ شِئْتُمْ","chapter":19},
        {"question":"ففروا إلى الله إني لكم منه نذير مبين","answer":"فَفِرُّوَا إِلَىٰ اللهِ إِنِّي لَكُمْ مِنْهُ نَذِيرٌ مُبِينٌ","chapter":19},
        {"question":"ما تسقط من ورق إلا يعلمها","answer":"مَا تَسْقُطُ مِنْ وَرَقٍ إِلَّا يَعْلَمُهَا","chapter":19},
        {"question":"لا تبعث مالك إليهم حتى تعلم أهم أتقياء أم لا","answer":"لَا تَبْعَثْ مَالَكَ إِلَيهِمْ حَتَّىٰ تَعْلَمَ أَهُمْ أَتْقِيَاءُ أَمْ لَا","chapter":19},
        {"question":"فقالت نساء مصر إنا لنرى زليخا في ضلال مبين فلما سمعت بقولهن دعتهن وقالت ليوسف اخرج عليهن فلما رأينه قلن ليس هذا بشرًا إن هذا إلا ملك كريم","answer":"فَقَالَتْ نِسَاءُ مِصْرَ إِنَّا لَنَرَىٰ زُلَيخَا فِي ضَلَالٍ مُبِينٍ فَلَمَّا سَمِعَتْ بِقَوْلِهِنَّ دَعَتْهُنَّ وَقَالَتْ لِيُوسُفَ اُخْرُجْ عَلَيهِنَّ فَلَمَّا رَأَينَهُ قُلْنَ لَيسَ هٰذَا بَشَرًا إِنْ هٰذَا إِلَّا مَلَكٌ كَرِيمٌ","chapter":19},
        {"question":"سوف يعلمون، حين يرون العذاب، من أضل","answer":"سَوفَ يَعْلَمُونَ، حِينَ يَرَونَ الْعَذَابَ، مَنْ أَضَلُّ","chapter":19},
        {"question":"يا ربنا اغفر لنا وارحمنا وأنت أرحم الراحمين","answer":"يَا رَبَّنَا اِغْفِرْ لَنَا وَاِرْحَمْنَا وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ","chapter":19},
        {"question":"يا أيها الناس اذكروا الله ذكرا كثيرا","answer":"يَا أَيُّهَا النَّاسُ اُذْكُرُوا اللهَ ذِكْرًا كَثِيرًا","chapter":19},
        {"question":"هو الله أحد لم يلد","answer":"هُوَ اللهُ أحَدٌ لَمْ يَلِدْ","chapter":19},
        {"question":"فعلمنا منه ما لم نعلم","answer":"فَعَلِمْنَا مِنْهُ مَا لَمْ نَعْلَمْ","chapter":19},
        {"question":"فخذها بالقوة وأمر قومك أن يأخذوا أموال الناس","answer":"فَخُذْهَا بِالْقُوَّةِ وَأْمُرْ قَومَكَ أَنْ يَأخُذُوا أَمْوَالَ النَّاسِ","chapter":19},
        {"question":"أولم تنصحنا ألا نقرب الذين هم أشد منا وهم مارّون على مدينتنا","answer":"أَوَلَمْ تَنْصَحْنَا أَلَّا نَقْرَبَ الَّذِينَ هُمْ أَشَدُّ مِنَّا وَهُمْ مَارُّونَ عَلَىٰ مَدِينَتِنَا","chapter":19},
        {"question":"قال إبليس يا آدم هل أدلك على شجرة الخلد","answer":"قَالَ إِبْلِيسُ يَا آدَمُ هَلْ أَدُلُّكَ عَلَىٰ شَجَرَةِ الْخُلْدِ","chapter":20},
        {"question":"فليقم من مقامه وليدع الظالمين لينصحوه","answer":"فَلْيَقُمْ مِنْ مَقَامِهِ وَلْيَدْعُ الظَّالِمِينَ لِيَنْصَحُوهُ","chapter":20},
        {"question":"اعبد الله كأنك تراه","answer":"اُعْبُدِ اللهَ كَأَنَّكَ تَرَاهُ","chapter":20},
        {"question":"يا أبتي إني قد جاءني من العلم ما لم يأتك","answer":"يَا أَبَتِي إِنِّي قَدْ جَاءَنِي مِنَ الْعِلْمِ مَا لَمْ يَأْتِكَ","chapter":20},
        {"question":"إن أمتي أمة مرحومة ليس عليها في الآخرة عذاب إنما عذابها في الدنيا","answer":"إِنَّ أُمَّتِي أُمَّةٌ مَرْحُومَةٌ لَيسَ عَلَيهَا فِي الْآخِرَةِ عَذَابٌ إِنَّمَا عَذَابُهَا فِي الدُّنْيَا","chapter":20},
        {"question":"ألم يأتهم نبأ الذين من قبلهم من قوم نوح","answer":"أَلَمْ يَأْتِهِمْ نَبَأُ الَّذِينَ مِنْ قَبْلِهِمْ مِنْ قَومِ نُوحٍ","chapter":20},
        {"question":"يا ربي اهد قومي فإنهم لا يعلمون","answer":"يَا رَبِّي اِهْدِ قَوْمِي فَإِنَّهُمْ لَا يَعْلَمُونَ","chapter":20},
        {"question":"لما لم تدللهم ولم تهدهم إذ بدا لك أنهم قد ضلوا","answer":"لِمَا لَمْ تَدْلُلْهُمْ وَلَمْ تَهْدِهِمْ إِذْ بَدَا لَكَ أَنَّهُمْ قَدْ ضَلُّوا","chapter":20},
        {"question":"فلما جاءه وقص عليه القصص قال لا تخف","answer":"فَلَمَّا جَاءَهُ وَقَصَّ عَلَيهِ الْقِصَصَ قَالَ لَا تَخَفْ","chapter":20},
        {"question":"لم نكن من الذين خسروا متاع الدنيا","answer":"لَمْ نَكُنْ مِنَ الَّذِينَ خَسِرُوا مَتَاعَ الدُّنْيَا","chapter":20},
        {"question":"كفرنا بكم وبدا بيننا وبينكم العداوة","answer":"كَفَرْنَا بِكُمْ وَبَدَا بَينَنَا وَبَينَكُمُ الْعَدَاوَةُ","chapter":20},
        {"question":"فقال يعقوب ليوسف قال يا إبني لا تقصص رؤياك على إخوتك","answer":"فَقَالَ يَعْقُوبُ لِيُوسُفَ قَالَ يا إِبْنِي لَا تَقْصُصْ رُؤْيَاكَ عَلَىٰ إِخْوَتِكَ","chapter":20},
        {"question":"ألم تر كيف فعل ربك بذلك القوم","answer":"أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِذٰلِكَ الْقَوْمِ","chapter":20},
        {"question":"أولم يسيروا في الأرض فينظروا كيف كان عاقبة الذين من قبلهم وكانوا أشد منهم قوة","answer":"أَوَلَمْ يَسِيرُوَا فِي الْأرْضِ فَيَنْظُرُوا كَيفَ كَانَ عَاقِبَةُ الَّذِينَ مِنْ قَبْلِهِمْ وَكَانُوا أَشَدَّ مِنْهُمْ قُوَّةً","chapter":20},
        {"question":"لا تدع مع الله إلهًا آخر فتكون من الكافرين","answer":"لَا تَدْعُ مَعَ اللهِ إِلهًا آخَرَ فَتَكُونَ مِنَ الْكَافِرِينَ","chapter":20},
        {"question":"ألم ينظروا إلى السماء فوقهم كيف بنيناها","answer":"أَلَمْ يَنْظُرُوا إِلَىٰ السَّمَاءِ فَوقَهُمْ كَيفَ بَنَينَاهَا","chapter":20},
        {"question":"إن الخاسرين الذين خسروا أنفسهم وأهليهم يوم القيامة ألا ذلك هو الخسران المبين","answer":"إِنَّ الْخَاسِرِينَ الَّذِينَ خَسِرُوا أَنْفُسَهُمْ وَأَهْلِيهِمْ يَومَ الْقِيَامَةِ أَلَا ذَلِكَ هُوَ الْخُسْرَانُ الْمُبِينُ","chapter":20},
        {"question":"يا ابن آدم مرضت فلم تعدني. قال يا رب كيف أعودك وأنت رب العالمين؟ قال أما علمت أن عبدي فلَانًا مرض فلم تعده؟ أمَا علمت أنك لو عدته لوجدتني عنده؟","answer":"يا اِبْنَ آدَمْ مَرِضْتُ فَلَمْ تَعُدْنِي. قالَ يا رَبُّ كَيفَ أَعُودُكَ وَأنْتَ رَبُّ الْعالَمِينَ؟ قالَ أَما عَلِمْتَ أَنَّ عَبْدِي فُلَانًا مَرِضَ فَلَمْ تَعُدْهُ؟ أَمَا عَلِمْتَ أَنَّكَ لَوْ عُدْتَهُ لَوَجَدْتَنِي عِنْدَهُ؟","chapter":21},
        {"question":"أما قيل لكم إني كنت أول النبيين في الخلق وآخرهم في البعث","answer":"أَمَا قِيلَ لَكُمْ إِنِّي كُنْتُ أَوَّلَ النَّبِيِينَ فِي الْخَلْقِ وَآخِرَهُمْ فِي الْبَعْثِ","chapter":21},
        {"question":"خُلقت من نور الله وخُلق أهل بيتي من نوري","answer":"خُلِقْتُ مِنْ نُورِ اللهِ وَخُلِقَ أَهْلُ بَيتِي مِنْ نُورِي","chapter":21},
        {"question":"إن ابن آدم لحريص على ما منع","answer":"إِنَّ اِبْنَ آدَمَ لَحَرِيصٌ عَلَىٰ مَا مُنِعَ","chapter":21},
        {"question":"إن يعلم الله في قلوبكم خيرًا يؤتكم خيرًا مما أُخذ منكم ويغفر لكم","answer":"إِنْ يَعْلَمِ اللهُ فِي قُلُوبِكُمْ خَيرًا يُؤْتِكُمْ خَيرًا مِمَّا أُخِذَ مِنْكُمْ وَيَغْفِرْ لَكُمْ","chapter":21},
        {"question":"إنكم تسألون رسولكم كما سئل موسى من قبل","answer":"إِنَّكُمْ تَسْأَلُونَ رَسُولَكُم كَمَا سُئِلَ مُوسَىٰ مِنْ قَبْلُ","chapter":21},
        {"question":"إذا دعيتم فادخلوا","answer":"إِذَا دُعِيتُمْ فَادْخُلُوا","chapter":21},
        {"question":"إنما كان قول المؤمنين، إذا دعوا إلى الله ورسوله ليحكم بينهم، أن يقولوا سمعنا","answer":"إِنَّمَا كَانَ قَولُ الْمُؤْمِنِينَ، إِذَا دُعُوا إِلَىٰ الله وَرَسُولِهِ لِيَحْكُمَ بَينَهُمْ، أَنْ يَقُولُوا سَمِعْنَا","chapter":21},
        {"question":"لو علمتم ما أعلم لضحكتم قليلًا وبكيتم كثيرًا","answer":"لَو عَلِمْتُمْ مَا أَعْلَمُ لَضَحِكْتُمْ قَلِيلًا وَبَكَيتُمْ كَثِيرًا","chapter":21},
        {"question":"لما قيل لامرأة إبرهيم إنها ستلد وهي كبيرة بالسن، ضحكت","answer":"لَمَّا قِيلَ لِامْرَأَةِ إِبْرهِيمَ إِنَّهَا سَتَلِدُ وَهِيَ كَبِيرَةٌ بِالسِّنِ، ضَحِكَتْ","chapter":21},
        {"question":"كلوا مما ذكر اسم الله عليه إن كنتم بآياته مؤمنين","answer":"كُلُوا مِمَّا ذُكِرَ اسْمُ اللهِ عَلَيهِ إِنْ كُنْتُمْ بِآيَاتِهِ مُؤْمِنِينَ","chapter":21},
        {"question":"قل أذلك خير أم جنة الخلد التي وُعد الأتقياء","answer":"قُلْ أَذٰلِكَ خَيرٌ أَمْ جَنَّةُ الْخُلْدِ الَّتِي وُعِدَ الْأَتْقِيَاءُ","chapter":21},
        {"question":"إن عصوك فقل إني بريء مما تعملون","answer":"إِنْ عَصَوكَ فَقُلْ إِنِّي بَرِيءٌ مِمَّا تَعْمَلُونَ","chapter":21},
        {"question":"لو شئنا لبعثنا نور الإيمان لخلق آخر","answer":"لَوْ شِئْنَا لَبَعَثْنَا نُورَ الْإِيمَانِ لِخَلْقٍ آخَرَ","chapter":21},
        {"question":"إن عصيت أمر الملك حكم عليك بالموت","answer":"إِنْ عَصَيتَ أمْرَ الْمَلِكِ حَكَمَ عَلَيكَ بِالْمَوْتِ","chapter":21},
        {"question":"قال الله للنبي لولاك لما خلقت الأفلاك","answer":"قََالَ الله لِلنَّبِيِّ لَوْلَاكَ لَمَا خَلَقْتُ الْأفْلَاكَ","chapter":21},
        {"question":"قالت امرأة فرعون قبل موتها ربي ابن لي عندك بيتًا في الجنة","answer":"قَالَتْ اِمْرَأَةُ فِرْعَونَ قَبْلَ مَوْتِهَا رَبِّي ابْنِ لِي عِنْدَكَ بَيتًا فِي الْجَنَّةِ","chapter":21},
        {"question":"يُبعث كل عبد على ما مات عليه","answer":"يُبْعَثُ كُلَّ عَبْدٍ عَلَىٰ مَا مَاتَ عَلَيهِ","chapter":22},
        {"question":"يأتي أقوام أبواب الجنة فيقولون ألم يعدنا ربنا أن نرد النار؟ فيقال مررتم عليها وهي خامدة","answer":"يَأتِي أَقْوَامٌ أَبْوابَ الْجَنَّةِ فَيَقُولُونَ أَلَمْ يَعِدْنَا رَبُّنَا أَنْ نَرِدَ النَّارَ؟ فَيُقَالُ مَرَرْتُمْ عَلَيهَا وَهِيَ خَامِدَةٌ","chapter":22},
        {"question":"مثل أمتي كمثل المطر - لا يُدرى أولُه خير أم آخره","answer":"مَثَلُ أُمَّتِي كَمَثَلِ الْمَطَرِ - لَا يُدْرَىٰ أَوَّلُهُ خَيرٌ أَمْ آخِرُهُ","chapter":22},
        {"question":"كما تعيشون فكذلك تموتون فكذلك تُحشرون","answer":"كَمَا تَعِيشُونَ فَكذٰلِكَ تَمُوتُونَ فَكَذٰلِكَ تُحْشَرُونَ","chapter":22},
        {"question":"قال كذلك أتتك آياتنا فنسيتها وكذلك اليوم تنسى","answer":"قَالَ كَذٰلِكَ أَتَتْكَ آيَاتُنَا فَنَسِيتَهَا وَكَذٰلِكَ الْيومَ تُنْسَىٰ","chapter":22},
        {"question":"كنت كنزًا مخفيا وأحببتُ أنْ أُعرف فخلقت الخلق لكي أُعرف","answer":"كُنْتُ كَنزًا مَخْفِيًّا وَأَحْبَبْتُ أَنْ أُْعْرِفَ فَخَلَقْتُ الْخَلْقَ لِكَي أُعْرِفَ","chapter":22},
        {"question":"من عرف نفسه فقد عرف ربه","answer":"مَنْ عَرِفَ نَفْسَهُ فَقَدْ عَرِفَ رَبَّهُ","chapter":22},
        {"question":"لا تقولوا لمن يقتل في سبيل الله أموات","answer":"لَا تَقُولُوا لِمَنْ يُقْتَلُ فِي سَبِيلِ اللهِ أمْوَاتٌ","chapter":22},
        {"question":"إن أدري أقريب أم بعيد ما توعدون","answer":"إِنْ أدْرِي أَقَرِيبٌ أَمْ بَعِيدٌ مَا تُوعَدُونَ","chapter":22},
        {"question":"فلا تغرّنّكم الحياة الدنيا ولا يغرّنّكم بالله الغرور","answer":"فَلَا تَغُرُّنَّكُمُ الْحَيَاةُ الدُّنْيَا وَلَا يَغُرُّنَّكُمْ بِاللهِ الْغُرُورُ","chapter":22},
        {"question":"إن الملائكة لا يعصون الله ما أمرهم ويفعلون ما يؤمرون","answer":"إِنَّ الْمَلائِكَةَ لَا يَعْصُونَ اللهَ مَا أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ","chapter":22},
        {"question":"من يفعل ذلك فقد ظلم نفسه","answer":"مَنْ يَفْعَلْ ذٰلِكَ فَقَدْ ظَلَمَ نَفْسَهُ","chapter":22},
        {"question":"بني الإسلام على خمس","answer":"بُنِيَ الْإسْلَامُ عَلَىٰ خَمْسٍ","chapter":22},
        {"question":"وكان رسول الله إذا ذكر أحدًا بدعائه بدأ بنفسه","answer":"وَكَانَ رَسُولُ اللهِ إِذَا ذَكَرَ أَحَدًا بِدُعَائِهِ بَدَأَ بِنَفْسِهِ","chapter":22},
        {"question":"وما محمد إلا رسول قد ماتت من قبله الرسل. أفإن مات أو قبل انقلبتم على أعقابكم؟","answer":"وَمَا مَحَمَّدٌ إِلَّا رَسُولٌ قَدْ مَاتَتْ مِنْ قَبْلِهِ الرُّسُلُ. أَفإِنْ مَاتَ أَو قُتِلَ اِنْقَلَبْتُمْ عَلَىٰ أَعْقَابِكُم؟","chapter":23},
        {"question":"وإذا كنت في الكافرين فقمت إلى الصلاة فلتقم طائفة من المؤمنين معك وليأخذوا أسلحتهم. فإذا سجدوا فليكونوا من ورائكم ولتأت طائفة أخرى وليأخذوا حذرهم وأسلحتهم. ودّ الذين كفروا لو تغفلون عن أسلحتكم وأمتعتكم. ولا جناح عليكم إن كان بكم أذى من المطر أو كنتم مرضى أن تضعوا أسلحتكم وخذوا حذركم","answer":"وَإِذَا كنْتَ فِي الْكَافِرِينَ فَقُمْتَ إِلَىٰ الصَّلَاةِ فَلْتَقُمْ طَائِفَةٌ مِنَ الْمُؤْمِنِينَ مَعَك وَلْيَأْخُذُوا أَسْلِحَتَهُمْ. فَإِذَا سَجَدُوا فَلْيكُونُوا مِنْ وَرَائِكُمْ وَلْتأتِ طَائِفَةٌ أُخْرَىٰ وَلْيَأْخُذُوا حِذْرَهُمْ وَأَسْلِحَتَهُمْ. وَدَّ الَّذِينَ كَفَروا لَوْ تَغْفَلُونَ عَنْ أَسْلِحَتِكُمْ وَأَمْتِعَتِكُمْ. وَلَا جُنَاحَ عَلَيكُمْ إِنْ كَانَ بِكُمْ أَذىً مِنَ الْمَطَرِ أَوْ كُنْتُمْ مَرْضَىٰ أَنْ تَضَعُوا أَسلِحَتَكُمْ وَخُذُوا حِذْرَكُم","chapter":23},
        {"question":"قال النبي إني خائف إن أموت فينقطع منكم هذا العلم","answer":"قَالَ النَّبِيُّ إِنِّي خَائِفٌ أَنْ أَمُوتَ فَيَنْقَطِعُ مِنْكُمْ هٰذَا الْعِلْمُ","chapter":23},
        {"question":" قد انطلق المرء وأخوه حتى قربا شجرة وضعا متاعهما قريبًا منها","answer":"قَدِ انْطَلَقَ الْمَرْءُ وَأَخُوه حَتَّىٰ قَرِبَا شَجَرَةً وَضَعَا مَتَاعَهُمَا قَرِيبًا مِنْهَا","chapter":23},
        {"question":"إذا انشقت السماء كان اليوم الآخر قريبًا","answer":"إِذَا انْشَقَّتِ السَّمَاءُ كَانَ الْيَومُ الْآخِرُ قَرِيبًا","chapter":23},
        {"question":"إن الذي في النار يأتيه الموت من كل مكان، وما هو بميت، ومن ورائه عذاب عظيم","answer":"إِنَّ الَّذِي فِي النَّارِ يَأْتِيهِ الْمَوتُ مِنْ كُلِّ مَكَانٍ، وَمَا هُوَ بِمَيِّتٍ، وَمِنْ وَرَائِهِ عَذَابٌ عَظِيمٌ","chapter":23},
        {"question":"والذين أتاهم الكتاب يعرفونه كما يعرفون أبناءهم","answer":"وَالَّذِينَ أَتَاهُمُ الْكِتَابُ يَعْرِفُونَهُ كَمَا يَعْرِفُونَ أَبْنَائَهُمْ","chapter":23},
        {"question":"قال يوسف لرجاله اجعلوا بضاعة إخوتي في رحالهم. لعلهم يعرفونها إذا انقلبوا إلى أهلهم","answer":"قَالَ يُوسُفُ لِرِجَالِهِ اجْعَلُوا بِضَاعَةَ إِخْوَتِي فِي رِحَالِهِمْ. لَعَلَّهُمْ يَعْرِفُونَهَا إِذَا انْقَلَبُوا إِلَىٰ أَهْلِهِمْ","chapter":23},
        {"question":"الملائكة في الجنة يدخلون على الصالحين من كل باب","answer":"المَلَائِكَةُ فِي الْجَنَّةِ يَدْخُلُونَ عَلَىٰ الصُّالِحِينَ مِنْ كُلِّ بَابٍ","chapter":23},
        {"question":"من يعمل مثقال ذرّة خيرًا يره، ومن يعمل مثقال ذرة شرًا يره","answer":"مَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيرًا يَرَهُ وَمَنْ يَعْمَلْ مِثْقَالَ ذَّرَّةٍ شَرًّا يَرَهُ","chapter":23},
        {"question":"أنا مع عبدي حين يذكرني فإن ذكرني في نفسه ذكرته في نفسي وإن ذكرني في ملأ ذكرته في ملأ هم خير منهم وإن اقترب إلَىَّ شبرًا اقتربت إليه ذراعًا وإن اقترب إليّ ذراعًا اقتربت إليه باعًا فإن أتاني يمشي أتيته هرولة","answer":"أَنَا مَعَ عَبْدِي حِينَ يَذْكُرُنِي فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي وَإِنْ ذَكَرَنِي فِي مَلَأٍ ذَكَرْتُهُ فِي مَلَأٍ هُمْ خَيرٌ مِنْهُمْ وَإِنِ اقْتَرَبَ إِلَيَّ شِبْرًا اِقْتَرَبْتُ إِلَيهِ ذِرَاعًا وَإِنْ اِقْتَرَبَ إِلَيَّ ذِراعًا اِقْتَرَبْتُ إِلَيهِ بَاعًا فَإِنْ أَتَانِي يَمْشِي أَتَيتُهُ هَرْوَلَةً","chapter":24},
        {"question":"إذ قال موسى يا قوم إنكم ظلمتم أنفسكم باتخاذكم العجل معبودًا","answer":"إذْ قَالَ مُوس يَا قَومُ إِنَّكُمْ ظَلَمْتُمْ أَنْفُسَكُمْ بِاتِّخَاذِكُمُ الْعِجْلَ مَعْبُودًا","chapter":24},
        {"question":"وقالت امرأة فرعون لا تقتلوه. عسى أن ينفعنا أو نتخذه ولدًا","answer":"وَقَالَتِ امْرَأَةُ فِرْعَونَ لَا تَقْتُلُوه. عَسَىٰ أَنْ يَنْفَعَنَا أَوْ نَتَّخِذَهُ وَلَدًا","chapter":24},
        {"question":"قال الله لإبليس اخرج من الجنة ولَمن تبعك منهم لأملأنّ جهنم منكم أجمعين","answer":"قَالَ اللهُ لِإبْلِيسَ اخْرُجْ مِنَ الْجَنَّةِ وَلَمَنْ تَبِعَكَ مِنْهُمْ لَأمْلَأَنَّ جَهَنَّمَ مِنْكُمْ أَجْمَعِينَ","chapter":24},
        {"question":"يا أهل الكتاب قد جاءكم من الله نور وكتاب مبين يهدي به الله من اتّبع رضوانه سبل السلام","answer":"يَا أَهْلَ الْكِتَابِ قَدْ جَاءَكُمْ مِنَ اللهِ نورٌ وكتَابٌ مبينٌ يَهْدِي بِهِ اللهُ مَنِ اتَّبَعَ رِضْوَانَهُ سُبُلَ السَّلَامِ","chapter":24},
        {"question":"قالوا أبشرًا واحدًا نتّبعه؟ إنا إذًا لفي ضلال","answer":"قَالُوا أَبَشَرًا وَاحِدًا نَتَّبِعُهُ؟ إنَّا إِذًا لَفِي ضَلَالٍ","chapter":24},
        {"question":"قال نوح يا رب إني دعوت قومي ليلًا ونهارًا وإني كلما دعوتهم لتغفر لهم جعلوا أصابعهم في آذانهم","answer":"قَالَ نوحٌ يَا رَبُّ إِنِّي دَعَوتُ قَومِي لَيلًا وَنَهَارًا وَإنِّي كُلَّمَا دَعَوتُهُمْ لِتَغْفِرَ لَهُمْ جَعَلُوا أَصَابِعَهُمْ فِي آذَانِهِمْ","chapter":24},
        {"question":"أولم يروا أن الله الذي خلقهم هو أشد منهم قوة؟","answer":"أَوَلَمْ يَرَوا أَنَّ اللهَ الَّذِي خَلَقَهُمْ هُوَ أَشَدُّ مِنْهُمْ قُوَّةً؟","chapter":24},
        {"question":"لن ينفعكم الفرار إن فررتم من الموت أو القتل","answer":"لَنْ يَنْفَعَكُمُ الْفِرَارُ إِنْ فَرَرْتُمْ مِنَ الْمَوتِ أَوِ الْقَتْلِ","chapter":24},
        {"question":"أيأمر إلهك أن نترك ما يعبد آباؤنا أو أن نفعل في أموالنا ما نشاء","answer":"أَيَأْمُرُ إِلهُكَ أَنْ نَتْرُكَ مَا يَعْبُدُ آبَاؤُنَا أَو أَنْ نَفْعَلَ فِي أَمْوَالِنَا مَا نَشَاءُ","chapter":24},
        {"question":"أولئك الناس يدعون لمن ضره أقرب من نفعه فهم غافلون عن شر ما يفعلون","answer":"أُولئِكَ النَّاسُ يَدْعُونَ لِمَنْ ضَرُّه أَقْرَبُ مِنْ نَفْعِهِ فَهُمْ غَافِلُونَ عَنْ شَرِّ مَا يَفْعَلُونَ","chapter":24},
        {"question":"أولئك عسى الله أن يعفو عنهم","answer":"أُولئِكَ عَسَىٰ اللهُ أَنْ يَعْفُو عَنْهُمْ","chapter":24},
        {"question":"أصحابي كالنجوم فبأيهم اقتديتم اهتديتم","answer":"أَصْحَابِي كَالنُّجُومِ فَبِأَيِّهِمُ اقْتَدَيتُمُ اهْتَدَيتُمْ","chapter":25},
        {"question":"إن الله اصطفى من ولد آدم إبرهيم واصطفى من ولد إبرهيم إسمعيل واصطفى من ولد إسمعيل بني كنانة واصطفى من بني كنانة قريشًا واصطفى من قريش بني هاشم واصطفاني من بني هاشم","answer":"إنَّ اللهَ اصْطَفَىٰ مِنْ وُلْدِ آدَمَ إِبْرهِيمَ وَاصْطَفَىٰ مِنْ وُلْدِ إِبْرهِيمَ إسْمعِيلَ وَاصْطَفَىٰ مِنْ وُلْدِ إِسْمعِيلَ بَنِي كِنَانَةَ وَاصْطَفَىٰ مِنْ بَنِي كِنَانَةَ قُرَيشًا وَاصْطَفَىٰ مِنْ قُريشٍ بَنِي هَاشِمٍ وَاصْطَفانِي مِنْ بَنِي هَاشِمٍ","chapter":25},
        {"question":"إنما يتّبعون أهواءهم ومن أضل ممن اتبع هواه غير هدى من الله؟","answer":"إِنَّمَا يَتَّبِعُونَ أَهْوَاءَهُمْ وَمَنْ أَضَلُّ مِمَّنِ اتَّبَعَ هَوَاهُ غَيرَ هُدىً مِنَ اللهِ؟","chapter":25},
        {"question":"إن الله لا يهدي القوم الظالمين","answer":"إِنَّ اللهَ لَا يَهْدِي الْقَوْمَ الظَّالِمِينَ","chapter":25},
        {"question":"يا رب اغفر للذين اتّبعوا سبيلك وقهم عذاب اليوم العظيم","answer":"يَا رَبُّ اغْفِرْ لِلَّذِينَ اتَّبَعُوا سَبِيلَكَ وَقِهِمْ عَذَابَ الْيَومِ الْعَظيمِ","chapter":25},
        {"question":"فقالوا لنا أعمالنا ولكم أعمالكم. سلام عليكم لا نبتغي الجاهلين","answer":"فَقَالُوا لَنَا أَعْمَالُنَا وَلَكُمْ أَعْمَالُكُمْ. سَلَامٌ عَلَيكُمْ لَا نَبْتَغِي الْجَاهِلِينَ","chapter":25},
        {"question":"يا أيها الناس اتقوا ربكم الذي خلقكم من نفس واحدة وابتغوا إليه السبيل","answer":"يَا أَيُّهَا النََّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ مِنْ نَفْسٍ وَاحِدَةٍ وابْتَغُوا إِلَيهِ الْسَبِيلَ","chapter":25},
        {"question":"قالوا سبحانك ما كان ينبغي لنا أن نتخذ من دونك من آلهة","answer":"قَالُوا سُبْحَانَكَ مَا كَانَ يَنْبَغِي لَنَا أَنْ نَتَّخِذَ مِنْ دُونِكَ مِنْ آلِهةٍ","chapter":25},
        {"question":"يا أيها المؤمنون اتقوا الله يجعل لكم نورًا تمشون به ويغفر لكم","answer":"يَا أَيُّهَا الْمُؤْمِنُونَ اتَّقُوا اللهَ يَجْعَلْ لَكُمْ نُورًا تَمْشُونَ بِهِ وَيَغْفِرْ لَكُمْ","chapter":25},
        {"question":"يقال لهم ذلك هو العذاب فذوقوه فادخلوا أبواب جهنم خالدين فيها","answer":"يُقَالُ لَهُمْ ذٰلِكَ هُوَ الْعَذَابُ فَذُوقُوهُ فَادْخُلُوا أَبْوَابَ جَهَنَّمَ خَالِدِينَ فِيهَا","chapter":25},
        {"question":"اتخذوا العجل معبودًا من بعدما جاءتهم البينات فعفونا عن ذلك","answer":"اِتَّخَذُوا الْعِجْلَ مَعْبُودًا مِنْ بَعْدِمَا جاءَتْهُمُ الْبَيِّنَاتُ فَعَفَونَا عَنْ ذٰلِكَ","chapter":25},
        {"question":"إذ قال يوسف لأبيه يا أبتي إني رأيت أحد عشر كوكبًا والشمس والقمر رأيتهم لي ساجدين. قال يا بنيّ لا تقصص رؤياك على إخوتك فيكيدوا لك كيدًا. إن الشيطان للإنسان عدو مبين","answer":"إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَا أَبَتِي إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوكَبًا وَالشَّمْسَ والْقَمَرَ رَأَيتُهُمْ لِي سَاجِدِينَ. قَالَ يَا بُيَيَّ لَا تَقْصُصْ رُؤْيَاكَ عَلَىٰ إِخْوَتِكَ فَيَكِيدُوا لَكَ كَيدًا. إِنَّ الشَّيطَانَ لِلْإنْسَانِ عَدوٌّ مُبِينٌ","chapter":26},
        {"question":"فقلنا لموسى اضرب بعصاك الحجر فانفجرت منه اثنتا عشرة عينًا","answer":"فَقُلْنَا لِمُوسَىٰ اضْرِبْ بِعَصَاكَ الْحَجَرَ فَانْفَجَرَتْ مِنْهُ اثْنَتَا عَشْرَةَ عَينًا","chapter":26},
        {"question":"من ضل فما له من هاد. لهم عذاب في الحياة الدنيا ولعذاب الآخرة أشق وما لهم من الله من واق. مثل الجنة التي وُعد المتّقون تجري من تحتها الأنهار. تلك عقبى الذين اتقوا وعقبى الكافرين النار","answer":"مَنْ ضَلَّ فَمَا لَهُ مِنْ هَادٍ. لَهُمْ عَذَابٌ فِي الْحَيَاةِ الدُّنْيَا وَلَعَذَابُ الْآخِرِةِ أَشَقُّ وَمَا لَهُمْ مِنَ اللهِ مِنْ وَاقٍ. مَثَلُ الْجَنَّةِ الَّتِي وُعِدَ الْمُتَّقُونَ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ. تَلْكَ عُقْبَىٰ الَّذِينَ اتَّقَوا وَعُقْبَىٰ الْكافِرِينَ النَّارُ","chapter":26},
        {"question":"يا ليتني مت قبل هذا وكنت منسيًا","answer":"يَا لَيتَنِي مِتُّ قَبْلَ هٰذَا وَكُنْتُ مَنْسِيًّا","chapter":26},
        {"question":"ضرب الله مثلًا للذين كفروا امرأة نوح وامرأة لوط. كانتا تحت عبدين من عبادنا صالحين فخانتاهما","answer":"ضَرَبَ اللهُ مَثَلًا لِلَّذِينَ كَفَرُوا امْرَأةَ نُوحٍ وَامْرَأَةَ لُوطٍ. كَانَتَا تَحْتَ عَبْدَينِ مِنْ عِبَادِنَا صَالِحِينَ فَخَانَتَاهُمَا","chapter":26},
        {"question":"الله يصطفي من الملاءكة رسلًا من الناس ويعلم ما بين أيديهم","answer":"اللهُ يَصْطَفِي مِنَ الْملَاءِكَةِ رُسُلًا مِنَ النَّاسِ وَيَعْلَمُ مَا بَينَ أَيدِيهِمْ.","chapter":26},
        {"question":"قل إني نُهيت أن أعبد الذين تدعون من دون الله. قل لا أتّبع أهواءكم قد ضللت إذًا وما أنا من المهتدين.","answer":"قُل إِنِّي نُهِيتُ أَنْ أَعْبُدَ الَّذِينَ تَدْعُونَ مِنْ دُونِ اللهِ. قُلْ لَا أتَّبِعُ أَهْوَاءَكُمْ قَدْ ضَلَلْتُ إِذًا وَما أنا مِنَ الْمُهْتَدِينَ","chapter":26},
        {"question":"فلما جاء موسى فرعون وقومه بآياتنا إذا هم منها يضحكون","answer":"فَلَمَّا جَاءَ مُوسَىٰ فِرْعَوْنَ وَقَومَهُ بِآيَاتِنَا إِذَا هُمْ مِنْهَا يَضْحَكُونَ","chapter":26},
        {"question":"أنتم بريئون مما أعمل وأنا بريء مما تعملون","answer":"أَنْتُمْ بَرِيئُونَ مِمَّا أَعْمَلُ مَ أَنَا بَرِيءٌ مِمَّا تَعْمَلُونَ","chapter":26},
        {"question":"يا مريم إن الله اصطفاك على نساء العالمين","answer":"يَا مَرْيَمُ إنَّ اللهَ اصْطَفَاكِ عَلَىٰ نِساءِ الْعَالَمِينَ","chapter":26},
        {"question":"اعبد الله كأنك تراه فإن لم تكن تراه فإنه يراك","answer":"اُعْبُدِ اللهَ كَأَنَّكَ تَرَاهُ فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ","chapter":26},
        {"question":"وإذا سألوه عن الروح قال إن الروح من أمر ربي","answer":"وَإذَا سَأَلُوهُ عَنِ الرُّوحِ قَالَ إِنَّ الرُّوحَ مِنْ أَمْرِ رَبِّي","chapter":26},
        {"question":"ولئن سألتهم من خلق السموات والأرض وسخر الشمس والقمر ليقولنّ الله","answer":"وَلَئِنْ سَأَلْتَهُمْ مَنْ خَلَقَ السَّمٰوَاتِ وَالْأَرْضَ وَسَخَّرَ الشَّمْسَ وَالْقَمَرَ لَيَقُولُنَّ اللهُ","chapter":27},
        {"question":"ألم يروا إلى الطير مسخرات في جوّ السماء؟ ما يمسكهن إلا الله","answer":"أَلَمْ يَرَوا إِلَىٰ الطَّيرِ مُسَخَّرَاتٍ فِي جَوِّ السَّمَاء؟ مَا يُمْسِكُهُنَّ إِلَّا اللهُ","chapter":27},
        {"question":"ذلك يخوّف الله به عباده. يا عبادي فاتّقوني","answer":"ذٰلِكَ يُخَوِّفُ اللهُ بِهِ عِبَادَهُ. يَا عِبَادِي فَاتَّقُونِي","chapter":27},
        {"question":"لا جناح عليكم إن طلّقتم النساء ما لم تمسّوهن","answer":"لَا جُنَاحَ عَلَيكُمْ إِنْ طَلَّقْتُمُ النِّسَاءَ مَا لَمْ تَمَسُّوهُنَّ","chapter":27},
        {"question":"إنه لذو علم لما علّمناه ولكن أكثر الناس لا يعلمون","answer":"إِنَّهُ لَذُو عِلْمٍ لِمَا عَلَّمْنَاه وَلكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ","chapter":27},
        {"question":"فإن كذّبوك فقد كُذّب رسل من قبلك فقل ربكم ذو رحمة واسعة","answer":"فَإِنْ كَذَّبُوكَ فَقَدْ كُذِّبَ رُسُلٌ مِنْ قَبْلِكَ فَقُلْ رَبُّكُمْ ذُو رَحْمَةٍ وَاسِعَةٍ","chapter":27},
        {"question":"قل ادعوا الله أو ادعوا الرحمن. أيًا ما تدعوا فله الأسماء الحسنى ولا تجهر بصلاتك ولا تخافت بها وابتغ بين ذلك سبيلًا وقل الحمد لله الذي لم يتخذ ولدًا ولم يكن له شريك في الملك ولم يكن له ولي من الذلّ وكبّرْه تكبيرًا","answer":"قُلِ ادْعُوا اللهَ أَوِ ادْعُوا الرَّحْمنَ. أَيًّا مَا تَدْعُوا فَلَهُ الْأَسْمَاءُ الْحُسْنَىٰ وَلَا تَجْهَرْ بِصَلَاتِكَ ولَا تُخَافِتْ بِهَا وَابْتَغِ بَينَ ذٰلِكَ سَبِيلًا وَقُلِ الْحَمْدُ لِلهِ الَّذِي لَمْ يَتَّخِذْ وَلَدًا وَلَمْ يَكُنْ لُهُ شَريكٌ فِي الْمُلْكِ وَلَمْ يَكُنْ لَهُ ولِيٌّ مِنَ الذُّلِّ وَكَبِّرْهُ تَكْبِيرًا","chapter":27},
        {"question":"لا جناح عليهن في آبائهن ولا ما ملكت أيمانهن واتقين الله. إن الله ليشهد على كل شيء","answer":"لَا جُنَاحَ عَليهِنَّ فِي آبَائِهَنَّ وَلَا مَا مَلَكَتْ أَيمَانُهُنَّ وَاتَّقِينَ اللهَ. إِنَّ اللهَ لَيَشْهَدُ عَلَىٰ كُلِّ شَيءٍ","chapter":27},
        {"question":"أنبّئكم بخير من ذلك. للذين اتّقوا عند ربهم جنات تجري من تحتها الأنهر خالدين فيها","answer":"أُنَبِّئُكُمْ بِخَيرٍ مِنْ ذٰلِكَ. لِلَّذِينَ اتَّقَوا عِنْدَ رَبِّهِمْ جَنَّاتٌ تَجْرِي مِنْ تَحْتِهَا الْأَنْهُرُ خَالِدِينَ فِيهَا","chapter":27},
        {"question":"كل مولود يولد على الفطرة فأبواه يهودانه أو ينصّرانه أو يمجسانه","answer":"كُلُّ مَولُودٍ يُولَدُ عَلَىٰ الْفِطْرَةِ فَأَبَوَاهُ يُهَوِّدَانِهِ أَوْ يُنَصِّرَانِهِ أَوْ يُمَجِّسَانِهِ","chapter":27},
        {"question":"إن نعف عن طائفة منكم نعذب طائفة","answer":"إِنْ نَعْفُ عَنْ طَائِفَةٍ مِنْكُمْ نُعَذِّبْ طَائِفَةً","chapter":27},
        {"question":"سخر الشمس والقمر كل يجري إلى أجل مسمّى. كذلك سخرها لكم لتكبروا الله على ما هداكم","answer":"سَخَّرَ الشَّمْسَ وَالْقَمَرَ كُلٌ يَجْرِي إلَىٰ أَجَلٍ مُسَمَّىٰ. كَذٰلِكَ سَخَّرَهَا لَكُمْ لِتُكَبِّرُوا اللهَ عَلَىٰ مَا هَدَاكُمْ","chapter":28},
        {"question":"ونقلّبهم ذات اليمين وذات الشمال وكلبهم باسطٌ ذراعيه بالوصيد. لو اطّلعت عليهم لولّيت منهم فرارًا ولملئت منهم رعبًا","answer":"وَنُقَلِّبُهُمْ ذَاتَ الْيَمِينِ وَذَاتَ الشِّمَالِ وَكَلْبُهُمْ بَاسِطٌ ذِرَاعَيهِ بِالْوَصيدِ. لَوِ اطَّلَعْتَ عَلَيهِمْ لَوَلَّيتَ مِنْهُمْ فِرَارًا وَلَمُلِئَتْ مِنْهُمْ رُعْبًا","chapter":28},
        {"question":"ولله المشرق والمغرب فأينما تولوا فثم وجه الله","answer":"وَلِلهِ الْمَشْرِقُ والْمَغْرِبُ فَأَينَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللهِ","chapter":28},
        {"question":"إن الله وملائكته يصلّون على النبي. يا أيها المؤمنون صلّوا عليه وسلّموا تسليمًا","answer":"إِنَّ اللهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَىٰ النَّبِيِّ. يَا أَيُّهَا الْمُؤْمِنُونَ صَلُّوا عَلَيهِ وَسَلِّمُوا تَسْلِيمًا","chapter":28},
        {"question":"ما تعبدون من دونه إلا أسماء سمّيتموها أنتم وآبائكم","answer":"مَا تَعْبُدُونَ مِنْ دُونِه إلَّا أَسْمَاءٌ سَمَّيتُمُوهَا أَنْتُمْ وَآبَائُكُم","chapter":28},
        {"question":"ويقول الله للملائكة أهؤلاء إياكم كانوا يعبدون؟","answer":"وَيَقُولُ اللهُ لِلْمَلَائِكةِ أَهؤُلَاءِ إِيَّاكُمْ كَانُوا يَعْبُدُونَ؟","chapter":28},
        {"question":"يا عبادي، إن أرضي واسعة فإياي فاعبدوني","answer":"يَا عِبَادِي، إِنَّ أَرْضِي وَاسِعَةٌ فَإِيَّايَ فَاعْبُدُونِي","chapter":28},
        {"question":"انطلقوا إلى المدينة وإن لم تجدوا فيها أحدًا فلا تدخلوها حتى يؤذن لكم","answer":"اِنْطَلِقُوا إِلَىٰ الْمَدِينَةِ وَإِنْ لَمْ تَجِدُوا فِيهَا أَحَدًا فَلَا تَدْخُلُوهَا حَتَّىٰ يُؤْذَنَ لَكُمْ","chapter":28},
        {"question":"لو نزّلنا القرآن على بعض الأعجمين فقرأناه عليهم، ما كانوا به مؤمنين","answer":"لَو نَزَّلْنَا الْقُرْآنَ عَلَىٰ بَعْضِ الْأعْجَمِينَ فَقَرَأْنَاهُ عَلَيهِمْ، مَا كَانُوا بِهِ مُؤْمِنِينَ","chapter":28},
        {"question":"قل لعبادي يقولوا التي هي أحسن","answer":"قُلْ لِعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ","chapter":28},
        {"question":"إني وجّهت وجهي للذي يملك الملك كله لا شريك له","answer":"إِنّي وَجَّهْتُ وَجْهِي لِلَّذِي يَمْلِكُ الْمُلْكَ كُلَّهُ لَا شَرِيكَ لَهُ","chapter":28},
        {"question":"وليشهد عذاب الزاني والزانية طائفة من المؤمنين","answer":"وَلْيَشْهَدْ عَذَابَ الزَّانِي وَالزَّانِيَةِ طَائِفَةٌ مِنَ الْمُؤْمِنِينَ","chapter":28},
        {"question":"حكموا عليه بالموت فانقطع رأسه","answer":"حَكَمُوا عَلَيهِ بِالْمَوتِ فَانْقَطَعَ رَأْسُهُ","chapter":28},
        {"question":"إن الإسلام بدأ غريبًا وسيعود غريبًا فطوبى للغرباء","answer":"إِنَّ الْإِسْلَامَ بَدَأَ غَرِيبًا وَسَيَعُودُ غَرِيبًا فَطُوبَىٰ لِلْغُرَبَاءِ","chapter":28},
        {"question":"الراحمون يرحمهم الرحمن. ارحموا أهل الأرض يرحمكم أهل السماء","answer":"اَلرّاحِمُونَ يَرْحَمُهُمُ الرَّحْمنُ. اِرْحَمُوا أَهْلَ الْأَرْضِ يَرْحَمْكُمْ أَهْلُ السَّمَاءُ","chapter":29},
        {"question":"وضرب الله مثل رجلين أحدهما أبكم لا يقدر على شيء وهو كلّ على مولاه. أينما يوجّهه لا يأت بخير. هل استوى هو ومن يأمر بالعدل؟","answer":"وَضَرَبَ اللهُ مَثَلَ رَجُلَينِ أَحَدُهمَا أَبْكَمُ لَا يَقْدِرُ عَلَىٰ شَيءٍ وَهُوَ كَلٌّ عَلَىٰ مَولَاهُ. أَينَمَا يُوَجِّهُهُ لَا يأْتِ بِخَيرٍ. هَلِ اسْتَوَىٰ هُوَ وَمَنْ يَأْمُرُ بِالْعَدْلِ؟","chapter":29},
        {"question":"واتل عليهم نبأ ابني آدم بالحق إذ قرّبا قربانًا فتُقبّل من أحدهما ولم يتقلّل من الآخر. قال لأقتلنَّك. قال إنما يتقبَّل الله من المتّقين. لَئن بسطت يدك إليّ لتقتلني ما أنا بباسط يدي إليك لأقتلك. إني أخاف الله رب العالمين","answer":"وَاتْلُ عَلَيهِمْ نَبَأَ ابْنَي آدَمَ بالْحَقِّ إِذْ قَرَّبَا قُرْبَانًا فَتُقُبِّلَ مِنْ أَحَدِهِمَا وَلَمْ يُتَقَبَّلْ مِنَ الْآخَرِ. قَالَ لَأَقْتُلَنَّكَ. قَالَ إِنَّمَا يَتَقبَّلُ اللهُ مِنَ الْمُتَّقِينَ. لَئِنْ بَسَطْتَ يَدَكَ إِلَيَّ لِتَقْتُلَنِي مَا أَنَا بِبَاسِطٍ يَدِي إِلِيكَ لِأَقْتُلَكَ. إنِّي أَخَافُ اللهَ رَبَّ الْعَالَمِينَ.","chapter":29},
        {"question":"نرى تقلب وجهك في السماء فلنولّينّك قبلة ترضاها. فولّ وجهك إليها","answer":"نَرَىٰ تَقَلُّبَ وَجْهِكَ فِي السَّمَاءِ فَلْنُوَلّيَّنَّكَ قِبْلَةً تَرْضَاها. فَوَلِّ وَجْهَكَ إِلَيهَا","chapter":29},
        {"question":"قال الله لإبليس إذ لم يسجد لآدم قال فاهبط من الجنة فما يكون لك أن تتكبر فيها لاخرج","answer":"قَالَ اللهُ لِإبليسَ إِذ لَمْ يَسْجُدْ لِآدَمَ قَالَ فَاهْبِطْ مِنَ الْجَنَّةِ فَمَا يَكُونُ لَكَ أَنْ تَتَكَبَّرَ فِيهَا","chapter":29},
        {"question":"الله الذي خلق سبع سموات ومن الأرض مثلهن يتنزل الأمر بينهن لتعلموا أن الله على كل شيء قدير","answer":"اَللهُ الَّذِي خَلَقَ سَبْعَ سَمٰوَاتٍ وَمِنَ الْأَرْضِ مِثْلَهُنَّ يَتَنَزَّلُ الْأمْرُ بَينَهُنَّ لِتَعْلَمُوا أَنَّ اللهَ عَلَىٰ كُلِّ شَيءٍ قَدِيرٌ","chapter":29},
        {"question":"إن الله يهيّئ لعباده الصالحين ما لا عين رأت ولا أذن سمعت ولا خطر على قلب بشر","answer":"إِنَّ اللهَ يُهَيِّئُ لِعِبَادِهِ الصَّالِحِينَ مَا لَا عَينٌ رَأَتْ وَلَا أُذُنٌ سَمِعَتْ وَلَا خَطَرَ عَلَىٰ قَلْبِ بَشَرٍ","chapter":29},
        {"question":"إن الذين يتكبرون في الأرض يولّون وجوههم عن القبلة ويتّجهون إلى جهن","answer":"إِنَّ الَّذِينَ يَتَكَبَّرُونَ فِي الْأرْضِ يُوَلُّونَ وُجُوهَهُمْ عَنِ الْقِبْلَةِ وَيَتَّجِهُونَ إِلَىٰ جَهَنَّمَ","chapter":29},
        {"question":"وقال رسول الله إن أدنى مقعد أحدكم من الجنة، إن هيّئ له، أن يقال له تمنّ. فيتمنّى ويتمنّى فيقال له هل تمنّيت؟ فيقول نعم فيقول له الله فإنّ لك ما تمنّيت ومثله معه","answer":"وَقَالَ رَسُولُ اللهِ إِنَّ أَدْنَىٰ مَقْعَدِ أَحَدِكُمْ مِنَ الْجَنَّةِ، إِنْ هُيِّئَ لَهُ، أَنْ يُقَالَ لَهُ تَمَنَّ. فَيَتَمنََّىٰ وَيَتَمَنََّىٰ فَيُقَالُ لَهُ هَلْ تَمَنَّيتَ؟ فَيَقُولُ نَعَمْ فَيَقُولُ لَهُ اللهُ فَإِنَّ لَكَ مَا تَمَنَّيتَ وَمِثْلَهُ مَعَهُ","chapter":30},
        {"question":"الذي خلق السموات والأرض وما بينهما في ستة أيام ثم استوى على العرش الرحمن فاسأل به خبيرًا","answer":"اَلَّذِي خَلَقَ السَّمٰوَاتِ وَالْأرْضَ وَمَا بَينَهُمَا فِي سِتَّةِ أَيَّامٍ ثُمَّ اسْتَوَىٰ عَلَىٰ الْعَرْشِ الرَّحْمنُ فَاسْأَلْ بِهِ خَبِيرًا","chapter":30},
        {"question":"ما أبرّئ نفسي. إن النفس لأمارة بالسوء إلّا ما رحم ربي","answer":"مَا أُبَرِّئُ نَفْسِي. إِنَّ النَّفْسَ لَأَمَّارةٌ بِالسُّوءِ إِلَّا مَا رَحِمَ رَبِّي","chapter":30},
        {"question":"ولقد جاءت رسلنا إبرهيم بالبشرى وقالوا سلامًا. قال سلام. فجاء بعجل حنيذ فلما رآهم لا يأكلون خاف. قالوا لا تخف. إنّا رسل إلى قوم لوط وامرأته قائمة فضحكت. فبشّرناها بإسحق ومن وراء إسحق، يعقوب","answer":"وَلَقَدْ جَاءَتْ رُسُلُنَا إِبْرٰهيمَ بِالْبُشْرَىٰ وَقَالُوا سَلَامًا. قالَ سَلامٌ. فَجَاءَ بِعِجْلٍ حَنِيذٍ فَلَمَّا رَآهُمْ لَا يأْكُلُونَ خَافَ. قَالُوا لَا تَخَفْ. إِنَّا رُسُلٌ إِلَىٰ قَومِ لُوطٍ وَامْرَأَتُهُ قَائِمَةٌ فَضَحِكَتْ فَبَشَّرْنَاهَا بِإسْحٰقَ وَمَنْ وَرَاءَ إِسْحٰقَ، يَعْقُوبَ","chapter":30},
        {"question":"لما ولدت مريم قالت أمها ربي إني سمّيتها مريم وإنهالك فتقبلها ربها بقبول حسن. فكلما دخل عليها زكريا وجد عندها رزقًا. قال يا مريم أنّى لك هذا؟ قالَتْ هو من عند الله. إن الله يرزق من يشاء","answer":"لَمَّا وُلَدَتْ مَرْيَمَ قَالَتْ أُمُّهَا رَبِّي إِنّي سَمَّيتُهَا مَرْيَمَ وَإنّهَا لَكَ فَتَقَبَّلَهَا رَبُّهَا بِقَبُولٍ حَسَنٍ. فَكُلَّمَا دَخَلَ عَلَيهَا زَكَرِيَّا وَجَدَ عِنْدَهَا رِزْقًا. قَالَ يَا مَرْيَمُ أَنَّىٰ لَكِ هٰذَا؟ قَالَتْ هُوَ مِنْ عِنْدِ اللهِ. إنَّ اللهَ يَرْزُقُ مَنْ يَشَاءُ","chapter":30},
        {"question":"وقضى ربكم ألّا تعبدوا إلّا إياه","answer":"وَقَضَىٰ رَبُّكُمْ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ","chapter":30},
        {"question":"من يتخذ الشيطان وليًا من دون الله فقد خسر خسرانًا مبينًا","answer":"مَنْ يَتَّخِذُ الشَّيطَانَ وَلِيًّا مِنْ دُونِ اللهِ فَقَدْ خَسِرَ خُسْرَانًا مُبِينًا","chapter":30},
        {"question":"كل نفس ذائقة الموت، ثم إلينا ترجعون","answer":"كُلُّ نَفْسٍ ذَائِقَةُ الْمَوتِ، ثُمَّ إِلَينَا تُرْجَعُونَ","chapter":30},
        {"question":"لو أن قرآنًا سيّرت به الجبالُ أو قطّعت به الأرضُ أو كُلّم به الموتى بل لله الأمر جميعًا","answer":"لَوْ أَنَّ قُرْآنًا سُيِّرَتْ بِهِ الْجِبَالُ أَوْ قُطِّعَتْ بِهِ الْأَرْضُ أَوْ كُلِّمَ بِهِ الْمَوتَىٰ بَلْ لِلهِ الْأَمْرُ جَمِيعًا","chapter":30},
        {"question":"تبارك الذي نزّل الفرقان على عبده ليكون للعالمين نذيرًا - الذي له ملك السموات والأرض ولم يتخد ولدًا ولم يكن له شريك في الملك وخلق كل شيء فقدّره تقديرًا - واتخذوا من دونه آلهة لا يخلقون شيئًا وهم يُخلقون ولا يملكون لأنفسهم ضرًّا ولا نفعًا ولا يملكون موتًا ولا حياةً","answer":"تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ عَلَىٰ عَبْدِهِ لِيَكُونَ لِلْعَالَمِينَ نَذِيرًا - اَلَّذِي لَهُ مُلْكُ السَّمٰوَاتِ وَالْأرْضِ وَلَمْ يَتَّخِذْ وَلَدًا وَلَمْ يَكُنْ لَهُ شَرِيكٌ فِي الْمُلْكِ وَخَلَقَ كُلَّ شَيءٍ فَقَدَّرَهُ تَقْدِيرًا - وَاتَّخَذُوا مِنْ دُونِهِ آلِهَةً لَا يَخْلُقُونَ شَيئًا وَهُمْ يُخْلَقُونَ وَلَا يَمْلِكُونَ لِأَنْفُسِهَمْ ضَرًّا وَلَا نَفْعًا وَلَا يَمْلِكُونَ مَوتًا وَلَا حَيَاةً","chapter":30},
        {"question":"ألم تر أن الله يسجد له من في السموات ومن في الأرض والشمس والقمر والنجوم و الجبال والشجر والدوابّ وكثير من الناس","answer":"أَلَمْ تَرَ أَنَّ اللهَ يَسْجُدُ لَهُ مَنْ فِي السَّمٰوَاتِ وَمَنْ فِي الْأرْضِ وَالشَّمْسُ وَالْقَمَرُ وَالنُّجُومُ و الْجِبَالُ وَالشَّجَرُ وَالدَّوَابُّ وَكَثِيرٌ مِنَ النَّاسِ","chapter":30},
        {"question":"والذين كفروا أعمالهم كسراب بقيعة: يحسبه الظمآن ماء حتى إذا جاءه لا يجده شيئًا ووجد الله عنده فوفّاه حسابه والله سريع الحساب","answer":"وَالَّذِينَ كَفَرُوا أَعْمَالُهُمْ كَسَرَابٍ بِقِيعَةٍ: يَحْسَبُهُ الظَّمْآنُ مَاءً حَتَّىٰ إِذَا جَاءَهُ لَا يَجِدُهُ شَيئًا وَ وَجَدَ اللهَ عِنْدَهُ فَوَفَّاهُ حِسَابَهُ واللهُ سَرِيعُ الْحِسَابِ","chapter":31},
        {"question":"إن ربك واسع المغفرة هو أعلم بكم","answer":"إِنَّ رَبَّكَ وَاسِعُ الْمَغْفِرةِ هُوَ أَعْلَمُ بِكُمْ","chapter":31},
        {"question":"يا ابن آدم ما دعوتني أغفر لك","answer":"يَا ابْنَ آدَمَ مَا دَعَوتَنِي أَغْفِرُ لَكَ","chapter":31},
        {"question":"ولو شاء ربك لجعل الناس أمة واحدة ولا يزالون مختلفين إلا من رحم ربك، ولذلك خلقهم وتمّت كلمة ربك لأملأنّ جهنم من الجن والناس أجمعين","answer":"وَلَوْ شَاءَ رَبُّكَ لَجَعَلَ النَّاسَ أُمَّةً وَاحِدَةً وَلَا يَزالُونَ مُخْتَلِفِينَ إِلََّا مَنْ رَحِمَ رَبُّكَ، وَلِذٰلِكَ خَلَقَهُمْ وَتَمَّتْ كَلِمَةُ رَبِّكَ لَأَمْلَأَنَّ جَهَنَّمَ مِنَ الْجِنِّ وَالنَّاسِ أَجْمَعِينَ","chapter":31},
        {"question":"فتولّ عنهم فما أنت بملوم","answer":"فَتَوَلَّ عَنْهُمْ فَمَا أَنْتَ بِمَلُومٍ","chapter":31},
        {"question":"وأنه لما قام عبد الله يدعو ربه كاد القوم يتولّون عنه","answer":"وَأَنَّه لَمَّا قَامَ عَبْدُ اللهِ يَدْعُو رَبَّه كَادَ الْقَومُ يَتَوَلُّونَ عَنْهُ","chapter":31},
        {"question":"قال الله أنا عند المنكسرة قلوبهم من أجلي","answer":"قَالَ اللهُ أَنَا عِنْدَ الْمُنْكَسِرَةِ قُلُوبُهُمْ مِنْ أَجْلِي","chapter":31},
        {"question":"إن المرأة الطاهرة القلب لامت نفسها على مرض ابنها","answer":"إِنَّ الْمَرْأَةَ الطََّاهِرةَ الْقَلْبِ لَامَتْ نَفْسَهَا عَلَىٰ مَرَضِ ابْنِهَا","chapter":31},
        {"question":"فكدنا نضلّ عن إلٰهنا لولا أن جاء مبشِّر يبشّرنا","answer":"فَكِدْنَا نَضُلُّ عَنْ إِلٰهِنَا لَوْلَا أَنْ جََاءَ مُبَشِّرٌ يُبَشِّرُنَا","chapter":31},
        {"question":"من عمل سيّئة فلا يجزى إلا مثلها ومن عمل صالحًا وهو مؤمن فأولئك يدخلون الجنة يرزقون فيها بغير حساب","answer":"مَنْ عَمِلَ سَيِّئَةً فَلَا يُجْزَىٰ إِلَّا مِثْلَهَا وَمَنْ عَمِلَ صَالِحًا وَهُوَ مُؤْمِنٌ فَأُولٰئِكَ يَدْخُلُونَ الْجَنَّةَ يُرْزَقُونَ فِيهَا بِغَيرِ حِسَابٍ","chapter":31},
        {"question":"إني أُمرت أن أكون أول من حكم بمثل هذا في الدنيا","answer":"إِنّي أُمِرْتُ أَنْ أَكُونَ أَوَّلَ مَنْ حَكَمَ بِمِثْلِ هٰذَا فِي الدُّنْيَا","chapter":31},
        {"question":"وقال الشيطان لما قُضي الأمر إنّ الله وعدكم وعد الحق ووعدتكم فاستجبتم لي فلا تلوموني ولوموا أنفسكم. ما أنا بمصرخكم وما أنتم بمصرخيّ. إني كفرت بما أشركتموني من قبل. إن الظالمين لهم عذاب أليم.","answer":"وَقَالَ الشَّيطَانُ لَمَّا قُضِيَ الْأَمْرُ إِنَّ اللهَ وَعَدَكُمْ وَعْدَ الْحَقِّ وَوَعَدْتُكُمْ فاسْتَجَبْتُمْ لِي فَلَا تَلُومُونِي وَلُومُوا أَنْفُسَكُمْ. مَا أَنَا بِمُصْرِخِكُمْ وَمَا أَنْتُمْ بِمُصْرِخِيَّ. إِنِّي كَفَرْتُ بِمَا أَشْرَكْتُمُونِي مِنْ قَبْلُ. إِنَّ الظََّالِمِينَ لَهُمْ عَذَابٌ أَلِيمٌ.","chapter":32},
        {"question":"وكيف أخاف ما أشركتم ولا تخافون أنكم أشركتم بالله ما لم ينزّل به عليكم سلطانًا","answer":"وَكَيفَ أَخَافُ مَا أَشْرَكْتُمْ وَلَا تَخَافُونَ أَنَّكُمْ أَشْرَكْتُمْ بِاللهِ مَا لَمْ يُنَزِّلْ بِهِ عَلَيكُمْ سُلْطَانًا","chapter":32},
        {"question":"ثم أورثنا الكتاب الذين اصطفينا من عبادنا","answer":"ثُمَّ أَوْرَثْنَا الْكِتَابَ الَّذِينَ اصْطَفَينَا مِنْ عِبَادِنَا","chapter":32},
        {"question":"أأنتم أضللتم عبادي هؤلاء أم هم ضلوا السبيل","answer":"أَأَنْتُمْ أَضْلَلْتُمْ عِبَادِي هٰؤُلَاءِ أَمْ هُمْ ضَلُّوا السَّبِيلَ","chapter":32},
        {"question":"وأنزلنا من السماء ماء فأسكنّاه في الأرض وإنّا على ذهاب به لقادرون","answer":"وَأَنْزَلْنَا مِنَ السَّمَاءِ مَاءً فَأَسْكَنَّاهُ فِي الْأرْضِ وَإِنَّا عَلَىٰ ذَهَابٍ بِهِ لَقَادِرُونَ","chapter":32},
        {"question":"وبالحق أنزلناه وبالحق نزل وما أرسلناك إلا شاهدًا مبشّرًا","answer":"وَبِالْحَقِّ أَنْزَلْنَاهُ وبِالْحَقِّ نَزَلَ وَمَا أَرْسَلْنَاكَ إِلَّا شَاهِدًا مُبَشِّرًا","chapter":32},
        {"question":"يقولون ربنا أتمم لنا نورنا واغفر لنا. إنك على كل شيء قدير","answer":"يَقُولُونَ رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا. إِنَّكَ عَلَىٰ كُلِّ شَيءٍ قَدِيرٌ","chapter":32},
        {"question":"هو الذي أنزل السكينة في قلوب المؤمنين ليزدادوا إيمانًا مع إيمانهم لِيدخل المؤمنين والمؤمنات جنات تجري من تحتها الأنهار خالدين فيها","answer":"هُوَ الَّذِي أَنْزَلَ السَّكِينةَ فِي قُلوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَعَ إِيمَانِهِمْ لِيُدْخِلَ الْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ جَنَّاتٍ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا","chapter":32},
        {"question":"ومن يشرك بالله فقد ضل ضلالًا بعيدًا","answer":"وَمَنْ يَشْرِكُ بِاللهِ فَقَدْ ضَلَّ ضَلَالًا بَعِيدًا","chapter":32},
        {"question":"أتهدون من أضل الله؟ ومن يضلل الله فلن تجد له سبيلًا. ودّوا لو تكفرون كما كفروا فتكونون سواء. فلا تتخذوا منهم أولياء حتى يهاجروا في سبيل الله فإن تولّوا فخذوهم واقتلوهم حيث وجدتموهم ولا تتخذوا منهم وليًا","answer":"أَتَهْدُونَ مَنْ أَضَلَّ اللهُ؟ وَمَنْ يُضْلِلِ اللهُ فَلَنْ تَجِدَ لَهُ سَبِيلًا. وَدُّوا لَوْ تَكْفُرُونَ كَمَا كَفَرُوا فَتَكُونُونَ سَوَاءً. فَلَا تَتَّخِذُوا مِنْهُمْ أَوْلِيَاءَ حَتَّىٰ يُهَاجِرُوا فِي سَبِيلِ اللهِ فَإِنْ تَوَلُّوا فَخُذُوهُمْ وَاقْتُلُوهُمْ حَيثُ وَجَدْتُمُوهُمْ وَلَا تَتَّخِذُوا مِنْهُمْ وَلِيًا","chapter":32},
        {"question":"فيه رجال يحبّون أن يتطهروا والله يحب المطّهّرين","answer":"فِيهِ رِجَالٌ يُحِبُّونَ أَنْ يَتَطَهَّرُوا وَاللهُ يُحِبُّ الْمُطَّهِّرِينَ","chapter":32},
        {"question":"كان الناس أمة واحدة فبعث الله النبيين مبشرين وأنزل معهم الكتاب بالحق ليحكم بين الناس","answer":"كَانَ النَّاسُ أُمَّةً وَاحِدةً فَبَعَثَ اللهُ النَّبِيِّينَ مُبَشِّرِينَ وَأَنْزَلَ مَعَهُمُ الْكِتَابَ بِالْحَقِّ لِيَحْكُمَ بَينَ النَّاسِ","chapter":32},
        {"question":"إن الله خلق خلقه في ظلمة فألقى عليهم من نوره، فمن أصابه من ذلك النور اهتدى ومن أخطأه ضل","answer":"إِنَّ اللهَ خَلَقَ خَلْقَهُ فِي ظُلْمَةٍ فَأَلْقَىٰ عَلَيهِمْ مِنْ نُورِهِ، فَمَنْ أَصَابَهُ مِنْ ذٰلِكَ النُّورِ اهْتَدَىٰ وَمَنْ أَخْطَأَهُ ضَلَّ","chapter":33},
        {"question":"أرني الدنيا كما تريها صالحي عبادك","answer":"أَرِنِي الدُّنْيَا كَمَا تُرِيهَا صَالِحِي عِبَادِكَ","chapter":33},
        {"question":"قل أي شيء أكبر شهادة؟ قل الله شهيد بيني وبينكم وأوحى إليّ هذا القرآن لأنذركم به ومن بلغ. أئنكم لتشهدون أن مع الله آلهة أخرى؟ قل لا أشهد. قل إنما هو إله واحد وإنني بريء مما تشركون","answer":"قُلْ أَيُّ شَيءٍ أَكْبَرُ شَهَادةً؟ قُلِ اللهُ شَهِيدٌ بَينِي وَبَينَكُمْ وَأَوحَىٰ إِلَيَّ هٰذَا الْقُرْآنَ لِأُنْذِرَكُمْ بِهِ وَمَنْ بَلَغَ. أَئِنَّكُمْ لَتَشْهَدُونَ أَنَّ مَعَ اللهِ آلِهَةً أُخْرَىٰ؟ قُلْ لَا أَشْهَدُ. قُلْ إِنَّمَا هُوَ إِلٰهٌ وَاحِدٌ وَإِنَّنِي بَرِيءٌ مِمَّا تُشْرِكُونَ","chapter":33},
        {"question":"وقال موسى يا فرعونُ إني رسولٌ من رب العالمين حقيقٌ على أن لا أقول على الله إلا الحق. قد جئتكم ببينة من ربكم فأرسل معي بني إسرئيل. قال إن كنت جئت بآية فأت بها إن كنت من الصادقين. فألقى عصاه فإذا هي ثعبان مبين. فقال الملأ من قوم فرعون إن هذا لساحر عليم يريد أن يخرجكم من أرضكم. فماذا تأمرون؟ قالو أرجه وأخاه وأرسل في المدائن حاشرين يأتوك بكل ساحر عليم. وجاء السحرة فرعون أن لنا لأجرًا إن كنا نحن الغالبين؟ قال نعم وإنكم لمن المقربين. قالوا يا موسى إما أن تلقي وإما أن نكون نحن الملقين؟ قال ألقوا. فلما ألقوا سحروا أعين الناس وجاءوا بسحر عظيم.","answer":"وَقَالَ مُوسَىٰ يَا فِرْعَونُ إِنِّي رَسُولٌ مِنْ رَبِّ الْعَالَمِينَ حَقِيقٌ عَلَىٰ أَنْ لَا أَقُولَ عَلَىٰ اللهِ إِلَّا الْحَقِّ. قَدْ جِئْتُكُمْ بِبَيِّنَةٍ مِنْ رَبِّكُمْ فَأَرْسِلْ مَعِي بَنِي إِسْرٰئِيلَ. قَالَ إِنْ كُنْتَ جِئْتَ بِآيَةٍ فَأْتِ بِهَا إِنْ كُنْتَ مِنَ الصَّادِقِينَ. فَأَلْقَىٰ عَصَاهُ فَإِذَا هِيَ ثُعْبَانٌ مُبِينٌ. فَقَالَ الْمَلأُ مِنْ قَومِ فِرْعَونَ إِنَّ هٰذَا لَسَاحِرٌ عَلِيمٌ يُرِيدُ أَنْ يُخْرِجَكُمْ مِنْ أَرْضِكُمْ. فَمَاذَا تأْمُرُونَ؟ قَالُو أَرْجِهِ وَأَخَاهُ وَأَرْسِلْ فِي الْمدَائِنِ حَاشِرِينَ يَأْتُوكَ بِكُلِّ سَاحِرٍ عَلِيمٍ. وَجَاءَ السَّحَرَةُ فِرْعَونَ أَنَّ لَنَا لَأَجْرًا إِنْ كُنَّا نَحْنُ الْغَالِبِينَ؟ قَالَ نَعَمْ وَإِنَّكُمْ لَمِنَ الْمُقَرَّبِينَ. قَالُوا يَا مُوسَىٰ إِمَّا أَنْ تُلْقِيَ و إِمَّا أَنْ نَكُونَ نَحْنُ الْمُلْقِينَ؟ قَالَ أَلْقُوا. فَلَمَّا أَلْقَوا سَحَرُوا أَعْيُنَ النَّاسِ وَجَاءُوا بِسِحْرٍ عَظِيمٍ","chapter":33},
        {"question":"يوم تُقلب وجوههم في النار يقولون يا ليتنا أطعنا الله وأطعنا الرسول","answer":"يَوْمَ تُقَلَّبُ وُجُوهُهُمْ فِي النََّارِ يَقُولُونَ يَا لَيتَنَا أَطَعْنَا اللهَ وَأَطَعْنَا الرَّسُولَ","chapter":33},
        {"question":"ألم تعلم أن الله له ملك السموات والأرض وما لكم من دون الله من ولي؟ أم تريدون أن تسألوا رسولكم كما سئل موسى من قبل؟ ومن يتبدل الكفر بالإيمان فقد ضل سواء السبيل","answer":"أَلَمْ تَعْلَمْ أَنَّ اللهَ لَهُ مُلْكُ السَّمٰوَاتِ وَالْأَرْضِ وَمَا لَكُمْ مِنْ دُونِ اللهِ مِنْ وَلِيٍّ؟ أَمْ تُرِيدُونَ أَنْ تَسْأَلُوا رَسُولَكُمْ كَمَا سُئِلَ مُوسَىٰ مِنْ قَبْلُ؟ وَمَنْ يَتَبَدَّلُ الْكُفْرَ بالْإيمَانِ فَقَدْ ضَلَّ سَوَاءَ السَّبِيل.","chapter":33},
        {"question":"كيف تكفرون بالله وكنتم أمواتًا فأحياكم ثم يميتكم ثم يحييكم؟","answer":"كَيْفَ تَكْفُرُونَ باللهِ وَكُنْتُمْ أَمْوَاتًا فَأَحْيَاحُمْ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ","chapter":33},
        {"question":"ولما جاء موسى الجبل وكلّمه ربه قال رب أرني أنظر إليك. قال لن تراني","answer":"وَلَمَّا جَاءَ مُوسَىٰ الْجَبَلَ وَكَلَّمَهُ رَبُّهُ قَالَ رَبِّ أَرِنِي أَنْظُرْ إِلَيكَ. قَالَ لَنْ تَرَانِي.","chapter":33},
        {"question":"ويقول الإنسان أئذا ما متّ لسوف أخرَج حيًا؟","answer":"وَيَقُولُ الْإنْسَانُ أَئِذَا مَا مِتُّ لَسَوفَ أُخْرَجُ حَيًا؟","chapter":33},
        {"question":"إن أول ما خلق الله العقل فقال له أقبل فأقبل وقال له أدبر فأدبر قال ما خلقت شيئًا أحسن إليّ منك أو أحبّ إليّ منك. بك آخذ وبك أعطي","answer":"إِنَّ أَوَّلَ مَا خَلَقَ اللهُ الْعَقْلُ فَقَالَ لَهُ أَقْبِلْ فَأَقْبَلَ وَقَالَ لَهُ أَدْبِرْ فَأَدْبَرَ قَالَ مَا خَلَقْتُ شَيْئًا أَحْسَنَ إِلَيَّ مِنْكَ أَوْ أَحَبَّ إِلَيَّ مِنْكَ. بِكَ آخُذُ وَبِكَ أُعْطِي.","chapter":33},
        {"question":"لو أراد الله أن لا يغفر للعباد لما خلق إبليس","answer":"لَوْ أَرَادَ اللهُ أَنْ لَا يَغْفِرَ لِلْعِبَادِ لَمَا خَلَقَ إِبْلِيسَ","chapter":33},
        {"question":"يا ابن آدم استطعمتك فلم تطعمني قال يا رب وكيف أطعمك وأنت رب العالمين؟ قال أما علمت أنه استطعمك عبدي فلان فلم تطعمه؟ أما علمت أنك لو أطعمته لوجدت ذلك عندي؟ يا ابن آدم استسقيتك فلم تسقني قال يا رب كيف أسقيك وأنت رب العالمين؟ قال استسقاك عبدي فلان فلم تسقه. أما علمت أنك لو سقيته لوجدت ذلك عندي","answer":"يَا ابْنَ آدَمَ اسْتَطْعَمْتُكَ فَلَمْ تُطْعِمْنِي قَالَ يَا رَبِّ وَكَيفَ أُطْعِمُكَ وَأَنْتَ رَبُّ الْعَالَلِينَ؟ قَالَ أَمَا عَلِمْتَ أَنَّهُ اسْتَطْعَمَكَ عَبْدِي فُلَانٌ فَلَمْ تُطْعِمْهُ؟ أَمَا عَلِمْتَ أَنَّكَ لَوْ أَطْعَمْتَهُ لَوَجَدْتَ ذٰلِكَ عِنْدِي؟ يَا ابْنَ آدَمَ اسْتَسْقَيتُكَ فَلَمْ تَسْقِنِي قَالَ يَا رَبِّ كَيفَ أَسْقِيكَ وَأَنْتَ رَبُّ الْعَالَمِينَ؟ قَالَ اسْتَسْقَاكَ عَبْدِي فُلَانٌ فَلَمْ تَسْقِهِ. أَمَا عَلِمْتَ أَنَّكَ لَوْ سَقَيتَهُ لَوَجَدْتَ ذٰلِكَ عِنْدِي","chapter":34},
        {"question":"لا تتخذوا آبائكم وإخوانكم أولياء إن استحبوا الكفر","answer":"لَا تَتَّخِذُوا آبَائَكُمْ وَإِخْوَانَكُمْ أَوْلِيَاءَ إِنِ اسْتَحَبُّوا الْكُفْرَ","chapter":34},
        {"question":"أراد ربك أن يبلغ اليتيمان أشدهما ويستخرجا كنزهما","answer":"أَرَادَ رَبُّكَ أَنْ يَبْلُغَ الْيَتِيمَانِ أَشُدَّهُمَا وَيَسْتَخْرِجَا كَنْزَهُمَا","chapter":34},
        {"question":"أنظر كيف ضربوا لك الأمثال فضلوا فلا يستطيعون سبيلًا","answer":"أُنْظُرْ كَيفَ ضَرَبُوا لَكَ الْأَمْثَالَ فَضَلُّوا فَلَا يَسْتَطِيعُونَ سَبِيلًا","chapter":34},
        {"question":"إنما الهكم إله واحد فاستقيموا إليه واستغفروه","answer":"إِنَّمَا إلٰهُكُمْ إِلٰهٌ وََاحِدٌ فَاسْتَقِيمُوا إِلَيهِ وَاسْتَغْفِرُوهُ","chapter":34},
        {"question":"إذا استأذنوك للخروج فقل لن تخرجوا معي أبدًا","answer":"إِذَا اسْتَأْذَنُوكَ لِلْخُرُوجِ فَقُلْ لَنْ تَخْرُجُوا مَعِي أَبَدًا","chapter":34},
        {"question":"لا تحسبنّ الذين قتلوا في سبيل الله أمواتًا بل أحياء عند ربهم يرزقون","answer":"لَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللهِ أَمْوَاتًا بَلْ أَحْيَاءً عِنْدَ رَبِّهِمْ يُرْزَقُونَ","chapter":34},
        {"question":"الله ولي الذين آمنوا - يخرجهم من الظلمات إلى النور. والذين كفروا أولياؤهم الطاغوت - يخرجونهم من النور إلى الظلمات. أولئك أصحاب النار هم فيها خالجون","answer":"اَللهُ وَلِيُّ الَّذِينَ آمَنُوا - يُخْرِجُهُمْ مِنَ الظُّلُمَاتِ إِلَىٰ النُّورِ. وَالَّذِينَ كَفَرُوا أَولِيَاؤُهُمُ الطَّاغُوتُ - يُخْرِجُونَهُمْ مِنَ النُّورِ إِلَىٰ الظُّلُمَاتِ. أُولٰئِكَ أَصْحَابُ النَّارِ هُمْ فِيهَا خَالِدُونَ","chapter":34},
        {"question":"خلق الإنسان من عجل. سأريكم آياتي فلا تستعجلوني ويقولون متى هذا الوعد إن كنتم صادقين؟","answer":"خُلِقَ الْإِنْسَانُ مِنْ عَجَلٍ. سَأُرِيكُمْ آيَاتِي فَلَا تَسْتعْجِلُونِي وَيَقُولُونَ مَتَىٰ هٰذَا الْوَعْدُ إِنْ كُنْتُمْ صَادِقِينَ؟","chapter":34},
        {"question":"الذين من قبلكم كانوا أشد منكم قوةً وأكثر أموالًا وأولادًا فاستمتعوا بخلاقهم فاستمتعتم بخلاقكم كما استمتع الذين من قبلكم","answer":"اَلَّذِينَ مِنْ قَبْلِكُمْ كَانوا أَشَدَّ مِنْكُمْ قُوَّةً وَأَكْثَرَ أَمْوَالًا وَأَوْلَادًا فَاسْتَمْتَعُوا بِخَلَاقِهِمْ فَاسْتَمْتَعْتُمْ بِخلَاقِكُمْ كَمَا اسْتَمْتَعَ الَّذِينَ مِنْ قَبْلِكُمْ","chapter":34},
        {"question":"ألم تر أنهم يقولون ما لا يفعلون إلا الذين آمنوا وعملوا الصالحات وذكروا الله","answer":"أَلَمْ تَرَ أَنَّهُمْ يَقُولُونَ مَا لَا يَفْعَلُونَ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَذَكَرُوا اللهَ","chapter":34},
        {"question":"ربنا اعف عنا واغفر لنا وارحمنا أنت مولانا فانصرنا على القوم الكافرين","answer":"رَبَّنَا اعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَولَانَا فَانْصُرْنَا عَلَىٰ الْقَومِ الْكَافِرِينَ","chapter":34},
        {"question":"لما خلق الله الأرض جعلت تميد فخلق الجبال وألقاها عليها فاستقامت. فعجبت الملائكة من شدة الجبال فقالت يا رب هل من خلقك شيء أشد من الجبال؟ قال نعم، الحديد. فقالت يا رب هل من خلقك شيء أشد من الحديد؟ قال نعم، النار. فقالت يا رب هل من خلقك شيء أشد من النار؟ قال نعم، الماء. فقات يا رب هل من خلقك شيء أشد من الماء؟ قال نعم، الريح. فقالت يا رب هل من خلقك شيء أشد من الريح؟ قال نعم الإنسان. يتصدق بيمينه فيخفيها عن شماله","answer":"لَمَّا خَلَقَ اللهُ الأَرْضَ جَعَلَتْ تَمِيدُ فَخَلَقَ الْجِبَالَ وَأَلْقَاهَا عَلَيهَا فَاسْتَقَامَتْ. فَعَجِبَتِ الْمَلَائِكَةُ مِنْ شِدِّةِ الْجِبَالِ فَقَالَتْ يَا رَبُّ هَلْ مِنْ خَلْقِكَ شَيءٌ أَشَدُّ مِنَ الْجِبَالِ؟ قَالَ نَعَمِ، الْحَدِيدُ. فَقَالَتْ يَا رَبُّ هَلْ مِنْ خَلْقِكَ شَيءٌ أَشَدُّ مِنَ الْحَدِيدِ؟ قَالَ نَعَمِ، النَّارُ. فَقَالَتْ يَا رَبُّ هَلْ من خَلْقِكَ شَيءٌ أَشَدُّ مِنَ النََّار؟ قَالَ نَعَمِ، الْمَاءُ. فَقَالَتْ يَا رَبُّ هَلْ مِنْ خَلْقِكَ شَيءٌ أَشَدُّ مِنَ الْمَاءِ؟ قَالَ نَعَمِ، الرِّيحُ. فَقَالَتْ يَا رَبُّ هَلْ مِنْ خَلْقِكَ شَيءٌ أَشَدُّ مِنَ الرِّيحِ؟ قَالَ نَعَمِ الْإنْسَانُ. يَتَصَدَّقُ بِيَمِينهِ فَيُخْفِيهَا عَنْ شِمَالِهِ.","chapter":34},
        {"question":"يجاهدون في سبيل الله ولا يخافون لومة لائم","answer":"يُجَاهِدُونَ فِي سَبِيلِ اللهِ وَلَا يَخَافُونَ لَومَةَ لَائِمِ","chapter":35},
        {"question":"ألم تر إلى الذي حاجّ إبرهيم في ربه أن آتاه الله الملك إذ قال إبرهيم ربي الذي يحيي ويميت قال أنا أحيي وأميت قال إبرهيم فإن الله يأتي بالشمس من المشرق فأت بها من المغرب فبُهت الذي كفر والله لا يهدي القوم الظالمين","answer":"أَلَمْ تَرَ إِلَىٰ الَّذِي حَاجَّ إبْرٰهِيمَ فِي رَبِّهِ أَنْ آتَاهُ اللهُ الْمُلْكَ إِذ قَالَ إِبْرٰهِيمُ رَبِّي الَّذِي يُحْيِي وَيُمِيتُ قَالَ أَنَا أُحْيِي وَأُمِيتُ قَالَ إِبْرٰهيمُ فَإنَّ اللهَ يأْتِي بالشِّمْسِ مِنَ الْمَشْرِقِ فَأْتِ بِهَا مِنَ الْمَغْرِبِ فَبُهِتَ الِّذِي كَفَرَ وَاللهُ لَا يَهْدِي الْقَومَ الظَّالِمِينَ","chapter":35},
        {"question":"إن الذين آمنوا وهاجروا وجاهدوا بأموالهم وأنفسهم في سبيل اللـه والذين آووا ونصروا أولـئك بعضهم أولياء بعض والذين امنوا ولم يهاجروا ما لكم من ولايتهم من شيء حتى يهاجروا وإن استنصروكم في الدين فعليكم النصر إلا على قوم بينكم وبينهم ميثاق والله بما تعملون بصير","answer":"إِنَّ الَّذِينَ آمَنُوا وَهَاجَرُوا وَجَاهَدُوا بِأَمْوَالِهِمْ وَأَنفُسِهِمْ فِي سَبِيلِ اللَّـهِ وَالَّذِينَ آوَوا وَنَصَرُوا أُولَـٰئِكَ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ وَالَّذِينَ آمَنُوا وَلَمْ يُهَاجِرُوا مَا لَكُمْ مِنْ وَلَايَتِهِمْ مِن شَيْءٍ حَتَّىٰ يُهَاجِرُوا وَإِنِ اسْتَنصَرُوكُمْ فِي الدِّينِ فَعَلَيْكُمُ النَّصْرُ إِلَّا عَلَىٰ قَوْمٍ بَيْنَكُمْ وَبَيْنَهُمْ مِيثَاقٌ وَاللهُ بِمَا تَعْمَلُونَ بَصِيرٌ","chapter":35},
        {"question":"تبارك الذي بيده الملك وهو على كل شيء قدير","answer":"تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيءٍ قَدِيرٌ","chapter":35},
        {"question":"إذ قال موسى لأهله إني آنست نارا سآتيكم منها بخبر او آتيكم بشهاب قبس فلما جاءها نودي أن بورك من في النار ومن حولها وسبحان الله رب العالمين. إنه أنا الله العزيز الحكيم","answer":"إِذْ قَالَ مُوسَىٰ لِأَهْلِهِ إِنِّي آنَسْتُ نَارًا سَآتِيكُمْ مِنْهَا بِخَبَرٍ أَوْ آتِيكُم بِشِهَابٍ قَبَسٍ فَلَمَّا جَاءَهَا نُودِيَ أَنْ بُورِكَ مَنْ فِي النَّارِ وَمَنْ حَوْلَهَا وَسُبْحَانَ اللهِ رَبِّ الْعَالَمِينَ. إِنَّهُ أَنَا اللهُ الْعَزِيزُ الْحَكِيمُ","chapter":35},
        {"question":" وهـذا كتاب أنزلناه مبارك فاتبعوه واتقوا لعلكم ترحمون","answer":" وَهَـٰذَا كِتَابٌ أَنْزَلْنَاهُ مُبَارَكٌ فَاتَّبِعُوهُ وَاتَّقُوا لَعَلَّكُمْ تُرْحَمُونَ","chapter":35},
        {"question":"وما أصابكم فبإذن اللـه وليعلم المؤمنين وليعلم الذين نافقوا وقيل لهم تعالوا قاتلوا في سبيل اللـه أو ادفعوا قالوا لو نعلم قتالا لاتبعناكم هم للكفر يوميذ أقرب منهم للإيمان يقولون بأفواههم ما ليس في قلوبهم واللـه أعلم بما يكتمون","answer":"وَمَا أَصَابَكُمْ فَبِإِذْنِ اللَّـهِ وَلِيَعْلَمَ الْمُؤْمِنِينَ وَلِيَعْلَمَ الَّذِينَ نَافَقُوا وَقِيلَ لَهُمْ تَعَالَوْا قَاتِلُوا فِي سَبِيلِ اللَّـهِ أَوِ ادْفَعُوا قَالُوا لَوْ نَعْلَمُ قِتَالًا لَاتَّبَعْنَاكُمْ هُمْ لِلْكُفْرِ يَوْمَئِذٍ أَقْرَبُ مِنْهُمْ لِلْإِيمَانِ ۚ يَقُولُونَ بِأَفْوَاهِهِمْ مَا لَيْسَ فِي قُلُوبِهِمْ وَاللَّـهُ أَعْلَمُ بِمَا يَكْتُمُونَ","chapter":35},
        {"question":"فأقبل بعضهم على بعض يتلاومون","answer":"فَأَقْبَلَ بَعْضُهُمْ عَلَىٰ بَعْضٍ يَتَلاوَمُونَ","chapter":35},
        {"question":"إني حرمت الظلم على نفسي وجعلته بينكم محرما فلا تظالموا يا عبادي كلكم ضال إلا من هديته فاستهدوني أهدكم يا عبادي كلكم جايع إلا من أطعمته فاستطعموني أطعمكم يا عبادي كلكم عار إلا من كسوته فاستكسوني أكسكم يا عبادي إنكم تخطيون بالليل والنهار وأنا أغفر الذنوب جميعا فاستغفروني أغفر لكم","answer":"إِنِّي حَرَّمْتُ الظُّلْمَ عَلَىٰ نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلاَ تَظَالَمُوا يَا عِبَادِي كُلُّكُمْ ضَالٌّ إِلاَّ مَنْ هَدَيْتُهُ فَاسْتَهْدُونِي أَهْدِكُمْ يَا عِبَادِي كُلُّكُمْ جَائِعٌ إِلاَّ مَنْ أَطْعَمْتُهُ فَاسْتَطْعِمُونِي أُطْعِمْكُمْ يَا عِبَادِي كُلُّكُمْ عَارٍ إِلاَّ مَنْ كَسَوْتُهُ فَاسْتَكْسُونِي أَكْسُكُمْ يَا عِبَادِي إِنَّكُمْ تُخْطِئُونَ بِاللَّيْلِ وَالنَّهَارِ وَأَنَا أَغْفِرُ الذُّنُوبَ جَمِيعًا فَاسْتَغْفِرُونِي أَغْفِرْ لَكُمْ","chapter":35},
        {"question":"لا تمارضوا فتمرضوا ولا تحفروا قبوركم فتموتوا","answer":"لا تَمَارَضوا فَتَمْرَضُوا وَلا تَحْفِرُوا قُبُورَكُمْ فَتَمُوتُوا","chapter":35},
        {"question":"استفت قلبك وإن أفتاك المفتون","answer":"اِسْتَفْتِ قَلْبَكَ وَإِنْ أَفْتاكَ الْمُفتُونَ","chapter":36},
        {"question":"لا تسمع الصم الدعاء إذا ولوا مدبرين","answer":"لا تُسْمِعُ الصُّمَّ الدُّعَاءَ إِذا وَلَّوا مُدْبِرِينَ","chapter":36},
        {"question":"يوم تبيض وجوه وتسود وجوه فأما الذين اسودت وجوههم أكفرتم بعد","answer":"إيمانكم فذوقوا العذاب بما كنتم تكفرون","chapter":36},
        {"question":"يَوْمَ تَبْيَضُّ وُجُوهٌ وَتَسْوَدُّ وُجُوهٌ فَأَمَّا الَّذِينَ اسْوَدَّتْ وُجُوهُهُمْ أَكَفَرْتُم بَعْدَ","answer":"إِيمَانِكُمْ فَذُوقُوا الْعَذَابَ بِمَا كُنتُمْ تَكْفُرُونَ","chapter":36},
        {"question":" ألم تر أن اللـه أنزل من السماء ماء فتصبح الأرض مخضرة","answer":" أَلَمْ تَرَ أَنَّ اللَّـهَ أَنزَلَ مِنَ السَّمَاءِ مَاءً فَتُصْبِحُ الْأَرْضُ مُخْضَرَّةً","chapter":36},
        {"question":" قل من رب السموات والأرض قل الله قل أفاتخذتم من دونه أولياء لا يملكون لانفسهم نفعا ولا ضرا قل هل يستوي الأعمى والبصير أم هل تستوي الظلمات والنور أم جعلوا لله شركاء خلقوا كخلقه فتشابه الخلق عليهم قل الله خالق كل شيء وهو الواحد","answer":" قُلْ مَن رَّبُّ السَّمٰوَاتِ وَالْأَرْضِ قُلِ اللَّـهُ قُلْ أَفَاتَّخَذْتُم مِّن دُونِهِ أَوْلِيَاءَ لَا يَمْلِكُونَ لِأَنفُسِهِمْ نَفْعًا وَلَا ضَرًّا قُلْ هَلْ يَسْتَوِي الْأَعْمَىٰ وَالْبَصِيرُ أَمْ هَلْ تَسْتَوِي الظُّلُمَاتُ وَالنُّورُ أَمْ جَعَلُوا لِلَّـهِ شُرَكَاءَ خَلَقُوا كَخَلْقِهِ فَتَشَابَهَ الْخَلْقُ عَلَيْهِمْ قُلِ اللَّـهُ خَالِقُ كُلِّ شَيْءٍ وَهُوَ الْوَاحِدُ","chapter":36},
        {"question":"فلا تطع الكافرين وجاهدهم جهادا كبيرا","answer":"فَلَا تُطِعِ الْكَافِرِينَ وَجَاهِدْهُم جِهَادًا كَبِيرًا","chapter":36},
        {"question":"يا أيها الذين آمنوا لا تدخلوا بيوتا غير بيوتكم حتى تستأذنوا وتسلموا على أهلها ذلكم خير لكم لعلكم تذكرون","answer":"يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَدْخُلُوا بُيُوتًا غَيْرَ بُيُوتِكُمْ حَتَّىٰ تَسْتَأْذِنُوا وَتُسَلِّمُوا عَلَىٰ أَهْلِهَا ذٰلِكُمْ خَيْرٌ لَّكُمْ لَعَلَّكُمْ تَذَكَّرُونَ","chapter":36},
        {"question":"إذا جاءك المنافقون قالوا نشهد إنك لرسول الله والله يعلم إنك لرسوله والله يشهد إن المنافقين لكاذبون","answer":"إِذَا جَاءَكَ الْمُنَافِقُونَ قَالُوا نَشْهَدُ إِنَّكَ لَرَسُولُ اللَّـهِ وَاللَّـهُ يَعْلَمُ إِنَّكَ لَرَسُولُهُ وَاللَّـهُ يَشْهَدُ إِنَّ الْمُنَافِقِينَ لَكَاذِبُونَ","chapter":36},
        {"question":"قل لين اجتمعت الإنس والجن على أن يأتوا بمثل هـذا القرآن لا يأتون بمثله","answer":"قُلْ لَئِنِ اجْتَمَعَتِ الْإِنسُ وَالْجِنُّ عَلَىٰ أَن يَأْتُوا بِمِثْلِ هَـٰذَا الْقُرْآنِ لَا يَأْتُونَ بِمِثْلِهِ","chapter":36},
        {"question":"وإذ أخذ ربك من بني آدم من ظهورهم ذريتهم وأشهدهم على أنفسهم ألست بربكم قالوا بلى شهدنا أن تقولوا يوم القيامة إنا كنا عن هـذا غافلين أو تقولوا إنما أشرك أباؤنا من قبل وكنا ذرية من بعدهم أفتهلكنا بما فعل المبطلون","answer":"وَإِذْ أَخَذَ رَبُّكَ مِن بَنِي آدَمَ مِن ظُهُورِهِمْ ذُرِّيَّتَهُمْ وَأَشْهَدَهُمْ عَلَىٰ أَنفُسِهِمْ أَلَسْتُ بِرَبِّكُمْ قَالُوا بَلَىٰ شَهِدْنَا أَن تَقُولُوا يَوْمَ الْقِيَامَةِ إِنَّا كُنَّا عَنْ هَـٰذَا غَافِلِينَ أَوْ تَقُولُوا إِنَّمَا أَشْرَكَ آبَاؤُنَا مِن قَبْلُ وَكُنَّا ذُرِّيَّةً مِن بَعْدِهِمْ أَفَتُهْلِكُنَا بِمَا فَعَلَ الْمُبْطِلُونَ","chapter":36},
        {"question":"إن شر الجواب عنج الله الصم البكم","answer":"إِنَّ شَرَّ الدَّوَابِّ عِندَ اللَّـهِ الصُّمُّ الْبُكْمُ","chapter":36},
        {"question":"يا ابن آدم أقم الصلاة وأمر بالمعروف وانه عن المنكر واصبر على ما أصابك","answer":"يا ابْنَ آدَمَ أَقِمِ الصَّلاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنْكَرِ وَاصْبِرْ عَلَىٰ ما أَصابَكَ","chapter":37},
        {"question":"إن المتقين في مقام أمين في جنات وعيون لا يذوقون فيها الموت إلا الموتة الأولى وقاهم عذاب الجحيم","answer":"إِنَّ الْمُتَّقِينَ فِي مَقَامٍ أَمِينٍ فِي جَنَّاتٍ وَعُيُونٍ لَا يَذُوقُونَ فِيهَا الْمَوْتَ إِلَّا الْمَوْتَةَ الْأُولَىٰ وَقَاهُمْ عَذَابَ الْجَحِيمِ","chapter":37},
        {"question":"يا بني إنها إن تك مثقال حبة من خردل فتكن في صخرة أو في السموات أو في الأرض يات بها الله","answer":"يَا بُنَيَّ إِنَّهَا إِنْ تَكُ مِثْقَالَ حَبَّةٍ مِّنْ خَرْدَلٍ فَتَكُنْ فِي صَخْرَةٍ أَوْ فِي السَّمٰوَاتِ أَوْ فِي الْأَرْضِ يَأْتِ بِهَا اللَّـهُ","chapter":37},
        {"question":" ولتكن منكم أمة يدعون إلى الخير ويأمرون بالمعروف وينهون عن المنكر وأولـئك هم المفلحون ولا تكونوا كالذين تفرقوا واختلفوا من بعد ما جاءهم البينات وأولـئك لهم عذاب عظيم","answer":" وَلْتَكُنْ مِنْكُمْ أُمَّةٌ يَدْعُونَ إِلَى الْخَيْرِ وَيَأْمُرُونَ بِالْمَعْرُوفِ وَيَنْهَوْنَ عَنِ الْمُنكَرِ وَأُولَـٰئِكَ هُمُ الْمُفْلِحُونَ وَلَا تَكُونُوا كَالَّذِينَ تَفَرَّقُوا وَاخْتَلَفُوا مِن بَعْدِ مَا جَاءَهُمُ الْبَيِّنَاتُ وَأُولَـٰئِكَ لَهُمْ عَذَابٌ عَظِيمٌ","chapter":37},
        {"question":"وقالوا أإذا ضللنا في الأرض إإنا لفي خلق جديد بل هم بلقاء ربهم كافرون. قل يتوفاكم ملك الموت الذي وكل بكم ثم إلى ربكم ترجعون","answer":"وَقَالُوا أَإِذَا ضَلَلْنَا فِي الْأَرْضِ أَإِنَّا لَفِي خَلْقٍ جَدِيدٍ بَلْ هُمْ بِلِقَاءِ رَبِّهِمْ كَافِرُونَ. قُلْ يَتَوَفَّاكُمْ مَلَكُ الْمَوْتِ الَّذِي وُكِّلَ بِكُمْ ثُمَّ إِلَىٰ رَبِّكُمْ تُرْجَعُونَ","chapter":37},
        {"question":"ولقد جعلنا في السماء بروجا وزيناها للناظرين. وحفظناها من كل شيطان رجيم. إلا من استرق السمع فأتبعه شهاب مبين","answer":"وَلَقَدْ جَعَلْنَا فِي السَّمَاءِ بُرُوجًا وَزَيَّنَّاهَا لِلنَّاظِرِينَ. وَحَفِظْنَاهَا مِن كُلِّ شَيْطَانٍ رَجِيمٍ. إِلَّا مَنِ اسْتَرَقَ السَّمْعَ فَأَتْبَعَهُ شِهَابٌ مُّبِينٌ","chapter":37},
        {"question":"قالت يا أيها الملأ إني ألقي إلي كتاب كريم إنه من سليمان وإنه بسم الله الرحمـن الرحيم ألا تعلوا علي وأتوني مسلمين. قالت يا أيها الملأ أفتوني في أمري ما كنت قاطعة أمرا حتى تشهدون. قالوا نحن أولو قوة والأمر إليك فانظري ماذا تامرين. قالت إن الملوك إذا دخلوا قرية أفسدوها وجعلوا أعزة أهلها أذلة وكذلك يفعلون وإني مرسلة إليهم بهدية فناظرة بما يرجع المرسلون","answer":"قَالَتْ يَا أَيُّهَا الْمَلَأُ إِنِّي أُلْقِيَ إِلَيَّ كِتَابٌ كَرِيمٌ إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ أَلَّا تَعْلُوا عَلَيَّ وَأْتُونِي مُسْلِمِينَ. قَالَتْ يَا أَيُّهَا الْمَلَأُ أَفْتُونِي فِي أَمْرِي مَا كُنتُ قَاطِعَةً أَمْرًا حَتَّىٰ تَشْهَدُونِ. قَالُوا نَحْنُ أُولُو قُوَّةٍ وَالْأَمْرُ إِلَيْكِ فَانظُرِي مَاذَا تَأْمُرِينَ. قَالَتْ إِنَّ الْمُلُوكَ إِذَا دَخَلُوا قَرْيَةً أَفْسَدُوهَا وَجَعَلُوا أَعِزَّةَ أَهْلِهَا أَذِلَّةً وَكَذَٰلِكَ يَفْعَلُونَ وَإِنِّي مُرْسِلَةٌ إِلَيْهِم بِهَدِيَّةٍ فَنَاظِرَةٌ بِما يَرْجِعُ الْمُرْسَلُونَ","chapter":37},
        {"question":"من أجل ذلك كتبنا على بني إسرائيل أنه من قتل نفسا بغير نفس او فساد في الأرض فكأنما قتل الناس جميعا ومن أحياها فكأنما أحيا الناس جميعا ولقد جاءتهم رسلنا بالبينات ثم إن كثيرا منهم بعد ذلك في الأرض لمسرفون","answer":"مِنْ أَجْلِ ذَٰلِكَ كَتَبْنَا عَلَىٰ بَنِي إِسْرَائِيلَ أَنَّهُ مَنْ قَتَلَ نَفْسًا بِغَيْرِ نَفْسٍ أَوْ فَسَادٍ فِي الْأَرْضِ فَكَأَنَّمَا قَتَلَ النَّاسَ جَمِيعًا وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا وَلَقَدْ جَاءَتْهُمْ رُسُلُنَا بِالْبَيِّنَاتِ ثُمَّ إِنَّ كَثِيرًا مِنْهُم بَعْدَ ذَٰلِكَ فِي الْأَرْضِ لَمُسْرِفُونَ","chapter":37},
        {"question":"إلـهكم إلـه واحد فالذين لا يؤمنون بالآخرة قلوبهم منكرة وهم مستكبرون","answer":"إِلَـٰهُكُمْ إِلَـٰهٌ وَاحِدٌ فَالَّذِينَ لَا يُؤْمِنُونَ بِالْآخِرَةِ قُلُوبُهُمْ مُنْكِرَةٌ وَهُمْ مُّسْتَكْبِرُونَ","chapter":37},
        {"question":"يا أيتها النفس المطمئنة ارجعي إلى ربك راضية مرضية فادخلي في عبادي وادخلي جنتي","answer":"يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَرْضِيَّةً فَادْخُلِي فِي عِبَادِي وَادْخُلِي جَنَّتِي","chapter":38},
        {"question":"ألا إن أولياء الله لا خوف عليهم ولا هم يحزنون. الذين آمنوا وكانوا يتقون لهم البشرى في الحياة الدنيا وفي الآخرة","answer":"أَلَا إِنَّ أَوْلِيَاءَ اللَّـهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ. الَّذِينَ آمَنُوا وَكَانُوا يَتَّقُونَ لَهُمُ الْبُشْرَىٰ فِي الْحَيَاةِ الدُّنْيَا وَفِي الْآخِرَةِ","chapter":38},
        {"question":"ولا يزالون يقاتلونكم حتى يردوكم عن دينكم إن استطاعوا ومن يرتدد منكم عن دينه فيمت وهو كافر","answer":"وَلَا يَزَالُونَ يُقَاتِلُونَكُمْ حَتَّىٰ يَرُدُّوكُمْ عَن دِينِكُمْ إِنِ اسْتَطَاعُوا وَمَن يَرْتَدِدْ مِنْكُمْ عَنْ دِينِهِ فَيَمُتْ وَهُوَ كَافِرٌ","chapter":38},
        {"question":"وأنفقوا من ما رزقناكم من قبل أن يأتي أحدكم الموت فيقول رب لولا إخرتني إلى أجل قريب فأصدق وأكن من الصالحين ولن يوخر الله نفسا إذا جاء أجلها والله خبير بما تعملون","answer":"وَأَنفِقُوا مِنْ مَا رَزَقْنَاكُمْ مِنْ قَبْلِ أَنْ يَأْتِيَ أَحَدَكُمُ الْمَوْتُ فَيَقُولَ رَبِّ لَوْلَا أَخَّرْتَنِي إِلَىٰ أَجَلٍ قَرِيبٍ فَأَصَّدَّقَ وَأَكُنْ مِنَ الصَّالِحِينَ وَلَن يُؤَخِّرَ اللَّـهُ نَفْسًا إِذَا جَاءَ أَجَلُهَا وَاللَّـهُ خَبِيرٌ بِمَا تَعْمَلُونَ","chapter":38},
        {"question":"قل إن الموت الذي تفرون منه فإنه ملاقيكم ثم تردون إلى عالم الغيب والشهادة فينبئكم بما كنتم تعملون","answer":"قُلْ إِنَّ الْمَوْتَ الَّذِي تَفِرُّونَ مِنْهُ فَإِنَّهُ مُلَاقِيكُمْ ثُمَّ تُرَدُّونَ إِلَىٰ عَالِمِ الْغَيْبِ وَالشَّهَادَةِ فَيُنَبِّئُكُمْ بِمَا كُنْتُمْ تَعْمَلُونَ","chapter":38},
        {"question":"تلك آيات الكتاب وقرآن مبين ربما يود الذين كفروا لو كانوا مسلمين ذرهم يأكلوا ويتمتعوا فسوف يعلمون وما أهلكنا من قرية إلا ولها كتاب معلوم","answer":"تِلْكَ آيَاتُ الْكِتَابِ وَقُرْآنٍ مُّبِينٍ رُّبَمَا يَوَدُّ الَّذِينَ كَفَرُوا لَوْ كَانُوا مُسْلِمِينَ ذَرْهُمْ يَأْكُلُوا وَيَتَمَتَّعُوا فَسَوْفَ يَعْلَمُونَ وَمَا أَهْلَكْنَا مِن قَرْيَةٍ إِلَّا وَلَهَا كِتَابٌ مَعْلُومٌ","chapter":38},
        {"question":" فإذا قرأت القرآن فاستعذ بالله من الشيطان الرجيم إنه ليس له سلطان على الذين آمنوا وعلى ربهم يتوكلون","answer":" فَإِذَا قَرَأْتَ الْقُرْآنَ فَاسْتَعِذْ بِاللَّـهِ مِنَ الشَّيْطَانِ الرَّجِيمِ إِنَّهُ لَيْسَ لَهُ سُلْطَانٌ عَلَىٰ الَّذِينَ آمَنُوا وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ","chapter":38},
        {"question":" عذابي أصيب به من أشاء ورحمتي وسعت كل شيء فسأكتبها للذين يتقون ويؤتون الزكاة والذين هم بآياتنا يؤمنون","answer":" عَذَابِي أُصِيبُ بِهِ مَنْ أَشَاءُ وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ فَسَأَكْتُبُهَا لِلَّذِينَ يَتَّقُونَ وَيُؤْتُونَ الزَّكَاةَ وَالَّذِينَ هُم بِآيَاتِنَا يُؤْمِنُونَ","chapter":38},
        {"question":"وأوحينا إلى أم موسى أن أرضعيه فإذا خفت عليه فألقيه في اليم ولا تخافي ولا تحزني إنا رادوه إليك وجاعلوه من المرسلين فرددناه إلى إمه كي تقر عينها ولا تحزن ولتعلم أن وعد اللـه حق ولـكن أكثرهم لا يعلمون ولما بلغ أشده واستوى آتيناه حكما وعلما وكذلك نجزي المحسنين","answer":"وَأَوْحَيْنَا إِلَىٰ أُمِّ مُوسَىٰ أَنْ أَرْضِعِيهِ فَإِذَا خِفْتِ عَلَيْهِ فَأَلْقِيهِ فِي الْيَمِّ وَلَا تَخَافِي وَلَا تَحْزَنِي إِنَّا رَادُّوهُ إِلَيْكِ وَجَاعِلُوهُ مِنَ الْمُرْسَلِينَ فَرَدَدْنَاهُ إِلَىٰ أُمِّهِ كَيْ تَقَرَّ عَيْنُهَا وَلَا تَحْزَنَ وَلِتَعْلَمَ أَنَّ وَعْدَ اللَّـهِ حَقٌّ وَلَـٰكِنَّ أَكْثَرَهُمْ لَا يَعْلَمُونَ وَلَمَّا بَلَغَ أَشُدَّهُ وَاسْتَوَىٰ آتَيْنَاهُ حُكْمًا وَعِلْمًا وَكَذَٰلِكَ نَجْزِي الْمُحْسِنِينَ","chapter":38},
        {"question":"إنا أنزلنا التوراة فيها هدى ونور يحكم بها النبيون الذين أسلموا للذين هادوا والربانيون والاحبار بما استحفظوا من كتاب اللـه وكانوا عليه شهداء ومن لم يحكم بما انزل اللـه فاولـئك هم الكافرون","answer":"إِنَّا أَنزَلْنَا التَّوْرَاةَ فِيهَا هُدًى وَنُورٌ يَحْكُمُ بِهَا النَّبِيُّونَ الَّذِينَ أَسْلَمُوا لِلَّذِينَ هَادُوا وَالرَّبَّانِيُّونَ وَالْأَحْبَارُ بِمَا اسْتُحْفِظُوا مِن كِتَابِ اللَّـهِ وَكَانُوا عَلَيْهِ شُهَدَاءَ وَمَن لَّمْ يَحْكُمْ بِمَا أَنزَلَ اللَّـهُ فَأُولَـٰئِكَ هُمُ الْكَافِرُونَ","chapter":38},
        {"question":"افترقت اليهود على إحدى وسبعين فرقة، وافترقت النصارى على اثنتين وسبعين فرقة، وستفترق هذه الأمة على ثلاث وسبعين ملة كلها في النار إلا واحدة","answer":"اِفْتَرَقَتِ الْيَهُودُ عَلَىٰ إِحْدَىٰ وَسَبْعِينَ فِرْقةً وَافْتَرَقَتِ النَّصَارَىٰ عَلَىٰ اثْنَتَينِ وَسَبْعِينَ فِرْقَةً، وَسَتَفْتَرِقُ هٰذِهِ الْأُمَّةُ عَلَىٰ ثَلاثٍ وَسَبْعِينَ مِلَّةً كُلُّها فِي النَّارِ إِلَّا وَاحِدَةً","chapter":39},
        {"question":" يا أيها النبي حرض المومنين على القتال إن يكن منكم عشرون صابرون يغلبوا مايتين وإن يكن منكم مائة يغلبوا ألفا وإن يكن منكم ألف يغلبوا ألفين باذن الله والله مع الصابرين","answer":" يَا أَيُّهَا النَّبِيُّ حَرِّضِ الْمُؤْمِنِينَ عَلَىٰ الْقِتَالِ إِن يَكُن مِّنكُمْ عِشْرُونَ صَابِرُونَ يَغْلِبُوا مِائَتَيْنِ وَإِن يَكُن مِّنكُم مِّائَةٌ يَغْلِبُوا أَلْفًا وَإِن يَكُن مِّنكُمْ أَلْفٌ يَغْلِبُوا أَلْفَيْنِ بِإِذْنِ اللَّـهِ وَاللَّـهُ مَعَ الصَّابِرِينَ","chapter":39},
        {"question":"استغفر لهم أو لا تستغفر لهم إن تستغفر لهم سبعين مرة فلن يغفر الله لهم. ذلك بأنهم كفروا باللـه ورسوله والله لا يهدي القوم الفاسقين","answer":"اسْتَغْفِرْ لَهُمْ أَوْ لَا تَسْتَغْفِرْ لَهُمْ إِنْ تَسْتَغْفِرْ لَهُمْ سَبْعِينَ مَرَّةً فَلَن يَغْفِرَ اللَّـهُ لَهُمْ. ذَٰلِكَ بِأَنَّهُمْ كَفَرُوا بِاللَّـهِ وَرَسُولِهِ وَاللَّـهُ لَا يَهْدِي الْقَوْمَ الْفَاسِقِينَ","chapter":39},
        {"question":"فمن لم يستطع ذلك فصيام شهرين متتابعين فمن لم يستطع فإطعام ستين مسكينا","answer":"فَمَن لَّمْ يَسْتَطِعْ ذٰلِكَ فَصِيَامُ شَهْرَيْنِ مُتَتَابِعَيْنِ فَمَنْ لَمْ يَسْتَطِعْ فَإِطْعَامُ سِتِّينَ مِسْكِينًا","chapter":39},
        {"question":"الزانية والزاني فاجلدوا كل واحد منهما مائة جلدة ولا تأخذكم بهما رافة في دين الله إن كنتم تؤمنون بالله واليوم الآخر وليشهد عذابهما طايفة من المؤمنين. الزاني لا ينكح إلا زانية أو مشركة والزانية لا ينكحها إلا زان او مشرك وحرم ذلك على المؤمنين. والذين يرمون المحصنات ثم لم يأتوا بأربعة شهداء فاجلدوهم ثمانين جلدة ولا تقبلوا لهم شهادة أبدا وأولـئك هم الفاسقون إلا الذين تابوا من بعد ذلك وأصلحوا فإن الله غفور رحيم","answer":"الزَّانِيَةُ وَالزَّانِي فَاجْلِدُوا كُلَّ وَاحِدٍ مِّنْهُمَا مِائَةَ جَلْدَةٍ وَلَا تَأْخُذْكُم بِهِمَا رَأْفَةٌ فِي دِينِ اللَّـهِ إِن كُنتُمْ تُؤْمِنُونَ بِاللَّـهِ وَالْيَوْمِ الْآخِرِ وَلْيَشْهَدْ عَذَابَهُمَا طَائِفَةٌ مِّنَ الْمُؤْمِنِينَ. الزَّانِي لَا يَنكِحُ إِلَّا زَانِيَةً أَوْ مُشْرِكَةً وَالزَّانِيَةُ لَا يَنكِحُهَا إِلَّا زَانٍ أَوْ مُشْرِكٌ وَحُرِّمَ ذَٰلِكَ عَلَى الْمُؤْمِنِينَ. وَالَّذِينَ يَرْمُونَ الْمُحْصَنَاتِ ثُمَّ لَمْ يَأْتُوا بِأَرْبَعَةِ شُهَدَاءَ فَاجْلِدُوهُمْ ثَمَانِينَ جَلْدَةً وَلَا تَقْبَلُوا لَهُمْ شَهَادَةً أَبَدًا وَأُولَـٰئِكَ هُمُ الْفَاسِقُونَ إِلَّا الَّذِينَ تَابُوا مِن بَعْدِ ذَٰلِكَ وَأَصْلَحُوا فَإِنَّ اللَّـهَ غَفُورٌ رَحِيمٌ","chapter":39},
        {"question":"إن الله خلق الأرواح قبل اللأجسام بألفي سنة","answer":"إِنَّ اللهَ خَلَقَ الْأَرْوَاحَ قَبْلَ الْأَجْسامِ بِأَلْفَي سَنَةٍ","chapter":39},
        {"question":"إن الله ينظر في كل يوم وليلة ثلاثمائة وستين نظرة إلى قلب المؤمن","answer":"إِنَّ اللهَ يَنْظُرُ فِي كُلِّ يَومٍ وَلَيلَةٍ ثَلَاثَمِائَةٍ وَسِتّينَ نَظْرَةً إِلَىٰ قَلْبِ الْمُؤْمِنِ","chapter":39},
        {"question":"خيرت بين أن أكون نبيا ملكا أو نبيا عبدا فأشار إلي جبريل أن تواضع، فقلت بل أكون نبيا عبدا أشبع يوما وأجوع يوما","answer":"خُيِّرْتُ بَيْنَ أَنْ أَكُونَ نَبِيًّا مَلِكًا أَوْ نَبِيًّا عَبْدًا فَأَشارَ إِلَيَّ جِبْرِيلُ أن تَوَاضَعْ، فَقُلْتُ بَلْ أَكُونُ نَبِيًّا عَبْدًا أَشْبَعُ يَومًا وأَجُوعُ يَومًا","chapter":39},
        {"question":"إن عدة الشهور عند الله اثنا عشر شهرا في كتاب الله يوم خلق السموات والأرض","answer":"إِنَّ عِدَّةَ الشُّهُورِ عِنْدَ اللَّـهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّـهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ","chapter":39},
        {"question":"وما كان لمومن أن يقتل مؤمنا إلا خطا ومن قتل مؤمنا خطا فتحرير رقبة مؤمنة ودية مسلمة إلى أهله إلا أن يصدقوا فإن كان من قوم عدو لكم وهو مؤمن فتحرير رقبة مؤمنة وإن كان من قوم بينكم وبينهم ميثاق فدية مسلمة إلى أهله وتحرير رقبة مؤمنة فمن لم يجد فصيام شهرين متتابعين توبة من الله وكان اللـه عليما حكيما","answer":"وَمَا كَانَ لِمُؤْمِنٍ أَن يَقْتُلَ مُؤْمِنًا إِلَّا خَطَأً وَمَن قَتَلَ مُؤْمِنًا خَطَأً فَتَحْرِيرُ رَقَبَةٍ مُّؤْمِنَةٍ وَدِيَةٌ مُسَلَّمَةٌ إِلَىٰ أَهْلِهِ إِلَّا أَن يَصَّدَّقُوا فَإِن كَانَ مِنْ قَوْمٍ عَدُوٍّ لَكُمْ وَهُوَ مُؤْمِنٌ فَتَحْرِيرُ رَقَبَةٍ مُّؤْمِنَةٍ وَإِنْ كَانَ مِنْ قَوْمٍ بَيْنَكُمْ وَبَيْنَهُمْ مِيثَاقٌ فَدِيَةٌ مُسَلَّمَةٌ إِلَىٰ أَهْلِهِ وَتَحْرِيرُ رَقَبَةٍ مُؤْمِنَةٍ فَمَنْ لَمْ يَجِدْ فَصِيَامُ شَهْرَيْنِ مُتَتَابِعَيْنِ تَوْبَةً مِنَ اللَّـهِ وَكَانَ اللَّـهُ عَلِيمًا حَكِيمًا","chapter":39},
        {"question":"لقد كفر الذين قالوا إن الله ثالث ثلاثة","answer":"لَقَدْ كَفَرَ الَّذِينَ قَالُوا إِنَّ اللَّـهَ ثَالِثُ ثَلَاثَةٍ","chapter":40},
        {"question":"حبب إلى من دنياكم ثلاث - الطيب والنساء وجعلت قرة عيني في الصلاة","answer":"حُبِّبَ إِلَىَّ مِنْ دُنْياكُمْ ثَلَاثٌ - الطِّيبُ وَالنِّسَاءُ وَجُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلاَةِ","chapter":40},
        {"question":"وإن خفتم ألا تقسطوا في اليتامى فانكحوا ما طاب لكم من النساء مثنى وثلاث ورباع","answer":"وَإِنْ خِفْتُمْ أَلَّا تُقْسِطُوا فِي الْيَتَامَىٰ فَانكِحُوا مَا طَابَ لَكُمْ مِنَ النِّسَاءِ مَثْنَىٰ وَثُلَاثَ وَرُبَاعَ","chapter":40},
        {"question":"ويستعجلونك بالعذاب ولن يخلف الله وعده وإن يوما عند ربك كألف سنة مما تعدون","answer":"وَيَسْتَعْجِلُونَكَ بِالْعَذَابِ وَلَنْ يُخْلِفَ اللَّـهُ وَعْدَهُ وَإِنَّ يَوْمًا عِندَ رَبِّكَ كَأَلْفِ سَنَةٍ مِمَّا تَعُدُّونَ","chapter":40},
        {"question":"سأل سائل بعذاب واقع للكافرين ليس له دافع من الله ذي المعارج تعرج الملايكة والروح إليه في يوم كان مقداره خمسين ألف سنة فاصبر صبرا جميلا إنهم يرونه بعيدا ونراه قريبا يوم تكون السماء كالمهل وتكون الجبال كالعهن","answer":"سَأَلَ سَائِلٌ بِعَذَابٍ وَاقِعٍ لِلْكَافِرِينَ لَيْسَ لَهُ دَافِعٌ مِنَ اللَّـهِ ذِي الْمَعَارِجِ تَعْرُجُ الْمَلَائِكَةُ وَالرُّوحُ إِلَيْهِ فِي يَوْمٍ كَانَ مِقْدَارُهُ خَمْسِينَ أَلْفَ سَنَةٍ فَاصْبِرْ صَبْرًا جَمِيلًا إِنَّهُمْ يَرَوْنَهُ بَعِيدًا وَنَرَاهُ قَرِيبًا يَوْمَ تَكُونُ السَّمَاءُ كَالْمُهْلِ وَتَكُونُ الْجِبَالُ كَالْعِهْنِ","chapter":40},
        {"question":"يوصيكم الله في أولادكم للذكر مثل حظ الانثيين. فإن كن نساء فوق اثنتين فلهن ثلثا ما ترك وإن كانت واحدة فلها النصف ولأبويه لكل واحد منهما السدس مما ترك إن كان له ولد فان لم يكن له ولد وورثه أبواه فلأمه الثلث فإن كان له إخوة فلامه السدس من بعد وصية يوصي بها أو دين","answer":"يُوصِيكُمُ اللَّـهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ. فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِنْ كَانَ لَهُ وَلَدٌ فَإِنْ لَّمْ يَكُنْ لَهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ فَإِنْ كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ مِنْ بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ","chapter":40},
        {"question":"ولكم نصف ما ترك ازوأجكم إن لم يكن لهن ولد فإن كان لهن ولد فلكم الربع مما تركن من بعد وصية يوصين بها أو دين ولهن الربع مما تركتم إن لم يكن لكم ولد فإن كان لكم ولد فلهن الثمن مما تركتم من بعد وصية توصون بها او دين وإن كان رجل يورث كلالة أو امرأة وله أخ أو أخت فلكل واحد منهما السدس فإن كانوا أكثر من ذلك فهم شركاء في الثلث من بعد وصية يوصى بها أو دين غير مضار وصية من الله والله عليم حليم","answer":"وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِنْ لَمْ يَكُنْ لَهُنَّ وَلَدٌ فَإِنْ كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ مِن بَعْدِ وَصِيَّةٍ يُوصِينَ بِهَا أَوْ دَيْنٍ وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِنْ لَمْ يَكُنْ لَكُمْ وَلَدٌ فَإِنْ كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُمْ مِنْ بَعْدِ وَصِيَّةٍ تُوصُونَ بِهَا أَوْ دَيْنٍ وَإِنْ كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ فَإِن كَانُوا أَكْثَرَ مِنْ ذَٰلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ مِنْ بَعْدِ وَصِيَّةٍ يُوصَىٰ بِهَا أَوْ دَيْنٍ غَيْرَ مُضَارٍّ وَصِيَّةً مِنَ اللَّـهِ وَاللَّـهُ عَلِيمٌ حَلِيمٌ","chapter":40},
    ]

    // Will result in [{name: 18}, {name: 2}...]
    data.chapters = getChapters();

    function getChapters() {
        var nums = _.range(18,41);
        return _.map(nums, function(num) {
            return {name: num};
        })
    }

    return data;
})



;var verbApp = angular.module('verbApp');

verbApp.constant('verbAppConstants', {
        templateDirectory: '/components/verb_app/templates'
    }
)
;// sound example
var verb = {
    letter1: 'ك',
    letter2: 'ت',
    letter3: 'ب',
    type: {
        name: 'sound'
    },
    perfectVowel: 'َ',
    imperfectVowel: 'ُ'
}


//hollow waaw example
var verb = {
    letter1: 'ق',
    letter2: 'و',
    letter3: 'ل',
    type: {
        name: 'hollow',
        type: 'waaw'
    },
    perfectVowel: 'َ',
    imperfectVowel: 'ُ'
}

//geminate example
var verb = {
    letter1: 'د',
    letter2: 'ل',
    letter3: 'ل',
    type: {
        name: 'geminate'
    },
    perfectVowel: 'َ',
    imperfectVowel: 'ُ'
}


//defective waaw example
var verb = {
    letter1: 'د',
    letter2: 'ع',
    letter3: 'و',
    type: {
        name: 'defective',
        type: 'waaw'
    },
    perfectVowel: 'َ',
    imperfectVowel: 'ُ'
}

//defective yaa example
var verb = {
    letter1: 'م',
    letter2: 'ش',
    letter3: 'ي',
    type: {
        name: 'defective',
        type: 'yaa (aa-ii)'
    },
    perfectVowel: 'َ',
    imperfectVowel: 'ُ'
}


//defective yaa example 2
var verb = {
    letter1: 'ن',
    letter2: 'س',
    letter3: 'ي',
    type: {
        name: 'defective',
        type: 'yaa (ya-aa)'
    },
    perfectVowel: 'ِ',
    imperfectVowel: 'ُ'
}

// hamzated example
var verb = {
    letter1: 'ء',
    letter2: 'ك',
    letter3: 'ل',
    type: {
        name: 'hamzated'
    },
    perfectVowel: 'َ',
    imperfectVowel: 'ُ'
}

// hamzated example
var verb = {
    letter1: 'ق',
    letter2: 'ر',
    letter3: 'ء',
    type: {
        name: 'hamzated'
    },
    perfectVowel: 'َ',
    imperfectVowel: 'ُ'
}

// hamazated word examples

//var myWord = 'هَيْءَة';
//var myWord = 'سَءَلَتْ';
//var myWord = 'مُءَدِّب';
//var myWord = 'ءِسْلَام';
//var myWord = 'مُرُوْءَة';
//var myWord = 'رَءْس'
var myWord = 'مَءَاذِن';
;var verbApp = angular.module('verbApp');

// General verb related helper data
verbApp.constant('verbs', [

    // Sound
    {
        letter1: 'ك',
        letter2: 'ت',
        letter3: 'ب',
        type: {
            name: 'sound'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to write'
    },
    {
        letter1: 'ص',
        letter2: 'ع',
        letter3: 'ب',
        type: {
            name: 'sound'
        },
        perfectVowel: 'ُ',
        imperfectVowel: 'ُ',
        definition: 'to be difficult'
    },
    {
        letter1: 'ش',
        letter2: 'ر',
        letter3: 'ب',
        type: {
            name: 'sound'
        },
        perfectVowel: 'ِ',
        imperfectVowel: 'َ',
        definition: 'to drink'
    },
    {
        letter1: 'ع',
        letter2: 'م',
        letter3: 'ل',
        type: {
            name: 'sound'
        },
        perfectVowel: 'ِ',
        imperfectVowel: 'َ',
        definition: 'to work'
    },
    {
        letter1: 'د',
        letter2: 'ر',
        letter3: 'س',
        type: {
            name: 'sound'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to study'
    },

    // Geminate
    {
        letter1: 'د',
        letter2: 'ل',
        letter3: 'ل',
        type: {
            name: 'geminate'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to indicate'
    },
    {
        letter1: 'ظ',
        letter2: 'ن',
        letter3: 'ن',
        type: {
            name: 'geminate'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to think, believe'
    },
    {
        letter1: 'ت',
        letter2: 'م',
        letter3: 'م',
        type: {
            name: 'geminate'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ِ',
        definition: 'to be complete'
    },
    {
        letter1: 'و',
        letter2: 'د',
        letter3: 'د',
        type: {
            name: 'geminate'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'َ',
        definition: 'to want, to like'
    },
    {
        letter1: 'ظ',
        letter2: 'ل',
        letter3: 'ل',
        type: {
            name: 'geminate'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'َ',
        definition: 'to continue, remain'
    },


    // Defective waaw
    {
        letter1: 'د',
        letter2: 'ع',
        letter3: 'و',
        type: {
            name: 'defective',
            type: 'waaw'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to call'
    },
    {
        letter1: 'ن',
        letter2: 'ج',
        letter3: 'و',
        type: {
            name: 'defective',
            type: 'waaw'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to survive'
    },
    {
        letter1: 'م',
        letter2: 'ش',
        letter3: 'ي',
        type: {
            name: 'defective',
            type: 'yaa (aa-ii)'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to walk'
    },
    {
        letter1: 'ر',
        letter2: 'م',
        letter3: 'ي',
        type: {
            name: 'defective',
            type: 'yaa (aa-ii)'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to throw'
    },
    {
        letter1: 'ر',
        letter2: 'و',
        letter3: 'ي',
        type: {
            name: 'defective',
            type: 'yaa (aa-ii)'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to narrate, relate'
    },
    {
        letter1: 'ن',
        letter2: 'س',
        letter3: 'ي',
        type: {
            name: 'defective',
            type: 'yaa (ya-aa)'
        },
        perfectVowel: 'ِ',
        imperfectVowel: 'ُ',
        definition: 'to forget'
    },
    {
        letter1: 'ب',
        letter2: 'ق',
        letter3: 'ي',
        type: {
            name: 'defective',
            type: 'yaa (ya-aa)'
        },
        perfectVowel: 'ِ',
        imperfectVowel: 'ُ',
        definition: 'to stay, remain'
    },
    {
        letter1: 'ق',
        letter2: 'و',
        letter3: 'ل',
        type: {
            name: 'hollow',
            type: 'waaw'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to say'
    },
    {
        letter1: 'ز',
        letter2: 'و',
        letter3: 'ر',
        type: {
            name: 'hollow',
            type: 'waaw'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to visit'
    },
    {
        letter1: 'ل',
        letter2: 'و',
        letter3: 'م',
        type: {
            name: 'hollow',
            type: 'waaw'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to blame'
    },
    {
        letter1: 'ع',
        letter2: 'ي',
        letter3: 'ش',
        type: {
            name: 'hollow',
            type: 'yaa'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ِ',
        definition: 'to live'
    },
    {
        letter1: 'ب',
        letter2: 'ي',
        letter3: 'ع',
        type: {
            name: 'hollow',
            type: 'yaa'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ِ',
        definition: 'to sell'
    },
    {
        letter1: 'خ',
        letter2: 'و',
        letter3: 'ف',
        type: {
            name: 'hollow',
            type: 'alif'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'َ',
        definition: 'to fear'
    },
    {
        letter1: 'ن',
        letter2: 'و',
        letter3: 'م',
        type: {
            name: 'hollow',
            type: 'alif'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'َ',
        definition: 'to sleep'
    },
    // Assimilated
    {
        letter1: 'و',
        letter2: 'ص',
        letter3: 'ل',
        type: {
            name: 'assimilated'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ِ',
        definition: 'to arrive'
    },
    {
        letter1: 'و',
        letter2: 'ض',
        letter3: 'ع',
        type: {
            name: 'assimilated'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'َ',
        definition: 'to put, place'
    },
    {
        letter1: 'ي',
        letter2: 'س',
        letter3: 'ر',
        type: {
            name: 'assimilated'
        },
        perfectVowel: 'ِ',
        imperfectVowel: 'ِ',
        definition: 'to be easy'
    },
    {
        letter1: 'و',
        letter2: 'س',
        letter3: 'ع',
        type: {
            name: 'assimilated'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to be wide'
    },
    // Hamzated
    {
        letter1: 'ق',
        letter2: 'ر',
        letter3: 'ء',
        type: {
            name: 'hamzated'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'َ',
        definition: 'to read'
    },
    {
        letter1: 'س',
        letter2: 'ء',
        letter3: 'ل',
        type: {
            name: 'hamzated'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'َ',
        definition: 'to ask'
    },
    {
        letter1: 'أ',
        letter2: 'ك',
        letter3: 'ل',
        type: {
            name: 'hamzated'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to eat'
    },
    {
        letter1: 'ب',
        letter2: 'د',
        letter3: 'ء',
        type: {
            name: 'hamzated'
        },
        perfectVowel: 'َ',
        imperfectVowel: 'ُ',
        definition: 'to begin'
    },




])
;var app = angular.module('arabicSite');

app.config(function($stateProvider) {
    // For any unmatched url, redirect to /state1
    //$urlRouterProvider.otherwise("/home");

    // Now set up the states
    $stateProvider
        // This is the root state. Every other state is a child of this state (directly or indirectly).
        .state('main', {
            url: '/',
            templateUrl: '/components/root/templates/index.html',
            controller: 'rootCtrl'
        })

        .state('main.conjugationPractice', {
            url: '^/conjugation_practice',
            templateUrl: '/components/verb_app/templates/index.html',
            controller: 'verbAppCtrl'
        })

        .state('main.typingTutor', {
            url: '^/typing_tutor',
            templateUrl: '/components/typing_tutor/typing_tutor.html',
            controller: 'typingTutorCtrl'
        })

        .state('main.exercises', {
            url: '^/thackston_book_exercises',
            templateUrl: '/components/verb_app/templates/exercises.html',
            controller: 'exercisesCtrl'
        })

        .state('main.about', {
            url: '^/about',
            templateUrl: '/static/about.html'
        })

        .state('main.conjugation', {
            url: '^/conjugation',
            templateUrl: '/components/verb_app/templates/conjugation.html',
            controller: 'conjugatorCtrl'
        })





})
;var arabicSite = angular.module('arabicSite');

arabicSite.directive('appAlert', function(alertService) {
    return {
        restrict: 'E',
        templateUrl: '/shared/directives_alert_alert.html',
        scope: {},
        link: function (scope, elem, attrs) {
            scope.alertService = alertService;

            scope.hideModal = function() {
                //scope.alertObj.visible = false;
                scope.alertService.visible = false;
            }
        }

    }
});var arabicSite = angular.module('arabicSite');

arabicSite.factory('alertService', function() {
    var service = {};

    // The message to be displayed
    service.message;

    // The alert type, e.g. noMatches, setComplete
    service.type

    service.visible = false;

    service.set = function(type, message) {
        service.message = message;
        service.type = type;
        service.visible = true;
    }

    service.clear = function() {
        service.message = null;
        service.alertType = null;
        service.visible = false;
    }

    return service;
})