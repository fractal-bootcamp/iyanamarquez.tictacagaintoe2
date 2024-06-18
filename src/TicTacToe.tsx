import {
    useState, MouseEvent,
    useEffect
} from 'react'
import './App.css'
import { Board } from './game'
import { useParams } from 'react-router-dom';
import Modal from './Modal';

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
            fetch(`http://localhost:4000/game/${id}`, {
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
        fetch(`http://localhost:4000/game/${id}/move`, {
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
            <div className='flex flex-col justify-center items-center mt-10 lg:mt-44'>

                <h1 className='mb-4 underline'>Tic Tac Toe</h1>
                {cont && <>{player}'s' turn</>}
                {gameState.outcome == 'win' && <>
                    <Modal message={player === "X" ? "O wins" : "X wins"} /></>}
                {gameState.outcome == 'tie' && <Modal message={'Tie game'} />}
                <div className='flex justify-center'>
                    {gameBoard.map((row, rowindex) => {
                        return <div className='' id={rowindex.toString()}>{
                            row.map((_string, itemIdx) => {
                                return <div onClick={handleClick} id={itemIdx.toString()} className=' grid-cols-3 border border-black w-20 h-20 flex justify-center items-center text-6xl'>{gameBoard[itemIdx][rowindex]}</div>
                            })
                        }</div>
                    })}
                </div>
                <div
                    className="hidden lg:block absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
                    aria-hidden="true"
                >
                    <div
                        className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-70"
                        style={{
                            clipPath:
                                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
                        }}
                    />
                </div>
                {/* <Lobby /> */}
                <div
                    className="hidden lg:block absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
                    aria-hidden="true"
                >
                    <div
                        className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-70 "
                        style={{
                            clipPath:
                                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
                        }}
                    />
                </div>
                <br>
                </br>
                {/* <button onClick={() => {
                    setCont(true)
                    fetch(`http://localhost:4000/game/${id}/restart`, {
                        method: "POST", // or 'PUT'
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }).then(response => response.json())
                        .then(data => {
                            setGameBoard(data.game.board)
                        });
                    window.location.reload()
                }}>Reset game</button>
                <a href='/'><button>Lobby</button></a> */}
                <div className="inline-flex self-center" >
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l mx-2" onClick={() => {
                        setCont(true)
                        fetch(`http://localhost:4000/game/${id}/restart`, {
                            method: "POST", // or 'PUT'
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }).then(response => response.json())
                            .then(data => {
                                setGameBoard(data.game.board)
                            });
                        window.location.reload()
                    }}>
                        Reset Game
                    </button>
                    <a href='/'>
                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r mx-2">
                            Lobby
                        </button>
                    </a>

                </div>
            </div>

        </>
    )
}

export default TicTacToe
