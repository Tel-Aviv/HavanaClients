// 
// Pending Reports (Notifications) Test Suite
// 
// This test suite uses configuration approach to mock axios calls
// See setEnvVars.js file in conjuction with 
// setupFiles: ["<rootDir>/__tests__/setEnvVars.js"]
// in 'jest.config.js'
//
import 'babel-polyfill'

import React from 'react';
import renderer from 'react-test-renderer';
 
const API = require('../utils').API;
import Badge from '../components/Badge';

let count = 0;

describe('Get notifications count from API and display it on Badge component', () => {

    const OLD_ENV = process.env;

    beforeAll(async() => {

        //
        // Set 'mock' environment variable 
        // and load API dynamically that should be mocked
        //
        // jest.resetModules() // clears the cache
        // process.env = { ...OLD_ENV, 
        //                 mock: true }; // make a copy

        // Dynamically import API with 'mock' environemnt variable
        //const API = require('../utils').API;
        
        // Now call API
        const resp = await API.get('/me/pendings/count', {
            withCredentials: true
        })
        count = resp.data;
        expect(count).toBeGreaterThanOrEqual(0);
    })

    // afterAll(() => {
    //     process.env = OLD_ENV; // restore old env
    // });

    test.only('Test Badge Component', () => {
        const component = renderer.create(
            <Badge count={count} />
        );

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })
})

