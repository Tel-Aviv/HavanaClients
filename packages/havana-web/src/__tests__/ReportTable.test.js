// 
// Report Table Test Suite
// 
// Test the apperiance on TableReport Component based on varios report data.
//
// This test suite uses dynamic environment variables approach to mock axios calls.
// See beforeAll() for the details.
// This is experiment used in contast with configuation approach (setEnvVars.js) taken for other suites 
//
import 'babel-polyfill'
import './matchMedia.mock';

import React from 'react';
import { Provider } from 'react-redux'
import moment from 'moment';

import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import translations from '../translations';

import renderer from 'react-test-renderer';

import TableReport from '../components/reports/TableReport';
import store from '../redux/store';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: false
  })

 const year = 2020;
 const month = 7; 

 let daysOff = [];
 let employeKind;
 let employerCode;
 let report_items = [];
 let manualUpdates = [];
 let isReportEditable = false;

describe('Get report data and display it', () => {

    const OLD_ENV = process.env;

    // Reproduce app logic to get the report data
    beforeAll( async() => {

        //
        // Set 'mock' environment variable 
        // and load API dynamically that should be mocked
        //
        jest.resetModules() //clears the cache
        process.env = { ...OLD_ENV, 
                        mock: true }; // make a copy
        
        // Dynamically import API with 'mock' environemnt variable
        const API = require('../utils').API;

        // Get all the data in parallel
        let resp = await Promise.all([
            API.get('/me', { withCredentials: true }),
            API.get('/daysoff',  {
                params: {
                    year: year,
                    month: month
                }, 
                withCredentials: true
            }),
             API.get(`/me/reports/manual_updates`, {
                params: {
                    year: year,
                    month: month
                },
                withCredentials: true
            }),                
            API.get(`/me/reports/${year}/${month}`, {
                withCredentials: true
            }),
        ])

        // 1. 
        // Let's start with processing the results of '/me' 
        employeKind = resp[0].data.kind;
        const ID = resp[0].data.ID;
 
        // 2.
        // Store obtained days-off
        daysOff = resp[1].data;

        // 3. 
        // Process manual updates
        manualUpdates = resp[2].data.items;

        // 4.
        // Process report data
        const report = resp[3].data;
        report_items = report.items.map( (item, index ) => {
            return {
                ...item, 
                key: index
            }
        });

        // 4.1
        // Is this report editable
        isReportEditable = report.isEditable;

        expect(report.totalHours).toBeGreaterThanOrEqual(0);
        
        // 4.2
        // Employer Code is assigned per report 
        // and needed to get the approprite report codes
        employerCode = report.employerCode || 0;

        // 4.3 
        // Get report codes (depends on previos step)
        resp = await API.get(`/me/report_codes`, {
            params: {
                id : ID,
                employerCode: employerCode,
                year: year,
                month: month
            },
            withCredentials: true
        })

    })

    afterAll(() => {
        // Restore environment
        process.env = OLD_ENV; // restore old env
    });

    test('Calculate totals', () => {

        expect(report_items.length).toBeGreaterThanOrEqual(0);

        const lTotal = report_items.reduce( ( accu, item ) => {
            
            const dayDuration = moment.duration(item.total);
            return accu.add(dayDuration);

        }, moment.duration('00:00'))

        const totalFormatted = `${Math.floor(lTotal.asHours())}:${lTotal.minutes().toString().padStart(2, '0')}`;

        //console.log(totalFormatted);
    });

    test('Display report data on TableReport Component', () => {

        const component = renderer.create(
            <Provider store={store}>
                <TableReport dataSource={report_items}
                            daysOff={daysOff}
                            employeKind={employeKind}
                            manualUpdates={manualUpdates}/>
            </Provider>
        );

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })
})