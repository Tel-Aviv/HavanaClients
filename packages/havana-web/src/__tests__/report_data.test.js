// 
// Report Data Test Suite
// 
// Test the network calls for PS server. Enforces un-mock by setting environment variable
// for MockAdapter before 'API' module (utils.js) is actually loaded.
// 
import './matchMedia.mock';
import 'babel-polyfill'

import axios from 'axios';

describe('Get report data', () => {

    const OLD_ENV = process.env;
    let API = undefined;

    beforeAll( async() => {
                
        //
        // Set 'mock' environment variable 
        // and load API dynamically that should be not mocked
        //
        jest.resetModules() //clears the cache
        process.env = { ...OLD_ENV, 
                        mock: false }; // make a copy
        
        // Dynamically import API with 'mock' environemnt variable
        API = require('../utils').API;
    })

    afterAll(() => {
        // Restore environment
        process.env = OLD_ENV; // restore old env
    });

    test('Get personal data', async() => {
        expect(API).toBeDefined();
        //console.log(API.defaults.baseURL);

        // try {
        //     const resp = await API.get('http://bizdev01/PS/me/', {
        //         withCredentials: true })
        // } catch(err) {
        //     console.error(err.message)
        // }
        
        // expect(resp).toHaveProperty("userAccountName");
    })

})