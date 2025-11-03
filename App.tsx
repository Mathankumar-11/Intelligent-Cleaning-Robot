
import React, { useState, useEffect } from 'react';
import LoginComponent from './components/Login';
import Dashboard from './components/Dashboard';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
            {isAuthenticated ? (
                <Dashboard theme={theme} toggleTheme={toggleTheme} />
            ) : (
                <LoginComponent onLogin={handleLogin} />
            )}
        </div>
    );
};

export default App;
