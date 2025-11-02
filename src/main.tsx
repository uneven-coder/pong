import { Fragment, StrictMode, use, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { useState } from 'react'
import Canvas from './appCanvas'
import * as utils from './utils'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Info from './info'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Info />} />
                <Route path="/game" element={<App />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)

// add singleplayer by passing mode as a navigation state

const WINSCORE = 10;
const PADDLE_SPEED = 0.3;

export const playState = {
    notStarted: 'notStarted',
    Playing: 'Playing',
    scored: 'scored',
    won: 'won'
} as const;

export type playState = typeof playState[keyof typeof playState];

export function App()
{
    const navigate = useNavigate();
    const [left_Height, setLeft_Height] = useState(50)
    const [right_Height, setRight_Height] = useState(50)
    const [gameStarted, setGameStarted] = useState<playState>(playState.notStarted)
    const [isScoring, setIsScoring] = useState(false)

    const [left_Score, setLeft_Score] = useState(0)
    const [right_Score, setRight_Score] = useState(0)

    useEffect(function checkHomePageVisit()
    {   // Redirect to home if user hasn't visited the info page first
        const hasVisitedHome = sessionStorage.getItem('hasVisitedHome');
        if (!hasVisitedHome) navigate('/');
    }, [navigate]);

    useEffect(function resetPaddlesWhenNotStarted()
    {   // Reset paddle positions to center when game is not active or after scoring
        if (gameStarted === playState.notStarted || gameStarted === playState.scored)
        {
            setLeft_Height(50);
            setRight_Height(50);
        }
    }, [gameStarted]);

    {   // handle input
        const wKey = utils.registerKey("w");
        const sKey = utils.registerKey("s");
        const upKey = utils.registerKey("ArrowUp");
        const downKey = utils.registerKey("ArrowDown");
        const spaceKey = utils.registerKey(" ");

        useEffect(function handlePaddleInput() {
            if (gameStarted !== playState.Playing || isScoring) return;

            const interval = setInterval(function listenForPaddleInputs()
            {   // Update paddle positions based on key input
                if (wKey())    utils.clampPercentChange(setLeft_Height, -PADDLE_SPEED);
                if (sKey())    utils.clampPercentChange(setLeft_Height, PADDLE_SPEED);
                if (upKey())   utils.clampPercentChange(setRight_Height, -PADDLE_SPEED);
                if (downKey()) utils.clampPercentChange(setRight_Height, PADDLE_SPEED);
            }, 16);

            return () => clearInterval(interval);
        }, [wKey, sKey, upKey, downKey, gameStarted, isScoring]);

        
        useEffect(function handleGameStart()
        {   // Check for space key press to start the game
            const interval = setInterval(function waitForSpaceInput()
            {
                if (gameStarted === playState.notStarted && spaceKey())
                    setGameStarted(playState.Playing);
            }, 10);
            return () => clearInterval(interval);
        }, [spaceKey, gameStarted, ]);

        useEffect(() => {
        if (left_Score >= WINSCORE || right_Score >= WINSCORE) {
            setTimeout(() =>
            {   // Reset game after scoring delay
                setGameStarted(playState.won);
                setIsScoring(false);
                navigate("/", {
                    state: {
                        winner: left_Score >= WINSCORE ? "Left Player" : "Right Player",
                        score: { left: left_Score, right: right_Score },
                    },
                });
            }, 500);

        }
        }, [left_Score, right_Score, WINSCORE, navigate]);
    }

    return (
        <div id="app">
            <p style={{position:"absolute"}}>Game Started: {gameStarted.toString()}</p>
            <Canvas leftInputHeight={left_Height} rightInputHeight={right_Height} 
            started={gameStarted} setStarted={(state: playState) => setGameStarted(state)} 
            setIsScoring={setIsScoring}
            getScore={(incrementLeft?: boolean | null, incrementRight?: boolean | null )  =>
            {
                if (incrementLeft) setLeft_Score(prev => prev + 1);
                if (incrementRight) setRight_Score(prev => prev + 1);
                return { left: left_Score, right: right_Score };
            }} />
        </div>
    )
}