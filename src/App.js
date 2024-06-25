
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { Pages } from './items/Pages';
import { GlobalStates } from './items/States';
import "./i18n/i18n";

const App = () => {
  return (
    <NavigationContainer >
    <GlobalStates>
        <Pages />
    </GlobalStates>
</NavigationContainer >
  )
}

export default App
