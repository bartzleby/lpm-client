import React, { useState } from 'react';
import './ActionBar.css';

// TODO: alot of these props are encapsulated in currentHand
function ActionBar({ dealerSeat, bigBlindAmount, currentPlayer, currentBet, onAction, isHandOver, winningPlayer, onSaveHand }) {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(0);

  // If hand is over, show winning message and save option
  // TODO: fix pot amount
  if (isHandOver && winningPlayer) {
    return (
      <div className="action-section compact">
        <div className="action-buttons">
          <button 
            className="action-button save-hand"
            onClick={onSaveHand}
          >
            💾 {winningPlayer.name} wins ${42}! Save Hand
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

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
    // Reset all inputs
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  const handleRaiseClick = () => {
    // Calculate default raise (3x the bet being faced)
    const defaultRaise = currentBet * 3;
    setRaiseAmount(defaultRaise);
    setShowRaiseSlider(true);
  };

  const handleRaiseSubmit = () => {
    if (raiseAmount > 0) {
      handleAction({
        number: 1,
        playerId: 0,
        action: 'raise',
        amount: raiseAmount,
        isAllIn: false,
        cards: []
      });
    }
  };

  const handleCancelRaise = () => {
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  // Big Blind Option Logic
  const isBigBlindOption = () => {
    if (!currentPlayer || dealerSeat-1 === undefined) return false;
    
    const bigBlindPosition = (dealerSeat-1 + 2) % 9;
    const playerIsBigBlind = currentPlayer.position === bigBlindPosition;
    
    // BB gets option when they are BB and pot shows no raises
    return playerIsBigBlind && currentPlayer.proffered == currentBet;
  };
  
  // Regular players face action when there's a bet to call
  // But BB doesn't "face action" during their option - they can check
  const needsToCall = currentPlayer.proffered < currentBet ? true : false;
  console.log(`${currentPlayer.name} needs to call ${needsToCall}`);
  
  // Calculate slider bounds for raises
  const minRaise = currentBet * 2;
  const maxRaise = currentPlayer ? currentPlayer.chips : currentBet * 10;

  // Show raise slider instead of main buttons
  if (showRaiseSlider) {
    return (
      <div className="action-section compact">
        <div className="raise-slider-section">
          <div className="raise-info">
            <span>Raise to: ${raiseAmount}</span>
            <span className="raise-detail">+${raiseAmount - currentBet} more</span>
          </div>
          <input
            type="range"
            className="raise-slider"
            min={minRaise}
            max={maxRaise}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
            step={bigBlindAmount}
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
              onClick={() => handleAction({
                number: 1,
                playerId: 1,
                action: 'fold',
                amount: 0,
                isAllIn: false,
                cards: []
              })}
            >
              Fold
            </button>
            
            <button 
              className="action-button call"
              onClick={() => handleAction({
                number: 1,
                playerId: 1,
                action: 'call',
                amount: currentBet,
                isAllIn: false,
                cards: []
              })}
            >
              Call ${currentBet - currentPlayer.proffered}
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
              onClick={() => handleAction({
                number: 1,
                playerId: 1,
                action: 'check',
                amount: 0,
                isAllIn: false,
                cards: []
              })}
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
              onClick={() => handleAction({
                number: 1,
                playerId: 1,
                action: 'check',
                amount: 0,
                isAllIn: false,
                cards: []
              })}
            >
              Check
            </button>
            
            <button 
              className="action-button bet"
              onClick={() => handleAction({
                number: 1,
                playerId: 1,
                action: 'bet',
                amount: currentBet,
                isAllIn: false,
                cards: []
              })}
            >
              Bet ${currentBet}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ActionBar;