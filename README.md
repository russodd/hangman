# Hangman

## Design

This project consists of two parts: a React client (located in the `client` folder) and a Node.js backend API (located in the `api` folder).  If you wish to clone it and try it out for yourself, you'll need to run `npm install` in both the `client` and the `api` directories to install the necessary node modules before either app can run (the app was built with node v14.0.0).  Once the node modules are set up, you can run `npm start` in the `client` directory to start the client (which runs on port 3000), and in the `api` directory to start the API (which runs on port 9000).

Here's my plan for writing the program:

1. Set up a React project containing a static version of the site, displaying several blanks, the number of turns remaining, a textbox for entering guesses, and "Guess", "Undo", and "New Game" buttons.

2. Set up a Node.js project with a `load` endpoint that will eventually return a game state specified by an ID that's passed to it, but which will initially just return dummy JSON data representing a new game with a blank six-letter word. The data structure will look like this:

```
{
    "id": 0, // an integer representing the current game state, which can be added to the client URL in order to call up a particular game state at any time.
    "letters": ["_", "_", "_", "_", "_", "_"],  // The correctly-guessed letters of the word, with blanks representing letters that havent been found yet
    "correctGuesses": [],   // The letters the user has guessed correctly
    "incorrectGuesses": [], // The letters the user has guessed incorrectly
    "guessesLeft": 8,   // The number of incorrect guesses the player has left
    "gameComplete": false,  // A flag for whether the current game is in a completed state
    "hasWordsRemaining": true,  // A flag showing whether there are any more words left to guess at after the current one
    "prevMove": null    // The game state ID of the player's previous move, or null when the player is starting a brand-new game
}
```

3. Wire up the client to display data from the API's `load` endpoint (the dummy data, for now) instead of static data.

4. Set up the API to load actual words, chosen at random from a list, into a data structure similar to the one above, except with an extra field called `remainingWords`, that keeps track of which words the player hasn't tried to guess yet (and which we don't want the user to be able to see on the client side, since it would give them the ability to eventually figure out which order the words will appear in), and an extra field called `letterLookup` that stores a dictionary of positions for all the letters in the word.  The `letters` array will represent the actual number of blanks needed for the word, and the `id` will contain an MD5 hash string generated using all of the other values in the game state data structure.  A dictionary with game state IDs as keys and game state data structures as values will keep track of new game states as they're created.

5. Set up the client to handle game state IDs in its URL, calling the `load` endpoint with their values. Also, display a bookmarkable/sharable link for the current game state, and wire up the "Undo" button to call the `load` endpoint with the the value of the current state's `prevMove`.

6. Implement an API endpoint called `guess`, which will take a string argument representing the current game state ID and a second string argument representing the player's guess (either a letter or an entire word).  It will also return a new game state, like the `load` endpoint does, reflecting the result of the player's move, with a `"prevMove"` value matching the game state ID that was passed as an argument to the `guess` endpoint.  This new game state will be added to the game state dictionary.

7. Wire up the `guess` endpoint to the "Guess" button on the client side.  Configure the UI to display "Game Over!" or "You got all the words!" messages when appropriate.

8. Deploy the API and client using AWS.