import {
    useState, MouseEvent,
    useEffect
} from 'react'
import './App.css'
import { Board } from './game'
import { Link, useParams } from 'react-router-dom';
import Modal from './Modal';
import { motion } from "framer-motion"


const url = 'https://tictactoe-multiclient.onrender.com'
// const url = 'http://localhost:4000'
// const url = process.env.BASE_URL

function TicTacToe() {
    const { id } = useParams();
    const blankBoard = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ] satisfies Board

    const [player, setPlayer] = useState('')
    const [gameBoard, setGameBoard] = useState(blankBoard)
    const [gameState, setGameState] = useState<any>({})
    const [poller, setPoller] = useState(0)
    const [cont, setCont] = useState(true)

    useEffect(() => {
        const refresh = () => {
            fetch(`${url}/game/${id}`, {
                method: "GET", // or 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
                // body: JSON.stringify(data),
            }).then(response => response.json())
                .then(async data => {
                    console.log('what is here', data)
                    setPlayer(data.game.currentPlayer)
                    setGameBoard(data.game.board)
                    setGameState(data.game.winState)
                    setCont(data.game.gameOn)
                }
                );
        }
        refresh()

        if (gameState.outcome == 'win') {
            setCont(false)
        } else if (gameState.outcome == 'tie') {
            setCont(false)
        }
        // settimeouthere
        setTimeout(() => {
            setPoller(poller + 1);
        }, 700);
    }, [poller]);

    const handleMove = (data: { rowId: number; itemId: number }) => {
        fetch(`${url}/game/${id}/move`, {
            method: "POST", // or 'PUT'
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then(response => response.json())
            .then(data => {
                setPlayer(data.game.currentPlayer)
                setGameBoard(data.game.board)
                setGameState(data.game.winState)
            });
    }

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        // Add text to screen, get the current position, and send that data to handle move
        if (cont) {
            // e.currentTarget.innerHTML = player
            const parentRow = e.currentTarget.parentNode as HTMLElement
            const rowId = Number(parentRow.id)
            const childItem = e.target as HTMLElement
            const itemId = Number(childItem.id)

            handleMove({ rowId: rowId, itemId: itemId })
        }
    }

    return (
        <>
            <div className='flex flex-col justify-center items-center bg-blue-100 h-screen'>

                <h1 className='mb-4 underline'>Tic Tac Toe</h1>
                {cont && <>{player}'s' turn</>}
                {gameState.outcome == 'win' && <>
                    <Modal message={player === "X" ? "O wins" : "X wins"} /></>}
                {gameState.outcome == 'tie' && <Modal message={'Tie game'} />}
                <div className='flex justify-center bg-white'>
                    {gameBoard.map((row, rowindex) => {

                        return <div className='' id={rowindex.toString()}>{
                            row.map((_string, itemIdx) => {
                                return <motion.div whileTap={{ scale: 1.1 }}
                                    onClick={handleClick} id={itemIdx.toString()} className=' grid-cols-3 border border-black w-20 h-20 flex justify-center items-center text-6xl hover:bg-purple-200 hover:cursor-pointer'>{gameBoard[itemIdx][rowindex]}</motion.div>
                            })
                        }</div>
                    })}
                </div>
                <div
                    className="hidden lg:block absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
                    aria-hidden="true"
                >

                </div>
                <br>
                </br>
                <div className="inline-flex self-center" >
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l mx-2" onClick={() => {
                        setCont(true)
                        fetch(`${url}/game/${id}/restart`, {
                            method: "POST", // or 'PUT'
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }).then(response => response.json())
                            .then(data => {
                                setGameBoard(data.game.board)
                            });
                    }}>
                        Reset Game
                    </button>
                    <Link to='/'>
                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r mx-2">
                            Lobby
                        </button>
                    </Link>

                </div>


                {/* <p><a href="https://giphy.com/gifs/dancing-fortnite-skull-trooper-1APhATvqD65r966yCP">via GIPHY</a></p> */}
            </div>

        </>
    )
}

export default TicTacToe
