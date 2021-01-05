import React, { useEffect, useState } from 'react';
import { Calendar, Row, Col, Tag,
    Modal, Tooltip } from 'antd';
import moment from 'moment';
import { useTranslation } from "react-i18next";

const DailyTable = React.lazy( () => import('./DailyTable') );

const format = 'HH:mm';

const CalendarReport = (props) => {

    const [originalData, setOriginalData] = useState([]);
    const [firstLevelData, setFirstLevelData] = useState([]);
    const [dailyReportVisible, setDailyReportVisible] = useState(false);
    const [secondLevelData, setSecondLevelData] = useState([]);
    const [selectedDate, setSelectedDate] = useState();

    const { t } = useTranslation();

    useEffect( () => {

        if( !props.dataSource || props.dataSource.length === 0 )
            return;

        const _originalData = props.dataSource.map( record =>  {

            return { 
                ...record, 
                rdate : moment(record.rdate)
            }
          })

        setFirstLevelData(
            _originalData.filter( 
                item => item.stripId === 1)
        );

        setOriginalData(_originalData);

    }, [props.dataSource])

    const onSelect = value => {

        // No edits for the future
        if( value.isAfter(moment()) )
            return;

        const day = value.date();
        setSecondLevelData(getSecondLevelData(day));
        setDailyReportVisible(true);
        setSelectedDate(value.format('DD/MM/YYYY'))
    }

    const onDailyReportClosed = () => {
        setSelectedDate(null);
        setDailyReportVisible(false);
    }

    const dateFullCellRender = (date) => {
        const originalItem = firstLevelData.find( item => item.rdate.isSame(date, 'day') )

        if( !originalItem )  
            return null;

        return <div className='ant-picker-cell-inner ant-picker-calendar-date'>
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
                            { t('required') + ': ' + originalItem.requiredHours }
                        </li>
                        <li style={{
                            margin: '3px'
                        }}>
                            { t('accepted') + ': ' + originalItem.acceptedHours }
                        </li>
                        <li style={{
                            float: 'right'
                        }}>
                            { originalItem.systemNotes ? 
                                <Tag color='magenta'
                                    style={{
                                        marginRight: '0',
                                        width: '100%',
                                        textAlign: 'start'
                                    }}>
                                    {originalItem.systemNotes}
                                </Tag> : null
                            }
                        </li>
                    </ul>
                : null
            }
            </Col>
        </Row>
        </div>
        </div>   
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
        return moment(record.rdate, 'DD/MM/YYYY').isAfter(moment());
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

    return (
        <>
            <Modal title={selectedDate}
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
                    value={new moment(originalData[0].rdate)}
                    headerRender={ () => null }
                /> : null
            }
        </>

    )
}

export default CalendarReport;