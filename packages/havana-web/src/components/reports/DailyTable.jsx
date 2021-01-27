import React, { useEffect, useState, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { ADD_ITEM, UPDATE_ITEM, DELETE_ITEM } from '../../redux/actionTypes';
import { Table, Popconfirm, Form, Icon,
    Tag, Row, Col, Tooltip, Typography } from 'antd';
const { Text } = Typography;    
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import { PlusCircleTwoTone, 
    MinusCircleTwoTone,
    TagOutlined } 
    from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { ReportContext } from "./TableContext";       
import moment from 'moment'; 

import EditIcons from './EditIcons';
import EditableCell from './EditableCell';
import DeletableRow from './DeletableRow';
import AddRecordModal from './AddRecordModal';
const FullDayReport = React.lazy( () => import('./FullDayReport') );

import { TIME_FORMAT, DATE_FORMAT } from '../../globals'

const DailyTable = (props) => {

    const [form] = Form.useForm()

    const [tableData, setTableData] = useState([]);
    const [reportCodes, setReportCodes] = useState([]);
    const [manualUpdates, setManualUpdates] = useState([]);
    const [editingKey, setEditingKey] = useState('')

    // Full Day Report
    const [fullDayReportVisible, setFullDayReportVisible] = useState(false); 

    // States for adding new record
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [recordToAdd, setRecordToAdd] = useState();

    const { t } = useTranslation();

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

    const action_ItemUpdated = (item, index) => ({
        type: UPDATE_ITEM,
        item
    })

    useEffect( () => {

        const _originalData = props.dataSource.map( record =>  {

            const _isRowEditable = isRowEditable(record);

            return { 
                ...record, 
                requireChange : _isRowEditable, 
                valid : _isRowEditable ? false : true
            }
          })

          setTableData(_originalData)
       
    }, [props.dataSource])

    useEffect( () => {

        if( props.reportCodes )
            setReportCodes(props.reportCodes);
    
    }, [props.reportCodes])    
        
    useEffect( () => {

        setManualUpdates(props.manualUpdates);
    
    }, [props.manualUpdates])

    const isRowEditing = record => {
        return record.key === editingKey
    }

    const handleAddRecord = (record) => {
        setRecordToAdd(record);
        setAddModalVisible(true);
    }

    const manuallyEditedTag = ( isEditedManually ) => {

        return isEditedManually ?
                <Tooltip title={t('manual_tag')}>
                  <Tag color='magenta'>
                        <TagOutlined />
                  </Tag> 
                </Tooltip>: null
    }

    const hasSytemNotes = (record) => {
        return record.systemNotes && record.systemNotes.startsWith('*');
    }

    const isTotalled = (item) => {
        const tokens = item.acceptedHours.split(':');
        const hours = parseInt(tokens[0]);
        const minutes = parseInt(tokens[1]);
        return item.total != '0:00';
    }

    const isWorkingDay = (item) => {
    
        const itemDate = moment(item.rdate);
    
        const index = props.daysOff.findIndex( dayOff => 
             dayOff.getDate() === itemDate.date() &&
             dayOff.getMonth() === itemDate.month() &&
             dayOff.getFullYear() === itemDate.year()
        );
    
        return index !== -1 
          ? false:   
          !(itemDate.day() == 5  || itemDate.day() == 6);
      }

    const isRowEditable = (record) => {
        return props.editable && (!isTotalled(record) && isWorkingDay(record) 
                              || record.isAdded || record.isUpdated
                              || isRecordUpdatedManually(record, 'entry') 
                              || hasSytemNotes(record));
    } 

    const findMaxStripId = (day) => {
        const dailyItems = tableData.filter( (item ) =>
          item.day === day
        )
        const max = dailyItems.reduce( (accu, current) => {
          return current.day === day  ? current.stripId : 0
        }, 1);

        return max;
      }

    const isRecordUpdatedManually = (record, columnName) => {

        if( !manualUpdates )
                return false;

        let found = false;  
        if( columnName === 'entry' ) {
                found = manualUpdates.find( item => {
                    return item.day == parseInt(record.day) && item.inout === true
                })
        }  else if ( columnName === 'exit') {
                found = manualUpdates.find( item => {
                    return item.day == parseInt(record.day) && item.inout === false
                })
        }
    
        return found ? true: false;
    }

    const onCancelAdd = () => 
        setAddModalVisible(false);

    const onCancelFullDayReport = () =>
        setFullDayReportVisible(false);        
 

    const removeRecord = (record) => {

        const index = tableData.findIndex( 
            item => item.key === record.key
        );

        if( index !== -1 ) {

            const deletedItem = tableData[index];
            deletedItem.isDeleted = true;

            // dispatch(
            //     action_ItemDeleted(deletedItem, index)
            // )

            props.onRemove && props.onRemove(deletedItem.key, deletedItem);
        }
    }

    const replaceRecord = (newValues, recordKey) => {
 
        const newData = [...tableData];
        const index = newData.findIndex(item => recordKey === item.key);
        if (index > -1) {
            const item = newData[index];

            let replacedItem = {
                ...item,
                ...newValues,
                isFullDay: true,
                isUpdated: true,
                valid: true
            }

            newData.splice(index, 1, replacedItem);
            setTableData(newData);

            props.onSave && props.onSave(replacedItem)
        }

        setFullDayReportVisible(false);
        setRecordToAdd(null);
   
    }

    const addRecord = ({inTime, outTime, reportCode, userNotes, isFullDay}) => {
    
        setAddModalVisible(false);
        
        let addedPositions = tableData.reduce( (accu, current, index) => {
            return {
                key: Math.max(accu.key, parseInt(current.key)),
                position: index
            }      
        },  {key:0,
            position: 0})
    
        const index = tableData.findIndex( item => 
            item.key == recordToAdd.key
            ) + 1     

        const newStripId = findMaxStripId(recordToAdd.day) + 1;

        let newItem = {
            ...recordToAdd,
            rdate: recordToAdd.rdate,
            key: addedPositions.key + 1,
            isAdded: true,
            userNotes: userNotes,
            entry: inTime,
            exit: outTime,
            stripId: newStripId,
            systemNotes: '',
            reportCode: reportCode,
            isFullDay: isFullDay
        }    
        setRecordToAdd(null);  

        newItem.total = moment.utc(moment(newItem.exit, TIME_FORMAT).diff(moment(newItem.entry, TIME_FORMAT))).format(TIME_FORMAT) 
    
        dispatch(
            action_ItemAdded(newItem, index)
        );  
        
        const newData = [
            ...tableData.slice(0, index),
            newItem,
            ...tableData.slice(index)
        ]    
    
        setTableData(newData);
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

          const newData = [...tableData];
          const index = newData.findIndex(item => key === item.key);
          if (index > -1) {
            const item = newData[index];
            let newItem = {
              ...item,
              ...row,
              rdate: moment(item.rdate, DATE_FORMAT).startOf('day').format(DATE_FORMAT)
            }
            newItem.total = moment.utc(moment(newItem.exit, TIME_FORMAT).diff(moment(newItem.entry, TIME_FORMAT))).format(TIME_FORMAT)
            newItem.valid = true;
            
            newData.splice(index, 1, newItem);
            setEditingKey('');
            props.onSave && props.onSave(newItem, inouts);        
            setTableData(newData)
          }

        } catch( errorInfo ) {
          console.error(errorInfo)
        }

    }
    
    const components = {
        body: {
          cell: EditableCell,
          row: DeletableRow
        },
    };

    let columns = [{
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
                        onClick={() => handleAddRecord(record)}/>
                </Tooltip>      
                </Col>
                <Col span={12}>
                {
                    record.isDeleted ? null :
                    <Tooltip title={t('delete_record')}>
                        <Popconfirm
                            title={t('sure')}
                            onConfirm={() => removeRecord(record)}>
                                <MinusCircleTwoTone />  
                        </Popconfirm>                        
                    </Tooltip>
                }
                </Col>
            </Row> 
            ) : null
      }, {
        title: t('in'),
        width: '15%',
        dataIndex: 'entry',
        align: 'right',
        editable: true,
        render: (text, record) => {
            
            const isEditedManually = isRecordUpdatedManually(record, 'entry')

            let tagColor = 'blue';
            if( text === '0:00' ) {
                tagColor = 'magenta'
            }
            return <>
                        {
                            text.format(TIME_FORMAT) === '00:00' ?
                                <div>-</div> :
                                <>
                                    <Tag color={tagColor}
                                        style={{
                                            marginRight: '0',
                                            backgroundColor: 'transparent'
                                    }}>
                                        {
                                            text.format(TIME_FORMAT)
                                        }
                                    </Tag>
                                    { manuallyEditedTag(isEditedManually) }
                                </>
                        }

                    </>
        }          
    }, {
        title: t('out'),
        width: '15%',
        dataIndex: 'exit',
        align: 'right',
        editable: true,
        render: (text, record) => {

            const isEditedManually = isRecordUpdatedManually(record, 'exit')

            let tagColor = 'blue';
            if( text === '0:00' ) {
                tagColor = 'magenta'
            }

            return <>
                {
                    text.format(TIME_FORMAT) === '00:00' ?
                    <div>-</div> :
                    <>
                        <Tag color={tagColor}
                            style={{
                                marginRight: '0',
                                backgroundColor: 'transparent'
                            }}>
                            {
                                text.format(TIME_FORMAT)
                            }
                        </Tag>
                        { manuallyEditedTag(isEditedManually) }
                    </>
                }
            </>

        }
    }, {
        title: t('report_code'),
        dataIndex: 'reportCode',
        align: 'right',
        editable: true,
        render: (text, record) => {
          
          if( !moment(record.rdate, DATE_FORMAT).isBefore(moment()) )
            return null;

          return <Row>
            <Col>
              <div style={{whiteSpace: 'nowrap'}}>
                  { text }
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
        title: t('system_notes'),
        dataIndex: 'systemNotes',
        align: 'right',
        editable: false,
        render: (text, record) => {

          if( !moment(record.rdate, DATE_FORMAT).isBefore(moment()) )
            return null;

          return ( text !== '' ) ?
                <Tag color="magenta"
                    style={{
                        marginRight: '0',
                        backgroundColor: 'transparent'
                }}>
                    {
                        record.isUpdated ?
                            <Text delete>{text}</Text> : 
                            <Text>{text}</Text>
                    }
                </Tag>
                : null
        }
      },           {
        title: t('user_notes'),
        dataIndex: 'userNotes',
        align: 'right',
        editable: true,
        render: (text, _) => {
          return text && text.length > 20 ?
                <Tooltip title={text}>
                  <Ellipsis length={12}>{text}</Ellipsis>
                </Tooltip> :
                  <div style={{
                    whiteSpace: 'nowrap'
                  }}>{text}</div>
        }
      }, {
        title: '',
        dataIndex: 'operation',
        width: '10%',
        render: (_, record) => {

          return ( moment(record.rdate, DATE_FORMAT).isBefore(moment()) // no edits for future
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
            }}
        };            
    })

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

    return <ReportContext.Provider value={ {
        codes: reportCodes,
        dailyTableData: tableData
       }
     }>
        
        <Suspense fallback={<div>Loading AddRecord Report...</div>}>
            <AddRecordModal 
                visible={addModalVisible}
                record = {recordToAdd}
                onCancel={onCancelAdd}
                onAddRecord={addRecord}
            />
        </Suspense>

        <Suspense fallback={<div>Loading FullDayReport...</div>}>
            <FullDayReport visible={fullDayReportVisible}
                          onCancel={onCancelFullDayReport}
                          onOk={replaceRecord}
                          record={recordToAdd}
                    />
        </Suspense>

        <Form form={form} component={false}>
            <Table style={{
                    marginRight: "38px",
                    marginLeft: "8px"
                }}
                pagination={false}
                dataSource={tableData}
                columns={columns}
                components={components}
                tableLayout='auto'
                bordered={false}  
                rowClassName="editable-row"
                size="small"
            />
        </Form>
    </ReportContext.Provider>
}

export default DailyTable;