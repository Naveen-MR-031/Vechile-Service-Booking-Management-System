import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Use the same base as the API (strip /api suffix)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const SERVER_URL = apiUrl.replace(/\/api\/?$/, '');

        const newSocket = io(SERVER_URL, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 10,
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
