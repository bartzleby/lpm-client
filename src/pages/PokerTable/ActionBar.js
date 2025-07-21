import React, { useState } from 'react';
import './ActionBar.css';

function ActionBar({ 
  dealerSeat, 
  bigBlindAmount, 
  currentPlayer, 
  currentBet,
  currentStreet,
  playersInHand,
  onAction, 
  isHandOver, 
  winningPlayer, 
  onSaveHand 
}) {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(0);

  // If hand is over, show winning message and save option
  if (isHandOver && winningPlayer) {
    const potAmount = calculatePotAmount(playersInHand);
    return (
      <div className="action-section compact">
        <div className="action-buttons">
          <button 
            className="action-button save-hand"
            onClick={onSaveHand}
          >
            💾 {winningPlayer.name} wins ${potAmount}! Save Hand
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
  console.log(`Current street: ${currentStreet}, current bet: ${currentBet}, player proffered: ${currentPlayer.proffered}`);

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
    // Reset all inputs
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  const handleRaiseClick = () => {
    // Calculate default raise amount based on current bet
    const minRaise = currentBet === 0 ? bigBlindAmount : currentBet * 2;
    setRaiseAmount(minRaise);
    setShowRaiseSlider(true);
  };

  const handleRaiseSubmit = () => {
    if (raiseAmount > 0) {
      handleAction({
        type: 'raise',
        amount: raiseAmount,
        allIn: raiseAmount >= currentPlayer.chips
      });
    }
  };

  const handleCancelRaise = () => {
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

  // Calculate pot amount for display
  function calculatePotAmount(players) {
    return players.reduce((total, player) => total + (player.proffered || 0), 0);
  }

  // Determine if player is facing a bet they need to call
  const needsToCall = currentPlayer.proffered < currentBet;
  
  // Big Blind Option Logic - only applies preflop when BB faces no raises
  const isBigBlindOption = () => {
    if (!currentPlayer || dealerSeat === undefined || currentStreet !== 'preflop') return false;
    
    const bigBlindPosition = (dealerSeat + 1) % 9; // BB is +2 from dealer, but dealerSeat is 1-indexed
    const playerIsBigBlind = currentPlayer.position === bigBlindPosition;
    
    // BB gets option when they are BB and facing only calls/folds (no raises)
    return playerIsBigBlind && currentPlayer.proffered === currentBet;
  };
  
  console.log(`${currentPlayer.name} needs to call: ${needsToCall}, is BB option: ${isBigBlindOption()}`);
  
  // Calculate slider bounds for raises
  const minRaise = currentBet === 0 ? bigBlindAmount : currentBet * 2;
  const maxRaise = currentPlayer.chips;

  // Show raise slider instead of main buttons
  if (showRaiseSlider) {
    return (
      <div className="action-section compact">
        <div className="raise-slider-section">
          <div className="raise-info">
            <span>Raise to: ${raiseAmount}</span>
            <span className="raise-detail">+${Math.max(0, raiseAmount - currentBet)} more</span>
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
                type: 'fold',
                amount: 0,
                allIn: false
              })}
            >
              Fold
            </button>
            
            <button 
              className="action-button call"
              onClick={() => handleAction({
                type: 'call',
                amount: currentBet - currentPlayer.proffered,
                allIn: (currentBet - currentPlayer.proffered) >= currentPlayer.chips
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
                type: 'check',
                amount: 0,
                allIn: false
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
          // No bet to face (everyone checked or start of post-flop): check, bet
          <>
            <button 
              className="action-button check"
              onClick={() => handleAction({
                type: 'check',
                amount: 0,
                allIn: false
              })}
            >
              Check
            </button>
            
            <button 
              className="action-button bet"
              onClick={() => handleAction({
                type: 'bet',
                amount: currentBet === 0 ? bigBlindAmount : currentBet,
                allIn: false
              })}
            >
              Bet ${currentBet === 0 ? bigBlindAmount : currentBet}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ActionBar;