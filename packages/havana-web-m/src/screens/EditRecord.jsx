import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import moment from 'moment';
import { DatePicker, List, InputItem, WhiteSpace, Icon, Picker } from 'antd-mobile';
import enUs from 'antd-mobile/lib/date-picker/locale/en_US';

const EditRecord = ({route, navigation}) => {

    const [enterTime, setEnterTime] = useState();
    const [exitTime, setExitTime] = useState();
    const [notes, setNotes] = useState('')
    const [reportCode, setReportCode] = useState([1]); // value of one of the report items

    const item = route.params.item;

    useEffect(() => {
        const _entryTime = moment(item.date + 'T' + item.entry, 'YYYY-MM-DDTHH:mm');
        setEnterTime(_entryTime.toDate());

        const _exitTime = moment(item.date + 'T' + item.exit, 'YYYY-MM-DDTHH:mm');
        setExitTime(_exitTime.toDate());
    }, [route.params.item]);

    const initialreportCodes = [{
        label: 'casual',
        value: 1
    }]

    const reportCodes = [
        ...initialreportCodes,
        ...route.params.reportCodes.map( item => (
            {
                label: item.Description,
                value: item.Code
            }
        ))
    ]
 
    const onReportCodeChanged = (v) => {
        setReportCode(v)
    }

    return (
        <View>
            <View>
                <Icon type='left' size='lg'/>
                <Text>{item.date}</Text>
            </View>
            <List className="date-picker-list" style={{ backgroundColor: 'white' }}>
                <DatePicker 
                    value={enterTime}
                    onChange={time => setEnterTime(time)}
                    minuteStep={2}
                    locale={enUs}
                    mode="time"
                    format="HH:mm">
                    <List.Item arrow="horizontal">Entry time</List.Item>
                </DatePicker>
                <DatePicker 
                    value={exitTime}
                    onChange={time => setExitTime(time)}
                    minuteStep={2}
                    locale={enUs}
                    mode="time"
                    format="HH:mm">
                    <List.Item arrow="horizontal">Exit time</List.Item>
                </DatePicker>                   
            </List>
            <WhiteSpace />
            <List>
                <InputItem 
                    placeholder="Notes"
                    clear
                    onChange={ val => setNotes(val)}>
                    Notes
                </InputItem>
            </List>
            <WhiteSpace />
            <List>
                <Picker data={reportCodes}
                    title='Report Codes'
                    okText='OK'
                    dismissText='Cancel'
                    cols={1}
                    value={reportCode}
                    onOk={onReportCodeChanged}>
                    <List.Item arrow="horizontal">Report Code</List.Item>
                </Picker>    
            </List>
            <WhiteSpace />
            <button onClick={() => navigation.goBack()}>BACK</button>
            <button>UPDATE</button>
        </View>
    )
}

export default EditRecord;