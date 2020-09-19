import React, {useState, useContext} from 'react';
import axios from 'axios';
import {SafeAreaView, StyleSheet} from 'react-native';

import {Button, Text, View} from 'react-native-ui-lib';
import {
  Container,
  Content,
  Form,
  Item,
  Input,
  Label,
  Spinner,
} from 'native-base';

import AuthContext from '../AuthContext';

const OtpScreen = (props) => {
  const [otp, setOtp] = useState();
  const [loading, setLoading] = useState(false);
  const {signIn} = useContext(AuthContext);

  const onSendOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        'https://api.tel-aviv.gov.il/auth/api/token',
        {code: otp},
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            'Ocp-Apim-Subscription-Key': 'CA81D4A1-F084-406C-AC9D-C0B897EB2AE9',
          },
        },
      );
      const {access_token, token_type, expires_in, refresh_token} = res.data;
      signIn(access_token, token_type, expires_in, refresh_token);

      props.navigation.push('My Office');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {top: 22}]}>
      <Content>
        {loading ? (
          <Spinner size="large" color="#0000ff" />
        ) : (
          <>
            <Form>
              <Item floatingLabel>
                <Label>OTP</Label>
                <Input
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="phone-pad"
                />
              </Item>
            </Form>
            <View>
              <View marginT-100 center>
                <Button
                  text70
                  white
                  background-blue30
                  label="Sign In"
                  onPress={() => onSendOtp()}
                />
              </View>
              <View style={[styles.horizontal, {top: 32}]}>
                <Text
                  adjustsFontSizeToFit
                  style={[styles.textHint, {marginRight: 6}]}>
                  SMS not arriving?
                </Text>
                <Text
                  style={[styles.link, styles.textHint]}
                  primary
                  onPress={() => props.navigation.goBack()}>
                  <Text>Try again</Text>
                </Text>
              </View>
            </View>
          </>
        )}
      </Content>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: 14,
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  textHint: {
    fontSize:18,
  },
  link: {
    opacity: 0.9,
    color: 'blue',
  },
});

export default OtpScreen;
