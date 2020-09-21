// flow
import React, {useState, useEffect, useContext} from 'react';
import {View, Button, TextInput, StyleSheet} from 'react-native';
import {
  Text,
  Container,
  Header,
  Content,
  Input,
  Label,
  Left,
  Right,
  Body,
  Icon,
  List,
  ListItem,
  Badge,
  Separator,
  Picker,
} from 'native-base';
import moment from 'moment';
import DatePicker from 'react-native-datepicker';

//import DataContext from '../DataContext';

const EditRecordModal = ({route, navigation}) => {
  const [enterTime, setEnterTime] = useState();
  const [exitTime, setExitTime] = useState();
  const [reportCode, setReportCode] = useState('ddd');

  //const {reportCodes} = useContext(DataContext);

  const item = route.params.item;
  const reportCodes = route.params.reportCodes;

  useEffect(() => {
    const _entryTime = moment(item.date + 'T' + item.entry, 'YYYY-MM-DDTHH:mm');
    setEnterTime(_entryTime);

    const _exitTime = moment(item.date + 'T' + item.exit, 'YYYY-MM-DDTHH:mm');
    setExitTime(_exitTime);
  }, [route.params.item]);

  return (
    <Container>
      <Header span transparent>
        <Left>
          <Icon
            type="Ionicons"
            name="arrow-back"
            onPress={() => navigation.goBack()}
          />
        </Left>
        <Body>
          <Text style={{fontSize: 20}}>{item.date}</Text>
        </Body>
        <Right />
      </Header>
      <Content>
        <List>
          <Separator bordered>
            <Text>Times</Text>
          </Separator>
          <ListItem>
            <Left>
              <Label>Entry Time</Label>
            </Left>
            <Right>
              <DatePicker
                customStyles={{
                  dateInput: {
                    borderWidth: 0,
                  },
                }}
                date={enterTime}
                mode="time"
                is24Hour={true}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                display="default"
                onDateChange={setEnterTime}
              />
            </Right>
          </ListItem>
          <ListItem>
            <Left>
              <Label>Exit Time</Label>
            </Left>
            <Right>
              <DatePicker
                customStyles={{
                  dateInput: {
                    borderWidth: 0,
                  },
                }}
                date={exitTime}
                mode="time"
                is24Hour={true}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                display="default"
                onDateChange={setExitTime}
              />
            </Right>
          </ListItem>
          <Separator bordered>
            <Text>Notes</Text>
          </Separator>
          <ListItem>
            <Left>
              <Text>Report Code</Text>
            </Left>
            <Right>
              <Picker
                note
                mode="dropdown"
                iosHeader="Report Codes"
                style={{width: undefined}}
                selectedValue={reportCode}
                onValueChange={setReportCode}
                iosIcon={<Icon ios="ios-arrow-down" />}>
                {reportCodes.map((el, index) => (
                  <Picker.Item
                    label={el.Description}
                    value={el.Code}
                    key={index}
                  />
                ))}
              </Picker>
            </Right>
          </ListItem>
          <ListItem>
            <Icon ios="ios-create" style={{color: 'green'}} />
            <Label>Notes</Label>
            <TextInput style={styles.panelSubtitle}>{item.notes}</TextInput>
          </ListItem>
        </List>
        <Button onPress={() => navigation.goBack()} title="Update" />
      </Content>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    height: 600,
    padding: 20,
    backgroundColor: '#f7f5eee8',
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    width: 200,
    direction: 'rtl',
  },
});

export default EditRecordModal;