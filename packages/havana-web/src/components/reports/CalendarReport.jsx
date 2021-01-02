import React, { useEffect, useState } from 'react';
import { Calendar, Row, Col, Tag,
    Modal } from 'antd';
import moment from 'moment';

const DailyTable = React.lazy( () => import('./DailyTable') );

const CalendarReport = (props) => {

    const [originalData, setOriginalData] = useState([]);
    const [firstLevelData, setFirstLevelData] = useState([]);
    const [dailyReportVisible, setDailyReportVisible] = useState(false);
    const [secondLevelData, setSecondLevelData] = useState([]);

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
        const day = value.date();
        setSecondLevelData(getSecondLevelData(day));
        setDailyReportVisible(true);
    }

    const dateCellRender = (date) => {

        const originalItem = firstLevelData.find( item => item.rdate.isSame(date, 'day') )

        return <Row>
            <Col>
            {
                ( originalItem ) ?
                    <Tag color='magenta'
                        style={{
                            marginRight: '0'
                        }}>
                        {originalItem.systemNotes}
                    </Tag>
                : null
            }
            </Col>
        </Row>
    }

    const getSecondLevelData = (day) => {
        return originalData.filter( item =>
            parseInt(item.day) === day
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

    return (
        <>
            <Modal visible={dailyReportVisible}>
                <DailyTable 
                    dataSource={secondLevelData}
                    reportCodes={props.reportCodes}
                    manualUpdates={props.manualUpdates}
                    editable={true}
                    onSave={saveRecord}
                    onReplace={replaceRecord}/>
            </Modal>

            {
                originalData.length > 0 ?
                <Calendar 
                    mode='month'
                    onSelect={onSelect}
                    dateCellRender={dateCellRender}
                    value={new moment(originalData[0].rdate)}
                    headerRender={ () => null }
                /> : null
            }
        </>

    )
}

export default CalendarReport;