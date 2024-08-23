import React, { useState, useEffect, useRef, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';


const Socket: React.FC = () => {
    const blankBoard = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];

    const [lobbyInput, setLobbyInput] = useState('');
    const [socketUrl, setSocketUrl] = useState('ws://localhost:3000');
    const [gameState, setGameState] = useState<{
        gameBoard: typeof blankBoard;
        playerLetter: string | null;
        lobbyId: string;
        message: string;
        currentPlayer: string;
    }>({
        gameBoard: blankBoard,
        playerLetter: null,
        lobbyId: '',
        message: '',
        currentPlayer: '',
    });

    const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
        onOpen: () => console.log('WebSocket connection established.'),
        onClose: () => console.log('WebSocket connection closed.'),
        onError: (error) => console.error('WebSocket error:', error),
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000,
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    // console.log('state of the game', gameState);

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            console.log('data.data', data.data);
            switch (data.type) {
                case 'LOBBY_CREATED':
                    console.log('hititng here')
                    setGameState(prev => ({ ...prev, lobbyId: data.data.lobbyId, gameBoard: data.data.gameBoard, playerLetter: data.data.players[0].playerLetter, currentPlayer: data.data.currentPlayer }));
                    break;
                case 'JOINED_LOBBY':
                    setGameState(prev => ({ ...prev, playerLetter: data.playerLetter }));
                    break;
                case 'GAME_START':
                    setGameState(prev => ({ ...prev, gameBoard: data.data.gameBoard }));
                    break;
                case 'MOVE_MADE':
                    setGameState(prev => ({ ...prev, gameBoard: data.data.gameBoard, currentPlayer: data.data.currentPlayer }));
                    break;
                case 'LOBBY_FULL':
                    setGameState(prev => ({ ...prev, message: 'Lobby is full' }));
                    break;
                case 'PLAYER_LEFT':
                    setGameState(prev => ({ ...prev, message: 'A player left the game' }));
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
        sendMessage(JSON.stringify({ type: 'JOIN_LOBBY', lobbyId: '123' }));
    };
    const makeMove = (row: number, col: number) => {
        sendMessage(JSON.stringify({ type: 'MAKE_MOVE', row, col, playerLetter: gameState.playerLetter }));
    };

    return (
        <div>
            <h1 className='text-2xl font-bold mb-6 underline'>Tic-Tac-Toe</h1>
            {gameState.lobbyId && <span>Lobby ID: <span className='font-mono'>hi{gameState.lobbyId}</span></span>}
            <br>
            </br>
            <span>The WebSocket is currently {connectionStatus}</span>
            <br></br>
            <span>Current Player: {gameState.currentPlayer}</span>
            <br></br>
            <div className='flex flex-col items-center gap-4 mt-4'>
                {gameState.playerLetter === null ? (
                    <div className='flex flex-col items-start gap-4'>
                        <button onClick={createLobby} className='border border-pink-200 rounded-sm mx-2 p-2 bg-pink-100 text-black text-xs'>Create Lobby</button>
                        <div className='flex flex-row items-center gap-4'>
                            <button onClick={() => joinLobby()} className='border border-pink-200 rounded-sm mx-2 p-2 bg-pink-100 text-black text-xs'>Join Lobby</button>
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
                        {console.log('current board', gameState.gameBoard)}
                        <div className='flex justify-center bg-white'>
                            {gameState.gameBoard?.map((row, rowindex) => (
                                <div key={rowindex} className='grid grid-cols-1'>
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            onClick={() => makeMove(rowindex, cellIndex)}
                                            className='border border-black w-20 h-20 flex justify-center items-center text-4xl hover:bg-purple-200 hover:cursor-pointer'
                                        >
                                            {cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        {gameState.message && <p>{gameState.message}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Socket;
