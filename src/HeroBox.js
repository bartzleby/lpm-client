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
        const y = Math.sin(radians) * radiusY;
        
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

    // Format action badge display - FIXED VERSION
    const formatActionBadge = (lastAction) => {
        if (!lastAction) return null;
        
        // Handle both old format (action.action) and new format (action.type)
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
            case 'allin':
            case 'all in':
                return `ALL IN $${actionAmount}`;
            case 'post sb':
                return `SB $${actionAmount}`;
            case 'post bb':
                return `BB $${actionAmount}`;
            case 'post ante':
                return `ANTE $${actionAmount}`;
            default:
                // Fallback for any unhandled action types
                return actionType?.toUpperCase() || '';
        }
    };

    // Get action badge color based on action type - UPDATED
    const getActionBadgeColor = (actionType) => {
        const type = (actionType?.type || actionType?.action || actionType)?.toLowerCase();
        
        switch (type) {
            case 'fold':
                return '#ef4444'; // Red
            case 'check':
                return '#6b7280'; // Gray
            case 'call':
                return '#3b82f6'; // Blue
            case 'bet':
            case 'raise':
                return '#10b981'; // Green
            case 'allin':
            case 'all in':
                return '#f59e0b'; // Amber
            case 'post sb':
            case 'post bb':
            case 'post ante':
                return '#8b5cf6'; // Purple for forced bets
            default:
                return '#6b7280'; // Default gray
        }
    };

    // Determine player circle class
    const getPlayerCircleClass = () => {
        let baseClass = 'player-circle';
        
        if (player.isFolded) {
            baseClass += ' folded';
        } else if (player.isActive) {
            baseClass += ' active';
        } else {
            baseClass += ' inactive';
        }
        
        if (isHero) {
            baseClass += ' hero';
        }
        
        return baseClass;
    };

    return (
        <div
            className="hero-box-container"
            style={getPlayerPosition()}
        >
            {/* Player circle */}
            <div className={getPlayerCircleClass()}>
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