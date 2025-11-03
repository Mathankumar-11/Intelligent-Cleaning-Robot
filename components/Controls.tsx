import React from 'react';
import { SimulationStatus } from '../types';

interface ControlsProps {
    onGenerate: () => void;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    status: SimulationStatus;
    isPlanGenerated: boolean;
}

const Button: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string }> = 
({ onClick, disabled, children, className }) => {
    const base = "w-full px-4 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200";
    const disabledStyles = "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed";
    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${disabled ? disabledStyles : className}`}>
            {children}
        </button>
    );
};


const Controls: React.FC<ControlsProps> = ({ onGenerate, onStart, onPause, onReset, status, isPlanGenerated }) => {
    const isPlanning = status === SimulationStatus.Planning;
    const isRunning = status === SimulationStatus.Running;
    const isPaused = status === SimulationStatus.Paused;
    
    const canGenerate = !(isPlanning || isRunning || isPaused);
    const canStart = (status === SimulationStatus.PlanGenerated || isPaused || status === SimulationStatus.Finished) && isPlanGenerated;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Controls</h3>
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={onGenerate} disabled={!canGenerate} className="bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400">
                    {isPlanning ? 'Planning...' : 'Generate Plan'}
                </button>
                 <Button onClick={onReset} className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-400">
                    Reset
                </Button>
                <Button onClick={onStart} disabled={!canStart} className="bg-green-500 hover:bg-green-600 text-white focus:ring-green-400">
                    { isPaused ? 'Resume' : 'Start'}
                </Button>
                <Button onClick={onPause} disabled={!isRunning} className="bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400">
                    Pause
                </Button>
            </div>
        </div>
    );
};

export default Controls;