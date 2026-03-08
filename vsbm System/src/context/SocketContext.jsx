import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // In production, this would be the deployed server URL
        const SERVER_URL = 'http://localhost:5001';

        const newSocket = io(SERVER_URL, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
        });

        setSocket(newSocket);

        // Clean up connection on unmount
        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
