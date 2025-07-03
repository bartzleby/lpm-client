import React, { useState } from 'react';
import './ActionBar.css';

function ActionBar({ hand, currentPlayer, onAction, pot, bigBlind, smallBlind, dealerPosition, isHandOver, winningPlayer, onSaveHand }) {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(0);

  // If hand is over, show winning message and save option
  if (isHandOver && winningPlayer) {
    return (
      <div className="action-section compact">
        <div className="action-buttons">
          <button 
            className="action-button save-hand"
            onClick={onSaveHand}
          >
            💾 {winningPlayer.name} wins ${pot}! Save Hand
          </button>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    console.log('ActionBar: No current player received');
    return (
      <div className="action-section compact">
        <div className="action-buttons">
          <div className="waiting-message">Waiting for hand to start...</div>
        </div>
      </div>
    );
  }

  console.log(`ActionBar: Current player is ${currentPlayer.name} at position ${currentPlayer.position}`);

  // Initialize all variables first
  const callAmount = bigBlind || 0;
  const initialPot = smallBlind + bigBlind;

  const handleAction = (actionType, amount = null) => {
    if (onAction) {
      onAction(actionType, amount);
    }
    // Reset all inputs
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  const handleRaiseClick = () => {
    // Calculate default raise (3x the bet being faced)
    const betToCall = bigBlind || 0;
    const defaultRaise = betToCall * 3;
    setRaiseAmount(defaultRaise);
    setShowRaiseSlider(true);
  };

  const handleRaiseSubmit = () => {
    if (raiseAmount > 0) {
      handleAction('raise', raiseAmount);
    }
  };

  const handleCancelRaise = () => {
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  // Big Blind Option Logic
  const isBigBlindOption = () => {
    if (!currentPlayer || dealerPosition === undefined) return false;
    
    const bigBlindPosition = (dealerPosition + 2) % 9;
    const playerIsBigBlind = currentPlayer.position === bigBlindPosition;
    
    // BB gets option when they are BB and pot shows no raises
    return playerIsBigBlind && pot <= initialPot + (bigBlind * 7);
  };
  
  // Regular players face action when there's a bet to call
  // But BB doesn't "face action" during their option - they can check
  const needsToCall = pot > 0 && !isBigBlindOption();
  
  // Calculate slider bounds for raises
  const minRaise = callAmount * 2;
  const maxRaise = currentPlayer ? currentPlayer.chips : callAmount * 10;

  // Show raise slider instead of main buttons
  if (showRaiseSlider) {
    return (
      <div className="action-section compact">
        <div className="raise-slider-section">
          <div className="raise-info">
            <span>Raise to: ${raiseAmount}</span>
            <span className="raise-detail">+${raiseAmount - callAmount} more</span>
          </div>
          <input
            type="range"
            className="raise-slider"
            min={minRaise}
            max={maxRaise}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
            step={smallBlind}
          />
          <div className="slider-labels">
            <span>Min: ${minRaise}</span>
            <span>Max: ${maxRaise}</span>
          </div>
          <div className="action-buttons raise-actions">
            <button 
              className="action-button cancel"
              onClick={handleCancelRaise}
            >
              Cancel
            </button>
            <button 
              className="action-button raise-submit"
              onClick={handleRaiseSubmit}
            >
              Raise to ${raiseAmount}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-section compact">
      {/* Main action buttons - one row only */}
      <div className="action-buttons main-actions">
        {needsToCall ? (
          // Facing a bet that requires calling: fold, call, raise
          <>
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
              onClick={handleRaiseClick}
            >
              Raise
            </button>
          </>
        ) : isBigBlindOption() ? (
          // Big blind option (everyone folded/called): check or raise
          <>
            <button 
              className="action-button check"
              onClick={() => handleAction('check')}
              style={{ flex: 1.5 }}
            >
              Check
            </button>
            
            <button 
              className="action-button raise"
              onClick={handleRaiseClick}
              style={{ flex: 1 }}
            >
              Raise
            </button>
          </>
        ) : (
          // No bet to face (everyone checked): check, bet
          <>
            <button 
              className="action-button check"
              onClick={() => handleAction('check')}
            >
              Check
            </button>
            
            <button 
              className="action-button bet"
              onClick={() => handleAction('bet', bigBlind)}
            >
              Bet ${bigBlind}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ActionBar;