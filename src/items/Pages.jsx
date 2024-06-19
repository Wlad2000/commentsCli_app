/****************************************************************************
**
** NAVIGATION
**
**
****************************************************************************/

import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainScreen from "../screens/MainScreen";
import CommentForm from "../components/CommentForm";



const Pages = (props) => {
    const Stack = createStackNavigator();

    const headerBar = {
        headerStyle: { backgroundColor: 'white' },
        headerTitleStyle: { color: 'gray' }
    };

    return (
        <Stack.Navigator initialRouteName="Comments">
            <Stack.Screen name="Comments" component={MainScreen} options={headerBar} />
            <Stack.Screen name="CommentForm" component={CommentForm} options={headerBar} />
        </Stack.Navigator>
    )


};

export { Pages };