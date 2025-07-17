// PokerTableSurface.js - The actual poker table surface with pot and community cards

import React from 'react';

const PokerTableSurface = ({ pot, communityCards = [] }) => {
  return (
    <div className="poker-table-container">
      <div className="poker-table">
        <div className="table-felt"></div>
        <div className="table-edge"></div>
        
        <div className="pot-area">
          <div className="pot-label">POT</div>
          <div className="pot-amount">${pot}</div>
        </div>
        
        <div className="community-cards">
          {[1, 2, 3, 4, 5].map((cardIndex) => (
            <div key={cardIndex} className="community-card">
              {communityCards[cardIndex - 1] ? (
                <div className="community-card-value">
                  {communityCards[cardIndex - 1]}
                </div>
              ) : (
                <div className="community-card-placeholder">?</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokerTableSurface;