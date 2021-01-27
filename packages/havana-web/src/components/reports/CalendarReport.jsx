import React, { useEffect, useState } from 'react';
import { Calendar, Row, Col, Tag, Modal, Badge, Typography } from 'antd';
const { Text } = Typography;
import { CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import uniqid from 'uniqid';
import { useTranslation } from "react-i18next";

// const DailyTable = React.lazy( () => import('./DailyTable') );
import DailyTable from './DailyTable';

import { TIME_FORMAT, DATE_FORMAT } from '../../globals'   

const CalendarReport = (props) => {

    const [originalData, setOriginalData] = useState([]);
    const [firstLevelData, setFirstLevelData] = useState([]);
    const [dailyReportVisible, setDailyReportVisible] = useState(false);
    const [secondLevelData, setSecondLevelData] = useState([]);
    const [selectedDate, setSelectedDate] = useState();

    const { t } = useTranslation();

    const dateKey = (day, month) => {
        return day.toString().padStart(2, '0') +
                month.toString().padStart(2, '0')
    }

    useEffect( () => {

        if( !props.dataSource || props.dataSource.length === 0 )
            return;

        setSelectedDate(new moment( props.dataSource[0].rdate));

        const _originalData = props.dataSource.map( record =>  {

            return { 
                ...record, 
                rdate : moment(record.rdate)
            }
          })

        // setFirstLevelData(
        //     _originalData.filter( 
        //         item => item.stripId === 1)
        // );

        setOriginalData(_originalData);

        const _firstLevelData = new Map();

        _originalData.map( item => {

            const key = dateKey(item.day, props.month);

            if( _firstLevelData.has(key) ) {
                _firstLevelData.get(key).systemNotes.push(item.systemNotes)
            }
            else
                _firstLevelData.set(key, {...item,
                                            systemNotes: item.systemNotes === '' ? []
                                                         : [item.systemNotes] // convert it to array
                                        })
        })

        setFirstLevelData(_firstLevelData);

    }, [props.dataSource])

    const onSelect = value => {

        // No edits for the future
        if( value.isAfter(moment()) )
            return;

        const day = value.date();
        setSecondLevelData(getSecondLevelData(day));
        setDailyReportVisible(true);
        setSelectedDate(value)
    }

    const onDailyReportClosed = () => {
        setSelectedDate(null);
        setDailyReportVisible(false);
    }

    const dateFullCellRender = (date) => {
        // Get from the Map by the key
        const key = dateKey(date.date(), date.month()+1);
        const originalItem = firstLevelData.get(key); 
        if( !originalItem )  
            return null;

        return (
        <div className='ant-picker-cell-inner ant-picker-calendar-date'>
            <div className='ant-picker-calendar-date-value'>
                <span className='calendar-date'>
                    {date.date()}
                </span>
            </div>
            <div className='ant-picker-calendar-date-content'>
                <Row>
                    <Col>
                    {
                        ( !isInPast(originalItem) ) ?
                            <ul className='calendar-events'>
                                <li style={{
                                    margin: '3px'
                                }}>
                                    { 
                                        props.employeeKind === 1 ?
                                        t('in') + ': ' + originalItem.entry.format(TIME_FORMAT)
                                         : t('required') + ': ' + originalItem.requiredHours
                                    }
                                </li>
                                <li style={{
                                    margin: '3px'
                                }}>
                                    { 
                                        props.employeeKind === 1 ?
                                        t('out') + ': ' + originalItem.exit.format(TIME_FORMAT) :
                                        t('accepted') + ': ' + originalItem.acceptedHours 
                                    }
                                </li>
                                <li style={{
                                    float: 'right'
                                }}>

                                    { 
                                    originalItem.systemNotes.length !== 0 ? 
                                      
                                        originalItem.systemNotes.map( item => {

                                            return item !== '' ?
                                                    <Tag key={uniqid()}
                                                        icon={<CloseCircleOutlined />}
                                                        color='error'
                                                        style={{
                                                            marginRight: '0',
                                                            marginBottom: '4px',
                                                            width: '100%',
                                                            textAlign: 'start'
                                                        }}>
                                                        {
                                                            originalItem.isUpdated ?
                                                            <Text delete>{ item.replace('*', ' ') }</Text> :
                                                            <Text strong>{ item.replace('*', ' ') }</Text>
                                                        }                                                
                                                    </Tag>
                                                    : null
                                        })
                                        : null
                                    }

                                </li>
                            </ul>
                        : null
                    }
                    </Col>
                </Row>
            </div>
        </div> 
        )  
    }

    const getSecondLevelData = (day) => {

        const dailyData =  originalData.filter( item =>
            parseInt(item.day) === day
        )
        
        return ( dailyData.length === 1 ) ?
            dailyData :
            dailyData.filter( item => parseInt(item.stripId) > 1 )
    }

    const isInPast = (record) => {
        return moment(record.rdate, DATE_FORMAT).isAfter(moment());
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
              rdate: moment(item.rdate, DATE_FORMAT).startOf('day')
            }
            newItem.total = moment.utc(moment(newItem.exit, TIME_FORMAT).diff(moment(newItem.entry, TIME_FORMAT))).format(TIME_FORMAT)
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

        //   const item = newData[index];
        //   let replacedItem = {
        //     ...item,
        //     inTime: newItem.inTime, 
        //     outTime: newItem.outTime, 
        //     rdate: moment(item.rdate, DATE_FORMAT).startOf('day'),
        //     reportCode: newItem.reportCode, 
        //     userNotes: newItem.userNotes,
        //     isUpdated: newItem.isUpdated,
        //     isDeleted: newItem.isDeleted,
        //     isFullDay: true
        //   }

          //replacedItem.valid = true;
          //newItem.valid = true;
          newData.splice(index, 1, newItem); //;replacedItem);
          setOriginalData(newData);
          //setRecordToAdd(null);

          // props.onChange && props.onChange(replacedItem, null);
          props.onChange && props.onChange(newItem, null);
        }
      }

    return (
        <>
            <Modal title={ selectedDate? selectedDate.format(DATE_FORMAT) : null }
                visible={dailyReportVisible}
                destroyOnClose='true'
                footer={null}
                width='64%'
                closable={true} 
                className='rtl'
                onCancel={ () => onDailyReportClosed() }
                onOk={ () => onDailyReportClosed() }>
                <DailyTable 
                    dataSource={secondLevelData}
                    reportCodes={props.reportCodes}
                    daysOff={props.daysOff}
                    manualUpdates={props.manualUpdates}
                    editable={true}
                    onRemove={replaceRecord}
                    onSave={saveRecord}
                    onReplace={replaceRecord}/>
            </Modal>

            {
                originalData.length > 0 ?
                <Calendar
                    style={{
                        margin: '12px'
                    }}
                    mode='month'
                    onSelect={onSelect}
                    dateFullCellRender={dateFullCellRender}
                    value={selectedDate}
                    headerRender={ () => null }
                /> : null
            }
        </>

    )
}

export default CalendarReport;