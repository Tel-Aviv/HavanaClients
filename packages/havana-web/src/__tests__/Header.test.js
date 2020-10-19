import './matchMedia.mock';

import React from 'react';
import { Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import renderer from 'react-test-renderer';
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { createMemoryHistory } from 'history';
//import { renderHook, act } from '@testing-library/react-hooks'

import Enzyme, {shallow, mount} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({adapter: new Adapter()});

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

describe('Test Header Layout', () => {

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
                    showBadge={true}
                    badgeCount={24} />
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

    test('Header Snap', () => {

        const component = renderer.create(headerComponent);

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();

        //expect(tree.getAllByRole('menuItem')).toHaveProperty('key')
    })

    // beforeEach( () => {
    //     headerWrapper.unmount();
    // })

    test('Header functionality (Enzyme)', () => {
        headerWrapper = mount(headerComponent)

        // Should be 4 menu items: 'home', 'settings', 'notifications' and user's avatar.
        expect(headerWrapper.find("li")).toHaveLength(4);    

        // const state = headerWrapper.state('notificationsCount');
        // const instance = headerWrapper.instance();
        // const result = instance.goSettings();


        //expect(myComp).toHaveLength(1) 
        // component
        //     .find('button#submit_form')
        //     .simulate('click');
    })

    test('Test functionality (@testing-library)', () => {
        render(headerComponent)

        expect(screen.getByLabelText('home')).toBeInTheDocument();
        expect(screen.getByLabelText('setting')).toBeInTheDocument();

        const approvalElement = screen.getByLabelText('bell');
        expect(approvalElement).toBeInTheDocument();
        fireEvent(approvalElement, new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        }));

        expect(screen.getByLabelText('user')).toBeInTheDocument();
       // expect(screen.getAllByRole('menuitem')).toHaveProperty('onClick')
    }) 
})