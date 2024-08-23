import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';


const Socket: React.FC = () => {
    const blankBoard = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];
    interface Lobby {
        lobbyId: string;
        players: Player[];
        playerCount: number;
    }
    interface Player {
        ws: WebSocket;
        playerLetter: string;
        lobbyId: string;
    }

    // socket url
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'ws://localhost:3000';

    const [lobbyInput, setLobbyInput] = useState('');
    const [lobbies, setLobbies] = useState<Lobby[]>([]);

    const initialGameState = {
        gameBoard: blankBoard,
        playerLetter: '',
        lobbyId: '',
        message: '',
        nextMove: '',
    };

    const [gameState, setGameState] = useState<{
        gameBoard: typeof blankBoard;
        playerLetter: string | null;
        lobbyId: string;
        message: string;
        nextMove: string;
    }>({
        gameBoard: blankBoard,
        playerLetter: '',
        lobbyId: '',
        message: '',
        nextMove: '',
    });

    const [tempMessage, setTempMessage] = useState('');

    useEffect(() => {
        if (gameState.message) {
            setTempMessage(gameState.message);
            const timer = setTimeout(() => {
                setTempMessage('');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [gameState.message]);

    const { sendMessage, lastMessage, readyState, } = useWebSocket(socketUrl, {
        onOpen: () => console.log('WebSocket connection established.'),
        onClose: () => console.log('WebSocket connection closed.'),
        onError: (error) => console.error('WebSocket error:', error),
        shouldReconnect: (_closeEvent) => true,
        reconnectInterval: 3000,
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    console.log('state of the game', gameState);

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            console.log('data.data', data.data);
            switch (data.type) {
                case 'LOBBY_CREATED':
                    console.log('hititng here')
                    setGameState(prev => ({ ...prev, lobbyId: data.data.lobbyId, gameBoard: data.data.gameBoard, playerLetter: data.data.players[0].playerLetter, nextMove: data.data.nextMove }));
                    break;
                case 'JOINED_LOBBY':
                    setGameState(prev => ({ ...prev, playerLetter: data.data.playerLetter, nextMove: data.data.nextMove, gameBoard: data.data.gameBoard, lobbyId: data.data.lobbyId, message: 'Joined lobby' }));
                    break;
                case 'LOBBY_RESTARTED':
                    setGameState(prev => ({ ...prev, gameBoard: data.data.gameBoard, nextMove: data.data.nextMove }));
                    break;
                case 'MOVE_MADE':
                    setGameState(prev => ({ ...prev, gameBoard: data.data.gameBoard, nextMove: data.data.nextMove, message: data.data.message }));
                    break;
                case 'LOBBY_FULL':
                    setGameState(prev => ({ ...prev, message: 'Lobby is full' }));
                    break;
                case 'PLAYER_LEFT':
                    setGameState(prev => ({ ...prev, message: 'Player left the lobby' }));
                    break;
                case 'LEFT_LOBBY':
                    setGameState(prev => ({ ...prev, ...initialGameState }));
                    break;
                case 'LOBBY_REMOVED':
                    setGameState(prev => ({ ...prev, ...initialGameState }));
                    break;
                case 'GAME_OVER':
                    setGameState(prev => ({ ...prev, message: 'Game over', lobbyId: data.data.lobbyId }));
                    break;
                case 'GET_LOBBIES':
                    console.log('getting lobbies', data.data);
                    setLobbies(data.data);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        }
    }, [lastMessage]);

    const createLobby = () => {
        sendMessage(JSON.stringify({ type: 'CREATE_LOBBY' }));
    };
    const joinLobby = () => {
        const joinLobbyMessage = {
            type: 'JOIN_LOBBY',
            lobbyId: lobbyInput
        };
        console.log('sending message', joinLobbyMessage);
        sendMessage(JSON.stringify(joinLobbyMessage));
    };
    const makeMove = (row: number, col: number) => {
        console.log('making move', row, col);
        const newMoveMessage = {
            type: 'MAKE_MOVE',
            row,
            col,
            playerLetter: gameState.playerLetter
        };
        console.log('sending message', newMoveMessage);
        sendMessage(JSON.stringify(newMoveMessage));
    };
    const restartGame = () => {
        console.log('restarting game');
        sendMessage(JSON.stringify({ type: 'RESTART_GAME' }));
    };
    const leaveLobby = () => {
        console.log('leaving lobby');
        sendMessage(JSON.stringify({ type: 'LEAVE_LOBBY' }));
        setGameState(prev => ({ ...prev, ...initialGameState }));
    };
    const getLobbies = () => {
        console.log('getting lobbies');
        sendMessage(JSON.stringify({ type: 'GET_LOBBIES' }));
    };

    return (
        <div>
            <h1 className='text-2xl font-bold mb-6 underline'>Tic-Tac-Toe</h1>
            {gameState.lobbyId && <span>Lobby ID: <span className='font-mono'>{gameState.lobbyId}</span></span>}
            <br>
            </br>
            <span>The Lobby server is currently {connectionStatus === 'Open' ? <span className='text-green-500'>online</span> : <span className='text-red-500'>offline</span>}</span>
            <br></br>
            {gameState.lobbyId && <span>Current turn: {gameState.nextMove}</span>}
            <br></br>
            <div className='flex flex-col items-center gap-4 mt-4'>
                {gameState.lobbyId === '' ? (
                    <div className='flex flex-col items-start gap-4'>
                        <button onClick={createLobby} className='rounded-md border border-pink-200 mx-2 p-2 bg-pink-100 text-black text-xs transition-transform transform focus:outline-none active:scale-95'>Create Lobby</button>
                        <div className='flex flex-row items-center gap-4'>
                            <button onClick={joinLobby} className='rounded-md border border-pink-200 mx-2 p-2 bg-pink-100 text-black text-xs transition-transform transform focus:outline-none  active:scale-95'>Join Lobby</button>
                            <input
                                type="text"
                                placeholder="Enter join code"
                                value={lobbyInput}
                                onChange={(e) => setLobbyInput(e.target.value)}
                                className='border border-slate-500 rounded-md mx-2 p-1'
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className='flex justify-center bg-white'>
                            {gameState.gameBoard?.map((row, rowindex) => (
                                <div key={rowindex} className='grid grid-cols-1'>
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            onClick={() => makeMove(rowindex, cellIndex)}
                                            className='border border-black w-20 h-20 flex justify-center items-center text-4xl hover:bg-purple-200 hover:cursor-pointer transition-transform transform focus:outline-none active:scale-95'
                                        >
                                            {cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {tempMessage && <p>{tempMessage}</p>}
                    </div>
                )}
            </div>
            {gameState.lobbyId && (
                <div>
                    <button className='border border-pink-200 rounded-lg mx-2 p-2 bg-pink-100 text-black text-xs mt-4 transition-transform transform active:scale-95' onClick={restartGame}>Restart Game</button>
                    <button className='border border-pink-200 rounded-lg mx-2 p-2 bg-pink-100 text-black text-xs mt-4 transition-transform transform focus:outline-none active:scale-95' onClick={leaveLobby}>Leave Lobby</button>
                </div>
            )}
            <div className='flex flex-col items-center gap-4 mt-4'>
                {gameState.lobbyId === '' && (
                    <button className='border border-green-200 rounded-lg mx-2 p-2 bg-green-100 text-black text-xs mt-4 transition-transform transform focus:outline-none active:scale-95' onClick={getLobbies}>refresh</button>
                )}
                {lobbies.map((lobby) => (
                    <div key={lobby?.lobbyId}>
                        <p>Lobbies: {lobby?.lobbyId}</p>
                        <p className='text-xs border border-pink-200 rounded-lg mx-2 p-2 bg-pink-100 text-black text-xs mt-4 transition-transform transform focus:outline-none active:scale-95'>Players: {lobby?.playerCount}/2</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Socket;
