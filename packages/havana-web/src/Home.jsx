import React, { useState, useEffect, useContext, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import uniqid from 'uniqid';
import Img from 'react-image';

import { useTranslation } from "react-i18next";

import  { Layout, Popconfirm,
            Tooltip, Modal, Button,
            Typography, Table, Tag,
            Alert, Card,
            Row, Col,
            DatePicker }
from 'antd';
import { UserOutlined,
    BarsOutlined,
    FundOutlined,
    PrinterOutlined,
    CheckCircleOutlined } 
from '@ant-design/icons'
;const { Content } = Layout;
const { Title } = Typography;
const { MonthPicker } = DatePicker;

import { Tabs, Dropdown, Menu, message  } from 'antd';
const { TabPane } = Tabs;

import { Pie } from 'ant-design-pro/lib/Charts';
import ReactToPrint from 'react-to-print';  

import { DataContext } from './DataContext';
import { UPDATE_ITEM, SET_DIRECT_MANAGER } from "./redux/actionTypes";

import TableReport from '@reports/TableReport';
const YearReport = React.lazy( () => import('@reports/YearReport') )
import DocsUploader from '@components/DocsUploader';

const TIME_FORMAT = 'HH:mm';

const Home = () => {

    const [month, setMonth] = useState(moment().month()+1);
    const [year, setYear] = useState(moment().year());
    const [reportData, setReportData] = useState([])
    const [managers, setManagers] = useState([])
    const [reportDataValid, setReportDataValid] = useState(false);
    const [isReportSubmitted, setReportSubmitted] = useState(false);
    const [isReportEditable, setIsReportEditable] = useState(true);
    const [isReportRejected, setIsReportRejected] = useState(false);
    const [totals, setTotals] = useState(0);
    const [userCompanyCode, setUserCompanyCode] = useState(0);

    const [loadingData, setLoadingData] = useState(false);
    const [reportDataLoaded, setReportDataLoaded] = useState(false);
    const [calendarDate, setCalendarDate] = useState(moment());
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [signature, setSignature] = useState('');
    // Report Status Alert
    const [alert, setAlert] = useState({
        type: 'info'
    })

    const [validateModalOpen, setValidateModalOpen] = useState(false)
    const [invalidReportItems, setInvalidReportItems] = useState();

    const [daysOff, setDaysOff] = useState([]);
    const [manualUpdates, setManualUpdates] = useState([]);
    const [assignee, setAssignee] = useState({
                                            userId:'direct'
                                        });
    const [reportCodes, setReportCodes] = useState([]);
    const [employeKind, setEmployeKind] = useState()

    const dataContext = useContext(DataContext);
    const componentRef = useRef();

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const action_setDirectManager = (manager) => ({
        type: SET_DIRECT_MANAGER,
        data: manager
    })
    
    //#region Redux selectors and corresponding Effects
    const _directManager = useSelector(
        store => store.directManagerReducer.directManager
    )
    useEffect( () => {
        if( _directManager ) {
            setAssignee(_directManager);
        }
        
    }, [_directManager])

    const _calendarDate = useSelector(
        store => store.reportDateReducer.reportDate
    );
    useEffect( () => {

        if( _calendarDate ) {
            setCalendarDate(_calendarDate)
            setMonth(_calendarDate.month()+1)
            setYear(_calendarDate.year())
        }
    }, [_calendarDate]);
    
    const _updatedItem = useSelector(
        store => store.reportUpdateReducer.lastUpdatedItem
    )
    useEffect( () => {
        
        if(_updatedItem){
            const index = reportData.findIndex( item => item.key === _updatedItem.key);
            if ( index > -1 ) {
                const updatedReportData =
                 [...reportData.slice(0, index), _updatedItem, ...reportData.slice(index+1)];
                const res = isReportDataValid();
                setReportDataValid( res.isValid );
                setReportData(updatedReportData);
                
            }
        }

    }, [_updatedItem])
    const _addedData= useSelector(
        store => store.reportUpdateReducer.addedData
    )

    useEffect( () => {

        if( _addedData ) {

            const index = _addedData.index;

            const newData = [
                ...reportData.slice(0, index),
                _addedData.item,
                ...reportData.slice(index)
            ];
            setReportData(newData);

            const addedManualUpdates = [{
                    Day: _addedData.item.day,
                    Inout: true,
                    StripId: _addedData.item.stripId
                }, {
                    Day: _addedData.item.day,
                    Inout: false,
                    StripId: _addedData.item.stripId
                }
            ]
            
            setManualUpdates([...manualUpdates, ...addedManualUpdates]);
        }

    }, [_addedData])

    const _deletedData = useSelector(
        store => store.reportUpdateReducer.deletedData
    )

    useEffect( () => {

        if( _deletedData ) {
            const index = _deletedData.index;
            const newData = [...reportData.slice(0, index), ...reportData.slice(index + 1)];
            setReportData(newData);

            
        }

    }, [_deletedData]);

    //#endregion

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

            setReportDataValid( false );
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
                        el.ShortDescription === item.reportCode
                    );
                    const _reportCode = reportCode? reportCode.Description : item.reportCode;

                    return {
                                ...item,
                                entry: moment(item.entry, TIME_FORMAT),
                                exit: moment(item.exit, TIME_FORMAT),
                                key: index,
                                reportCode: isWorkingDay(item) ? _reportCode : ''
                            };
                })
                setReportData(data);
                setReportDataLoaded(true);

                setTotals(`${Math.floor(report.totalHours)}:${Math.round(report.totalHours % 1 * 60)}`);

                setIsReportEditable(report.isEditable);

            } catch(err) {
                handleError(err);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData();
    }, [month, year])

    useEffect( () => {

        const applyEffect = async () => {

            if( reportData.length > 0 ) { // skip for the first time
                const _totals = recalculateTotals();
                setTotals(_totals);

                await onSave();
            }

        }

        applyEffect();

    }, [reportData])

    useEffect( () => {

        const postData = async () => { 

                    try {

                        // post the manual updates to the server 
                        const manualUpdate = {
                            Year: year,
                            Month: month,
                            UserID: dataContext.user.account_name,
                            items: manualUpdates
                        }
                        await dataContext.API.post(`/me/reports/manual_updates`, 
                                                    manualUpdate);
                    } catch(err) {
                        handleError(err);
                    }

                }

        if( manualUpdates.length > 0)
            postData();

    }, [manualUpdates])

    const onSave = async() => {

        // convert back entry/exit times from moment to 'HH:mm'
        const _reportData = reportData.map( item => {
            return {
                ...item,
                entry: moment(item.entry).format('HH:mm'),
                exit: moment(item.exit).format('HH:mm')
            }
        })

        try {
            await dataContext.API.post(`/me/report/save`, 
                _reportData,
                {
                    params: {
                        month: month,
                        year: year,
                        employerCode: userCompanyCode
                    }
                });

            //message.success(t('saved'))
        } catch( err ) {
            handleError(err)
            //message.error(response.data)
        }
    }

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

    const recalculateTotals = () => {

        const lTotal = reportData.reduce( ( accu, item ) => {
            
            const dayDuration = moment.duration(item.total);
            return accu.add(dayDuration);

        }, moment.duration('00:00'))
      
        return `${Math.floor(lTotal.asHours())}:${lTotal.minutes().toString().padStart(2, '0')}`;
        
    }

    const action_updateItem = (item) => ({
        type: UPDATE_ITEM,
        item
    })

    const getAlertDescription = () => {
        if( alert.type === 'error' )
            return <Link to={`/support/${year}/${month}`}>
                Support
                </Link>
        else    
            return null;
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
    
    const validateReport = () => {
        const res = isReportDataValid();
        if( !res.isValid ) {
            setValidateModalOpen(true);
            const item = reportData[res.invalidItemIndex];
            const _date = moment(item.rdate).format('DD/MM/YYYY');
            console.log(_date);
            const invalidItem = //{ ...item,
                                //    rdate : moment(item.rdate).format('DD/MM/YYYY')                         
                                //}
                                {
                                    "id":87864,
                                    "rdate":"2020-07-01T00:00:00",
                                    "day":"1",
                                    "isWorkingDay":false,
                                    "dayOfWeek":"ד",
                                    "entry":"10:54",
                                    "exit":"18:22",
                                    "required": "8:18",
                                    "accepted": "8:18",
                                    "notes":"",
                                    "total":"7:28",
                                    "isAdded":false,
                                    "reportCode":""
                                };                                
            setInvalidReportItems([invalidItem]);
        }
        else {
            setValidateModalOpen(false); 
            setInvalidReportItems(null);

            setReportDataValid( true );
            message.info(t('report_validated'));
        }

    }

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

    const isTotalled = (item) => {
        const tokens = item.total.split(':');
        const hours = parseInt(tokens[0]);
        const minutes = parseInt(tokens[1]);
    
        //return item.entry !== '0:00' && item.exit !== '0:00'
        return item.total != '0:00';
    }

    const isReportDataValid = () => {

        let invalidItemIndex = -1;
        const res = reportData.some( (item, index) => {

            const workingDay = isWorkingDay(item);
            const hasTotal = isTotalled(item);

            const isItemInvalid = workingDay && !hasTotal && !item.notes || item.notes.startsWith('*');
            if( isItemInvalid ) {
                invalidItemIndex = index;
                return true;
            }

            return isItemInvalid;
        })

        return {
            isValid: !res,
            invalidItemIndex: invalidItemIndex
        } 
    }

    const onShowPDF = () => {
        setPrintModalVisible(!printModalVisible);
    }

    const onSubmit = async () => {
        
        let _message = `דוח שעות לחודש ${month}/${year} נשלח לאישור`;
        
        try {
            
            await dataContext.API.post(`/me/reports?month=${month}&year=${year}&assignee=${assignee.userAccountName}`,
                                        reportData);
            
            setReportSubmitted(true);
            setIsReportEditable(false)

            message.info(_message)
            
        } catch( err ) {
            handleError(err);
        }
    }

    const getSubmitTitle = () => {
        if( assignee ) {
            return `הדוח יעבור לאישור ע"י ${assignee.userName}`;
        } else {
            return t('no_direct_manager');
        }
      
    }  

    const handleMenuClick = (e) => {
        setAssignee(managers[e.key].userId);
        message.info(`הדוח יועבר לאישור ${managers[e.key].userName}`);
    }

    const menu = 
        <Menu onClick={handleMenuClick}>
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

    const onMonthChange = (date, dateString) => {
        if( date ) {
            const month = date.month()
            setMonth(month+1)

            const year = date.year()
            setYear(year)

            const calendarDate = moment().set({
                month: month,
                year: year
            })
            setCalendarDate(calendarDate);
        }
    }

    const disabledDate = (current) => {
        return current && 
                ( current > moment().endOf('day') )
                || (current < moment().add(-12, 'month'))
    }

    const getTotalHoursPercentage = () => {
        return Math.floor( parseFloat(totals) / 160. * 100 );
    }

    const operations = <div>
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
                            <Button onClick={onShowPDF}
                                    disabled={loadingData}
                                    icon={<PrinterOutlined />}
                                    style={{
                                        marginLeft: '4px'
                                    }}>
                                    {t('print')}
                            </Button>
                        </div>;

        let columns = [
            {
                title: 'יום',
                dataIndex: 'day',
                align: 'right',
                ellipsis: true,
                editable: false,
            }, {
                title: 'יום בשבוע',
                dataIndex: 'dayOfWeek',
                align: 'right',
                ellipsis: true,
                editable: false,
            }, {
                title: 'כניסה',
                dataIndex: 'entry',
                align: 'right',
                editable: true,
                render: (text) => {
                    let tagColor = 'green';
                    if( text === '0:00' ) {
                    tagColor = 'volcano'
                    }
                    return <Tag color={tagColor}
                            style={{
                                marginRight: '0'
                            }}>
                            {text}
                            </Tag>
                }          
            }, {
                title: 'יציאה',
                dataIndex: 'exit',
                align: 'right',
                editable: true,
                render: (text) => {
                    let tagColor = 'green';
                    if( text === '0:00' ) {
                    tagColor = 'volcano'
                    }
                    return <Tag color={tagColor}
                            style={{
                                marginRight: '0'
                            }}>
                            {text}
                            </Tag>
                }
            }, {
                title: 'סיכום',
                dataIndex: 'total',
                align: 'right',
                editable: false,
            }, {
                title: 'הערות',
                dataIndex: 'notes',
                align: 'right',
                editable: true,
                render: (text, _) => 
                    ( text !== '' ) ?
                        <Tag color="volcano"
                            style={{
                                marginRight: '0'
                            }}>
                            {text}
                        </Tag>
                        : null
            }, {
                title: '',
                width: '3%',
                dataIndex: 'operation'
            }
        ];

    const onReportDataChanged = async ( item, inouts ) => {
        item.isUpdated = true;
        dispatch(action_updateItem(item)) 

        // No manual updates were passed
        if( !inouts )
            return;

        let items = []
        if( inouts[0] ) { // entry time was changed for this item
            const foundIndex = manualUpdates.findIndex( arrayItem => {
                return arrayItem.day === item.day
                    && arrayItem.InOut === true
            });
            if( foundIndex === -1 ) {
                items = [...items, {
                    Day: parseInt(item.day),
                    InOut: true,
                    StripId: item.stripId
                }]
            }
    
        }
        if( inouts[1] ) { // exit time was changed
            const foundIndex = manualUpdates.findIndex( arrayItem => {
                return arrayItem.day === item.day
                    && arrayItem.InOut === false
            });
            if( foundIndex )
                items = [...items, {
                    Day: parseInt(item.day),
                    InOut: false,
                    StripId: item.stripId
                }]                            
        }

        const _manualUpdates = [...manualUpdates, ...items];
        setManualUpdates(_manualUpdates);
    }

    const getMonthName = (monthNum) => {
        return t('m' + monthNum)
    }

    const printReportTitle = () => (
        <div style={{
            margin: '0 auto'
        }}>
            {t('print_report')}
        </div>
    )

    const handlePrintCancel = () => {
        setPrintModalVisible(false);
    }

    const alertOpacity = loadingData ? 0.2 : 1.0;   

    return (
        <Content>
             <Modal visible={validateModalOpen}
                    closable={true}
                    forceRender={true}
                    onCancel={() => setValidateModalOpen(false)}
                    footer={
                        [<Button type='primary' 
                                key={uniqid()}
                                onClick={() => setValidateModalOpen(false)}>
                                    {t('close')}
                        </Button>]
                    }>
                 <div>
                    <Title className='rtl'
                        style={{
                            marginTop: '12px'
                        }}>
                        {t('invalid_items')}
                    </Title>
                </div>
                <Row>
                    <Col>
                        <Table style={{
                                    direction: 'rtl'
                                }}
                                dataSource={invalidReportItems}
                                columns={columns} 
                                pagination={false}
                                size="small"
                                tableLayout='auto'
                            />
                    </Col>
                </Row>
            </Modal>
            <Row className='hvn-item-ltr' align={'middle'} type='flex'>
                <Col span={10} >
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
            { 
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
            }
            </Row>
            <Row gutter={[32, 32]}>
                <Col span={5}>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={ `סיכום חודשי: ${getMonthName(month)} ${year} ` } 
                                style={{ width: 270}}
                                bordered={false}
                                className='rtl' loading={loadingData}>
                                        <Pie percent={getTotalHoursPercentage()} 
                                            total={getTotalHoursPercentage() + '%'} 
                                            title={ `סיכום חודשי: ${getMonthName(month)} ${year} `}
                                            animate={false}
                                            subTitle={ `${totals} שעות`}
                                            height={140} />                               
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={t('abs_docs')} 
                                style={{ width: 270}}
                                bordered={true}
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
                            <TableReport dataSource={reportData}
                                        employeKind={employeKind}
                                        reportCodes={reportCodes}
                                        daysOff={daysOff}
                                        manualUpdates={manualUpdates}
                                        loading={loadingData && !reportDataLoaded}
                                        scroll={{y: '400px'}}
                                        onChange={( item, inouts ) => onReportDataChanged(item, inouts) } 
                                        editable={isReportEditable}>
                            </TableReport>
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
            <Modal title={printReportTitle()}
                    width='64%'
                    visible={printModalVisible}
                    closable={true}
                    forceRender={true}
                    onCancel={handlePrintCancel}
                    footer={[
                            <ReactToPrint key={uniqid()}
                                copyStyles={true}
                                removeAfterPrint={true}
                                trigger={() => <Button type="primary">{t('print')}</Button>}
                                documentTitle={`attendance report ${month}/${year}`}
                                content={() => componentRef.current}
                            />,
                            <Button key={uniqid()} onClick={handlePrintCancel}>{t('cancel')}</Button>
                        ]}>

                <div ref={componentRef} style={{textAlign: 'center'}} className='pdf-container'>
                    <div className='pdf-title'>{dataContext.user.name} (ת.ז. {dataContext.user.userID})</div>
                    <div className='pdf-title'>{t('summary')} {month}/{year}</div>
                    <TableReport dataSource={reportData}
                                employeKind={employeKind}
                                reportCodes={reportCodes}
                                daysOff={daysOff}
                                loading={loadingData} 
                                manualUpdates={manualUpdates}
                                editable={false} />
                    <Row>
                         <Col span={9} style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            {
                                signature ? 
                                <img className='footer-signature' src={signature} /> :
                                null
                            }
                        </Col>
                        <Col span={3}>
                            <div className='footer-print'>{t('signature')}</div>        
                        </Col>
                        <Col span={6}>
                            <div className='footer-print'>סה"כ { totals } שעות</div>
                        </Col>
                        <Col span={6}>
                            <div className='footer-print'>{t('printed_when')} {moment().format('DD/MM/YYYY')}</div>
                        </Col> 
                    </Row>
                </div>
            </Modal>
        </Content>
    )
}

export default Home;
