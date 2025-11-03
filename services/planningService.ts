
import { WorldState, Action, Plan, Node, CellType, Position, Grid } from '../types';
import { GRID_SIZE } from '../constants';

// --- Helper Functions ---

const stateToString = (state: WorldState): string => {
    return `${state.robotPos.r},${state.robotPos.c}|${state.grid.flat().join('')}`;
};

const isGoalState = (state: WorldState): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (state.grid[r][c] === CellType.Dirty) {
                return false;
            }
        }
    }
    return true;
};

const calculateHeuristic = (state: WorldState): number => {
    // Admissible heuristic: count of dirty cells. Each clean action reduces this by one.
    let dirtyCount = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (state.grid[r][c] === CellType.Dirty) {
                dirtyCount++;
            }
        }
    }
    return dirtyCount;
};

const getSuccessors = (state: WorldState): { action: Action; newState: WorldState }[] => {
    const successors: { action: Action; newState: WorldState }[] = [];
    const { r, c } = state.robotPos;

    const actions: { action: Action; newPos: Position }[] = [
        { action: Action.MoveUp, newPos: { r: r - 1, c } },
        { action: Action.MoveDown, newPos: { r: r + 1, c } },
        { action: Action.MoveLeft, newPos: { r, c: c - 1 } },
        { action: Action.MoveRight, newPos: { r, c: c + 1 } },
    ];

    // Move actions
    for (const { action, newPos } of actions) {
        if (newPos.r >= 0 && newPos.r < GRID_SIZE && newPos.c >= 0 && newPos.c < GRID_SIZE && state.grid[newPos.r][newPos.c] !== CellType.Obstacle) {
            const newState: WorldState = JSON.parse(JSON.stringify(state));
            newState.robotPos = newPos;
            successors.push({ action, newState });
        }
    }

    // Clean action
    if (state.grid[r][c] === CellType.Dirty) {
        const newState: WorldState = JSON.parse(JSON.stringify(state));
        newState.grid[r][c] = CellType.Clean;
        successors.push({ action: Action.Clean, newState });
    }

    return successors;
};

// --- A* Search Implementation ---

export const findPlan = (initialState: WorldState): Plan | null => {
    if (isGoalState(initialState)) {
        return [];
    }

    const startNode: Node = {
        state: initialState,
        path: [],
        cost: 0,
        heuristic: calculateHeuristic(initialState),
    };
    
    // Using an array as a priority queue, sorted by f = cost + heuristic
    const openList: Node[] = [startNode];
    const visited = new Set<string>([stateToString(initialState)]);

    while (openList.length > 0) {
        // Get the node with the lowest f value
        openList.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
        const currentNode = openList.shift()!;

        if (isGoalState(currentNode.state)) {
            return currentNode.path;
        }

        const successors = getSuccessors(currentNode.state);
        for (const { action, newState } of successors) {
            const newStateStr = stateToString(newState);
            if (!visited.has(newStateStr)) {
                visited.add(newStateStr);
                const newNode: Node = {
                    state: newState,
                    path: [...currentNode.path, action],
                    cost: currentNode.cost + 1,
                    heuristic: calculateHeuristic(newState),
                };
                openList.push(newNode);
            }
        }
    }

    return null; // No plan found
};
