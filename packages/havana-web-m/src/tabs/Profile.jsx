/**
 * @format
 * @flow strict-local
 */
import React, {useState, useEffect, useContext} from 'react';
//import {Spinner} from 'native-base';
import {View, TextInput, Text, Button, SafeAreaView, StyleSheet} from 'react-native';
import { AuthContext } from '../AuthContext';

const Profile = (props) => {
  const [userName, setUserName] = useState();

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const resp = await authContext.API.get('/me', { withCredentials: true });
        console.log(resp.data);
        setUserName(resp.data.userName);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  });

  const onLogout = () => {
    signOut();
  };

  return (
    <View flex paddingH-25 paddingT-120>
      {userName ? (
        <Text blue30 center>
          {userName}
        </Text>
      ) : (
        <Text>loading</Text>
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