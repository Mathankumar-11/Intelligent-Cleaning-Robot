
export enum CellType {
    Clean,
    Dirty,
    Obstacle,
}

export enum Action {
    MoveUp = 'Move Up',
    MoveDown = 'Move Down',
    MoveLeft = 'Move Left',
    MoveRight = 'Move Right',
    Clean = 'Clean',
    NoOp = 'No Operation',
}

export enum SimulationStatus {
    Idle,
    Planning,
    PlanGenerated,
    Running,
    Paused,
    Finished,
    Error,
}

export type Position = { r: number; c: number };

export type Grid = CellType[][];

export type WorldState = {
    robotPos: Position;
    grid: Grid;
};

export type Plan = Action[];

// For A* search
export type Node = {
    state: WorldState;
    path: Plan;
    cost: number; // g(n)
    heuristic: number; // h(n)
};

export type AnalyticsData = {
    steps: number;
    time: number;
    cellsCleaned: number;
    efficiency: number;
    planningTime: number;
};
