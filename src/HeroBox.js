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

    return (
        <div
            className="hero-box-container"
            style={getPlayerPosition()}
        >
            {/* Player circle */}
            <div className={`player-circle ${player.isActive ? 'active' : 'inactive'} ${isHero ? 'hero' : ''}`}>
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
                
                {/* Action indicator */}
                {player.isActive && (
                    <div className="action-indicator"></div>
                )}

                {/* Dealer button - NOTE: This is just visual, the draggable one is in PokerTable */}
                {isDealer && (
                    <div className="dealer-button">
                        D
                    </div>
                )}
            </div>
            
            {/* Player cards */}
            <div className="player-cards">
                {player.hand && player.hand.length > 0 ? (
                    // Show actual cards if we have them
                    player.hand.map((card, index) => (
                        <div key={index} className="card face-up">
                            {card}
                        </div>
                    ))
                ) : (
                    // Show card backs
                    <>
                        <div className="card face-down"></div>
                        <div className="card face-down"></div>
                    </>
                )}
            </div>
        </div>
    );
}

export default HeroBox;