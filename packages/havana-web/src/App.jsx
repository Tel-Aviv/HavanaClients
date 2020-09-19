import React, { useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import moment from 'moment';
import i18n from 'i18next';
import { useTranslation, initReactI18next } from "react-i18next";

import { Helmet } from 'react-helmet';

import { Layout, Menu,
    Avatar, Tooltip,
    Icon
   } 
from 'antd';
import 'antd-rtl/es/tabs/style/index.css';
import 'antd/dist/antd.css';

import NotificationBadge, {Effect} from 'react-notification-badge';
import { getUserFromHtml, getHost, getProtocol, API } from './utils';
import translations from './translations';
import { DataContext } from './DataContext';

import ConfirmList from './ConfirmList';
import Confirm from './Confirm';
import Home from './Home';
import Settings from './Settings'

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: false
  })

const App = () => {

    const history = useHistory();
    const { t } = useTranslation();

    const [month, setMonth] = useState(moment().month());
    const [year, setYear] = useState(moment().year());
    const [displayNotifications, setDisplayNotificatios] = useState(false);
    const [notificationsCount, setNotificationsCount] = useState(0);

    const context = {
        user: getUserFromHtml(),
        host: getHost(),
        protocol: getProtocol(),
        API: API
    }

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
                <Layout.Header className='ant-layout-header rtl'>
                    <Menu mode="horizontal" className='ant-menu top-nav-menu ant-menu-blue' 
                            style={{
                                padding: '0 3%'
                            }}>
                        <Menu.Item key='avatar' style={{
                                top: '6px',
                                cursor: 'pointer'
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
                                <Icon type="home" 
                                    theme="outlined"
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
                                <Icon type="setting" 
                                        theme="outlined"
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
                                <div>
                                    <NotificationBadge count={parseInt(notificationsCount)} effect={Effect.SCALE}>
                                    </NotificationBadge>                                
                                </div>
                                <Tooltip title={t('notifications')}>
                                    <Icon type="bell" theme="outlined" onClick={onApprovalClicked} 
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
                        <Switch>
                        <Route exact path='/'
                                render={ (props) => 
                                    <Home />
                                }/>
                        <Route path='/confirmlist' component={ConfirmList} />
                        <Route path='/confirm/:userid/:saveReportId' component={Confirm}/>                                
                        <Route path='/settings'
                                component={Settings} />
                        </Switch>
                    </DataContext.Provider>
                </Layout.Content>
            </Layout>

    </>
    )
}

export default App;