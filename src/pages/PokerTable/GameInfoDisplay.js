// GameInfoDisplay.js - Display game information

import React from 'react';

const GameInfoDisplay = ({ 
  gameConfig, 
  currentStreet, 
  remainingPlayersCount 
}) => {
  return (
    <div className="game-info">
      {gameConfig.isTournament ? 'Tournament' : 'Cash Game'}<br/>
      SB: ${gameConfig.smallBlind} | BB: ${gameConfig.bigBlind}<br/>
      Street: {currentStreet}<br/>
      Players: {remainingPlayersCount}
      {gameConfig.ante > 0 && <><br/>Ante: ${gameConfig.ante}</>}
      {gameConfig.isTournament && gameConfig.bigBlindAnte > 0 && (
        <><br/>BB Ante: ${gameConfig.bigBlindAnte}</>
      )}
    </div>
  );
};

export default GameInfoDisplay;