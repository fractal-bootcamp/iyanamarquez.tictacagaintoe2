import { useState } from 'react';
import makeAIMove, { Board as AIBoard } from './aimove'; // Ensure this is the correct import path
import { checkBoard, Board as GameBoard } from './game';
import { Link } from 'react-router-dom';

const AiPlay = () => {
    const blankBoard = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];
    const [board, setBoard] = useState([
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ]);

    const [robotThinking, setRobotThinking] = useState(false);
    const [winner, setWinner] = useState("");
    const [text, setText] = useState("");

    const handlePlayerMove = (rowIndex: number, cellIndex: number) => {
        // Make sure the cell is empty
        if (board[rowIndex][cellIndex] === "") {
            // Create a copy of the board and make the player's move
            const newBoard = board.map(row => [...row]) as GameBoard;
            newBoard[rowIndex][cellIndex] = "O"; // Assuming "O" is the player's mark

            // Update the board state
            setBoard(newBoard);

            // Check for the end of the game (win/tie) before making the AI move
            let result = checkBoard(newBoard);

            if (result.outcome === "continue") {
                setRobotThinking(true);
                // Cast the board to AIBoard type
                const updatedBoard = makeAIMove(newBoard as AIBoard);
                // wait a second before updating the board
                setTimeout(() => {
                    setBoard(updatedBoard);
                    setRobotThinking(false);
                }, 500);
                result = checkBoard(updatedBoard);
            }
            if (result.outcome === "win") {
                setRobotThinking(false);
                setWinner(result.winner || "");
                setText((result.winner || "Unknown") + " won!");
            }
            if (result.outcome === "tie") {
                setText("Tie");
            }
        }
    };

    const resetBoard = () => {
        setBoard(blankBoard);
        setWinner("");
        setRobotThinking(false);
        setText("");
    }

    return (
        <div>
            <div className='flex justify-start ml-10 mt-2 md:mt-4'>

                <Link to="/">
                    <button className='bg-purple-100 text-black px-4 py-2 rounded-md transition-transform transform active:scale-95 md:mb-10'>Go Back</button>
                </Link>
            </div>
            <h1 className='text-2xl md:text-4xl font-bold text-center mt-2'>AI Play</h1>
            <div className='flex justify-center h-20 mb-4'>
                {winner && <h1 className='text-2xl md:text-4xl font-bold text-center my-10'>{winner} won!</h1>}
                {!winner && robotThinking && <h1 className='text-2xl font-bold text-center my-10'>Robot is thinking...</h1>}
                {!winner && !robotThinking && <h1 className='text-2xl font-bold text-center my-10'>{text}</h1>}
            </div>


            <div className='flex justify-center bg-white mt-10 md:mt-2'>
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className='grid grid-cols-1'>
                        {row.map((cell, cellIndex) => (
                            <div
                                key={cellIndex}
                                onClick={() => handlePlayerMove(rowIndex, cellIndex)}
                                className='border border-black w-20 h-20 flex justify-center items-center text-4xl hover:bg-purple-200 hover:cursor-pointer transition-transform transform focus:outline-none active:scale-95'
                            >
                                {cell}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <button className='bg-purple-500 text-white px-4 py-2 rounded-md mt-4' onClick={() => resetBoard()}>Restart</button>
        </div>
    );
};

export default AiPlay;
