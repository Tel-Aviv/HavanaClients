import React, { useState, useEffect, useContext, useRef, Children } from 'react';
import { Modal, Button, Row, Col } from 'antd';
import ReactToPrint from 'react-to-print';
import moment from 'moment';
import { useTranslation } from "react-i18next";
import uniqid from 'uniqid'; 

import { DataContext } from './DataContext';

const PrintModal = (props) => {

    const [visible, setVisible] = useState(false)
    const dataContext = useContext(DataContext);
    const componentRef = useRef();
    const { t } = useTranslation();

    useEffect( () => {
        setVisible(!visible)
    }, [props.visible])

    const gettTitle = () => (
        <div style={{ margin: '0 auto' }}>
            {t('print_report')}
        </div>
    )

    const onCancel = () => {
        setVisible(false);
        props.closed & props.closed();
    }

    return (
        <Modal title={gettTitle()}
            width='70%'
            closable={true}
            forceRender={true}
            visible={visible}
            onCancel={onCancel}
            footer={[
                <ReactToPrint key={uniqid()} 
                            copyStyles={true}
                            removeAfterPrint={true}
                            trigger={() => <Button type="primary">{t('print')}</Button>}
                            content={() => componentRef.current}
                />,
                <Button key={uniqid()} onClick={onCancel}>{t('cancel')}</Button>
            ]}>
                <div ref={componentRef} style={{textAlign: 'center'}} className='pdf-container'>
                    <div className='pdf-title'>{dataContext.user.name}</div>
                    <div className='pdf-title'>{t('summary')} {props.month}/{props.year}</div>
                    {
                        props.children
                    }
                    <Row>
                        <Col span={9} style={{
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                            {
                                props.signature ? 
                                <img className='footer-signature' src={props.signature} /> :
                                null
                            }
                        </Col>
                        <Col span={3}>
                            <div className='footer-print'>{t('signature')}</div>        
                        </Col>
                        <Col span={6}>
                            <div className='footer-print'>סה"כ { props.totals } שעות</div>
                        </Col>
                        <Col span={6}>
                            <div className='footer-print'>{t('printed_when')} {moment().format('DD/MM/YYYY')}</div>
                        </Col>                                                 
                    </Row>
                </div>
        </Modal>
    )
}

export default PrintModal;