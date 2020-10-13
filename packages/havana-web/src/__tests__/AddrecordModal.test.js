import 'babel-polyfill'

import React from 'react';
import renderer from 'react-test-renderer';
//import {cleanup, fireEvent, render} from '@testing-library/react';

import i18n from 'i18next';
import { useTranslation, initReactI18next } from "react-i18next";
import translations from '../translations';

import { ReportContext } from "../components/reports//TableContext";
import AddRecordModal from '../components/reports/AddRecordModal';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: false
  })

const year = 2020;
const month = 7; 
let reportCodes = [];

describe('Enables adding new entry to the report', () => {

    const OLD_ENV = process.env;

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

        let resp = await Promise.all([
            API.get('/me', { withCredentials: true }),
            API.get(`/me/reports/${year}/${month}`, { withCredentials: true })
        ])

        const ID = resp[0].data.ID;

        const report = resp[1].data;
        const employerCode = report.employerCode || 0;

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

    test('Fit Layout', () => {
        const component = renderer.create(
            <ReportContext.Provider value={ {
                                                codes: reportCodes
                                            }
                                           }>
                <AddRecordModal />
            </ReportContext.Provider>
        );

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();

        //console.log(tree.props)
    })
})