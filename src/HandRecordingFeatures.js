// HandRecordingFeatures.js - Additional features for hand recording

import React, { useState } from 'react';
import { Card } from './Hand';

// Card input component for entering hole cards
export const CardInput = ({ onCardsEntered, playerName }) => {
  const [card1, setCard1] = useState('');
  const [card2, setCard2] = useState('');
  
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const suits = ['s', 'h', 'd', 'c'];
  
  const handleSubmit = () => {
    if (card1.length === 2 && card2.length === 2) {
      onCardsEntered(playerName, [card1, card2]);
      setCard1('');
      setCard2('');
    }
  };
  
  return (
    <div className="card-input-container">
      <h4>Enter {playerName}'s Cards</h4>
      <div className="card-selectors">
        <select 
          value={card1} 
          onChange={(e) => setCard1(e.target.value)}
          className="card-select"
        >
          <option value="">Card 1</option>
          {ranks.map(rank => 
            suits.map(suit => (
              <option key={`${rank}${suit}`} value={`${rank}${suit}`}>
                {rank}{suit}
              </option>
            ))
          )}
        </select>
        
        <select 
          value={card2} 
          onChange={(e) => setCard2(e.target.value)}
          className="card-select"
        >
          <option value="">Card 2</option>
          {ranks.map(rank => 
            suits.map(suit => (
              <option key={`${rank}${suit}`} value={`${rank}${suit}`}>
                {rank}{suit}
              </option>
            ))
          )}
        </select>
        
        <button onClick={handleSubmit} className="submit-cards-btn">
          Submit Cards
        </button>
      </div>
    </div>
  );
};

// Street progression component
export const StreetProgression = ({ currentStreet, onDealCommunityCards, onNextStreet }) => {
  const [flop1, setFlop1] = useState('');
  const [flop2, setFlop2] = useState('');
  const [flop3, setFlop3] = useState('');
  const [turn, setTurn] = useState('');
  const [river, setRiver] = useState('');
  
  const handleDealFlop = () => {
    if (flop1 && flop2 && flop3) {
      onDealCommunityCards('flop', [flop1, flop2, flop3]);
      onNextStreet();
    }
  };
  
  const handleDealTurn = () => {
    if (turn) {
      onDealCommunityCards('turn', [turn]);
      onNextStreet();
    }
  };
  
  const handleDealRiver = () => {
    if (river) {
      onDealCommunityCards('river', [river]);
      onNextStreet();
    }
  };
  
  return (
    <div className="street-progression">
      <h4>Current Street: {currentStreet}</h4>
      
      {currentStreet === 'preflop' && (
        <div className="flop-input">
          <h5>Deal Flop</h5>
          <input 
            type="text" 
            placeholder="Card 1 (e.g., As)"
            value={flop1}
            onChange={(e) => setFlop1(e.target.value)}
            maxLength={2}
          />
          <input 
            type="text" 
            placeholder="Card 2"
            value={flop2}
            onChange={(e) => setFlop2(e.target.value)}
            maxLength={2}
          />
          <input 
            type="text" 
            placeholder="Card 3"
            value={flop3}
            onChange={(e) => setFlop3(e.target.value)}
            maxLength={2}
          />
          <button onClick={handleDealFlop}>Deal Flop</button>
        </div>
      )}
      
      {currentStreet === 'flop' && (
        <div className="turn-input">
          <h5>Deal Turn</h5>
          <input 
            type="text" 
            placeholder="Turn card"
            value={turn}
            onChange={(e) => setTurn(e.target.value)}
            maxLength={2}
          />
          <button onClick={handleDealTurn}>Deal Turn</button>
        </div>
      )}
      
      {currentStreet === 'turn' && (
        <div className="river-input">
          <h5>Deal River</h5>
          <input 
            type="text" 
            placeholder="River card"
            value={river}
            onChange={(e) => setRiver(e.target.value)}
            maxLength={2}
          />
          <button onClick={handleDealRiver}>Deal River</button>
        </div>
      )}
      
      {currentStreet === 'river' && (
        <div className="showdown-notice">
          <p>Betting complete. Ready for showdown.</p>
        </div>
      )}
    </div>
  );
};

// Hand history display component
export const HandHistoryDisplay = ({ hands }) => {
  const [selectedHand, setSelectedHand] = useState(null);
  
  return (
    <div className="hand-history-display">
      <h3>Recorded Hands ({hands.length})</h3>
      
      <div className="hand-list">
        {hands.map((hand, index) => (
          <div 
            key={hand.id} 
            className="hand-summary"
            onClick={() => setSelectedHand(hand)}
          >
            <div className="hand-header">
              <span>Hand #{index + 1}</span>
              <span>{new Date(hand.timestamp).toLocaleString()}</span>
            </div>
            <div className="hand-details">
              <span>Players: {hand.players.length}</span>
              <span>Pot: ${hand.totalPot}</span>
            </div>
          </div>
        ))}
      </div>
      
      {selectedHand && (
        <div className="hand-detail-modal">
          <button onClick={() => setSelectedHand(null)}>Close</button>
          <pre>{JSON.stringify(selectedHand.toJSON(), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Advanced action input with keyboard shortcuts
export const AdvancedActionInput = ({ onAction, bigBlind, pot }) => {
  const [customAmount, setCustomAmount] = useState('');
  
  // Common bet sizes
  const betSizes = [
    { label: 'Min', amount: bigBlind * 2 },
    { label: '1/3 Pot', amount: Math.round(pot / 3) },
    { label: '1/2 Pot', amount: Math.round(pot / 2) },
    { label: '2/3 Pot', amount: Math.round(pot * 2 / 3) },
    { label: 'Pot', amount: pot },
    { label: '1.5x Pot', amount: Math.round(pot * 1.5) },
    { label: '2x Pot', amount: pot * 2 }
  ];
  
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key.toLowerCase()) {
        case 'f':
          onAction('fold');
          break;
        case 'c':
          onAction('call', bigBlind);
          break;
        case 'r':
          if (customAmount) {
            onAction('raise', Number(customAmount));
            setCustomAmount('');
          }
          break;
        case 'k':
          onAction('check');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [onAction, bigBlind, customAmount]);
  
  return (
    <div className="advanced-action-input">
      <div className="quick-bets">
        {betSizes.map(size => (
          <button
            key={size.label}
            className="bet-size-btn"
            onClick={() => onAction('bet', size.amount)}
          >
            {size.label}<br/>${size.amount}
          </button>
        ))}
      </div>
      
      <div className="custom-action">
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Custom amount"
          className="custom-amount-input"
        />
        <button 
          onClick={() => {
            if (customAmount) {
              onAction('bet', Number(customAmount));
              setCustomAmount('');
            }
          }}
          className="custom-bet-btn"
        >
          Bet Custom
        </button>
      </div>
      
      <div className="keyboard-hints">
        <span>Shortcuts: F=Fold, C=Call, K=Check, R=Raise</span>
      </div>
    </div>
  );
};

// Notes component for adding hand notes
export const HandNotes = ({ onNoteSaved }) => {
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  
  const commonTags = ['Bluff', 'Value Bet', 'Hero Call', 'Bad Beat', 'Cooler', 'Mistake', 'Good Read'];
  
  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const saveNote = () => {
    onNoteSaved({
      text: note,
      tags: tags,
      timestamp: new Date().toISOString()
    });
    setNote('');
    setTags([]);
  };
  
  return (
    <div className="hand-notes">
      <h4>Hand Notes</h4>
      
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add notes about this hand..."
        className="notes-textarea"
        rows={4}
      />
      
      <div className="tags-section">
        <h5>Tags</h5>
        <div className="common-tags">
          {commonTags.map(tag => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className={`tag-btn ${tags.includes(tag) ? 'selected' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        <div className="custom-tag">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Custom tag"
          />
          <button onClick={() => {
            if (newTag) {
              addTag(newTag);
              setNewTag('');
            }
          }}>
            Add Tag
          </button>
        </div>
        
        <div className="selected-tags">
          {tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
        </div>
      </div>
      
      <button onClick={saveNote} className="save-note-btn">
        Save Note
      </button>
    </div>
  );
};

// Export styles for these components
export const additionalStyles = `
.card-input-container {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.card-selectors {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.card-select {
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: #1f2937;
  color: white;
  border: 1px solid #374151;
}

.submit-cards-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.street-progression {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.street-progression input {
  padding: 0.375rem;
  margin: 0 0.25rem;
  width: 60px;
  background: #1f2937;
  color: white;
  border: 1px solid #374151;
  border-radius: 0.25rem;
}

.hand-history-display {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.hand-summary {
  background: #1f2937;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
}

.hand-summary:hover {
  background: #374151;
}

.hand-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.hand-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.hand-detail-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1f2937;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 80vw;
  max-height: 80vh;
  overflow: auto;
  z-index: 1000;
}

.advanced-action-input {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 0.5rem;
}

.quick-bets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.bet-size-btn {
  padding: 0.5rem;
  background: #374151;
  color: white;
  border: 1px solid #4b5563;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.2s;
}

.bet-size-btn:hover {
  background: #4b5563;
}

.custom-action {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.custom-amount-input {
  flex: 1;
  padding: 0.5rem;
  background: #1f2937;
  color: white;
  border: 1px solid #374151;
  border-radius: 0.375rem;
}

.custom-bet-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.keyboard-hints {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
}

.hand-notes {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.notes-textarea {
  width: 100%;
  padding: 0.5rem;
  background: #1f2937;
  color: white;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  resize: vertical;
}

.tags-section {
  margin: 1rem 0;
}

.common-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.tag-btn {
  padding: 0.25rem 0.75rem;
  background: #374151;
  color: white;
  border: 1px solid #4b5563;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: #4b5563;
}

.tag-btn.selected {
  background: #3b82f6;
  border-color: #2563eb;
}

.custom-tag {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.custom-tag input {
  flex: 1;
  padding: 0.375rem;
  background: #1f2937;
  color: white;
  border: 1px solid #374151;
  border-radius: 0.375rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #059669;
  color: white;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.tag button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0;
}

.save-note-btn {
  width: 100%;
  padding: 0.5rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}
`;