import { useEffect, useRef, useState } from 'react';
import { playState } from './main';
import * as utils from './utils';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CANVAS_PADDING = 20;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;

const Position = { LEFT: 0, RIGHT: 1 } as const;
type Position = typeof Position[keyof typeof Position];

const drawPaddle = (pos: Position, heightPerc: number, context: CanvasRenderingContext2D) => {   // Draw paddle centered at height as a percentage
    context.fillStyle = "#ffffff";
    const y = (heightPerc / 100 * CANVAS_HEIGHT) - (PADDLE_HEIGHT / 2);
    const x = pos === Position.LEFT ? CANVAS_PADDING : CANVAS_WIDTH - PADDLE_WIDTH - CANVAS_PADDING;
    context.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

const drawBall = (xPerc: number, yPerc: number, context: CanvasRenderingContext2D) => {   // Draw ball centered at x and y as percentages
    context.fillStyle = "#ffffff";
    const x = (xPerc / 100 * CANVAS_WIDTH) - (BALL_SIZE / 2);
    const y = (yPerc / 100 * CANVAS_HEIGHT) - (BALL_SIZE / 2);
    context.fillRect(x, y, BALL_SIZE, BALL_SIZE);
}

const Canvas = ({ leftInputHeight, rightInputHeight, started, setStarted, setIsScoring, getScore }: {
    leftInputHeight: number; rightInputHeight: number; started: playState, setStarted: (state: playState) => void, setIsScoring: (value: boolean) => void, getScore: (incrementLeft?: boolean | null, incrementRight?: boolean | null) => { left: number; right: number }
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [ball, setBall] = useState<BallState>({ position: { x: 50, y: 50 }, velocity: { x: 1, y: 0.5 } });
    const scoredRef = useRef(false);
    const paddleHeightsRef = useRef({ left: leftInputHeight, right: rightInputHeight });

    useEffect(function updatePaddleHeights() {   // use ref to allow update seperate of update loop
        paddleHeightsRef.current = { left: leftInputHeight, right: rightInputHeight };
    }, [leftInputHeight, rightInputHeight]);

    useEffect(function updateBallPosition() {
        if (started === playState.scored || started === playState.notStarted) {   // Reset ball when not started
            setBall({ position: { x: 50, y: 50 }, velocity: { x: 1, y: 0.4 * (Math.floor(Math.random() * 2) * 2 - 1) } });
            scoredRef.current = false;
            if (started === playState.scored)
                setStarted(playState.Playing);
            return;
        }

        if (started !== playState.Playing)
            return;

        const interval = setInterval(() => {
            setBall(prevBall => {
                const newBall = updateBall(prevBall);
                const ballX = (newBall.position.x / 100 * CANVAS_WIDTH) - (BALL_SIZE / 2);
                const ballY = (newBall.position.y / 100 * CANVAS_HEIGHT) - (BALL_SIZE / 2);

                const ballRight = ballX + BALL_SIZE;
                const ballCenterY = ballY + BALL_SIZE / 2;

                const leftPaddleTop = paddleHeightsRef.current.left / 100 * CANVAS_HEIGHT - PADDLE_HEIGHT / 2;
                const leftPaddleBottom = leftPaddleTop + PADDLE_HEIGHT;
                const rightPaddleTop = paddleHeightsRef.current.right / 100 * CANVAS_HEIGHT - PADDLE_HEIGHT / 2;
                const rightPaddleBottom = rightPaddleTop + PADDLE_HEIGHT;

                const leftPaddleX = CANVAS_PADDING + PADDLE_WIDTH;
                const rightPaddleX = CANVAS_WIDTH - CANVAS_PADDING - PADDLE_WIDTH;

                if (ballX <= leftPaddleX || ballRight >= rightPaddleX)
                {   // Ball within paddle height
                     const ballBottom = ballY + BALL_SIZE;
                    const hitLeftPaddle = ballX <= leftPaddleX && ballBottom >= leftPaddleTop && ballY <= leftPaddleBottom;
                    const hitRightPaddle = ballRight >= rightPaddleX && ballBottom >= rightPaddleTop && ballY <= rightPaddleBottom;

                    if (hitLeftPaddle || hitRightPaddle)
                    {   // Calculate hit position relative to the paddle that was hit
                        const paddle = hitLeftPaddle ? { top: leftPaddleTop, bottom: leftPaddleBottom } : { top: rightPaddleTop, bottom: rightPaddleBottom };
                        const hitY = ((ballCenterY - paddle.top) / (paddle.bottom - paddle.top)) * 100;

                        return updateBall(prevBall, hitY);
                    }

                    if (scoredRef.current)
                        return prevBall;

                    {   // Handle scoring
                        scoredRef.current = true;
                        setIsScoring(true);
                        if (ballX > CANVAS_WIDTH / 2) getScore(true, null);
                        else getScore(null, true);
                    }
                        
                    setTimeout(() => {   // Reset game after scoring delay
                        setStarted(playState.scored);
                        setIsScoring(false);
                    }, 500);
                    return prevBall;
                }

                return newBall;
            });
        }, 36);

        return () => clearInterval(interval);
    }, [started, setStarted, setIsScoring, getScore]);

    useEffect(function renderCanvas() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        context.font = '48px sans-serif';
        const { left, right } = getScore();
        const text = `${left} : ${right}`;
        const textMetrics = context.measureText(text);

        context.fillText(text, CANVAS_WIDTH / 2 - textMetrics.width / 2, 50);

        drawBall(ball.position.x, ball.position.y, context);
        drawPaddle(Position.LEFT, leftInputHeight, context);
        drawPaddle(Position.RIGHT, rightInputHeight, context);
    }, [leftInputHeight, rightInputHeight, ball, getScore]);

    return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};

export default Canvas;

type Vec2 = { x: number; y: number };
type BallState = { position: Vec2; velocity: Vec2 };

const updateBall = (state: BallState, hasHitPaddle?: number): BallState => 
{   // recursize function to calculate ball next position and respond to collisions
    // includes taking relitive hit position on paddle to adjust angle 
    //      (uses percentage of paddle height top: 0% to bottom: 100%)
    let { position, velocity } = state;

    if (typeof hasHitPaddle === "number") 
    {   // Calculate new velocity based on where ball hit the paddle
        const normalized = utils.clampPercent(hasHitPaddle) / 100;
        const angleFactor = 2 * (normalized - 0.5);
        velocity = { x: -velocity.x, y: angleFactor * Math.abs(velocity.x) };
    }

    const ballYPixels = (position.y / 100 * CANVAS_HEIGHT) - (BALL_SIZE / 2);
    if (ballYPixels <= 0 || ballYPixels + BALL_SIZE >= CANVAS_HEIGHT)
        velocity = { x: velocity.x, y: -velocity.y };

    position = { x: position.x + velocity.x, y: position.y + velocity.y };

    return { position, velocity };
};
