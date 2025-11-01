import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

const WINSCORE = 10;


export function App() {
    const [left_Height, setLeft_Height] = useState(100)
    const [right_Height, setRight_Height] = useState(100)


    return (
        // this will be replaced with a canvas
        <div id="app">
             {/* <h1>0 : 0</h1>
             <span className='devider' />
             <div className="paddle left" />
             <div className="paddle right" />

             <p className='left info'>
                 use the W and S keys to move the paddle.
             </p>
             <p className='right info'>
                 use the Up and Down keys to move the paddle.
             </p> */}
        </div>
    )
}