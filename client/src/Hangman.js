import React, { useState, useEffect } from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';

const config = require('./config.json');
const HANGMAN_FRONTEND = config.hangman_frontend;
const HANGMAN_BACKEND = config.hangman_backend;
const HANGMAN_LOAD_ENDPOINT = 'hangman/load';
const HANGMAN_GUESS_ENDPOINT = 'hangman/guess';

function Hangman() {
    const [gameState, setGameState] = useState({});
    const [guess, setGuess] = useState('');
    let params = new URLSearchParams(useLocation().search);
    const currentStateId = params.get('state');
 
    useEffect(() => {
        if (!gameState.id) {
            loadState(currentStateId);
        }
    }, [gameState.id, currentStateId]);

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

    function renderGuessesLeft() {
        if (gameState.guessesLeft > 0 && gameState.gameComplete) {
            return <div>You win!</div>;
        } else if (gameState.guessesLeft > 0) {
            return <div className="guesses">You have {gameState.guessesLeft} guesses remaining.</div>;
        } else {
            return <div>Game over!</div>;
        }
    }

    function handleGuessUpdate(event) {
        setGuess(event.target.value);
    }

    function callGuessEndpoint(useGuess = true) {
        let guessUrl = HANGMAN_BACKEND + HANGMAN_GUESS_ENDPOINT + '?state=' + gameState.id;

            if (useGuess) {
                guessUrl += '&guess=' + guess;
            }

            fetch(guessUrl)
                .then(res => res.json())
                .then(res => setGameState(res))
                .catch(err => alert(err.message));
    }

    function handleSubmitGuess(event) {
        if (!guess) {
            alert('Please guess a letter, or the whole word');
        } else {
            callGuessEndpoint();
            setGuess('');
        }
        
        event.preventDefault();
    }

    function renderGuess() {
    if (!gameState.gameComplete) {
            return (
                <form onSubmit={handleSubmitGuess}>
                    <input type="text" className="guess-textbox" value={guess} onChange={handleGuessUpdate} />
                    <input type="submit" value="Guess" className="guess-button" />
                </form>
            );
        } else {
            return '';
        }
    }

    function handleUndo() {
        loadState(gameState.prevMove);
    }

    function renderUndo() {
        if (gameState.prevMove) {
            return <button type="button" className="undo-button" onClick={handleUndo}>Undo</button>;
        } else {
            return '';
        }
    }

    function handleNewGame() {
        callGuessEndpoint(false);
    }

   function renderNewGame() {
        if (gameState.guessesLeft > 0 && gameState.gameComplete && gameState.hasWordsRemaining) {
            return <button type="button" className="new-game-button" onClick={handleNewGame}>New Game</button>;
        } else {
            return '';
        }
    }

    return (
        <div className="hangman-app">
            <div className="title">HANGMAN</div>
            <div className="letters">{renderLetters()}</div>
            <div className="incorrect">{renderIncorrectGuesses()}</div>
            <div className="guesses">{renderGuessesLeft()}</div>
            <div>{renderGuess()}</div>
            <div>
                <span>{renderUndo()}</span>
                <span>{renderNewGame()}</span>
            </div>
            <div>Bookmark or share your game: {HANGMAN_FRONTEND + '?state=' + gameState.id}</div>
        </div>
    );
}

export default Hangman;
