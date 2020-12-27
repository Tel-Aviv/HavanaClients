import React, { useEffect, useState} from 'react';
import { Table, Popconfirm, Modal, Form, Icon,
    Tag, Row, Col, Tooltip, Typography } from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import moment from 'moment';
import { useTranslation } from "react-i18next";

const DailyTable = React.lazy( () => import('./DailyTable') );
//import DailyTable from './DailyTable';

const format = 'HH:mm';

const NestedTableReport = (props) => {

    const [originalData, setOriginalData] = useState([]);
    const [firstLevelData, setFirstLevelData] = useState([]);

    const { t } = useTranslation();

    useEffect(() => {

        const _originalData = props.dataSource.map( record =>  {

            return { 
                ...record, 
                rdate : moment(record.rdate).format('DD/MM/YYYY')
            }
          })

        setOriginalData(_originalData)

        setFirstLevelData(
            _originalData.filter( 
                item => item.stripId === 1)
        );
    }, [props.dataSource])

    const getSecondLevelData = (day) => {
        return originalData.filter( item =>
            item.day === day
        )
    }

    const expandedRowRender = (record) => {
 
        const secondLevelData = getSecondLevelData(record.day)

        return <DailyTable dataSource={secondLevelData}
                         pagination={false}
                         editable={true}
                         reportCodes={props.reportCodes}
                         manualUpdates={props.manualUpdates}
                />
    }

    let columns = [{
        title: 'יום',
        width: '4%',
        dataIndex: 'day',
        align: 'right',
        ellipsis: true,
        editable: false,
    }, {
        title: 'יום בשבוע',
        width: '10%',
        dataIndex: 'dayOfWeek',
        align: 'center',
        ellipsis: true,
        editable: false,
    }, {
        title: 'נדרש',
        width: '6%',
        dataIndex: 'requiredHours',
        align: 'right',
        editable: false,
    }, {
        title: 'נחשב',
        width: '6%',
        dataIndex: 'acceptedHours',
        align: 'right',
        editable: false
    }, {
        title: t('system_notes'),
        width: '6%',
        dataIndex: 'systemNotes',
        align: 'right',
        editable: false,
            render: (text, record) => {

              if( !moment(record.rdate, 'DD/MM/YYYY').isBefore(moment()) )
                return null;

              return ( text !== '' ) ?
                  <Tag color="blue"
                    style={{
                      marginRight: '0'
                    }}>
                      <Tooltip title={text}>
                        <Ellipsis length={42}>{text}</Ellipsis>
                      </Tooltip>
                  </Tag>
                  : null
            }
          },  ];

    return  <Table
                {...props}
                style={{ 
                    direction: 'rtl', 
                    heigth: '600px',
                    // margin: '12px'
                }}
                tableLayout='auto'
                columns={columns}
                expandable={{ expandedRowRender,
                    indentSize: 100 }}
                dataSource={firstLevelData}
                pagination={false}
                size="small"
            />

}

export default NestedTableReport;