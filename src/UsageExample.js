// UsageExample.js - Shows how to integrate all components

import React, { useState } from 'react';
import { Hand } from './Hand';
import { 
  CardInput, 
  StreetProgression, 
  HandHistoryDisplay, 
  AdvancedActionInput,
  HandNotes 
} from './HandRecordingFeatures';

const CompletePokerRecorder = () => {
  const [currentHand, setCurrentHand] = useState(null);
  const [handHistory, setHandHistory] = useState([]);
  const [showCardInput, setShowCardInput] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [handNotes, setHandNotes] = useState({});
  
  // Example of starting a new hand with all features
  const startNewHand = () => {
    const hand = new Hand();
    
    // Configure the hand
    hand.tableName = "Home Game Table 1";
    hand.gameType = "NLH";
    hand.smallBlind = 1;
    hand.bigBlind = 2;
    hand.tableSize = 9;
    
    // Add players
    const players = [
      { name: 'Hero', seat: 1, chips: 200 },
      { name: 'Villain1', seat: 3, chips: 150 },
      { name: 'Villain2', seat: 5, chips: 300 },
      { name: 'Villain3', seat: 7, chips: 100 },
      { name: 'Villain4', seat: 9, chips: 250 }
    ];
    
    players.forEach(p => hand.addPlayer(p.name, p.seat, p.chips));
    hand.setHero('Hero');
    hand.setDealerSeat(9);
    
    // Post blinds
    hand.postSmallBlind('Hero');
    hand.postBigBlind('Villain1');
    
    setCurrentHand(hand);
  };
  
  // Handle card input
  const handleCardsEntered = (playerName, cards) => {
    if (currentHand) {
      currentHand.dealHoleCards(playerName, cards);
      setShowCardInput(false);
      setSelectedPlayer(null);
    }
  };
  
  // Handle community cards
  const handleDealCommunityCards = (street, cards) => {
    if (currentHand) {
      currentHand.dealCommunityCards(street, cards);
    }
  };
  
  // Handle street progression
  const handleNextStreet = () => {
    if (currentHand) {
      currentHand.nextStreet();
    }
  };
  
  // Handle actions
  const handleAction = (type, amount) => {
    if (currentHand) {
      const activePlayer = currentHand.players[0]; // In real app, track active player
      currentHand.addAction(activePlayer.name, type, amount);
    }
  };
  
  // Handle notes
  const handleNoteSaved = (note) => {
    if (currentHand) {
      setHandNotes({
        ...handNotes,
        [currentHand.id]: note
      });
    }
  };
  
  // Complete hand
  const completeHand = () => {
    if (currentHand) {
      // Add any final data
      const validation = currentHand.validate();
      if (validation.valid) {
        // Save to history
        setHandHistory([...handHistory, currentHand]);
        
        // Export
        const handData = currentHand.toJSON();
        if (handNotes[currentHand.id]) {
          handData.notes = handNotes[currentHand.id];
        }
        
        // Download JSON
        const blob = new Blob([JSON.stringify(handData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hand_${currentHand.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Reset
        setCurrentHand(null);
      } else {
        alert('Validation errors: ' + validation.errors.join(', '));
      }
    }
  };
  
  // Export all hands
  const exportAllHands = () => {
    const allHandsData = handHistory.map(hand => {
      const data = hand.toJSON();
      if (handNotes[hand.id]) {
        data.notes = handNotes[hand.id];
      }
      return data;
    });
    
    const blob = new Blob([JSON.stringify(allHandsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poker_session_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="complete-poker-recorder">
      <div className="recorder-header">
        <h1>Live Poker Hand Recorder</h1>
        <div className="session-controls">
          {!currentHand ? (
            <button onClick={startNewHand} className="start-hand-btn">
              Start New Hand
            </button>
          ) : (
            <>
              <span className="recording-indicator">● Recording Hand</span>
              <button onClick={completeHand} className="complete-hand-btn">
                Complete Hand
              </button>
            </>
          )}
          {handHistory.length > 0 && (
            <button onClick={exportAllHands} className="export-all-btn">
              Export Session ({handHistory.length} hands)
            </button>
          )}
        </div>
      </div>
      
      {currentHand && (
        <div className="recording-interface">
          <div className="main-recording-area">
            {/* Player cards input */}
            <div className="players-section">
              <h3>Players in Hand</h3>
              {currentHand.players.map(player => (
                <div key={player.name} className="player-card-entry">
                  <span>{player.name} (Seat {player.seatNumber})</span>
                  <button 
                    onClick={() => {
                      setSelectedPlayer(player.name);
                      setShowCardInput(true);
                    }}
                    className="enter-cards-btn"
                  >
                    Enter Cards
                  </button>
                </div>
              ))}
            </div>
            
            {showCardInput && selectedPlayer && (
              <CardInput 
                playerName={selectedPlayer}
                onCardsEntered={handleCardsEntered}
              />
            )}
            
            {/* Street progression */}
            <StreetProgression
              currentStreet={currentHand.currentStreet}
              onDealCommunityCards={handleDealCommunityCards}
              onNextStreet={handleNextStreet}
            />
            
            {/* Action input */}
            <AdvancedActionInput
              onAction={handleAction}
              bigBlind={currentHand.bigBlind}
              pot={currentHand.totalPot}
            />
            
            {/* Notes */}
            <HandNotes onNoteSaved={handleNoteSaved} />
          </div>
          
          <div className="hand-info-sidebar">
            <h3>Current Hand Info</h3>
            <div className="hand-stats">
              <div>Pot: ${currentHand.totalPot}</div>
              <div>Street: {currentHand.currentStreet}</div>
              <div>Players: {currentHand.players.length}</div>
              <div>Actions: {
                Object.values(currentHand.streets).reduce(
                  (sum, street) => sum + street.actions.length, 0
                )
              }</div>
            </div>
            
            {/* Action history */}
            <div className="action-history">
              <h4>Action History</h4>
              {Object.entries(currentHand.streets).map(([street, streetData]) => (
                streetData.actions.length > 0 && (
                  <div key={street} className="street-actions">
                    <h5>{street.charAt(0).toUpperCase() + street.slice(1)}</h5>
                    {streetData.actions.map((action, idx) => (
                      <div key={idx} className="action-item">
                        {action.playerName} {action.type}
                        {action.amount && ` $${action.amount}`}
                        {action.allIn && ' (All-in)'}
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Hand history display */}
      {handHistory.length > 0 && !currentHand && (
        <HandHistoryDisplay hands={handHistory} />
      )}
    </div>
  );
};

// Styles for the complete recorder
export const completeRecorderStyles = `
.complete-poker-recorder {
  min-height: 100vh;
  background: #1f2937;
  color: white;
  padding: 2rem;
}

.recorder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
}

.session-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.start-hand-btn, .complete-hand-btn, .export-all-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.start-hand-btn {
  background: #10b981;
  color: white;
}

.complete-hand-btn {
  background: #3b82f6;
  color: white;
}

.export-all-btn {
  background: #8b5cf6;
  color: white;
}

.recording-indicator {
  color: #ef4444;
  font-weight: bold;
  animation: pulse 2s infinite;
}

.recording-interface {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.main-recording-area {
  background: rgba(0, 0, 0, 0.5);
  padding: 2rem;
  border-radius: 0.5rem;
}

.players-section {
  margin-bottom: 2rem;
}

.player-card-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #374151;
  margin: 0.5rem 0;
  border-radius: 0.375rem;
}

.enter-cards-btn {
  padding: 0.375rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.hand-info-sidebar {
  background: rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
  border-radius: 0.5rem;
  height: fit-content;
}

.hand-stats {
  background: #374151;
  padding: 1rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
}

.hand-stats div {
  margin: 0.25rem 0;
}

.action-history {
  margin-top: 1.5rem;
}

.street-actions {
  margin: 1rem 0;
}

.street-actions h5 {
  color: #60a5fa;
  margin-bottom: 0.5rem;
}

.action-item {
  padding: 0.25rem 0.5rem;
  background: #1f2937;
  margin: 0.25rem 0;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .recording-interface {
    grid-template-columns: 1fr;
  }
  
  .hand-info-sidebar {
    order: -1;
  }
}
`;

export default CompletePokerRecorder;