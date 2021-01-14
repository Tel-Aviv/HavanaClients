import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Button } from 'antd';
import uniqid from 'uniqid';
import { useTranslation } from "react-i18next";

const ExtraHoursModal = ({title, visible, dataSource, cancel}) => {

    const [tableData, setTableData] = useState([])

    const { t } = useTranslation();

    useEffect( () => {
        setTableData(dataSource);
    },[dataSource])

    const renderTime = (text) => {
        if( text === '0:00' )
            return <div>{ text }</div>
        else return <Tag color='blue'>
                {text}
            </Tag>
    }

    const columns = [{
        title: t('day'),
        key: t('day'),
        align: 'center',
        dataIndex: 'day'
    }, {
        title: t('day_of_week'),
        key: t('day_of_week'),
        align: 'center',
        dataIndex: 'dayOfWeek'
    }, {
        title: t('extra_hours'),
        key: t('extra_hours'),
        children: [
            {
                title: '75%',
                key: '75',
                dataIndex: 'extra_hours75',
                render: renderTime
            }, {
                title: '100%',
                key: '100',
                dataIndex: 'extra_hours100',
                render: renderTime     
            }, {
                title: '125%',
                key: '125',
                dataIndex: 'extra_hours125',
                render: renderTime      
            }, {
                title: '150%',
                key: '150',
                dataIndex: 'extra_hours150',
                render: renderTime       
            }, {
                title: '200%',
                key: '200',
                dataIndex: 'extra_hours200',
                render: renderTime     
            }
        ]
    }
    ]

    return <Modal title={title}
                  visible={visible}
                  closable={true}
                  onCancel={cancel}
                  footer={[
                      <Button type='primary' key={uniqid()} onClick={cancel}>
                          {t('close')}
                      </Button>
                  ]}>
        <Table
            style={{ 
                direction: 'rtl', 
                heigth: '600px',
                margin: '12px'
            }}
            pagination={false}
            dataSource={tableData}
            columns={columns}
            size="small" />
    </Modal>
}

export default ExtraHoursModal;