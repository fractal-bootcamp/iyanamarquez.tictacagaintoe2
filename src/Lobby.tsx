import {
    useState,
    useEffect
} from 'react'
import './App.css'
import { Link } from 'react-router-dom'

function Lobby() {
    const url = 'https://tictactoe-multiclient.onrender.com'
    // const url = process.env.BASE_URL

    const [games, setGames] = useState<any>([])

    // fetch all games
    useEffect(() => {
        fetch(`${url}/games/`, {
            method: "GET", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
        }).then(response => response.json())
            .then(data => {
                console.log([data.games])
                setGames(data.games)
            });
    }, [])
    return (
        <div className=' w-full flex justify-center p-4 '>
            <div className="max-w-sm rounded ">
                <div className="">
                    <h1 className='mb-4'>Lobby</h1>
                    <p className="text-gray-700 text-base">
                        Join a game down below                    </p>
                </div>
                <div className="">
                    {Object.keys(games).map((x, idx) => {

                        return < div className=" m-4" >
                            <Link to={`/game/${games[x].id}`}>
                                <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow flex flex-col w-64">
                                    <span>Game : {idx + 1}</span>
                                    <div></div>
                                    {games[x].player2.id == '' ? <>player 2: empty</> : <>player 2: occupied</>}
                                    <br></br>
                                    {games[x].player1.id == '' ? <>player 1: empty</> : <>player 1: occupied</>}

                                </button></Link>
                        </div>
                    })}
                </div>
            </div>
            {/* show list of games ,ids attached to each item, on click make a get to that game*/}


        </div>
    )
}

export default Lobby
