import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import * as input from './utils'

function Info()
{
    const location = useLocation();
    const navigate = useNavigate();

    const winner = location.state?.winner;
    const leftScore = location.state?.score.left;
    const rightScore = location.state?.score.right;

    useEffect(function markHomePageVisited() {
        sessionStorage.setItem('hasVisitedHome', 'true');
    }, []);

    const spaceKey = input.registerKey(" ");
    useEffect(() => {
                    const interval = setInterval(() =>
            {
        if (spaceKey()) {
            navigate('/game');
        }
    }, 10);
    return () => clearInterval(interval);
    }, [spaceKey, navigate]);

    return (
        <div className="#app">
            <h1>Pong</h1>
            
            <section>
                <h2>How to Play</h2>
                <p>Press <strong>SPACE</strong> to start the game.</p>
                <p>Player <strong>one</strong> use the <strong>W</strong> and <strong>S</strong> keys to move the left paddle up and down.</p>
                <p>Player <strong>two</strong> use  the <strong>Up</strong> and <strong>Down</strong> keys to move the right paddle up and down.</p>
                <p>First player to reach <strong>{10} points</strong> wins.</p>
            </section>

            <section style={{ marginTop: '2rem' }}>
                {winner && (
                    <>
                        <h2>Game Over</h2>
                        <p>Winner: <strong>{winner}</strong></p>
                        <p>Final Score - Left Player: {leftScore}, Right Player: {rightScore}</p>
                    </>
                )}
            </section>


            <button 
                onClick={() => navigate('/game')}
                style={{
                    marginTop: '2rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                {winner ? 'Play Again' : 'Start Game'}
            </button>
        </div>
    );
}

export default Info;