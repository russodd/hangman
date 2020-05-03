import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import './App.css';
import Hangman from './Hangman';

function App() {
  return (
    <Router>
      <Route path="/" component={Hangman} />
    </Router>
  );
}

export default App;
