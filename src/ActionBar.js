import React, { useState } from 'react';
import './ActionBar.css';

function ActionBar({ hand, currentPlayer, onAction, pot, bigBlind, smallBlind }) {
  const [customBetAmount, setCustomBetAmount] = useState('');
  const [showCustomBet, setShowCustomBet] = useState(false);

  if (!currentPlayer) {
    return (
      <div className="action-section">
        <div className="active-player-display">
          Waiting for hand to start...
        </div>
      </div>
    );
  }

  const handleAction = (actionType, amount = null) => {
    if (onAction) {
      onAction(actionType, amount);
    }
    // Reset custom bet input
    setCustomBetAmount('');
    setShowCustomBet(false);
  };

  const handleCustomBet = () => {
    const amount = parseFloat(customBetAmount);
    if (amount && amount > 0) {
      handleAction('bet', amount);
    }
  };

  const callAmount = bigBlind || 0; // Simplified - in real app this would be the amount to call

  return (
    <div className="action-section">
      <div className="active-player-display">
        Action: {currentPlayer.name}
      </div>
      
      <div className="action-buttons">
        <button 
          className="action-button fold"
          onClick={() => handleAction('fold')}
        >
          Fold
        </button>
        
        <button 
          className="action-button call"
          onClick={() => handleAction('call', callAmount)}
        >
          Call ${callAmount}
        </button>
        
        <button 
          className="action-button raise"
          onClick={() => handleAction('raise', bigBlind * 2)}
        >
          Raise ${bigBlind * 2}
        </button>
        
        <button 
          className="action-button custom-bet"
          onClick={() => setShowCustomBet(!showCustomBet)}
        >
          Custom Bet
        </button>
      </div>
      
      {showCustomBet && (
        <div className="custom-bet-section">
          <input
            type="number"
            className="custom-bet-input"
            placeholder="Bet amount"
            value={customBetAmount}
            onChange={(e) => setCustomBetAmount(e.target.value)}
            min={bigBlind}
            step={smallBlind}
          />
          <button 
            className="action-button custom-bet"
            onClick={handleCustomBet}
            disabled={!customBetAmount || parseFloat(customBetAmount) <= 0}
          >
            Bet ${customBetAmount || '0'}
          </button>
        </div>
      )}
      
      <div className="hand-progress">
        <div>Pot: ${pot}</div>
        {hand && (
          <>
            <div>Hand #{hand.GameNumber || 'Active'}</div>
            <div>Players: {hand.players?.length || 0}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default ActionBar;