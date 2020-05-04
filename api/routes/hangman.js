var express = require('express');
var crypto = require('crypto');
var router = express.Router();

const WORDS = require('../public/data/words.json').words;
const GUESSES_PER_GAME = 8; // The number of incorrect guesses that will cause the player to lose
const GAME_STATE_TEMPLATE = {   // A template for a new game state (representing the start of a game by default)
    // (fields that need to be added separately are written as comments)
    // "wordsRemaining": [], an array of indices for words that haven't been guessed yet
    // "letterLookup": {}, a dictionary with the letters in the current word as keys and their indices as values
    // "id": 0, an integer representing the current game state, which can be added to the client URL in order to call up a particular game state at any time.
    "letters": [],  // The correctly-guessed letters of the word, with blanks representing letters that havent been found yet
    "correctGuesses": [],   // The letters the user has guessed correctly
    "incorrectGuesses": [], // The letters the user has guessed incorrectly
    "guessesLeft": GUESSES_PER_GAME,   // The number of incorrect guesses the player has left
    "gameComplete": false,  // A flag for whether the current game is in a completed state
    "hasWordsRemaining": true,  // A flag showing whether there are any more words left to guess at after the current one
    "prevMove": null    // The game state ID of the player's previous move, or null when the player is starting a brand-new game
};

const gameStates = {};

// Create an array that stores the indices of all the words in a random order
function createRemainingWordsArray() {
    const numArray = [];    // An array of all the word indices
    const wordArray = [];   // An array with word indices in random order

    for (let i = 0; i < WORDS.length; i++) {
        numArray.push(i);
    }

    while (numArray.length > 0) {
        wordArray.push(numArray.splice(Math.floor(Math.random() * numArray.length), 1)[0]);
    }

    return wordArray;
}

function startNewGame(prevState) {
    // Make a deep copy of the template, since we don't want to modify it
    const newGameState = JSON.parse(JSON.stringify(GAME_STATE_TEMPLATE));

    if (!prevState) {
        // When starting from scratch, the order in which the words will appear needs to be chosen
        newGameState.wordsRemaining = createRemainingWordsArray();
    } else {
        // Otherwise, use the passed state as the previous state
        newGameState.wordsRemaining = JSON.parse(JSON.stringify(prevState.wordsRemaining));
        newGameState.prevMove = prevState.id;
    }

    // Get a new word from the list of words remaining
    const currentWordString = WORDS[newGameState.wordsRemaining.pop()];
    const currentWordLetters = currentWordString.split('');
    
    newGameState.letterLookup = {};

    // Put all of the new word's letters into a dictionary, and create blanks for them
    currentWordLetters.forEach((letter, idx) => {
        if (!newGameState.letterLookup[letter]) {
            newGameState.letterLookup[letter] = [idx];
        } else {
            newGameState.letterLookup[letter].push(idx);
        }
        newGameState.letters.push('_');
    });

    // Create an MD5 hash to be used as a game state ID
    newGameState.id = crypto.createHash('md5').update(JSON.stringify(newGameState)).digest('hex');
    console.log('New game ID: '+newGameState.id);

    return newGameState;
}

// Return a copy of the given game state that has the hidden fields (wordsRemaining and letterLookup) removed
function stripHiddenFields(gameState) {
    return {
        id: gameState.id,
        letters: gameState.letters,
        correctGuesses: gameState.correctGuesses,
        incorrectGuesses: gameState.incorrectGuesses,
        guessesLeft: gameState.guessesLeft,
        gameComplete: gameState.gameComplete,
        hasWordsRemaining: gameState.hasWordsRemaining,
        prevMove: gameState.prevMove
    };
}

// Load hangman game state data from a given ID
// Arguments:
// state - a valid game state ID
router.get('/load', function(req, res, next) {
    if (req.query.state) {
        const gameState = gameStates[req.query.state];
        if (gameState) {
            res.send(stripHiddenFields(gameState));
        } else {
            throw new Error('Invalid game state: ' + req.query.state);
        }
    } else {
        const gameState = startNewGame();
        // Add the new game state to the dictionary of game states
        gameStates[gameState.id] = gameState;
        // Return the game state
        res.send(stripHiddenFields(gameState));
    }
});

// Load the result of a guess, or of creating a new game (if no guess is given and the current game state is an endgame)
// Arguments:
// state - a valid game state ID
// guess - a single character, or a string representing a whole word guess
router.get('/guess', function(req, res, next) {
    const gameState = req.query.state ? gameStates[req.query.state] : null;
    // Normalize guesses to all caps
    const guess = req.query.guess ? req.query.guess.toUpperCase() : null;

    if (!gameState) {
        throw new Error('Invalid game state: ' + req.query.state);
    }

    let newGameState = null;

    if (gameState.guessesLeft === 0) {
        throw new Error ('No guesses remaining');
    }

    if (gameState.gameComplete === true) {
        // A new game
        if (!gameState.hasWordsRemaining) {
            throw new Error('There are no words remaining');
        }
        newGameState = startNewGame(gameState.id);
    } else {
        if (!guess) {
            throw new Error('No guess argument found');
        }
        // Make a deep copy of the current game state
        newGameState = JSON.parse(JSON.stringify(gameState));
        // Strip out its ID
        newGameState.id = undefined;
        if (guess.length === 1) {
            // A letter guess
            if (gameState.letterLookup[guess]) {
                // A correct guess
                newGameState.letterLookup[guess].forEach(pos => {
                    newGameState.letters[pos] = guess;
                });
                if (newGameState.letters.indexOf('_') < 0) {
                    newGameState.gameComplete = true;
                }if (newGameState.wordsRemaining.length === 0) {
                    newGameState.hasWordsRemaining = false;
                }
            } else {
                // An incorrect guess
                newGameState.incorrectGuesses.push(guess);
                newGameState.guessesLeft--;
                if (newGameState.guessesLeft === 0) {
                    newGameState.gameComplete = true;
                }
            }
        } else {
            // A whole word guess
            let correct = true;
            // Check that every letter in the guess is where it should be
            guess.split('').forEach((letter, idx) => {
                if (newGameState.letterLookup[letter].indexOf(idx) < 0) {
                    correct = false;
                }
            });
            // Regardless of whether the guess is correct or incorrect, the game will be complete
            newGameState.gameComplete = true;
            if (correct) {
                // The word was guessed correctly
                guess.split('').forEach((letter, idx) => {
                    newGameState.letters[idx] = letter;
                });
            } else {
                // The word was guessed incorrectly
                newGameState.incorrectGuesses.push(guess);
                newGameState.guessesLeft = 0;
            }
        }
        // Create an MD5 hash to be used as a game state ID
        newGameState.id = crypto.createHash('md5').update(JSON.stringify(newGameState)).digest('hex');
    }

    // Add the new game state to the dictionary of game states
    gameStates[newGameState.id] = newGameState;
    // Return the new game state
    res.send(stripHiddenFields(newGameState));
});

module.exports = router;
