 const regeneratorRuntime = require("regenerator-runtime");
import React, {useState, useEffect, useContext, useReducer} from 'react';

import Reports from '../tabs/Reports';
import Profile from '../tabs/Profile';
import Notifications from '../tabs/Notifications';

import { AuthContext } from '../AuthContext';
import { DataContext } from '../DataContext';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
const Tabs = createBottomTabNavigator();

const HavanaTabs = () => 
    <Tabs.Navigator
        initialRouteName="Reports"
        tabBarOptions={{
            activeTintColor: '#e91e63',
        }}>
        <Tabs.Screen
            name="Reports"
            component={Reports}
            options={{
                tabBarLabel: 'Reports'
            }}
        />
        <Tabs.Screen
            name="Notifications"
            component={Notifications}
            options={{
              tabBarLabel: 'Inbox',
            }}
        />
        <Tabs.Screen
            name="Profile"
            component={Profile}
            options={{
                tabBarLabel: 'Profile'
            }}
        />              
    </Tabs.Navigator>

const dataReducer = (prevState, action) => {
  switch (action.type) {
    case 'SET_REPORT_DATA':
      return {
        ...prevState,
        reportData: action.data,
      };

    case 'SET_DAYS_OFF':
      return {
        ...prevState,
        daysOff: action.data,
      };

    case 'SET_MANUAL_UPDATES':
      return {
        ...prevState,
        manualUpdates: action.data,
      };

    case 'SET_REPORT_CODES':
      return {
        ...prevState,
        reportCodes: action.data
      }

    default:
      return {
        ...prevState,
      };
  }
};

const HomeScreen = (props) => {
  
  // All parameters gathered in API will be passed downward 
  // thru DataContext because it's not convinient to use Tab's params for this purpose (but possible).
  // That's why we use old-fashion initial state and reducer hook here instead of useState() hook here
  const initialState = {
    reportData: [],
    daysOff: [],
    manualUpdates: [],
    reportCodes: []
  };
  const [reportData, dispatch] = useReducer(dataReducer, initialState);
  const [employerCode, setEmployerCode] = useState();
  const [reportCodes, setReportCodes] = useState([]);
  
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // + 1;

        let data = [];
        let respArr = await Promise.all([
        //     authContext.API.get(`/daysoff?year=${year}&month=${month}`, { withCredentials: true }),
              authContext.API.get(`/daysoff`, {
                params: {
                  year: year,
                  month: month
                }, 
                withCredentials: true
              }),
        //     // authContext.API.get(`/me/reports/status?month=${month}&year=${year}`, { withCredentials: true }),
              authContext.API.get(`/me/reports/status`, {
                params: {
                  month: month,
                  year: year
                },
                withCredentials: true 
              }),
        //     // authContext.API.get(`/me/manual_updates?year=${year}&month=${month}`, { withCredentials: true })
                authContext.API.get(`/me/manual_updates`, {
                  params: {
                    year: year,
                    month: month
                  },
                  withCredentials: true 
                })
        ]);
        data = respArr[0].data.items.map(
          (item) => new Date(Date.parse(item.date)),
        );
        dispatch({type: 'SET_DAYS_OFF', data: data});

        data = respArr[2].data.items;
        dispatch({type: 'SET_MANUAL_UPDATES', data: data});

        let reportId = 0;

        if (respArr[1].data) {

          // check report's status
          const savedReportId = respArr[1].data.saveReportId;

          let _resp;
          if (savedReportId) {

            const reportStatus = respArr[1].data;
            setEmployerCode(reportStatus.employerCode || 0)

            _resp = await authContext.API.get('/me/report_codes', {
              params: {
                id: authContext.user.userID,
                employerCode: employerCode,
                year: year,
                month: month
              }
            })
            dispatch({type: 'SET_REPORT_CODES', data: _resp.data.items});

            // Interim report found. Actually the following call gets
            // the merged report: saved changes over the original data
            // _resp = await authContext.API.get(`/me/reports/saved?savedReportGuid=${savedReportId}`, { withCredentials: true }
            _resp = await authContext.API.get(`/me/reports/saved`, {
              params: {
                savedReportGuid: savedReportId
              },
              withCredentials: true 
              }
            );
          } else {
            reportId = respArr[1].data.reportId;

            _resp = awaitauthContext.API.get(`/me/reports/${reportId}/updates`, { withCredentials: true },
            );
          }

          data = _resp.data.items.map((item, index) => {
            const _item = {...item, key: index};
            return _item;
          });

          dispatch({type: 'SET_REPORT_DATA', data: data});
        } else {
          // The status of the report is unknown, i.e. get the original report

          const resp = await authContext.API.get(`/me/reports/${year}/${month}`, { withCredentials: true }
          );

          data = resp.data.items.map((item, index) => {
            const _item = {...item, key: index};
            if (reportId === 0) reportId = item.reportId;
            return _item;
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={reportData}>
        <HavanaTabs />
    </DataContext.Provider>
  );
};

export default HomeScreen;

