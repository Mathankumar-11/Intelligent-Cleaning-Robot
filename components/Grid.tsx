import React from 'react';
import { Grid, Position, CellType } from '../types';
import { GRID_SIZE } from '../constants';

interface GridProps {
    grid: Grid;
    robotPos: Position;
    onCellClick: (pos: Position, e: React.MouseEvent) => void;
}

const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8.5 12c.83 0 1.5-.67 1.5-1.5S9.33 9 8.5 9 7 9.67 7 10.5 7.67 12 8.5 12zm7 0c.83 0 1.5-.67 1.5-1.5S16.33 9 15.5 9s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-4-3h2v2h-2v-2z" />
        <path d="M12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z" />
    </svg>
);

const DirtIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3/5 h-3/5 opacity-50 text-yellow-700 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);

const Cell: React.FC<{ type: CellType; onClick: (e: React.MouseEvent) => void }> = ({ type, onClick }) => {
    const baseStyle = "w-full h-full flex items-center justify-center border border-gray-200 dark:border-gray-700 cursor-pointer";
    let typeStyle = "";
    let content = null;

    switch (type) {
        case CellType.Clean:
            typeStyle = "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500";
            break;
        case CellType.Dirty:
            typeStyle = "bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800";
            content = <DirtIcon />;
            break;
        case CellType.Obstacle:
            typeStyle = "bg-gray-400 dark:bg-gray-900 cursor-not-allowed";
            break;
    }

    return (
        <div className={`${baseStyle} ${typeStyle}`} onClick={onClick}>
            {content}
        </div>
    );
};


const GridComponent: React.FC<GridProps> = ({ grid, robotPos, onCellClick }) => {
    return (
        <div 
            className="aspect-square w-full max-w-[60vh] p-2 bg-gray-300 dark:bg-gray-900 rounded-md"
            title="Left-click to cycle cell type. Shift+click to move the robot."
        >
            <div className="relative w-full h-full grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {grid.map((row, r) =>
                    row.map((cell, c) => (
                        <Cell key={`${r}-${c}`} type={cell} onClick={(e) => onCellClick({ r, c }, e)} />
                    ))
                )}
                <div
                    className="absolute z-10 p-1 bg-indigo-500 rounded-full shadow-lg"
                    style={{
                        width: `${100 / GRID_SIZE}%`,
                        height: `${100 / GRID_SIZE}%`,
                        top: `${robotPos.r * (100 / GRID_SIZE)}%`,
                        left: `${robotPos.c * (100 / GRID_SIZE)}%`,
                        transition: 'top 0.2s ease-in-out, left 0.2s ease-in-out',
                    }}
                >
                    <RobotIcon />
                </div>
            </div>
        </div>
    );
};

export default GridComponent;