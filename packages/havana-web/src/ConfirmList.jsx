// @flow
import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment'

import { Table, Alert, 
        Row, Col, Icon, Tag, Checkbox } from 'antd';
import { ScheduleTwoTone,
    CarryOutTwoTone,
    AlertTwoTone 
} from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { Tabs } from 'antd';
const { TabPane } = Tabs;
import { Layout } from 'antd';
const { Content } = Layout;
import { DataContext } from './DataContext';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';

const DATE_FORMAT = 'DD/MM/YYYY';

const monthsFilter = [...Array(12).keys()].map( i => ({
                                                        text: i+1,
                                                        value: i + 1
                                                    })
                                              )
const yearsFilter = [2019, 2020, 2021, 2022, 2023, 2024].map( i => ({
                                                            text: i,
                                                            value: i
                                                        })
                                                    )                                              

const columns = [{
        title: 'שם עובד',
        dataIndex: 'userName',
        align: 'right',
        key: 'name'
    },{
      title: "שנה",
      dataIndex: "year",
      align: 'right',
      key: "year",
      filters: yearsFilter,
      onFilter: (value, record) => {
          return record.year === value
      }      
   },{
      title: "חודש",
      dataIndex: "month",
      align: 'right',
      key: "month",
      filters: monthsFilter,
      onFilter: (value, record) => {
          return record.month === value
      }      
   },{
      title: "תאריך שליחה",
      dataIndex: "whenSubmitted",
      align: 'right',
      key: "submitted"
   },{
      title: "סימון",
      dataIndex: "systemNotes",
      align: 'right',
      key: "comment",
      render: (text, _) => 
          <Tag color='magenta'
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
  }, {
      title: "סטטוס",
      dataIndex: "reSubmitted",
      align: 'right',
      key: "resubmitted",
      render: (value, _) => 
        <Tag color='blue'
        style={{
            marginRight: '0'
        }}>
            {
                value ? 
                <div>נשלח מחדש</div> :
                <div>ממתין לאישור</div>
            }
        </Tag>
  }

]


const ConfirmList = () => {

    const history = useHistory();

    const [pendingList, setPendingList] = useState([])
    const [pendingCount, setPendingCount] = useState(0)
    const [approvedList, setApprovedList] = useState([])
    const [approvedCount, setApprovedCount] = useState(0)
    const [rejectedList, setRejectedList] = useState([])
    const [rejectedCount, setRejectedCount] = useState(0)
    const [namesFilter, setNamesFilter] = useState({})
    const [loadingData, setLoadingData] = useState(false);
    
    const context = useContext(DataContext)

    const { t } = useTranslation();

    const approvedTableColumns = [{
        title: "שם עובד",
        dataIndex: "reportOwner",
        align: 'right',
        key: "name",
        //filters: namesFilter,
        onFilter: (value, record) => {
            return record.reportOwner.indexOf(value) === 0
        }
    },
    ...columns.slice(1, columns.length - 1),
    {
        title: "תאריך אישור",
        dataIndex: "whenApproved",
        align: 'right',
        key: "approved"
    }];
    
    const rejectedTableColumns = [{
        title: "שם עובד",
        dataIndex: "reportOwner",
        align: 'right',
        key: "name",
        //filters: namesFilter,
        onFilter: (value, record) => {
        } 
    },
    ...columns.slice(1, columns.length - 1),
    {
        title: "תאריך דחיה",
        dataIndex: "whenRejected",
        align: 'right',
        key: "approved" 
    }
    ]

    useEffect( () =>  {

        async function fetchData() {

            setLoadingData(true);

            try {

                const resp = await Promise.all([
                    // API is already wrapped with credentials = true
                    context.API.get('/me/pendings'),
                    context.API.get('/me/approved'),
                    context.API.get('/me/pendings/rejected')
                ])

                const pendingReports = resp[0].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format(DATE_FORMAT),
                        key: index
                    }
                })
                setPendingCount(pendingReports.length);
                setPendingList(pendingReports);

                const approvedReports = resp[1].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format(DATE_FORMAT),
                        whenApproved: moment(item.whenApproved).format(DATE_FORMAT),
                        key: index
                    }
                });
                setApprovedCount(approvedReports.length);
                setApprovedList(approvedReports);

                const names = new Set(); // will be unique
                resp[1].data.forEach( item => names.add(item.reportOwner) )

                const _namesFilter = [...names].map( item => (
                    {
                        text: item,
                        value: item
                    }
                ))
                setNamesFilter(_namesFilter);

                const _rejectedList = resp[2].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format(DATE_FORMAT),
                        whenRejected: moment(item.whenRejected).format(DATE_FORMAT),
                        key: index
                    }
                });
                setRejectedCount(_rejectedList.length);
                setRejectedList(_rejectedList);

            } catch(error) { // 😨
                console.log(error.message);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()

    }, [])

    const onRowClick = (record, index, event) => {
        history.push(`/confirm/${record.userId}/${record.saveReportId}`);
    }

    const onApprovedRowClick = (record, index, event) => {
        history.push(`/confirm/${record.reportOwnerId}/${record.saveReportId}`);
    }

    const onRejectedRowClick = (record, index, event) => {
        history.push(`/confirm/${record.reportOwnerId}/${record.saveReportId}`); 
    }

    const alertOpacity = loadingData ? 0.2 : 1.0; 

    return(
        <Content>
            <Row>
                <Alert closable={false}
                style={{
                    opacity: alertOpacity,
                    width: '100%'
                }}
                    className='hvn-item-rtl'
                    message={t('approvals_list')}/>
            </Row>
            <Row>
                <Col span={24}>
                    <Tabs defaultActiveKey="1" 
                        type="line"
                        className='hvn-table-rtl'>
                        <TabPane tab={
                            <span>
                                <ScheduleTwoTone />
                                <span>
                                    {t('pending_reports')} ({pendingCount})
                                </span>
                            </span>
                            }
                            key='1'>
                            <Table dataSource={pendingList} 
                                    style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                                    columns={columns} 
                                    size='middle' 
                                    bordered={false}
                                    pagination={false}
                                    onRow={(record, index) => ({
                                                onClick: (event) => { onRowClick(record, index, event) } 
                                            })}>
                            </Table>
                        </TabPane>
                        <TabPane tab={
                            <span>
                                <CarryOutTwoTone />
                                <span>
                                    {t('approved_reports')} ({approvedCount})
                                </span>
                            </span>
                            }
                            key='2'>
                            <Table dataSource={approvedList} 
                                    style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                                    columns={approvedTableColumns}
                                    size='middle'
                                    bordered={true}
                                    pagination={false}
                                    onRow = { (record, index) => ({
                                        onClick: (event) => { onApprovedRowClick(record, index, event) }
                                    })}>

                            </Table>
                        </TabPane>
                        <TabPane tab={
                            <span>
                                <AlertTwoTone />
                                <span>
                                    {t('rejected_reports')} ({rejectedCount})
                                </span>
                            </span>
                            }
                            key='3'>
                                <Table dataSource={rejectedList}
                                    style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                                    columns={rejectedTableColumns}
                                    size='middle'
                                    bordered={false}
                                    pagination={false}
                                    onRow = { (record, index) => ({
                                        onClick: (event) => { onRejectedRowClick(record, index, event) }
                                    })}
                                    />
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>            
        </Content>
    )
}

export default ConfirmList;