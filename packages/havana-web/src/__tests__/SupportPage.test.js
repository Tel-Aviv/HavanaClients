// 
// Support Page Test Suite
// 
// Test the apperiance on SupportPage Component based on varios API calls.
//
import 'babel-polyfill'

import React from 'react';
import { Route, Switch, HashRouter} from 'react-router-dom';
import renderer from 'react-test-renderer';
import SupportPage from '../components/SupportPage';

describe('Get data the API and display it', () => {

    test('Display SupportPage component', async() => {
        // await act( async () => mount(<HashRouter>
        //     <SupportPage />
        // </HashRouter>));
        // // const component = renderer.create(
        // //         <HashRouter>
        // //             <SupportPage />
        // //         </HashRouter>
        // // );

        // let tree = component.toJSON();
        // expect(tree).toMatchSnapshot();
    });

});