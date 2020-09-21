/**
 * @format
 * @flow
 */
import React, {useEffect, useContext, useReducer} from 'react';
import axios from 'axios';
import {StyleSheet} from 'react-native';
import {Spinner} from 'native-base';
import {View, Text, Button} from 'react-native-ui-lib';
import AsyncStorage from '@react-native-community/async-storage';

import AuthContext from '../AuthContext';

const Profile = (props) => {

  const [me, setMe] = useReducer(
    (state, newState) => ({...state, ...newState}),
    {
      userName: '',
      userID: '',
    },
  );

  const {signOut} = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('userToken');
        console.log(accessToken);

        const resp = await axios('https://api.tel-aviv.gov.il/ps/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setMe({
          userName: resp.data.userName,
          userID: resp.data.ID,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  });

  const onLogout = () => {
    AsyncStorage.setItem('userToken', null);
    signOut();
    props.navigation.navigate('SignIn');
  };

  return (
    <View flex paddingH-25 paddingT-120>
      {me ? (
        <View>
          <Text blue30 center>
            {me.userName}
          </Text>
          <Text blue30 center>
            {me.userID}
          </Text>
        </View>
      ) : (
        <Spinner />
      )}
      <View marginT-100 center>
        <Button
          text70
          white
          background-orange30
          label="Logout"
          onPress={() => onLogout()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: 14,
  },
});

export default Profile;
