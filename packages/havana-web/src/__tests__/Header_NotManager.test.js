import './matchMedia.mock';

import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux'
import renderer from 'react-test-renderer';
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { createMemoryHistory } from 'history';

import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import translations from '../translations';

import store from '../redux/store';

import { DataContext } from '../DataContext';
import Header from '../Header'

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: false
  })

let headerWrapper;

describe('Test Header Layout in NonManager Mode', () =>
{
    const OLD_ENV = process.env;

    const context = {
        user: 'אולג קליימן',
        protocol: 'http',
    }
    
    const history = createMemoryHistory()

    const headerComponent = <Provider store={store}>
            <Router history={history}>
                <DataContext.Provider value={context}>
                    <Header mode='inline' 
                            showBadge={false}
                            badgeCount={0}/>
                </DataContext.Provider>
            </Router>
        </Provider>

    beforeAll( async() => {

        try {
            //
            // Set 'mock' environment variable 
            // and load API dynamically that should be mocked
            //
            jest.resetModules() //clears the cache
            process.env = { ...OLD_ENV, 
                            mock: true }; // make a copy

            // Dynamically import API with 'mock' environemnt variable
            context.API = require('../utils').API;
            
        } catch( err ) {
            console.error(err);
        }
    })

    afterAll(() => {
        // Restore environment
        process.env = OLD_ENV; // restore old env
    });

    test('Test layout of the header w/o Notification item', () => {
        const component = renderer.create(headerComponent);

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    test('Test the items in header (@testting-library)', () => {
        headerWrapper = render(headerComponent);

        // Should be 3 menu items: 'home', 'settings' and user's avatar.
        // Don't count 'notifications' her
        expect(headerWrapper.getAllByRole("menuitem")).toHaveLength(3);

        const homeElement = screen.getByLabelText('home');
        expect(homeElement).toBeInTheDocument();
        fireEvent(homeElement, new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
          }));

        const settingsElement = screen.getByLabelText('setting');  
        expect(settingsElement).toBeInTheDocument();
        fireEvent(settingsElement, new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
          }));

        expect(screen.queryByLabelText('bell')).not.toBeInTheDocument();
        
        expect(screen.getByLabelText('user')).toBeInTheDocument();
    })
})