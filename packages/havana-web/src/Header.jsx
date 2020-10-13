import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Avatar, Image, Tooltip } from 'antd';
import { HomeOutlined,
    SettingOutlined,
    BellOutlined } 
from '@ant-design/icons';
import { useTranslation } from "react-i18next";

import Badge from './components/Badge'
import { DataContext } from './DataContext';

import { SET_NOTIFICATIONS_COUNT } from './redux/actionTypes';

const Header = ({showBadge, badgeCount, ...restProps}) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const history = useHistory();

    const [notificationsCount, setNotificationsCount] = useState(badgeCount);
    const [displayNotifications, setDisplayNotificatios] = useState(false);
    const context = useContext(DataContext);

    useEffect(()=> {
        
        setDisplayNotificatios(showBadge);
        setNotificationsCount(badgeCount);
        dispatch( action_setNotificationCount(badgeCount) )

    }, [showBadge, badgeCount])

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

    const goHome = () => {
        history.push('/');
    }

    const goApproval = () => {
        history.push(`/confirmlist`);
    }

    const goSettings = () => {
        history.push(`/settings`);
    }    

    return (
        <Menu {...restProps} className='ant-menu-blue'>
            <Menu.Item key='user' style={{
                    top: '6px',
                    float: 'right'
                }}>
                    <Avatar size='large' 
                            src={`data:image/jpeg;base64,${context.user.imageData}`}
                            onError={ () => true} />
                    <span style={{
                            padding: '0 12px'
                        }} 
                        aria-label= 'user'>
                            {context.user.name}
                    </span>                                                            
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
            {
                displayNotifications ?
                    <Menu.Item key='notifications' style={{
                            marginTop: '8px',
                            float: 'left'
                        }}>
                        <Badge count={parseInt(notificationsCount)} />
                        <Tooltip title={t('notifications')}>
                            <BellOutlined onClick={goApproval} 
                                    style={{
                                        fontSize: '24px'
                                    }}/>                    
                        </Tooltip>
                    </Menu.Item>
                : null
            }             
        </Menu>
    )
}

export default Header;