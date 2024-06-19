/****************************************************************************
**
** WEBSOCKET
**
**
****************************************************************************/


import { useEffect } from 'react';

const useWsockets = ({ ws, setWsState, setWsMessage }) => {
    const wsSend = (msg) => ws.send(JSON.stringify(msg));

    useEffect(() => {
        ws.onopen = () => {
            console.log("Connection...");
            console.log("ws: ", ws);
            ws.send(JSON.stringify({
                type: "debug",
                msg: "CommentsApp is connected to WebSocket"
            }));
            setWsState(ws.readyState);
        }

        ws.onmessage = (event) => {
            const { type, data } = JSON.parse(event.data);
            setWsMessage(JSON.parse(event.data));
            //console.log("messagews: ", JSON.parse(event.data));
        };
    }, []);
    return { wsSend };
};

export default useWsockets;
