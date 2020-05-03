import React, { useState, useEffect } from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';

const config = require('./config.json');
const HANGMAN_FRONTEND = config.hangman_frontend;
const HANGMAN_BACKEND = config.hangman_backend;
const HANGMAN_LOAD_ENDPOINT = 'hangman/load';

function Hangman() {
    const [gameState, setGameState] = useState({});
    let params = new URLSearchParams(useLocation().search);
    const currentStateId = params.get('state');
 
    useEffect(() => {
        loadState(currentStateId);
    }, [currentStateId]);

    function loadState(stateId = null) {
        let loadUrl = HANGMAN_BACKEND + HANGMAN_LOAD_ENDPOINT;

        if (stateId) {
            loadUrl += '?state=' + stateId;
        }

        fetch(loadUrl)
            .then(res => res.json())
            .then(res => setGameState(res))
            .catch(err => alert(err.message));
    }

    function renderLetters() {
        if (gameState.letters) {
        return (
            <div>
            {gameState.letters.map((letter, idx) => {
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

    function renderIncorrectGuesses() {
        if (gameState.incorrectGuesses && gameState.incorrectGuesses.length > 0) {
            return <div>Incorrect guesses: 
                {gameState.incorrectGuesses.map((guess, idx) => {
                return idx === gameState.incorrectGuesses.length - 1 ? guess : guess + ', ';
            })}
            </div>
        }
    }

    function renderUndo() {
        if (gameState.prevMove) {
            return <button type="button" className="undo-button" onClick={loadState(gameState.prevMove)}>Undo</button>;
        } else {
            return '';
        }
    }

    function renderNewGame() {
        if (gameState.gameComplete && gameState.hasWordsRemaining) {
            return <button type="button" className="new-game-button">New Game</button>;
        } else {
            return '';
        }
    }

    return (
        <div className="hangman-app">
            <div className="title">HANGMAN</div>
            <div className="letters">{renderLetters()}</div>
            <div className="incorrect">{renderIncorrectGuesses()}</div>
            <div className="guesses">You have {gameState.guessesLeft || 0} guesses remaining.</div>
            <form>
                <input type="text" className="guess-textbox" />
                <input type="submit" value="Guess" className="guess-button" />
            </form>
            <div>
                <span>{renderUndo()}</span>
                <span>{renderNewGame()}</span>
            </div>
            <div>Share your game: {HANGMAN_FRONTEND + '?state=' + currentStateId}</div>
        </div>
    );
}

export default Hangman;
