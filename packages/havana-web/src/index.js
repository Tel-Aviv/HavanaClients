import 'core-js/es6/string';

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import heIL from 'antd/es/locale/he_IL'

import store from './redux/store';

import AppErrorBoundary from './AppErrorBoundary';
import App from './App';

ReactDOM.render(<Provider store={store}>
                    <HashRouter>
                        {/* <AppErrorBoundary> */}
                            <ConfigProvider locale={heIL}>
                                <App />
                            </ConfigProvider>
                        {/* </AppErrorBoundary> */}
                    </HashRouter>
                </Provider>,
    document.getElementById('root'));
