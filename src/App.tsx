import React, { useState, useEffect } from 'react';
import './PeriodicTableGame.css';
import ElementData from './ElementData.json'; // Import element data

const PeriodicTableGame = () => {
  const [currentElement, setCurrentElement] = useState(null);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("easy"); // Default difficulty
  const [timer, setTimer] = useState(60); // Initial timer value
  const [gameOver, setGameOver] = useState(false);


  const difficulties = {
    "easy": { numElements: 10, time: 60 },
    "medium": { numElements: 25, time: 45 },
    "hard": { numElements: Object.keys(ElementData).length, time: 30 }, // All elements
  };

  useEffect(() => {
    startGame();
  }, [difficulty]);

  useEffect(() => {
      let intervalId;
      if (timer > 0 && !gameOver) {
          intervalId = setInterval(() => {
              setTimer((prevTimer) => prevTimer - 1);
          }, 1000);
      } else if (timer === 0) {
          clearInterval(intervalId);
          setGameOver(true);
      }
      return () => clearInterval(intervalId); // Clear interval on unmount or difficulty change
  }, [timer, gameOver]);


  const startGame = () => {
    setScore(0);
    setTimer(difficulties[difficulty].time);
    setGameOver(false);
    pickNewElement();
  };


  const pickNewElement = () => {
      const availableElements = Object.keys(ElementData).filter(symbol => ElementData[symbol].number <= difficulties[difficulty].numElements);
      const randomIndex = Math.floor(Math.random() * availableElements.length);
      const randomSymbol = availableElements[randomIndex];
      setCurrentElement(ElementData[randomSymbol]);
  };

  const handleClick = (symbol) => {
    if (!gameOver) { // Check for game over
        if (symbol === currentElement.symbol) {
          setScore(score + 1);
          pickNewElement();
        } else {
          // Handle incorrect click (optional: decrement score, show feedback)
          console.log("incorrect");
        }
    }
  };

  const renderPeriodicTable = () => {
    return (
      <div className="periodic-table">
          {Object.keys(ElementData).map(symbol => (
              <div
                  key={symbol}
                  className={`element ${ElementData[symbol].category}`}
                  onClick={() => handleClick(symbol)}
                  style={{
                      gridColumnStart: ElementData[symbol].col,
                      gridRowStart: ElementData[symbol].row,
                  }}
              >
                  {symbol}
              </div>
          ))}

      </div>
    );
  };


  return (
    <div className="game-container">
      <h1>Periodic Table Game</h1>

      <div>
        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>


      {gameOver ? (
        <div className="game-over">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button onClick={startGame}>Play Again</button>
        </div>
      ) : (
        <>
           <div>
               Time Left: {timer} seconds
           </div>
           <p>Find: {currentElement ? currentElement.name : ""}</p>
           {renderPeriodicTable()}
           <p>Score: {score}</p>
        </>
      )}
    </div>
  );
};

export default PeriodicTableGame;
