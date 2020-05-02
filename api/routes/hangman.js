var express = require('express');
var router = express.Router();

// Load hangman game state data from a given ID
router.get('/load', function(req, res, next) {
  res.send({
    "id": 0, // an integer representing the current game state, which can be added to the client URL in order to call up a particular game state at any time.
    "letters": ["_", "_", "_", "_", "_", "_"],  // The correctly-guessed letters of the word, with blanks representing letters that havent been found yet
    "guessesLeft": 8,   // The number of incorrect guesses the player has left
    "gameComplete": false,  // A flag for whether the current game is in a completed state
    "gameLost": false, // A flag saying whether the player has lost the game
    "wordsRemaining": true,  // A flag showing whether there are any more words left to guess at after the current one
    "prevMove": null    // The game state ID of the player's previous move, or null when the player is starting a brand-new game
  });
});

module.exports = router;
