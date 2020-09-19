/* eslint-disable no-unused-vars */
/**
 * @format
 */

import React, {
  useState,
  useEffect,
  useReducer,
  useMemo,
  createContext,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Alert,
  StatusBar,
} from 'react-native';

import axios from 'axios';
import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-community/async-storage';
import {Icon} from 'native-base';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {createStackNavigator} from '@react-navigation/stack';
const Stack = createStackNavigator();

import {NavigationContainer} from '@react-navigation/native';

import AuthContext from './AuthContext';

import HomeScreen from './screens/HomeScreen';
import SignInScreen from './screens/SignInScreen';
import OtpScreen from './screens/OtpScreen';
import EditRecordModal from './screens/EditRecordModal';

const reducer = (prevState, action) => {
  switch (action.type) {
    case 'SIGN_OUT':
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        refreshToken: null,
      };

    case 'SIGN_IN':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.token,
        refreshToken: action.refreshToken,
      };
  }
};

const App = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [userToken, setUserToken] = useState();
  const [state, dispatch] = useReducer(reducer, {
    isOtpSent: false,
    userToken: null,
    refreshToken: null,
  });

  const authContext = useMemo(
    () => ({
      signIn: async (accessToken, tokenType, expires_in, refreshToken) => {
        console.log(
          `Access token: ${accessToken}, Refresh token: ${refreshToken}`,
        );

        AsyncStorage.setItem('userToken', accessToken);
        AsyncStorage.setItem('refreshToken', refreshToken);
        setUserToken(accessToken);

        dispatch({
          type: 'SIGN_IN',
          token: accessToken,
          refreshToken: refreshToken,
        });
      },
      signOut: () => dispatch({type: 'SIGN_OUT'}),
    }),
    [],
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let _userToken;

      try {
        _userToken = await AsyncStorage.getItem('userToken');
        console.log(_userToken);
      } catch (e) {
        // Restoring token failed
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    const setupGeoFences = async () => {
      try {
        BackgroundGeolocation.onLocation(onLocation, onError);
        BackgroundGeolocation.onMotionChange(onMotionChange);
        BackgroundGeolocation.onProviderChange(onProviderChange);
        BackgroundGeolocation.addGeofence({
          identifier: 'Office',
          radius: 200,
          latitude: 32.084136,
          longitude: 34.782755,
          notifyOnEntry: true,
          notifyOnExit: true,
        });
        BackgroundGeolocation.onGeofence(onGeoFence);
        const locationState = await BackgroundGeolocation.ready({
          desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
          distanceFilter: 10,
          logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
          debug: true,
          stopOnTerminate: false, // <-- Allow the background-service to continue tracking when app terminated.
          startOnBoot: true,
          locationAuthorizationRequest: 'Always',
          geofenceModeHighAccuracy: true,
        });

        console.log(
          '- BackgroundGeolocation is configured and ready: ',
          locationState.enabled,
        );
        //if (locationState.enabled) {
        // engage geofences-only mode:
        BackgroundGeolocation.startGeofences();
        // BackgroundGeolocation.start(() => {
        //   console.log('- Start success');
        // });
      } catch (error) {
        console.log('- BackgroundGeolocation error: ', error);
      }
    };

    setupGeoFences();
  });

  const onLocation = (location) => {
    console.log('[location] - ', location);
  };
  const onMotionChange = (event) => {
    console.log('[motionchange] - ', event);
  };
  const onProviderChange = (event) => {
    console.log('[providerchange] - ', event.enabled, event.status);
  };
  const onError = (error) => {
    console.warn('[location] ERROR -', error);
  };
  const onGeoFence = (geofence) => {
    console.log('[geofence] ', geofence.identifier, geofence.action);
  };

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator mode="card">
          <>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{
                title: 'Sign in',
              }}
            />
            <Stack.Screen
              name="OTP"
              component={OtpScreen}
              options={{
                title: 'OTP',
              }}
            />
            <Stack.Screen
              name="Edit Record"
              component={EditRecordModal}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="My Office"
              component={HomeScreen}
              options={{
                headerLeft: () => null,
                headerRight: () => (
                  <View style={styles.horizontal}>
                    <Icon
                      name="ios-checkmark-circle-outline"
                      size={24}
                      color={'red'}
                      style={styles.rightBandItem}
                      onPress={() => Alert.alert('check')}
                    />
                    <Icon
                      name="send"
                      size={24}
                      color={'red'}
                      style={styles.rightBandItem}
                      onPress={() => Alert.alert('send')}
                    />
                  </View>
                ),
              }}
            />
          </>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  rightBandItem: {
    marginRight: 18,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
