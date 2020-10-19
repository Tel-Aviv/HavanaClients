import React, { useState, useEffect, useContext, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import  { Button, Row, Col, Layout,
    Tooltip, Popconfirm, Dropdown,
    Menu, Alert, DatePicker,
    Card, Tabs }
from 'antd';
const { Content } = Layout;
const { MonthPicker } = DatePicker;
const { TabPane } = Tabs;
import { UserOutlined,
    BarsOutlined,
    FundOutlined,
    PrinterOutlined,
    CheckCircleOutlined } 
from '@ant-design/icons';
import { Pie } from 'ant-design-pro/lib/Charts';
import moment from 'moment';
import { useTranslation } from "react-i18next";

import { DataContext } from './DataContext';
const PrintModal = React.lazy( () => import('./PrintModal') );
import DocsUploader from '@components/DocsUploader';
import TableReport from '@reports/TableReport';
const YearReport = React.lazy( () => import('@reports/YearReport') )

const TIME_FORMAT = 'HH:mm';

const Stub = () => {

    const { t } = useTranslation();

    const [loadingData, setLoadingData] = useState(false);
    const [reportDataValid, setReportDataValid] = useState(false);
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [month, setMonth] = useState(moment().month()+1);
    const [year, setYear] = useState(moment().year());
    const [reportData, setReportData] = useState([])
    const [calendarDate, setCalendarDate] = useState(moment());
    const [signature, setSignature] = useState('');
    const [totals, setTotals] = useState(0);
    const [alert, setAlert] = useState({
        type: 'info',
        message: t('loading')
    })
    const [isReportSubmitted, setReportSubmitted] = useState(false);
    const [assignee, setAssignee] = useState({
        userId:'direct'
    });
    const [managers, setManagers] = useState([])
    const [daysOff, setDaysOff] = useState([]);
    const [manualUpdates, setManualUpdates] = useState();
    const [isReportRejected, setIsReportRejected] = useState(false);
    const [userCompanyCode, setUserCompanyCode] = useState(0);
    const [reportCodes, setReportCodes] = useState([]);
    const [isReportEditable, setIsReportEditable] = useState(true);
    const [employeKind, setEmployeKind] = useState()

    const dataContext = useContext(DataContext);

    const dispatch = useDispatch();

    useEffect( () => {

        const fetchData = async () => {

            try {

                const resp = await dataContext.API.get('/me')
                if( !resp.data.managers )
                    throw new Error(t('no_managers'));
                setManagers(resp.data.managers); 
                
                const signature = resp.data.signature;
                if( signature ) {
                    if( signature.startsWith('data:') ) {
                        setSignature(signature);
                    }
                    else {    
                        setSignature(`data:/image/*;base64,${signature}`);
                    }
                }

                if( assignee.userId === 'direct' ) {
                    const directManager = resp.data.direct_manager;
                    if( directManager ) {
                        setAssignee(directManager);
                        dispatch(action_setDirectManager(directManager));
                    }
                }

                setEmployeKind(resp.data.kind);                

            } catch(err) {
                handleError(err);
            }

        }

        fetchData()
    }, [])

    useEffect( () => {

        const fetchData = async () => {

            setLoadingData(true);

            try {
                let data = [];

                let respArr = await Promise.all([
                    // API is already wrapped with credentials = true
                    dataContext.API.get('/daysoff',  {
                        params: {
                            year: year,
                            month: month
                        }
                    }),
                    dataContext.API.get(`/me/reports/manual_updates`, {
                        params: {
                            year: year,
                            month: month
                        }
                    }),
                    dataContext.API.get(`/me/reports/${year}/${month}`)
                ]);

                // 1. Process work off days
                data = respArr[0].data.items.map( item => 
                    new Date( Date.parse(item.date) )
                );
                setDaysOff( data );

                // 2. process manual updates
                data = respArr[1].data.items;
                setManualUpdates(data)

                // 3. process report data
                let report = respArr[2].data;
                defineAlert(report);
                setIsReportRejected( report.isRejected );
                const employerCode = report.employerCode || 0;
                setUserCompanyCode( employerCode );

                // 3a. Get report codes
                const resp = await dataContext.API.get(`/me/report_codes`, {
                    params: {
                        id : dataContext.user.userID,
                        employerCode: employerCode,
                        year: year,
                        month: month
                    }
                })
                setReportCodes(resp.data.items); 
                
                // Now process the report items
                data = report.items.map( (item, index ) => {
        
                    // Map short description of the report code to the 'normal' description.
                    // At this moment, reportCodes is not yet updated to state, so we use resp.data.items instead of additional useEffect()
                    const reportCode = resp.data.items.find( (el) => 
                        el.ShortDescription === item.reportType
                    );
                    const reportType = reportCode? reportCode.Description : item.reportType;

                    return {
                                ...item,
                                entry: moment(item.entry, TIME_FORMAT),
                                exit: moment(item.exit, TIME_FORMAT),
                                key: index,
                                reportType: isWorkingDay(item) ? reportType : ''
                            };
                })
                setReportData(data);

                setTotals(`${Math.floor(report.totalHours)}:${Math.round(report.totalHours % 1 * 60)}`);

                setIsReportEditable(report.isEditable);                              

            } catch( err ) {
                handleError(err);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData();
    }, [month, year])

    const handleError = (err) => {

        let _message = err.message;
        const {response} = err;
        if( response )
            _message += `. URL: ${response.config.url} => ${response.statusText}`;

        setAlert({
            message: _message,
            type: 'error'
        })
    }

    const action_setDirectManager = (manager) => ({
        type: SET_DIRECT_MANAGER,
        data: manager
    })

    const isWorkingDay = (item) => {

        const itemDate = moment(item.rdate);
        
        const index = daysOff.find( dayOff => (
             dayOff.getDate() == itemDate.date()   
             && dayOff.getMonth() == itemDate.month()
             && dayOff.getFullYear() == itemDate.year()
        ))
        if( index ) 
            return false;
        else
            return !(item.dayOfWeek === 'ש' || item.dayOfWeek === 'ו');
    }

    const defineAlert = (data) => {
        if( data ) {

            if( !data.submitted ) {
                setAlert({
                    type: 'info',
                    message: `דוח שעות לחודש ${month}/${year} טרם נשלח לאישור`
                });
            } else if( !data.approved ) {

                if ( data.rejected ) {
                    setAlert({
                        type: 'error',
                        message: t('rejected_note') + data.note
                    })
                } else {

                    let _alertMessage = `דוח שעות לחודש ${month}/${year} טרם אושר`
                    if( data.assignedToName ) {
                        _alertMessage += ` ע"י ${data.assignedToName}`;
                    }
                    setAlert({
                        type: 'info',
                        message : _alertMessage
                    });
                }
            } else {
                const whenApproved = moment(data.whenApproved).format('DD/MM/YYYY')
                setAlert({
                    type: 'info',
                    message: `דוח שעות לחודש ${month}/${year} אושר בתאריך ${whenApproved} ע"י ${data.assignedToName}`
                });
            }

        } else {
            setAlert({
                message: `דוח שעות לחודש ${month}/${year} טרם אושר`,
                type: 'warning'
            });
        }
    }

    const onMonthChange = (date, dateString) => {
    }

    const getMonthName = (monthNum) => {
        return t('m'+monthNum)
    }

    const disabledDate = (current) => {
        return current && 
                ( current > moment().endOf('day') )
                || (current < moment().add(-12, 'month'))
    }

    const getAlertDescription = () => {
        if( alert.type === 'error' )
            return <Link to={`/support/${year}/${month}`}>
                Support
                </Link>
        else    
            return null;
    }

    const getSubmitTitle = () => {
        if( assignee ) {
            return `הדוח יעבור לאישור ע"י ${assignee.userName}`;
        } else {
            return t('no_direct_manager');
        }
      
    }  

    const onSubmit = async () => {
    }

    const validateReport = () => {
    }

    const onPrintModalClosed = () => {
        setPrintModalVisible(false);
    }

    const onAssigneeChanged = (e) => {
        setAssignee(managers[e.key].userId);
        message.info(`הדוח יועבר לאישור ${managers[e.key].userName}`);
    }

    const getTotalHoursPercentage = () => {
        return Math.floor( parseFloat(totals) / 160. * 100 );
    }

    const menu = 
        <Menu onClick={onAssigneeChanged}>
            {
                managers ? 
                managers.map((manager, index) => (
                        <Menu.Item  key={index}>
                            <UserOutlined />
                            {manager.userName}
                        </Menu.Item>
                )) : 
                null
            }
        </Menu>

    const operations = <>
        <Tooltip placement='bottom' title={getSubmitTitle}>
            <Popconfirm title={t('send_to_approval')} 
                onConfirm={onSubmit}>
                <Dropdown.Button type="primary" overlay={menu}
                                    disabled={ isReportSubmitted || !reportDataValid }
                    style={{
                        marginRight: '6px'
                    }}>
                    {t('submit')}
                </Dropdown.Button>
            </Popconfirm>
        </Tooltip>
        <Tooltip placement='bottom' title={t('validate_report')}>
            <Button onClick={validateReport} 
                    icon={<CheckCircleOutlined />}
                    disabled={loadingData}>
                {t('validate')} 
            </Button>
        </Tooltip>        
        <Button onClick={ () => setPrintModalVisible(true)}
                disabled={loadingData}
                icon={<PrinterOutlined />}
                style={{
                    marginLeft: '4px'
                }}>
                {t('print')}
        </Button>
    </>

    const alertOpacity = loadingData ? 0.2 : 1.0;

    return (
        <Content>
            <Row gutter={[32, 0]}>
                <Col span={10}>
                    {operations}
                </Col>
                <Col span={3} offset={11}>
                    <MonthPicker onChange={onMonthChange}
                                disabledDate={disabledDate}
                                className='ltr'
                                value={calendarDate}
                                allowClear={false}
                                defaultValue={moment()} />
                </Col>                
            </Row>
            <Row>
                <Alert closable={false}
                        style={{
                            opacity: alertOpacity,
                            width: '100%'
                        }}
                        message={alert.message}
                        description={getAlertDescription()}
                        className='hvn-item-rtl' 
                        showIcon 
                        type={alert.type} />               
            </Row>
            <Row gutter={[32, 32]}>
                <Col span={5}>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={ `סיכום חודשי: ${getMonthName(month)} ${year} ` }
                                    style={{ width: 270}}
                                    bordered={true}
                                    className='rtl' 
                                    loading={loadingData}>
                                        <Pie percent={getTotalHoursPercentage()} 
                                            total={getTotalHoursPercentage() + '%'} 
                                            subTitle={ `${totals} שעות`}
                                            height={140}
                                            animate={false}/>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={t('abs_docs')}
                                style={{ width: 270}}
                                className='rtl' loading={loadingData}>
                                <div style={{
                                    marginBottom: '12px'
                                }}>ניתן להעלות קבצי JPG/PNG/PDF</div>                                    
                                <DocsUploader year={year} month={month} 
                                              isOperational={true}/>                            
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={19}>
                    <Tabs defaultActiveKey="1" 
                        type="line"
                        className='hvn-table-rtl'>
                        <TabPane tab={
                                    <span>
                                        <BarsOutlined />
                                        <span style={{
                                            marginRight: '6px'
                                        }}>
                                            {t('plain')}
                                        </span>
                                    </span>
                                }
                            key="1">
                            <TableReport dataSource={[]}
                                         employeKind={employeKind}
                                         reportCodes={reportCodes}
                                         manualUpdates={manualUpdates}
                                         daysOff={daysOff}
                                         editable={isReportEditable}
                                         loading={loadingData}
                                         scroll={{y: '400px'}}/>
                        </TabPane>
                        <TabPane tab={<span>
                                        <FundOutlined />
                                        <span style={{
                                            marginRight: '6px'
                                        }}>
                                            {t('yearly')}
                                        </span>
                                    </span>
                                    }
                            key='2'>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <YearReport year={year}/>
                                </Suspense>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
            {
                printModalVisible ?
                    <Suspense fallback={<div>Loading...</div>}>
                        <PrintModal visible={printModalVisible}
                            closed={onPrintModalClosed}
                            month={month}
                            year={year}
                            signature={signature}
                            totals={totals}>
                                <div>Report</div>                                   
                            </PrintModal>
                    </Suspense> 
                    : null
            }            
        </Content>
    )
}

export default React.memo(Stub);