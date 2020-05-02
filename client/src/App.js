import React, { Component } from 'react';
import './App.css';

const config = require('./config.json');
const HANGMAN_BACKEND = config.hangman_backend;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: {}
    };
  }

  renderLetters() {
    if (this.state.gameState.letters) {
      return (
        <div>
          {this.state.gameState.letters.map((letter, idx) => {
            return (
              <span key={idx}>{letter} </span>
            );
          })}
        </div>
      );
    } else {
      return <div>Loading word...</div>;
    }
  }

  // Load the current game state
  loadGameState() {
    fetch(HANGMAN_BACKEND + 'hangman/load')
      .then(res => res.json())
      .then(res => this.setState({ gameState: res }))
      .catch(err => err);
  }

  componentDidMount() {
    this.loadGameState();
  }

  render() {
    return (
      <div className="app">
        <div className="title">HANGMAN</div>
        <div className="letters">{this.renderLetters()}</div>
        <div className="guesses">You have {this.state.gameState.guessesLeft || 0} guesses remaining.</div>
        <form>
          <input type="text" className="guess-textbox" />
          <input type="submit" value="Guess" className="guess-button" />
        </form>
        <button type="button" className="undo-button">Undo</button>
        <button type="button" className="new-game-button">New Game</button>
      </div>
    );
  }
}

export default App;
