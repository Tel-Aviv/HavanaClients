import React from 'react'

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
const Stack = createStackNavigator();

import { getUserFromHtml, getHost, getProtocol, API } from './utils';
import { AuthContext } from "./AuthContext";
import HomeScreen from './screens/HomeScreen'
import EditRecord from './screens/EditRecord';

const App = () => {

    const context = {
        user : getUserFromHtml(),
        host : getHost(),
        protocol: getProtocol(),
        API: API
    }

    return (
        <AuthContext.Provider value={context}>
            <NavigationContainer>
                <Stack.Navigator mode="card">
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}>
                    </Stack.Screen> 
                    <Stack.Screen
                        name="Edit Record"
                        component={EditRecord}
                        options={{
                            headerShown: false,
                        }}
                    />                  
                </Stack.Navigator>               
            </NavigationContainer>
        </AuthContext.Provider>
    )
}    

export default App;
