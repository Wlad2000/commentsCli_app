/****************************************************************************
**
** GLOBAL STORE
**
**
****************************************************************************/

import React, { createContext, useContext, useState } from "react";
import useWsockets from "./Wsockets";

const Context = createContext();


const GlobalStates = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [wsState, setWsState] = useState(0);
    const [wsMessage, setWsMessage] = useState({});
    const [flag, setFlag] = useState(false);

    //Websocket
    const { wsSend, ws } = useWsockets({
        url: 'ws://localhost:3434',
        setWsState,
        setWsMessage,
    });

    return (
        <Context.Provider
            value={{
                ws, wsSend, wsState,
                theme, setTheme,
                flag, setFlag
            }}
        >
            {children}
        </Context.Provider >
    );
};

const useGlobalStates = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error('useGlobalState must be used within a GlobalItemStateProvider');
    }
    return context;
};

export { useGlobalStates, GlobalStates };
