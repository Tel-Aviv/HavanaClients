import React from 'react';
import  { Modal, Button,
    Typography, Table, Tag,
    Alert, Card,
    Row, Col,
    DatePicker }
from 'antd';
const { Title } = Typography;
import uniqid from 'uniqid';
import { useTranslation } from "react-i18next";

import { TIME_FORMAT } from '../../globals'

const ValidationReport = ({visible, onClosed, invalidItems}) => {

    const { t } = useTranslation();

    let columns = [
        {
            title: 'יום',
            dataIndex: 'day',
            align: 'right',
            ellipsis: true,
            editable: false,
        }, {
            title: 'יום בשבוע',
            dataIndex: 'dayOfWeek',
            align: 'right',
            ellipsis: true,
            editable: false,
        }, {
            title: 'כניסה',
            dataIndex: 'entry',
            align: 'right',
            editable: true,
            render: (text) => {
                let tagColor = 'blue';
                if( text === '0:00' ) {
                    tagColor = 'magenta'
                }
                return text.format(TIME_FORMAT) === '00:00' ?
                    <div>-</div> :
                    <>
                        <Tag color={tagColor}
                            style={{
                            marginRight: '0'
                        }}>
                            {
                                text.format(TIME_FORMAT)
                            }
                        </Tag>
                    </> 
            }          
        }, {
            title: 'יציאה',
            dataIndex: 'exit',
            align: 'right',
            editable: true,
            render: (text) => {
                let tagColor = 'blue';
                if( text === '0:00' ) {
                tagColor = 'magenta'
                }
                return text.format(TIME_FORMAT) === '00:00' ?
                    <div>-</div> :
                    <>
                        <Tag color={tagColor}
                            style={{
                            marginRight: '0'
                        }}>
                            {
                                text.format(TIME_FORMAT)
                            }
                        </Tag>
                    </> 
            }
        }, {
            title: 'סיכום',
            dataIndex: 'total',
            align: 'right',
            editable: false,
        }, {
            title: 'סימון',
            dataIndex: 'systemNotes',
            align: 'right',
            editable: true,
            render: (text, _) => 
                ( text !== '' ) ?
                    <Tag color="magenta"
                        style={{
                            marginRight: '0'
                        }}>
                        {text}
                    </Tag>
                    : null
        }, {
            title: '',
            width: '3%',
            dataIndex: 'operation'
        }
    ];


    return <Modal visible={visible}
                closable={true}
                forceRender={true}
                onCancel={() => onClosed(false)}
                footer={
                    [<Button type='primary' 
                            key={uniqid()}
                            onClick={() => onClosed(false)}>
                                {t('close')}
                    </Button>]
                }>
                <div>
                    <Title className='rtl'
                        style={{
                            marginTop: '12px'
                        }}>
                        {t('invalid_items')}
                    </Title>
                </div>
                <Row>
                    <Col span={24}>
                        <Table style={{
                                    direction: 'rtl'
                                }}
                                dataSource={invalidItems}
                                columns={columns} 
                                pagination={false}
                                size="small"
                                tableLayout='auto'
                            />
                    </Col>
                </Row>                
    </Modal>
}

export default ValidationReport;