import React, { useState, useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_ITEM, DELETE_ITEM } from '../../redux/actionTypes';
import { Table, Popconfirm, Modal, Form, Icon,
        Tag, Row, Col, Tooltip, Typography } from 'antd';
const { Text, Title } = Typography;        
import { PlusCircleTwoTone, 
  MinusCircleTwoTone,
  TagOutlined } 
from '@ant-design/icons';
import moment, { max } from 'moment';
import { useTranslation } from "react-i18next";

import { ReportContext } from "./TableContext";
import EditableCell from './EditableCell';
import EditIcons from './EditIcons';
import AddRecordModal from './AddRecordModal';
const FullDayReport = React.lazy( () => import('./FullDayReport') );
//import FullDayReport from './FullDayReport';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';

const format = 'HH:mm';

const TableReport = (props) => {

    const [form] = Form.useForm()

    const [data, setData] = useState([])
    const [daysOff, setDaysOff] = useState([]);
    const [editingKey, setEditingKey] = useState('')
    const [manualUpdates, setManualUpdates] = useState([]);
    const [reportCodes, setReportCodes] = useState([]);
  
    const dispatch = useDispatch();
  
    const action_ItemAdded = (item, index) => ({
      type: ADD_ITEM,
      addIndex: index,
      addItem: item
    });  
  
    const action_ItemDeleted = (item, index) => ({
      type: DELETE_ITEM,
      deleteIndex: index,
      deletedItem: item
    })
  
    // States for adding new record
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [recordToAdd, setRecordToAdd] = useState();
  
    // Full Day Report
    const [fullDayReportVisible, setFullDayReportVisible] = useState(false);

    const { t } = useTranslation();

    useEffect(() => {
        setData(props.dataSource.map( record =>  {
    
            const _isRowEditable = isRowEditable(record);
    
            return { 
                ...record, 
                requireChange : _isRowEditable, // isRowEditable(record),
                valid : _isRowEditable ? false : true, // (record.requireChange)?  false : true,
                rdate : moment(record.rdate).format('DD/MM/YYYY')
            }
          })
        )
      }, [props.dataSource])

      useEffect( () => {

        if( props.reportCodes )
          setReportCodes(props.reportCodes);
    
      }, [props.reportCodes])

      useEffect( () => {

        setManualUpdates(props.manualUpdates);
    
      }, [props.manualUpdates])
    
      useEffect(() => {
        setDaysOff(props.daysOff);
      },[props.daysOff])

      const isRowEditing = record => {
        return record.key === editingKey
      }
    
      const isWorkingDay = (item) => {
    
        const itemDate = moment(item.rdate);
    
        const index = daysOff.findIndex( dayOff => 
             dayOff.getDate() === itemDate.date() &&
             dayOff.getMonth() === itemDate.month() &&
             dayOff.getFullYear() === itemDate.year()
        );
    
        return index !== -1 
          ? false:   
          !(itemDate.day() == 5  || itemDate.day() == 6);
      }
    
      const isTotalled = (item) => {
        const tokens = item.total.split(':');
        const hours = parseInt(tokens[0]);
        const minutes = parseInt(tokens[1]);
        return item.total != '0:00';
      }
    
      const hasSytemNotes = (record) => {
        return record.notes && record.notes.startsWith('*');
      }
    
      const isRowEditable = (record) => {
        return props.editable && (!isTotalled(record) && isWorkingDay(record) 
                              || record.isAdded 
                              || isRecordUpdatedManually(record, 'entry') 
                              || hasSytemNotes(record));
      }
    
      const edit = (record) => {
        form.setFieldsValue({
          ...record
        })
        setEditingKey(record.key);
      }

      const editFullDay = (record) => {
        setRecordToAdd(record);
        setFullDayReportVisible(true);      
      }
    
      const cancel = () => {
        setEditingKey('');
      };
    
      const getEntryTime = (formValues, key) => {
        return formValues.entry ? formValues.entry.format("HH:mm") : data[key].entry;
      }
    
      const getExitTime = (formValues, key) => {
        return formValues.exit ? formValues.exit.format("HH:mm") : data[key].exit;
      }
    
      const minutes = (timeValue) => {
        const tokens = timeValue.split(':');
        return parseInt(tokens[0]) * 60 + parseInt(tokens[1]);
      }
    
      const save = async (key) => {
    
        try {

          const row = await form.validateFields();
          const entryTime = row.entry;
          const exitTime = row.exit;

          if( exitTime.isBefore(entryTime) ) {
            form.setFields([{
              name: 'entry',
              value: entryTime,
              errors: [t('exit_before_entry')]
            }]);
            return;
          }

          const inouts = [entryTime, exitTime]; 

          const newData = [...data];
          const index = newData.findIndex(item => key === item.key);
          if (index > -1) {
            const item = newData[index];
            let newItem = {
              ...item,
              ...row,
              rdate: moment(item.rdate, 'DD/MM/YYYY').startOf('day').format('DD/MM/YYYY')
            }
            newItem.total = moment.utc(moment(newItem.exit, format).diff(moment(newItem.entry, format))).format(format)
            newItem.valid = true;
            
            newData.splice(index, 1, newItem);
            setEditingKey('');
            props.onChange && props.onChange(newItem, inouts);        
            setData(newData)
          }

        } catch( errorInfo ) {
          console.error(errorInfo)
        }

      }
    
      const handleAddRow = (record) => {
        setRecordToAdd(record);
        setAddModalVisible(true);
      }

      const components = {
        body: {
          cell: EditableCell,
        },
      };
     
      let columns = [
        {
          title: '',
          dataIndex: 'add',
          align: 'center',
          width: '6%',
          editable: false,
          render: (_, record) => 
            props.editable ? (
              <Row>
                <Col span={12}>
                  <Tooltip title={t('add_record')}>
                    <PlusCircleTwoTone
                          onClick={() => handleAddRow(record)}/>
                  </Tooltip>      
                </Col>
                <Col span={12}>
                {
                    record.isAdded ? 
                      <Popconfirm
                        title={t('sure')}
                        onConfirm={() => handleRemoveRecord(record)}>
                          <MinusCircleTwoTone />  
                      </Popconfirm>    
                    : null
                }
                </Col>
              </Row> 
              ) : null
        },
          {
            title: 'יום',
            width: '4%',
            dataIndex: 'day',
            align: 'right',
            ellipsis: true,
            editable: false,
          },
          {
            title: 'יום בשבוע',
            width: '10%',
            dataIndex: 'dayOfWeek',
            align: 'center',
            ellipsis: true,
            editable: false,
          },    
          {
            title: t('in'),
            width: '15%',
            dataIndex: 'entry',
            align: 'right',
            editable: true,
            render: (text, record) => {
              const isEditedManually = isRecordUpdatedManually(record, 'entry')
    
              let tagColor = 'green';
              if( text === '0:00' ) {
                tagColor = 'volcano'
              }
              return <Row>
                      <Tag color={tagColor}
                        style={{
                          marginRight: '0'
                      }}>

                        { 
                          
                            moment.isMoment(text) ?
                              text.format(format) : '-'
                          
                        }

                      </Tag>
                      {
                        manuallyEditedTag(isEditedManually)
                      }
                     </Row> 
            }          
          },
          {
            title: t('out'),
            width: '15%',
            dataIndex: 'exit',
            align: 'right',
            editable: true,
            render: (text, record) => {
    
              const isEditedManually = isRecordUpdatedManually(record, 'exit')
    
              let tagColor = 'green';
              if( text === '0:00' ) {
                tagColor = 'volcano'
              }
              return <>
                    <Tag color={tagColor}
                      style={{
                        marginRight: '0'
                    }}>
                      {
                        moment.isMoment(text) ?
                        text.format(format) : '-'
                      }
                    </Tag>
                    {
                      manuallyEditedTag(isEditedManually)
                    }
                </>                  
            }
          },
          {
            title: 'סיכום',
            width: '6%',
            dataIndex: 'total',
            align: 'right',
            editable: false,
          },
          {
            title: 'נדרש',
            width: '6%',
            dataIndex: 'required',
            align: 'right',
            editable: false,
          },
          // {
          //   title: 'נחשב',
          //   width: '6%',
          //   dataIndex: 'accepted',
          //   align: 'right',
          //   editable: false
          // },
          {
            title: t('report_code'),
            //width: '14%',
            dataIndex: 'reportCode',
            align: 'right',
            editable: true,
            render: (text, record) => {
              //const isEditedManually = isRecordUpdatedManually(record, 'entry')

              return <Row>
                <Col>
                  <div style={{whiteSpace: 'nowrap'}}>
                    {text}
                  </div>
                </Col>
                <Col>
                {
                  record.isFullDay ?
                    manuallyEditedTag(true) : null
                }
                </Col>
              </Row>
            }
          },
          {
            title: t('notes'),
            dataIndex: 'notes',
            align: 'right',
            editable: true,
            render: (text, _) => 
              ( text !== '' ) ?
                  <Tag color="blue"
                    style={{
                      marginRight: '0'
                    }}>
                      {
                        text && text.length > 42 ?
                        <Tooltip title={text}>
                          <Ellipsis length={42}>{text}</Ellipsis>
                        </Tooltip> :
                          <div>{text}</div>
                      }
                  </Tag>
                  : null
          },
          {
            title: '',
            dataIndex: 'operation',
            width: '10%',
            render: (_, record) => {

              return ( moment(record.rdate, 'DD/MM/YYYY').isBefore(moment()) // no edits for future
                        && record.requireChange)? 
                (<EditIcons 
                    record={record}
                    editing={isRowEditing(record)} 
                    disable={editingKey !== ''} 
                    edit={edit}
                    editFullDay={editFullDay}
                    save={save} 
                    cancel={cancel}
                />) : null
    
            }
          },
        ];
    
      columns = columns.map(col => {
        if (!col.editable) 
          return col;
    
        return {
          ...col,
          onCell: (record, rowIndex) => {
    
            return {
              record,
              inputType: getInputType(col.dataIndex),
              dataIndex: col.dataIndex,
              title: col.title,
              rowEditing: isRowEditing(record),
              //cellEditable: true
    
              // cellEditable: record.isAdded && ( col.dataIndex == 'entry' || col.dataIndex == 'exit' )
              //               || data[rowIndex][col.dataIndex] === '0:00'
              //               || col.dataIndex === 'notes' || col.dataIndex === 'typeReport'
              //               || isRecordUpdatedManually(record, col.dataIndex)
     
          }}
        };
      });

      if( props.employeKind === 1) { // Do not display 'required' columns for Contractors 
        let index = columns.findIndex( item => item.dataIndex === 'required');
        columns = [...columns.slice(0, index),
                  ...columns.slice(index+1)];
        // index = columns.findIndex( item => item.dataIndex === 'accepted');
        // columns = [...columns.slice(0, index),
        //   ...columns.slice(index+1)];
      }
    
      const getInputType = (type) => {
        const controls = {
          entry: function () {
            return 'time';
          },
          exit: function () {
            return 'time';
          },
          reportCode: function () {
            return 'select';
          },
          default: function () {
            return 'text';
          }
        };
        return (controls[type] || controls['default'])();
      }      

      const manuallyEditedTag = ( isEditedManually ) => {

        return isEditedManually ?
                <Tooltip title={t('manual_tag')}>
                  <Tag color='magenta'>
                        <TagOutlined />
                  </Tag> 
                </Tooltip>: null
      }

      const isRecordUpdatedManually = (record, columnName) => {

        if( !manualUpdates )
                return false;

        let found = false;  
        if( columnName === 'entry' ) {
                found = manualUpdates.find( item => {
                return item.Day == parseInt(record.day) && item.InOut === true
                })
        }  else if ( columnName === 'exit') {
                found = manualUpdates.find( item => {
                return item.Day == parseInt(record.day) && item.InOut === false
                })
        }
    
        return found ? true: false;
      }

      const isValid = !data.some(r => !r.valid)
      if (isValid) {
        props.onValidated && props.onValidated(data)
      }

      const onFullDayReportAdded = ({jobDescription, reportCode}, key) => {

        setFullDayReportVisible(false);
        setRecordToAdd(null);

        var zeroTime = moment().utcOffset(0);
        zeroTime.set({
          hour:0,
          minute:0,
          second:0,
          millisecond:0
        })

        const item = {
            inTime: zeroTime, 
            outTime: zeroTime, 
            reportCode: reportCode, 
            notes: jobDescription,
            isFullDay: true
        }

        replaceRecord(key, item);

      }

      const addRecord = ({inTime, outTime, reportCode, notes, isFullDay}) => {
    
        setAddModalVisible(false);
    
        let addedPositions = data.reduce( (accu, current, index) => {
          return {
            key: Math.max(accu.key, parseInt(current.key)),
            position: index
         }      
        },  {key:0,
          position: 0})
    
        const index = data.findIndex( item => 
            item.key == recordToAdd.key
          ) + 1     

        const newStripId = findMaxStripId(recordToAdd.day) + 1;

        let newItem = {
            ...recordToAdd,
            key: addedPositions.key + 1,
            isAdded: true,
            notes: notes,
            entry: inTime,
            exit: outTime,
            stripId: newStripId,
            reportCode: reportCode,
            isFullDay: isFullDay
        }    
        setRecordToAdd(null);  

        newItem.total = moment.utc(moment(newItem.exit, format).diff(moment(newItem.entry, format))).format(format) 
    
        dispatch(
          action_ItemAdded(newItem, index)
        );  
   
        const newData = [
          ...data.slice(0, index),
          newItem,
          ...data.slice(index)
        ]    
    
        setData(newData);
      }

      const replaceRecord = (key, newItem) => {
        const newData = [...data];
        const index = newData.findIndex(item => key === item.key);
        if (index > -1) {

          const item = newData[index];
          let replacedItem = {
            ...item,
            inTime: newItem.inTime, 
            outTime: newItem.outTime, 
            reportCode: newItem.reportCode, 
            notes: newItem.notes,
            isFullDay: true
          }

          replacedItem.valid = true;
          newData.splice(index, 1, replacedItem);
          setData(newData);
          setRecordToAdd(null);

          props.onChange && props.onChange(replacedItem, null);
        }
      }

      const findMaxStripId = (day) => {
        const dailyItems = data.filter( (item ) =>
          item.day === day
        )
        const max = dailyItems.reduce( (accu, current) => {
          return current.day === day  ? current.stripId : 0
        }, 1);

        return max;
      }

      const onCancelAdd = () => 
        setAddModalVisible(false);

      const onCancelFullDayReport = () =>
        setFullDayReportVisible(false);

      const handleRemoveRecord = (record) => {
    
        const index = data.findIndex( item => 
          item.key == record.key
        )    
    
        const deletedItem = data[index];
        dispatch(
          action_ItemDeleted(deletedItem, index)
        );  
    
        const newData = [...data.slice(0, index), ...data.slice(index + 1)];
        setData(newData);
      }

      return (<>
        <ReportContext.Provider value={ {
                                         codes: reportCodes
                                        }
                                      }>
          <AddRecordModal 
                  visible={addModalVisible}
                  record = {recordToAdd}
                  onCancel={onCancelAdd}
                  onAddRecord={addRecord}
                  />

          <Suspense fallback={<div>Loading...</div>}>
            <FullDayReport visible={fullDayReportVisible}
                          onCancel={onCancelFullDayReport}
                          onOk={onFullDayReportAdded}
                          record={recordToAdd}
                    />
          </Suspense>


          <Form form={form} component={false}>
            <Table
                {...props}
                style={{ 
                        direction: 'rtl', 
                        heigth: '600px',
                        margin: '12px'
                        }}
                tableLayout='auto'
                bordered={false}
                components={components}
                dataSource={data}
                columns={columns}
                rowClassName="editable-row"
                pagination={false}
                size="small"
              />
            </Form>
        </ReportContext.Provider>
    </>)
  
}

export default TableReport;