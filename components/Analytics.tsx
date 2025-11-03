
import React from 'react';
import { AnalyticsData, Plan, SimulationStatus, Action } from '../types';

interface AnalyticsProps {
    analytics: AnalyticsData;
    plan: Plan | null;
    currentStep: number;
    status: SimulationStatus;
}

const StatCard: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {value} <span className="text-sm font-normal">{unit}</span>
        </p>
    </div>
);

const getStatusMessage = (status: SimulationStatus): { text: string; color: string } => {
    switch (status) {
        case SimulationStatus.Idle: return { text: 'Ready to Plan', color: 'text-gray-500 dark:text-gray-400' };
        case SimulationStatus.Planning: return { text: 'Generating Plan...', color: 'text-blue-500' };
        case SimulationStatus.PlanGenerated: return { text: 'Plan Generated!', color: 'text-green-500' };
        case SimulationStatus.Running: return { text: 'Simulation Running', color: 'text-green-500' };
        case SimulationStatus.Paused: return { text: 'Simulation Paused', color: 'text-yellow-500' };
        case SimulationStatus.Finished: return { text: 'Simulation Finished', color: 'text-indigo-500' };
        case SimulationStatus.Error: return { text: 'No Plan Found', color: 'text-red-500' };
        default: return { text: 'Idle', color: 'text-gray-500 dark:text-gray-400' };
    }
};

const Analytics: React.FC<AnalyticsProps> = ({ analytics, plan, currentStep, status }) => {
    const statusMessage = getStatusMessage(status);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex-grow flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Analytics</h3>
            
            <div className="mb-4 text-center">
                <p className={`font-semibold text-lg ${statusMessage.color}`}>{statusMessage.text}</p>
                {analytics.planningTime > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Planning took {analytics.planningTime.toFixed(2)} ms
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard label="Steps" value={analytics.steps} />
                <StatCard label="Time" value={analytics.time.toFixed(1)} unit="s" />
                <StatCard label="Cleaned" value={analytics.cellsCleaned} />
                <StatCard label="Efficiency" value={analytics.efficiency.toFixed(1)} unit="%" />
            </div>
            
            <h4 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Action Plan</h4>
            <div className="flex-grow bg-gray-100 dark:bg-gray-900 rounded-md p-2 overflow-y-auto h-32">
                {plan ? (
                    <ul className="space-y-1 text-sm">
                        {plan.map((action, index) => (
                            <li
                                key={index}
                                className={`px-2 py-1 rounded ${
                                    index < currentStep && (status === SimulationStatus.Running || status === SimulationStatus.Finished || status === SimulationStatus.Paused)
                                        ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            >
                                <span className="font-mono text-gray-500 dark:text-gray-400 mr-2">{index + 1}.</span>
                                {action}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        No plan generated yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
