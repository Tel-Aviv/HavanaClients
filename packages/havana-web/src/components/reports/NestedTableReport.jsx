import React, { useEffect, useState} from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { DownCircleTwoTone, 
    UpCircleTwoTone } 
    from '@ant-design/icons';    
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

    const saveRecord = async (record, inouts) => {
    
        try {

          const newData = [...originalData];
          const index = newData.findIndex(item => record.key === item.key);
          if (index > -1) {
            const item = newData[index];
            let newItem = {
              ...item,
              ...record,
              rdate: moment(item.rdate, 'DD/MM/YYYY').startOf('day').format('DD/MM/YYYY')
            }
            newItem.total = moment.utc(moment(newItem.exit, format).diff(moment(newItem.entry, format))).format(format)
            newItem.valid = true;
            
            newData.splice(index, 1, newItem);
            props.onChange && props.onChange(newItem, inouts);  
            setOriginalData(newData)
          }

        } catch( errorInfo ) {
          console.error(errorInfo)
        }

      }


    const replaceRecord = (key, newItem) => {
        const newData = [...originalData];
        const index = newData.findIndex(item => key === item.key);
        if (index > -1) {

          const item = newData[index];
          let replacedItem = {
            ...item,
            inTime: newItem.inTime, 
            outTime: newItem.outTime, 
            rdate: moment(item.rdate, 'DD/MM/YYYY').startOf('day').format('YYYY-MM-DD'),
            reportCode: newItem.reportCode, 
            userNotes: newItem.userNotes,
            isFullDay: true
          }

          replacedItem.valid = true;
          newData.splice(index, 1, replacedItem);
          setOriginalData(newData);
          //setRecordToAdd(null);

          props.onChange && props.onChange(replacedItem, null);
        }
      }


    const expandedRowRender = (record) => {
 
        const secondLevelData = getSecondLevelData(record.day)

        return <DailyTable dataSource={secondLevelData}
                         editable={true}
                         reportCodes={props.reportCodes}
                         manualUpdates={props.manualUpdates}
                         onSave={saveRecord}
                         onReplace={replaceRecord}
                />
    }

    const isInPast = (record) => {
        return moment(record.rdate, 'DD/MM/YYYY').isAfter(moment());
    }

    let columns = [{
        title: t('day'),
        width: '4%',
        dataIndex: 'day',
        align: 'right',
        ellipsis: true,
        editable: false,
    }, {
        title: t('day_of_week'),
        // width: '10%',
        dataIndex: 'dayOfWeek',
        align: 'center',
        ellipsis: true,
        editable: false,
    }, {
        title: t('required'),
        // width: '6%',
        dataIndex: 'requiredHours',
        align: 'right',
        editable: false,
        render: (text, record) => (
           isInPast(record) ? null 
                : <span>{text}</span>
        )
    }, {
        title: t('accepted'),
        // width: '6%',
        dataIndex: 'acceptedHours',
        align: 'right',
        editable: false,
        render: (text, record) => (
           isInPast(record) ? null 
                : <span>{text}</span>
        )
    }, {
        title: t('system_notes'),
        // width: '6%',
        dataIndex: 'systemNotes',
        align: 'right',
        editable: false,
        render: (text, record) => (

              isInPast(record) ? null 
                :
              ( text !== '' ) ?
                  <Tag color="blue"
                    style={{
                      marginRight: '0'
                    }}>
                      <Tooltip title={text}>
                        <Ellipsis length={42}>{text}</Ellipsis>
                      </Tooltip>
                  </Tag>
                  : null 
        )
    }
    ];

    return  <Table
                {...props}
                style={{ 
                    direction: 'rtl', 
                    heigth: '600px',
                    // margin: '12px'
                }}
                tableLayout='auto'
                columns={columns}
                expandable={{ 
                    expandedRowRender,
                    indentSize: 100,
                    expandIcon: ({ expanded, onExpand, record }) => 
                    expanded ? (
                        <UpCircleTwoTone onClick={e => onExpand(record, e)} />
                      ) : (
                        <DownCircleTwoTone onClick={e => onExpand(record, e)} />
                      ),
                    rowExpandable: record => !isInPast(record) }}
                dataSource={firstLevelData}
                pagination={false}
                size="small"
            />

}

export default NestedTableReport;