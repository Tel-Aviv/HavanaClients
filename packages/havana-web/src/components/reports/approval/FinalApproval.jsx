import React from 'react';
import { Col, Row, Button, Tooltip, 
    Space, Input } from 'antd';

import { useTranslation } from "react-i18next";

const FinalApproval = () => {

    const { t } = useTranslation();

    return <Col>
        <Row>
            <Input placeholder={t('notes_for_report')} />
        </Row>
        <Row>
            <Space>
                <Button key='cancel' style={{
                                        marginRight: '8px'
                                    }}>{t('cancel')}</Button>
                <Tooltip key='reject' title={t('reject_tooltip')}>
                    <Button  type='danger' style={{
                        marginLeft: '8px'
                    }}>
                        {t('reject')}
                    </Button>
                </Tooltip>
                <Tooltip key='forward' title={t('forward_tooltip')}>
                    <Button type="primary"
                            style={{
                                direction: 'ltr',
                                marginRight: '8px'
                            }}>
                        {t('move_to')}
                    </Button>
                </Tooltip>
                <Tooltip key='approve' title={t('approve_tooltip')}>
                    <Button type="primary" 
                        style={{
                            direction: 'ltr'
                        }}>
                        {t('approve')}
                    </Button> 
                </Tooltip>
            </Space>                       
        </Row>                           
    </Col>
}

export default FinalApproval;