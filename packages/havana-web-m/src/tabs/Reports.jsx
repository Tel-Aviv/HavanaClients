/**
 * @format
 */
import React, {forwardRef, useState, useEffect, useContext} from 'react';
import _ from 'lodash';
import moment from 'moment';
import {
  Platform,
  Alert,
  StyleSheet,
  ScrollView,
  View,
  SafeAreaView,
  Button,
  TouchableOpacity,
} from 'react-native';
import { SectionList, Text}  from 'react-native';
import DatePicker, { registerLocale, CalendarContainer } from 'react-datepicker';
import he from 'date-fns/locale/he';
registerLocale('he', he);

import "react-datepicker/dist/react-datepicker.css";
import { getMonth, getYear } from 'date-fns'

import { DataContext } from '../DataContext';

const themeColor = '#00AAAF';
const lightThemeColor = '#EBF9F9';

const Reports = ({route, navigation}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [monthlyReportData, setMonthlyReportData] = useState([]);
  
  const {reportData, daysOff, manualUpdates, reportCodes} = useContext(DataContext);
  console.log(reportCodes);

  // const bs = React.createRef();

  useEffect(() => {
    if( reportData.length > 0 )
    {
      const _data = reportData.map((item) => {
        const date = moment(item.rdate).format('YYYY-MM-DD');

        return {
          title: `${date} (${item.dayOfWeek})`,
          data: [
            {
              entry: item.entry,
              exit: item.exit,
              total: item.total,
              notes: item.notes,
              date: date,
              reportCode: item.reportType
            },
          ],
        };
      });

      setMonthlyReportData(_data);
    }
  }, [reportData]);

  const itemPressed = (item) => {
    // setEditingRecord(item);
    // bs.current.snapTo(0);

    navigation.navigate('Edit Record', {
      item: item,
      reportCodes: reportCodes
    });
  };

  const renderEmptyItem = () => {
    return (
      <View style={styles.emptyItem}>
        <Text style={styles.emptyItemText}>No Events Planned</Text>
      </View>
    );
  };

  const isWorkingDay = (item) => {
    const itemDate = moment(item.date);

    return !(itemDate.day() === 5 || itemDate.day() === 6);
  };

  const renderItem = ({item}, rest) => {
    if (_.isEmpty(item)) {
      return renderEmptyItem();
    }

    const iconClassName = {
      color: isWorkingDay(item) ? 'green' : 'gray',
    };

    return (
      <TouchableOpacity onPress={() => itemPressed(item)} style={styles.item}>
        <View style={styles.timesSection}>
          <Text>Record Code: {item.reportCode || 'casual'}</Text>
          <Text style={styles.itemHourText}>Enter: {item.entry}</Text>
          <Text style={styles.itemHourText}>Exit: {item.exit}</Text>
          <Text style={styles.itemDurationText}>Total: {item.total}</Text>
        </View>
        <View style={styles.cellItem}>
          {/* <Icon
            active={false}
            type="Ionicons"
            name={'checkmark-circle'}
            style={iconClassName}
          /> */}
        </View>
        <Text style={[styles.itemTitleText, styles.cellItem]}>
          {item.notes}
        </Text>
      </TouchableOpacity>
    );
  };

  const HebContainer = ( {className, children}) => {
    return (
      <View style={{direction: 'rtl'}}>
        <CalendarContainer>
          {children}
        </CalendarContainer>
      </View>
    )
  }

  const StyledMonthInput = forwardRef( ({value, onClick}, ref) => {
    return <View style={styles.fixToText}>
                <button ref={ref} 
                    className='monthInput'
                    onClick={onClick}>{value}</button>
            </View>
  });

  const onMonthChange = (date) => {
    console.log(`${getMonth(date)+1}/${getYear(date)}`)
    setStartDate(date)
  }

  return (
    <View style={styles.container}>
          <DatePicker
              calendarContainer={HebContainer}
              selected={startDate}
              locale="he"
              customInput={<StyledMonthInput />}
              onChange={ onMonthChange }
              dateFormat="MM/yyyy"
              showMonthYearPicker
          />
          <SectionList 
              sections={monthlyReportData}
              renderItem={ renderItem }
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.header}>{title}</Text>
              )}      
              keyExtractor={(item, index) => index}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: 24
  },  
  header: {
    fontSize: 8,
    backgroundColor: "red",
    direction: 'ltr'
  },
  fitToText: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  section: {
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize',
  },
  timesSection: {
    paddingRight: 14,
    borderRightWidth: 2,
    borderRightColor: 'green',
  },
  item: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row',
  },
  cellItem: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  itemHourText: {
    color: 'black',
  },
  itemDurationText: {
    color: 'grey',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  itemTitleText: {
    color: 'black',
    marginLeft: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  emptyItem: {
    paddingLeft: 20,
    height: 52,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  emptyItemText: {
    color: 'lightgrey',
    fontSize: 14,
  },
  // bottom sheet
  panel: {
    height: 600,
    padding: 20,
    backgroundColor: '#f7f5eee8',
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#318bfb',
    alignItems: 'center',
    marginVertical: 10,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
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

export default Reports;

