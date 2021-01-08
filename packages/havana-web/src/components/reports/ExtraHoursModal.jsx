import React, { useState, useEffect } from 'react';
import { Modal, Table } from 'antd';
import { useTranslation } from "react-i18next";

const ExtraHoursModal = ({visible, dataSource}) => {

    const [tableData, setTableData] = useState([])

    const { t } = useTranslation();

    useEffect( () => {
        setTableData(dataSource);
    },[dataSource])

    const columns = [{
        title: t('day'),
        key: t('day'),
        dataIndex: 'day'
    }, {
        title: t('day_of_week'),
        key: t('day_of_week'),
        dataIndex: 'dayOfWeek'
    }, {
        title: t('extra_hours'),
        key: t('extra_hours'),
        children: [
            {
                title: '75%',
                key: '75',
                dataIndex: 'extra_hours75'
            }, {
                title: '100%',
                key: '100',
                dataIndex: 'extra_hours100'       
            }, {
                title: '125%',
                key: '125',
                dataIndex: 'extra_hours125'       
            }, {
                title: '150%',
                key: '150',
                dataIndex: 'extra_hours150'       
            }, {
                title: '200%',
                key: '200',
                dataIndex: 'extra_hours200'       
            }
        ]
    }
    ]

    return <Modal visible={visible}
                  closable={true}>
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