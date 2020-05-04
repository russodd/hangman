# Hangman

## Design

This project consists of two parts: a React client (located in the `client` folder) and a Node.js backend API (located in the `api` folder).  If you wish to clone it and try it out for yourself, you'll need to run `npm install` in both the `client` and the `api` directories to install the necessary node modules before either app can run (the app was built with node v14.0.0).  Once the node modules are set up, you can run `npm start` in the `api` directory to start the API (which runs on port 3000), and in the `client` directory to start the client (which also runs on port 3000 by default, but which can be switched to port 3001 by saying yes when prompted).

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

## Validation

1. **Rules:** The game behaves as described in the rules, with the words being chosen from a randomized list, one by one, eight incorrect guesses per word, game over when a player runs out of guesses or guesses the entire word wrong, and the player being told that they have won when they either guess all the correct letters without running out of guesses or they guess the entire word at once.

2. **New Game:** A "New Game" button appears when the user is able to start a new game (after they have just won a game).

3. **Bookmarkable Turns** This one ended up being sort of a fudge, since I ran out of time.  The user can bookmark the shareable URL at the bottom of the page if they would like to return to their current turn later.

4. **Sharing:** The same URL mentioned above for bookmarking can also be shared and used by anyone else.

5. **Undo:** An "Undo" button appears whenever the player is able to undo their actions (on any turn besides the first one).

6. **Standards:** I was able to test the app successfully on current versions of Chrome, Safari, and Firefox.

7. **Security:** The client has no information about what the words being guessed are, besides what it displays to the user.  All game states are represented by MD5 hashes generated on the server side.  The server stores all data about the words in memory, and decides the outcome of each turn.

8. **Proxy-Friendly:** I see no reason why the app shouldn't work behind a caching HTTP reverse-proxy.

9. **No Other Software/Storage:** All information generated on the server side is stored in memory.