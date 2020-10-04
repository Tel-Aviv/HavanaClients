import 'core-js/es6/string';

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import { Provider } from 'react-redux'

import moment from 'moment';
import 'moment/locale/he';
moment.locale('he');

import store from './redux/store';

import AppErrorBoundary from './AppErrorBoundary';
import App from './App';

ReactDOM.render(<Provider store={store}>
                    <HashRouter>
                        {/* <AppErrorBoundary> */}
                            <App />
                        {/* </AppErrorBoundary> */}
                    </HashRouter>
                </Provider>,
    document.getElementById('root'));
