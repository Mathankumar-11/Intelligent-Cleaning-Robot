import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CellType, Action, Position, Grid, WorldState, Plan, SimulationStatus, AnalyticsData } from '../types';
import { GRID_SIZE, SIMULATION_SPEED_MS } from '../constants';
import GridComponent from './Grid';
import Controls from './Controls';
import Analytics from './Analytics';
import Header from './Header';
import { findPlan } from '../services/planningService';

const createInitialGrid = (): Grid => {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CellType.Clean));
};

const Dashboard: React.FC<{ theme: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const [initialState, setInitialState] = useState<WorldState>(() => ({
        robotPos: { r: 0, c: 0 },
        grid: createInitialGrid(),
    }));
    const [currentState, setCurrentState] = useState<WorldState>(initialState);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>(SimulationStatus.Idle);
    const [currentStep, setCurrentStep] = useState(0);
    const [analytics, setAnalytics] = useState<AnalyticsData>({ steps: 0, time: 0, cellsCleaned: 0, efficiency: 0, planningTime: 0 });

    const simulationInterval = useRef<number | null>(null);

    const resetSimulation = useCallback(() => {
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
        }
        setCurrentState(initialState);
        setPlan(null);
        setCurrentStep(0);
        setSimulationStatus(SimulationStatus.Idle);
        setAnalytics({ steps: 0, time: 0, cellsCleaned: 0, efficiency: 0, planningTime: 0 });
    }, [initialState]);
    
    const handleSetInitialState = (pos: Position, e: React.MouseEvent) => {
        if (simulationStatus !== SimulationStatus.Idle) return;
    
        setInitialState(prev => {
            const newGrid = prev.grid.map(row => [...row]);
            let newRobotPos = { ...prev.robotPos };

            // With shift key, try to move robot
            if (e.shiftKey) {
                if (newGrid[pos.r][pos.c] !== CellType.Obstacle) {
                    newRobotPos = pos;
                }
            } else { // Otherwise, cycle cell type
                // Prevent changing the cell where the robot is located
                if (pos.r === prev.robotPos.r && pos.c === prev.robotPos.c) {
                    return prev;
                }
                newGrid[pos.r][pos.c] = (newGrid[pos.r][pos.c] + 1) % 3;
            }
            
            const newWorldState = { robotPos: newRobotPos, grid: newGrid };
            // We must also update currentState to see the changes immediately
            setCurrentState(newWorldState);
            return newWorldState;
        });
    };

    const handleGeneratePlan = async () => {
        setSimulationStatus(SimulationStatus.Planning);
        setPlan(null);
        setAnalytics({ steps: 0, time: 0, cellsCleaned: 0, efficiency: 0, planningTime: 0 });
        
        await new Promise(resolve => setTimeout(resolve, 50)); // Allow UI to update
        
        const startTime = performance.now();
        const generatedPlan = findPlan(initialState);
        const endTime = performance.now();

        if (generatedPlan) {
            setPlan(generatedPlan);
            setSimulationStatus(SimulationStatus.PlanGenerated);
            const cellsCleaned = generatedPlan.filter(a => a === Action.Clean).length;
            const steps = generatedPlan.length;
            setAnalytics({
                steps,
                time: (steps * SIMULATION_SPEED_MS) / 1000,
                cellsCleaned,
                efficiency: steps > 0 ? (cellsCleaned / steps) * 100 : 0,
                planningTime: endTime - startTime,
            });
        } else {
            setSimulationStatus(SimulationStatus.Error);
        }
    };

    const applyAction = (state: WorldState, action: Action): WorldState => {
        const newState = JSON.parse(JSON.stringify(state));
        switch (action) {
            case Action.MoveUp: newState.robotPos.r--; break;
            case Action.MoveDown: newState.robotPos.r++; break;
            case Action.MoveLeft: newState.robotPos.c--; break;
            case Action.MoveRight: newState.robotPos.c++; break;
            case Action.Clean:
                newState.grid[newState.robotPos.r][newState.robotPos.c] = CellType.Clean;
                break;
        }
        return newState;
    };
    
    const startSimulation = useCallback(() => {
        if (!plan || simulationStatus === SimulationStatus.Running) return;
        setSimulationStatus(SimulationStatus.Running);

        simulationInterval.current = window.setInterval(() => {
            setCurrentStep(prevStep => {
                if (prevStep >= plan.length) {
                    if (simulationInterval.current) clearInterval(simulationInterval.current);
                    return prevStep;
                }

                setCurrentState(prevState => applyAction(prevState, plan[prevStep]));
                
                const nextStep = prevStep + 1;

                if (nextStep >= plan.length) {
                    if (simulationInterval.current) clearInterval(simulationInterval.current);
                    setSimulationStatus(SimulationStatus.Finished);
                }
                return nextStep;
            });
        }, SIMULATION_SPEED_MS);
    }, [plan, simulationStatus]);


    const pauseSimulation = () => {
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
        }
        setSimulationStatus(SimulationStatus.Paused);
    };

    useEffect(() => {
        return () => {
            if (simulationInterval.current) {
                clearInterval(simulationInterval.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <Header theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <GridComponent grid={currentState.grid} robotPos={currentState.robotPos} onCellClick={handleSetInitialState} />
                </div>
                <div className="flex flex-col space-y-6">
                    <Controls 
                        onGenerate={handleGeneratePlan}
                        onStart={startSimulation}
                        onPause={pauseSimulation}
                        onReset={resetSimulation}
                        status={simulationStatus}
                        isPlanGenerated={!!plan}
                    />
                    <Analytics analytics={analytics} plan={plan} currentStep={currentStep} status={simulationStatus} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;