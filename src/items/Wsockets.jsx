import { useEffect, useState, useRef } from 'react';

const useWsockets = ({ url, setWsState, setWsMessage }) => {
    const [ws, setWs] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeout = useRef(null);
    const reconnectAttempts = useRef(0);
    const checkingInterval = useRef(null);

    const connect = () => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const websocket = new WebSocket(url);
        wsRef.current = websocket;

        websocket.onopen = () => {
            console.log("Connected to WebSocket");
            websocket.send(JSON.stringify({
                type: "debug",
                msg: "CommentsApp is connected to WebSocket"
            }));
            setWsState(websocket.readyState);
            reconnectAttempts.current = 0;
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
        };

        websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setWsMessage(message);
        };

        websocket.onclose = () => {
            console.log("WebSocket connection closed, attempting to reconnect...");
            setWsState(websocket.readyState);
            if (!reconnectTimeout.current) {
                reconnectTimeout.current = setTimeout(() => {
                    reconnectAttempts.current += 1;
                    console.log("Reconnecting...");
                    connect();
                }, 3000); // reconnect
            }
        };

        websocket.onerror = (error) => {
            console.log("WebSocket error: ", error);
            websocket.close();
        };

        setWs(websocket);
    };

    const checkConnection = () => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            connect();
        }
    };

    useEffect(() => {
        connect();
        checkingInterval.current = setInterval(checkConnection, 5000);

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (checkingInterval.current) {
                clearInterval(checkingInterval.current);
            }
        };
    }, [url]);

    const wsSend = (msg) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg));
        } else {
            console.log("WebSocket is not open. Ready state is:", ws ? ws.readyState : 'null');
        }
    };

    return { wsSend, ws };
};

export default useWsockets;
