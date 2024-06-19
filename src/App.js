
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { Pages } from './items/Pages';
import { GlobalStates } from './items/States';
import "./i18n/i18n";


// WebSocket
const ws = new WebSocket(`ws://localhost:3434`);
ws.onopen = () => {
    console.log("Connection...");
    console.log("ws: ", ws);
    const message = {
        type: "debug",
        msg: "React native is connected to WebSocket",
    };
    ws.send(JSON.stringify(message));
};
const App = () => {
  return (
    <NavigationContainer>
    <GlobalStates ws={ws}>
        <Pages />
    </GlobalStates>
</NavigationContainer >
  )
}

export default App