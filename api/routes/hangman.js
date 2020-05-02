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
    "gameLost": false, // A flag saying whether the player has lost the game
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

    // Add the new game state to the dictionary of game states
    gameStates[newGameState.id] = newGameState;

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
        gameLost: gameState.gameLost,
        hasWordsRemaining: gameState.hasWordsRemaining,
        prevMove: gameState.prevMove
    };
}

// Load hangman game state data from a given ID
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
        res.send(stripHiddenFields(gameState));
    }
});

module.exports = router;
