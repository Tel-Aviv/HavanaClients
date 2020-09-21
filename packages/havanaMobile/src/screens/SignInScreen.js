/**
 * @format
 * @flow strict-local
 */
import React, {useState} from 'react';
import axios from 'axios';
import {
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {
  Container,
  Content,
  Form,
  Item,
  Input,
  Label,
  Spinner,
} from 'native-base';
import {Button, Text, View} from 'react-native-ui-lib';

const SignInScreen = ({navigation}) => {
  const [username, setUsername] = useState('c1306948');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('0543307026');

  const colorScheme = useColorScheme();

  const onSignIn = async () => {
    try {
      setLoading(true);
      const res = await axios(
        `https://api.tel-aviv.gov.il/auth/api/otp?id=${username}&phoneNum=${phoneNumber}`,
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Ocp-Apim-Subscription-Key': 'CA81D4A1-F084-406C-AC9D-C0B897EB2AE9',
          },
        },
      );
      console.log(res);
      navigation.navigate('OTP');
      //signIn(username, phoneNumber);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {loading ? (
          <Spinner size="large" color="#0000ff" />
        ) : (
          <>
            <Form>
              <Text blue50 text20 style={styles.title}>
                Welcome
              </Text>
              <Item floatingLabel>
                <Label>Username</Label>
                <Input
                  placeholder="Username"
                  writingDirection="ltr"
                  value={username}
                  onChangeText={setUsername}
                />
              </Item>
              <Item floatingLabel last>
                <Label>Phone Number</Label>
                <Input
                  placeholder="Phone Number"
                  value={phoneNumber}
                  keyboardType="phone-pad"
                  onChangeText={setPhoneNumber}
                />
              </Item>
            </Form>
            <View center>
              <Button
                text70
                white
                background-blue30
                label="Send SMS"
                style={{top: 20}}
                onPress={() => onSignIn()}
              />
            </View>
          </>
        )}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    // paddingHorizontal: 14,
    marginHorizontal: 0,
  },
  title: {
    paddingHorizontal: 14,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  // bottom sheet
  panel: {
    height: 600,
    padding: 20,
    backgroundColor: '#f7f5eee8',
  },
  header: {
    backgroundColor: '#f7f5eee8',
    shadowColor: '#000000',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
});

export default SignInScreen;
