import {
    useState, MouseEvent,
    useEffect
} from 'react'
import './App.css'

function Lobby() {
    const [games, setGames] = useState<any>([])

    // fetch all games
    useEffect(() => {
        fetch("http://localhost:4000/games/", {
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
        <div>
            <h1>Lobby</h1>
            {/* show list of games ,ids attached to each item, on click make a get to that game*/}
            <ul>
                {Object.keys(games).map((x, idx) => {
                    console.log('erm', games[x].id)

                    console.log('erm', Object.keys(x)[idx])
                    return < li >
                        <a href={`/game/${games[x].id}`}><button>Game {idx + 1}</button></a>
                    </li>
                })}
            </ul>
        </div>
    )
}

export default Lobby