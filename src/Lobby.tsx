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
        <div className='bg-white rounded-xl lg:w-96 lg:h-96 shadow-2xl'>
            <div className="max-w-sm rounded ">
                <div className="px-6 py-4">
                    <h1 className='mb-4'>Lobby</h1>
                    <p className="text-gray-700 text-base">
                        Join a game down below                    </p>
                </div>
                <div className="px-6 pt-4 pb-2">
                    <ul className='flex flex-col'>
                        {Object.keys(games).map((x, idx) => {
                            console.log('erm', games[x].id)

                            console.log('erm', Object.keys(x)[idx])
                            return < li className="my-4" >
                                <Link to={`/game/${games[x].id}`}>
                                    <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                                        Button Game {idx + 1}
                                    </button></Link>
                            </li>
                        })}
                    </ul>
                </div>
            </div>
            {/* show list of games ,ids attached to each item, on click make a get to that game*/}


        </div>
    )
}

export default Lobby
