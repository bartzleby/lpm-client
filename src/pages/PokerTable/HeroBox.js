// src/pages/PokerTable/HeroBox.js - Mobile positioning adjustment

import React from 'react';
import './HeroBox.css';

function HeroBox({ player, isHero, isDealer, position, onPlayerUpdate }) {
    // Calculate position for player around the oval
    const getPlayerPosition = () => {
        const angle = (position * 360) / 9 + 90; // Start from bottom, +90 degrees offset
        const radians = (angle * Math.PI) / 180;
        const radiusX = 140; // Horizontal radius
        const radiusY = 200; // Vertical radius (larger for oval)
        
        const x = Math.cos(radians) * radiusX;
        let y = Math.sin(radians) * radiusY;
        
        // Mobile adjustment: shift all players up
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // Shift all players up, with hero (position 0) getting extra clearance
            const mobileYOffset = position === 0 ? -80 : -48; // Hero gets -80px, others get -48px
            y += mobileYOffset;
        }
        
        return {
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: 'translate(-50%, -50%)'
        };
    };

    // Format forced bet display
    const formatForcedBet = (forcedBet) => {
        if (!forcedBet) return null;
        
        let display = [];
        
        if (forcedBet.type === 'SB') {
            display.push(`SB $${forcedBet.amount}`);
        } else if (forcedBet.type === 'BB') {
            display.push(`BB $${forcedBet.amount}`);
        } else if (forcedBet.type === 'ANTE') {
            display.push(`A $${forcedBet.amount}`);
        } else if (forcedBet.type === 'BB_ANTE') {
            display.push(`BBA $${forcedBet.amount}`);
        }
        
        // Add ante if present
        if (forcedBet.ante) {
            display.push(`A $${forcedBet.ante}`);
        }
        
        // Add big blind ante if present
        if (forcedBet.bbAnte) {
            display.push(`BBA $${forcedBet.bbAnte}`);
        }
        
        return display.join(' + ');
    };

    // Format action badge display
    const formatActionBadge = (lastAction) => {
        if (!lastAction) return null;
        
        const actionType = lastAction.type || lastAction.action;
        const actionAmount = lastAction.amount || 0;
        
        switch (actionType?.toLowerCase()) {
            case 'fold':
                return 'FOLD';
            case 'check':
                return 'CHECK';
            case 'call':
                return actionAmount > 0 ? `CALL $${actionAmount}` : 'CALL';
            case 'bet':
                return `BET $${actionAmount}`;
            case 'raise':
                return `RAISE $${actionAmount}`;
            case 'all-in':
            case 'allin':
                return `ALL-IN $${actionAmount}`;
            default:
                return actionType?.toUpperCase() || '';
        }
    };

    // Get action badge color
    const getActionBadgeColor = (lastAction) => {
        if (!lastAction) return '#374151';
        
        const actionType = lastAction.type || lastAction.action;
        switch (actionType?.toLowerCase()) {
            case 'fold':
                return '#ef4444'; // Red
            case 'check':
                return '#6b7280'; // Gray
            case 'call':
                return '#57534e'; // Brown
            case 'bet':
            case 'raise':
                return '#059669'; // Green
            case 'all-in':
            case 'allin':
                return '#dc2626'; // Red
            default:
                return '#374151'; // Default gray
        }
    };

    return (
        <div 
            className="hero-box-container" 
            style={getPlayerPosition()}
        >
            {/* Player circle */}
            <div className={`player-circle ${player.isActive ? 'active' : 'inactive'} ${isHero ? 'hero' : ''} ${player.isFolded ? 'folded' : ''}`}>
                {/* Player avatar */}
                <div className="player-avatar">
                    {isHero ? '👤' : '🎭'}
                </div>
                
                {/* Chips indicator */}
                <div className="player-chips">
                    ${player.chips}
                </div>
                
                {/* Player name */}
                <div className="player-name">
                    {player.name}
                </div>
                
                {/* Action indicator - only show if active and not folded */}
                {player.isActive && !player.isFolded && (
                    <div className="action-indicator"></div>
                )}

                {/* Dealer button - NOTE: This is just visual, the draggable one is in PokerTable */}
                {isDealer && (
                    <div className="dealer-button">
                        D
                    </div>
                )}
            </div>
            
            {/* Action badge - positioned toward center, replaces forced bet when present */}
            {player.lastAction && !player.isFolded ? (
                <div 
                    className="action-badge"
                    style={{
                        backgroundColor: getActionBadgeColor(player.lastAction)
                    }}
                >
                    {formatActionBadge(player.lastAction)}
                </div>
            ) : (
                /* Forced bet indicator - only show if no action and not folded */
                player.forcedBet && !player.isFolded && (
                    <div className="forced-bet">
                        {formatForcedBet(player.forcedBet)}
                    </div>
                )
            )}
            
            {/* Player cards */}
            <div className={`player-cards ${player.isAnimatingFold ? 'folding' : ''} ${player.isFolded ? 'folded' : ''}`}>
                {player.hand && player.hand.length > 0 ? (
                    // Show actual cards if we have them
                    player.hand.map((card, index) => (
                        <div key={index} className="card face-up">
                            {card}
                        </div>
                    ))
                ) : (
                    // Show card backs only if not folded
                    !player.isFolded && (
                        <>
                            <div className="card face-down"></div>
                            <div className="card face-down"></div>
                        </>
                    )
                )}
            </div>
        </div>
    );
}

export default HeroBox;