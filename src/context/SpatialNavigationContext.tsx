import React, { createContext, useContext, useEffect } from 'react';
import { init } from '@noriginmedia/norigin-spatial-navigation';

interface SpatialNavigationContextType {
    isNavigationEnabled: boolean;
}

const SpatialNavigationContext = createContext<SpatialNavigationContextType>({
    isNavigationEnabled: true,
});

export const useSpatialNavigationContext = () => {
    return useContext(SpatialNavigationContext);
};

interface SpatialNavigationProviderProps {
    children: React.ReactNode;
}

export const SpatialNavigationProvider: React.FC<SpatialNavigationProviderProps> = ({ children }) => {
    useEffect(() => {
        // Initialize spatial navigation
        init({
            // Debug mode - set to false in production
            debug: false,
            // Visualize focus - helpful for development
            visualDebug: false,
        });
    }, []);

    return (
        <SpatialNavigationContext.Provider value={{ isNavigationEnabled: true }}>
            {children}
        </SpatialNavigationContext.Provider>
    );
};
