import React, { useState } from 'react';
import { Row, Col, Divider, InputNumber } from 'antd';
import { useTranslation } from "react-i18next";

const ExtraHoursDiff = ({extraHours, vacationHoursChanged, paymentHoursChanged}) => {

    const { t } = useTranslation();

    return <>
    <Row gutter={[16, 16]}>
        <Col span={11} className='extraHours-tile'>
            <div>{t('granted')}</div>
            <div style={{
                 fontSize: 'x-large'
            }}>{extraHours.granted}</div>
        </Col>
        <Col span={2}></Col>
        <Col span={11} className='extraHours-tile'>
            <div>{t('actual')}</div>
            <div style={{
                 fontSize: 'x-large'
            }}>{extraHours.actual}</div>
        </Col>
    </Row>
    <Divider orientation="left">{t('divide_extra_hours')}</Divider>
    <Row gutter={[16, 16]}>
        <Col span={8}>{t('to_vacation')}</Col>
        <Col>
            <InputNumber min={0} size="small" defaultValue={0}
                onChange={vacationHoursChanged}/>
        </Col>
    </Row>
    <Row gutter={[16, 16]}>
        <Col span={8}>{t('to_pay')}</Col>
        <Col>
            <InputNumber min={0} size="small" defaultValue={extraHours.granted}
                onChange={paymentHoursChanged}/>
        </Col>
    </Row>
        
    </>
}

export default ExtraHoursDiff;