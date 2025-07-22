// GameConfigPanel.js - Configuration panel component

import React from 'react';

const GameConfigPanel = ({ 
  showConfig, 
  setShowConfig, 
  gameConfig, 
  setGameConfig, 
  onApplyConfig 
}) => {
  const handleInputChange = (field, value) => {
    setGameConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyGameConfig = () => {
    setShowConfig(false);
    if (onApplyConfig) {
      onApplyConfig();
    }
  };

  if (!showConfig) {
    return (
      <button
        onClick={() => setShowConfig(true)}
        className="settings-btn"
      >
        ⚙️ game config
      </button>
    );
  }

  return (
    <div className="config-panel">
      <div className="config-header">Game Configuration</div>
      
      <div className="config-group">
        <label>Small Blind:</label>
        <input
          type="number"
          value={gameConfig.smallBlind}
          onChange={(e) => handleInputChange('smallBlind', Number(e.target.value))}
        />
      </div>
      
      <div className="config-group">
        <label>Big Blind:</label>
        <input
          type="number"
          value={gameConfig.bigBlind}
          onChange={(e) => handleInputChange('bigBlind', Number(e.target.value))}
        />
      </div>
      
      <div className="config-group">
        <label>Ante:</label>
        <input
          type="number"
          value={gameConfig.ante}
          onChange={(e) => handleInputChange('ante', Number(e.target.value))}
        />
      </div>
      
      <div className="config-group">
        <label>Big Blind Ante:</label>
        <input
          type="number"
          value={gameConfig.bigBlindAnte}
          onChange={(e) => handleInputChange('bigBlindAnte', Number(e.target.value))}
        />
      </div>
      
      <div className="config-group">
        <label>Site Name:</label>
        <input
          type="text"
          value={gameConfig.siteName}
          onChange={(e) => handleInputChange('siteName', e.target.value)}
        />
      </div>
      
      <div className="config-group">
        <label>
          <input
            type="checkbox"
            checked={gameConfig.isTournament}
            onChange={(e) => handleInputChange('isTournament', e.target.checked)}
          />
          Tournament
        </label>
      </div>
      
      <button
        onClick={applyGameConfig}
        className="config-apply-btn"
      >
        Apply & Close
      </button>
    </div>
  );
};

export default GameConfigPanel;