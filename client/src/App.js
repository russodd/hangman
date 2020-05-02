import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div class="app">
      <div class="title">HANGMAN</div>
      <div class="blanks">_ _ _ _ _ _</div>
      <div class="guesses">You have 8 guesses remaining.</div>
      <form>
        <input type="text" class="guess-textbox" />
        <input type="submit" value="Guess" class="guess-button" />
      </form>
      <button type="button" class="undo-button">Undo</button>
      <button type="button" class="new-game-button">New Game</button>
    </div>
  );
}

export default App;
