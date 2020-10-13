import React, { useState, useEffect, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import i18n from 'i18next';
import { useTranslation, initReactI18next } from "react-i18next";

import { Helmet } from 'react-helmet';

import { Layout } from 'antd';
import 'antd/dist/antd.css';
import 'ant-design-pro/dist/ant-design-pro.css'

import { getUserFromHtml, getHost, getProtocol, API } from './utils';
import translations from './translations';
import { DataContext } from './DataContext';

import Header from './Header';

const ConfirmList = React.lazy( () => import('./ConfirmList') )
const Confirm = React.lazy( () => import('./Confirm') )
import Home from './Home';
const Settings = React.lazy( () => import('./Settings') )
const SupportPage = React.lazy( () => import('@components/SupportPage') )

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: false,
    react: { 
        useSuspense: false
      }
  })

const App = () => {

    const [isUserManager, setIsUserManager] = useState(false);
    const [notificationsCount, setNotificationsCount] = useState(0);

    const { t } = useTranslation();

    const context = {
        user: getUserFromHtml(),
        host: getHost(),
        protocol: getProtocol(),
        API: API
    }

    useEffect( () => {

        const fetchData = async() => {
            try {
                let res = await context.API.get('/me/is_manager'); // API is already wrapped with credentials = true
                const isManager = res.data;
                setIsUserManager(isManager);

                if( isManager ) {
                    res = await context.API.get('/me/pendings/count');
                    setNotificationsCount(res.data)
                }
            } catch(err) {
                console.error(err);
            }
        }

        fetchData();

    })

    return (<>
        <Helmet>
            <title>{t('product_name')}</title>
            <meta name="description" content={t('product_name')} />
            <style>{'body { background-color: rgb(240, 242, 245) !important; }'}</style>
        </Helmet>
        <DataContext.Provider value={context}>
        <Layout> 
                <Layout.Header className='rtl'
                                style={{
                                    padding: '0 1%'
                                }}>
                    <Header mode='horizontal'
                        showBadge={isUserManager}
                        badgeCount={notificationsCount} />
                </Layout.Header>
                <Layout.Content style={{ 
                        padding: '17px 24px 24px 24px'
                    }}>
                    
                        <Suspense fallback={<div>Loading...</div>}>
                            <Switch>
                                <Route exact path='/'
                                        render={ (props) => 
                                            <Home />
                                        }/>
                                <Route path='/confirmlist' component={ConfirmList} />
                                <Route path='/confirm/:userid/:saveReportId' component={Confirm} />                                
                                <Route path='/settings' component={Settings} />
                                <Route path='/support/:year/:month' component={SupportPage} />
                            </Switch>
                        </Suspense> 
                    
                </Layout.Content>
            </Layout>
        </DataContext.Provider>
    </>
    )
}

export default App;
