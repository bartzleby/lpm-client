// PokerTable.js - Refactored main component

import React, { useState, useEffect } from 'react';
import HeroBox from './HeroBox';
import ActionBar from './ActionBar';
import DealerButton from './DealerButton';
import GameConfigPanel from './GameConfigPanel';
import PokerTableSurface from './PokerTableSurface';
import GameInfoDisplay from './GameInfoDisplay';
import { useHandManager } from '../../hooks/useHandManager';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import './PokerTable.css';

const PokerTable = () => {
  // Game configuration state
  const [gameConfig, setGameConfig] = useState({
    networkName: "",
    siteName: "Bellagio",
    smallBlind: 5,
    bigBlind: 10,
    ante: 0,
    bigBlindAnte: 0,
    isTournament: false,
    dealerPosition: 2
  });

  const [showConfig, setShowConfig] = useState(true);

  // Players state - initial setup
  const [players, setPlayers] = useState([
    { id: 1, name: 'Hero', starting_stack: 1000, position: 0, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 2, name: 'Player 2', starting_stack: 1000, position: 1, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 3, name: 'Player 3', starting_stack: 1000, position: 2, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 4, name: 'Player 4', starting_stack: 1000, position: 3, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 5, name: 'Player 5', starting_stack: 1000, position: 4, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 6, name: 'Player 6', starting_stack: 1000, position: 5, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 7, name: 'Player 7', starting_stack: 1000, position: 6, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 8, name: 'Player 8', starting_stack: 1000, position: 7, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 9, name: 'Player 9', starting_stack: 1000, position: 8, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 }
  ]);

  // Custom hooks
  const { isMobile, getLayoutClass, getActionSectionClass } = useResponsiveLayout();
  const handManager = useHandManager(gameConfig, players, setPlayers);

  // Community cards state (could be moved to hand manager if needed)
  const [communityCards, setCommunityCards] = useState([]);

  // Auto-start recording when dealer button is moved
  useEffect(() => {
    if (gameConfig.dealerPosition !== null && !showConfig) {
      handManager.startNewHand();
    }
  }, [gameConfig.dealerPosition, showConfig]);

  // Update player data
  const updatePlayer = (playerId, updates) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId ? { ...player, ...updates } : player
      )
    );
  };

  // Handle dealer position change
  const setDealerPosition = (position) => {
    setGameConfig(prev => ({
      ...prev,
      dealerPosition: position
    }));
  };

  // Expose functions for dealing cards (for console access)
  useEffect(() => {
    window.dealCardsToPlayer = handManager.dealCardsToPlayer;
    window.dealCommunityCards = handManager.dealCommunityCards;
  }, [handManager.dealCardsToPlayer, handManager.dealCommunityCards]);

  return (
    <div className={`poker-wrapper ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Main content wrapper */}
      <div className={`main-content ${getLayoutClass()}`}>
        {/* Table section */}
        <div className="table-section">
          {/* Configuration Panel */}
          <GameConfigPanel
            showConfig={showConfig}
            setShowConfig={setShowConfig}
            gameConfig={gameConfig}
            setGameConfig={setGameConfig}
          />

          {/* Poker Table Surface */}
          <PokerTableSurface 
            pot={handManager.pot}
            communityCards={communityCards}
          />

          {/* Players */}
          {players.map((player, index) => (
            <HeroBox
              key={player.id}
              player={player}
              isHero={index === 0}
              isDealer={false}
              position={index}
              onPlayerUpdate={(updates) => updatePlayer(player.id, updates)}
            />
          ))}

          {/* Draggable dealer button */}
          <DealerButton
            dealerPosition={gameConfig.dealerPosition}
            setDealerPosition={setDealerPosition}
          />

          {/* Game info display */}
          <GameInfoDisplay
            gameConfig={gameConfig}
            currentStreet={handManager.currentStreet}
            remainingPlayersCount={handManager.getRemainingPlayersCount()}
          />
        </div>

        {/* Action section - responsive placement */}
        <div className={getActionSectionClass()}>
          <ActionBar
            dealerSeat={gameConfig.dealerPosition + 1}
            bigBlindAmount={gameConfig.bigBlind}
            currentPlayer={handManager.getCurrentPlayer()}
            currentBet={handManager.currentBet}
            currentStreet={handManager.currentStreet}
            playersInHand={players}
            pot={handManager.pot}
            onAction={handManager.handleAction}
            isHandOver={handManager.isHandOver()}
            winningPlayer={handManager.getWinningPlayer()}
            onSaveHand={handManager.saveCurrentHand}
            currentBettingRound={handManager.currentBettingRound}
            lastRaiseSize={handManager.lastRaiseSize}
          />
        </div>
      </div>
    </div>
  );
};

export default PokerTable;