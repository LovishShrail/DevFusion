import socket from 'socket.io-client';


let socketInstance = null;


export const initializeSocket = (projectId) => {

    if (socketInstance) {
        socketInstance.disconnect();
    }

    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: {
            // token: localStorage.getItem('token')
        },
        query: {
            projectId
        },
        withCredentials: true
    });

    return socketInstance;

}

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}

export const receiveMessage = (eventName, cb) => {
    if (socketInstance) {
        socketInstance.off(eventName); // Remove old listener before adding new one
        socketInstance.on(eventName, cb);
    }
}

export const sendMessage = (eventName, data) => {
    if (socketInstance) socketInstance.emit(eventName, data);
}