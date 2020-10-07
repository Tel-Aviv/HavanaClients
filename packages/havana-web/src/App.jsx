import React, { useState, useEffect, Suspense } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import i18n from 'i18next';
import { useTranslation, initReactI18next } from "react-i18next";

import { Helmet } from 'react-helmet';

import { Layout, Menu,
    Avatar, Tooltip,
    Icon
   } 
from 'antd';
import { HomeOutlined,
    SettingOutlined,
    BellOutlined } 
from '@ant-design/icons';
import 'antd/dist/antd.css';
import 'ant-design-pro/dist/ant-design-pro.css'

import Badge from '@components/Badge'

import { getUserFromHtml, getHost, getProtocol, API } from './utils';
import translations from './translations';
import { DataContext } from './DataContext';

const ConfirmList = React.lazy( () => import('./ConfirmList') )
const Confirm = React.lazy( () => import('./Confirm') )
import Home from './Home';
const Settings = React.lazy( () => import('./Settings') )
const SupportPage = React.lazy( () => import('@components/SupportPage') )

import { SET_NOTIFICATIONS_COUNT } from './redux/actionTypes';

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

    const history = useHistory();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [displayNotifications, setDisplayNotificatios] = useState(false);
    const [notificationsCount, setNotificationsCount] = useState(0);

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
                setDisplayNotificatios( isManager ? 'block' : 'none');

                if( isManager ) {
                    res = await context.API.get('/me/pendings/count');
                    dispatch( action_setNotificationCount(res.data) )
                }

            } catch(e) {
                console.error(e.message)
            }
        }

        fetchData();

    }, [displayNotifications])

    const action_setNotificationCount = (count) => ({
        type: SET_NOTIFICATIONS_COUNT,
        data: count
    })

    const _notificationsCount = useSelector(
        store => store.notificationsCountReducer.notificationsCount
    )

    useEffect( ()=> {
        if( _notificationsCount )
            setNotificationsCount(_notificationsCount);
    }, [_notificationsCount])

    const onApprovalClicked = () => {
        history.push(`/confirmlist`);
    }

    const goSettings = () => {
        history.push(`/settings`);
    }

    const goHome = () => {
        history.push('/');
    }

    return (<>
        <Helmet>
            <title>{t('product_name')}</title>
            <meta name="description" content={t('product_name')} />
            <style>{'body { background-color: rgb(240, 242, 245) !important; }'}</style>
        </Helmet>
        <Layout layout='topmenu' 
                    locale='he-IL'> 
                <Layout.Header className='ant-layout-header rtl'
                                style={{
                                    padding: '0 1%'
                                }}>
                    <Menu mode="horizontal" theme='light'
                        className='ant-menu top-nav-menu ant-menu-blue'>
                        <Menu.Item key='avatar' style={{
                                top: '6px',
                                cursor: 'pointer',
                                float: 'right'
                            }}>
                                <div>
                                    <Avatar size="large" src={`data:image/jpeg;base64,${context.user.imageData}`}
                                        style={{
                                            marginRight: '0'
                                        }}
                                        onError={ () => true} />
                                    <span style={{
                                        padding: '0 12px'
                                    }}>{context.user.name}</span>        
                                </div>
                        </Menu.Item>
                        <Menu.Item key='home' style={{
                            float: 'left',
                            marginTop: '8px'
                            }}>
                            <Tooltip title={t('home')}>
                                <HomeOutlined
                                    style={{
                                        fontSize: '24px'
                                    }} 
                                    onClick={goHome}
                                />
                            </Tooltip> 
                        </Menu.Item>
                        <Menu.Item key='settings' style={{
                            float: 'left',
                            marginTop: '8px'
                            }}>
                                <Tooltip title={t('settings')}>
                                <SettingOutlined
                                        style={{
                                            fontSize: '24px'
                                        }}
                                        onClick={goSettings}/>
                                </Tooltip>             
                        </Menu.Item>
                        <Menu.Item key='notifications' style={{
                                marginTop: '8px',
                                float: 'left',
                                display: displayNotifications
                            }}>
                                <Badge count={parseInt(notificationsCount)} />
                                <Tooltip title={t('notifications')}>
                                    <BellOutlined onClick={onApprovalClicked} 
                                        style={{
                                            fontSize: '24px'
                                        }}/>
                                </Tooltip>
                                
                        </Menu.Item>
                    </Menu>
                </Layout.Header>
                <Layout.Content style={{ 
                        padding: '17px 24px 24px 24px'
                    }}>
                    <DataContext.Provider value={context}>
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
                    </DataContext.Provider>
                </Layout.Content>
            </Layout>

    </>
    )
}

export default App;
