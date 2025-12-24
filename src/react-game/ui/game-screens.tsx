import React from 'react';
import { useGameStore } from '../use-game.store';

export const GameScreens: React.FC = () => {
  const gameState = useGameStore((state) => state);
  const startGame = useGameStore((state) => state.startGame);

  return (
    <>
      {/* Start Screen */}
      {!gameState.gameStarted && !gameState.gameOver && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center text-white z-[1000]">
          <h1 className="text-6xl font-bold mb-8 tracking-wider">
            HUMAN VS ZOMBIE
          </h1>
          <p className="mb-8 text-xl text-gray-300">
            Survive the zombie apocalypse!
          </p>
          <button
            onClick={() => startGame()}
            className="px-8 py-4 text-2xl font-bold cursor-pointer bg-green-600 hover:bg-green-500 text-white border-none rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            START GAME
          </button>
          <div className="mt-12 text-sm text-gray-400">
            <p>WASD to Move • Mouse to Aim & Shoot</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/80 flex flex-col items-center justify-center text-white z-[1000]">
          <h1 className="text-6xl font-bold text-red-500 mb-4">GAME OVER</h1>
          <h2 className="text-3xl mb-8">Score: {gameState.score}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-xl font-bold cursor-pointer bg-red-600 hover:bg-red-500 text-white border-none rounded-lg transition-all shadow-lg"
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </>
  );
};
