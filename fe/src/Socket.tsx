import React, { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:3001'; // URL of your WebSocket server

const Socket: React.FC = () => {
    const blankBoard = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];

    const [lobbyInput, setLobbyInput] = useState('');
    const [state, setState] = useState<{
        gameBoard: typeof blankBoard;
        playerLetter: string | null;
        lobbyId: string;
        message: string;
    }>({
        gameBoard: blankBoard,
        playerLetter: null,
        lobbyId: '',
        message: '',
    });

    const wsRef = useRef<WebSocket | null>(null);

    const connectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close(); // Close existing connection if it exists
        }

        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
            console.log('WebSocket connection opened');
        };

        wsRef.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'LOBBY_CREATED':
                    setState(prev => ({ ...prev, lobbyId: data.lobbyId, playerLetter: 'X' }));
                    break;
                case 'JOINED_LOBBY':
                    setState(prev => ({ ...prev, playerLetter: data.playerLetter }));
                    break;
                case 'GAME_START':
                    setState(prev => ({ ...prev, gameBoard: data.board }));
                    break;
                case 'MOVE_MADE':
                    setState(prev => ({ ...prev, gameBoard: data.board }));
                    break;
                case 'LOBBY_FULL':
                    setState(prev => ({ ...prev, message: 'Lobby is full' }));
                    break;
                case 'PLAYER_LEFT':
                    setState(prev => ({ ...prev, message: 'A player left the game' }));
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket connection closed, reconnecting...');
            setTimeout(connectWebSocket, 3000); // Attempt to reconnect after 3 seconds
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const createLobby = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'CREATE_LOBBY' }));
        } else {
            console.error('WebSocket connection is not open');
        }
    };

    const joinLobby = (id: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'JOIN_LOBBY', lobbyId: id }));
        } else {
            console.error('WebSocket connection is not open');
        }
    };

    const makeMove = (row: number, col: number) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'MAKE_MOVE', lobbyId: state.lobbyId, row: row, col: col, playerLetter: state.playerLetter }));
        } else {
            console.error('WebSocket connection is not open');
        }
    };


    return (
        <div>
            <h1 className='text-2xl font-bold mb-6 underline'>Tic-Tac-Toe</h1>
            {state.lobbyId != '' && <span >Lobby ID: <span className='font-mono'>{state.lobbyId}</span></span>}
            <div className='flex flex-col items-center gap-4 mt-4'>
                {state.playerLetter === null ? (
                    <div className='flex flex-col items-start gap-4'>
                        <button onClick={createLobby} className='border border-pink-200 rounded-sm mx-2 p-2 bg-pink-100 text-black text-xs'>Create Lobby</button>
                        <div className='flex flex-row items-center gap-4'>
                            <button onClick={() => joinLobby(lobbyInput)} className='border border-pink-200 rounded-sm mx-2 p-2 bg-pink-100 text-black text-xs'>Join Lobby</button>
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
                            {state.gameBoard.map((row, rowindex) => (
                                <div key={rowindex} className='grid grid-cols-1'>
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            onClick={() => makeMove(rowindex, cellIndex)}
                                            className=' border border-black w-20 h-20 flex justify-center items-center text-4xl hover:bg-purple-200 hover:cursor-pointer'
                                        >
                                            {cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        {state.message && <p>{state.message}</p>}
                    </div>
                )}
            </div>
        </div>

    );
};

export default Socket;
