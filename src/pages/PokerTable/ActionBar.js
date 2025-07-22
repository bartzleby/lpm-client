import React, { useState } from 'react';
import './ActionBar.css';

function ActionBar({ 
  dealerSeat, 
  bigBlindAmount, 
  currentPlayer, 
  currentBet,
  currentStreet,
  playersInHand,
  pot, // Add pot as a prop instead of calculating it
  onAction, 
  isHandOver, 
  winningPlayer, 
  onSaveHand,
  currentBettingRound,
  lastRaiseSize
}) {
  const [showBetSlider, setShowBetSlider] = useState(false);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
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

  // Calculate betting history for this street
  const getBettingHistory = () => {
    if (!currentBettingRound || !currentBettingRound.actions) return [];
    
    // Get all betting actions in chronological order (not sorted by amount)
    // Include both "Bet" and "Raise" actions, plus forced bets on preflop
    const bettingActions = currentBettingRound.actions
      .filter(action => {
        // Include bets and raises
        if (['Bet', 'Raise'].includes(action.action)) return true;
        
        // On preflop, also include big blind as the initial "bet"
        if (currentStreet === 'preflop' && action.action === 'Post BB') return true;
        
        return false;
      })
      .map(action => action.amount);
      
    console.log('🔍 Raw betting actions from current round:', currentBettingRound.actions);
    console.log('🔍 Filtered betting history:', bettingActions);
    
    return bettingActions;
  };

  // Calculate minimum raise according to poker rules
  const calculateMinimumRaise = () => {
    console.log('🎯 Calculating minimum raise:');
    console.log('  Current bet:', currentBet);
    console.log('  Current street:', currentStreet);
    console.log('  Big blind:', bigBlindAmount);
    console.log('  Last raise size:', lastRaiseSize);
    
    if (currentStreet === 'preflop') {
      if (currentBet === bigBlindAmount) {
        // Only big blind has been posted - minimum raise is double big blind
        const minRaise = bigBlindAmount * 2;
        console.log('  Preflop - only BB posted, min raise:', minRaise);
        return minRaise;
      } else {
        // Someone has raised - use the last raise size (if available) or calculate from BB
        const raiseSize = lastRaiseSize || (currentBet - bigBlindAmount);
        const minRaise = currentBet + raiseSize;
        console.log(`  Preflop - current bet: ${currentBet}, last raise size: ${raiseSize}, min raise: ${minRaise}`);
        return minRaise;
      }
    } else {
      // Post-flop streets
      if (currentBet === 0) {
        // No bets this street - minimum raise is double big blind
        const minRaise = bigBlindAmount * 2;
        console.log('  Post-flop - no bets, min raise:', minRaise);
        return minRaise;
      } else {
        // Someone has bet - use last raise size or default to current bet size
        const raiseSize = lastRaiseSize || currentBet;
        const minRaise = currentBet + raiseSize;
        console.log(`  Post-flop - current bet: ${currentBet}, last raise size: ${raiseSize}, min raise: ${minRaise}`);
        return minRaise;
      }
    }
  };

  // Calculate minimum bet (when no one has bet)
  const calculateMinimumBet = () => {
    return bigBlindAmount;
  };

  console.log(`ActionBar: Current player is ${currentPlayer.name} at position ${currentPlayer.position}`);
  console.log(`Current street: ${currentStreet}, current bet: ${currentBet}, player proffered: ${currentPlayer.proffered}`);
  console.log('🔍 Current betting round:', currentBettingRound);
  console.log('🔍 Betting history:', getBettingHistory());

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
    // Reset all inputs
    setShowBetSlider(false);
    setShowRaiseSlider(false);
    setBetAmount(0);
    setRaiseAmount(0);
  };

  const handleBetClick = () => {
    const minBet = calculateMinimumBet();
    setBetAmount(minBet);
    setShowBetSlider(true);
  };

  const handleRaiseClick = () => {
    const minRaise = calculateMinimumRaise();
    console.log('🚀 Raise button clicked - setting minimum raise to:', minRaise);
    setRaiseAmount(minRaise);
    setShowRaiseSlider(true);
  };

  const handleBetSubmit = () => {
    if (betAmount > 0) {
      handleAction({
        type: 'bet',
        amount: betAmount,
        allIn: betAmount >= currentPlayer.chips
      });
    }
  };

  const handleRaiseSubmit = () => {
    if (raiseAmount > 0) {
      handleAction({
        type: 'raise',
        amount: raiseAmount, // Pass the total raise amount, not the difference
        allIn: (raiseAmount - currentPlayer.proffered) >= currentPlayer.chips
      });
    }
  };

  const handleCancelBet = () => {
    setShowBetSlider(false);
    setBetAmount(0);
  };

  const handleCancelRaise = () => {
    setShowRaiseSlider(false);
    setRaiseAmount(0);
  };

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
  
  // Calculate slider bounds
  const minBet = calculateMinimumBet();
  const maxBet = currentPlayer.chips;
  const minRaise = calculateMinimumRaise();
  const maxRaise = currentPlayer.chips;

  // Show bet slider
  if (showBetSlider) {
    return (
      <div className="action-section compact">
        <div className="raise-slider-section">
          <div className="raise-info">
            <span>Bet: ${betAmount}</span>
            <span className="raise-detail">All-in: {betAmount >= currentPlayer.chips ? 'Yes' : 'No'}</span>
          </div>
          <input
            type="range"
            className="raise-slider"
            min={minBet}
            max={maxBet}
            value={betAmount}
            onChange={(e) => setBetAmount(parseInt(e.target.value))}
            step={bigBlindAmount}
          />
          <div className="slider-labels">
            <span>Min: ${minBet}</span>
            <span>Max: ${maxBet}</span>
          </div>
          <div className="action-buttons raise-actions">
            <button 
              className="action-button cancel"
              onClick={handleCancelBet}
            >
              Cancel
            </button>
            <button 
              className="action-button raise-submit"
              onClick={handleBetSubmit}
            >
              Bet ${betAmount}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show raise slider
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
              onClick={handleBetClick}
            >
              Bet
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ActionBar;