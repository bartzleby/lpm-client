import React from 'react';
import './ActionBar.css';

function ActionBar({ hand, player }) {

    // Calculate position for player around the oval
    const handleAction = (player, action) => {
        hand.addAction(action);
        return;
    };

    return (
        <div>
          <div className="active-player-display">
            Action: {}
          </div>
          
          <div className="action-buttons">
            <button 
              className="action-button fold"
              onClick={() => handleAction({player: player, action: 'fold'})}
            >
              Fold
            </button>
            <button 
              className="action-button call"
              onClick={() => handleAction({player: player, action: 'call'})}
            >
              Call ${}
            </button>
            <button 
              className="action-button raise"
              onClick={() => handleAction({player: player, action: 'raise'})}
            >
              Raise
            </button>
          </div>
        </div>
    );
}

export default ActionBar;