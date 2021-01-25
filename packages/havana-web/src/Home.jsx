import React, { useState, useEffect, useContext, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import uniqid from 'uniqid';

import { useTranslation } from "react-i18next";

import  { Layout, Popconfirm,
            Tooltip, Modal, Button,
            Typography, Table, Tag,
            Alert, Card,
            Row, Col,
            DatePicker }
from 'antd';
import { IssuesCloseOutlined,
    BarsOutlined,
    FundOutlined,
    PrinterOutlined,
    CheckCircleOutlined } 
from '@ant-design/icons';
const { Content } = Layout;
const { MonthPicker } = DatePicker;

import { Tabs, message  } from 'antd';
const { TabPane } = Tabs;

import { Pie } from 'ant-design-pro/lib/Charts';
import ReactToPrint from 'react-to-print';  

import { DataContext } from './DataContext';
import { UPDATE_ITEM } from "./redux/actionTypes";

import TableReport from '@reports/TableReport';
//import NestedTableReport from "@reports/NestedTableReport";
import CalendarReport from '@reports/CalendarReport';
const YearReport = React.lazy( () => import('@reports/YearReport') )
import DocsUploader from '@components/DocsUploader';
const ValidationReport = React.lazy( () => import('@reports/ValidationsReport') )
const ExtraHoursModal = React.lazy( () => import('@reports/ExtraHoursModal'))

import { TIME_FORMAT, DATE_FORMAT } from './globals'

const Home = () => {

    const [month, setMonth] = useState(moment().month()+1);
    const [year, setYear] = useState(moment().year());
    const [reportData, setReportData] = useState([])
    const [reportDataValid, setReportDataValid] = useState(false);
    const [isReportEditable, setIsReportEditable] = useState(true);
    const [isReportRejected, setIsReportRejected] = useState(false);
    const [totals, setTotals] = useState(0);
    const [userCompanyCode, setUserCompanyCode] = useState(0);

    const [loadingData, setLoadingData] = useState(false);
    const [reportDataLoaded, setReportDataLoaded] = useState(false);
    const [calendarDate, setCalendarDate] = useState(moment());
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [extraHoursModalVisible, setExtraHoursModalVisible] = useState(false);
    const [signature, setSignature] = useState('');
    // Report Status Alert
    const [alert, setAlert] = useState({
        type: 'info'
    })

    const [validateModalOpen, setValidateModalOpen] = useState(false)
    const [invalidReportItems, setInvalidReportItems] = useState();

    const [daysOff, setDaysOff] = useState([]);
    const [manualUpdates, setManualUpdates] = useState([]);
    const [assignee, setAssignee] = useState();
    const [reportCodes, setReportCodes] = useState([]);
    const [employeeKind, setEmployeeKind] = useState();
    const [spareHours, setSpareHours] = useState({});
    const [criticalSystemNotes, setCriticalSystemNotes] = useState([]);

    const dataContext = useContext(DataContext);
    const componentRef = useRef();

    const dispatch = useDispatch();
    const { t } = useTranslation();
    
    //#region Redux selectors and corresponding Effects
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
                    day: _addedData.item.day,
                    inout: true,
                    stripId: _addedData.item.stripId
                }, {
                    day: _addedData.item.day,
                    inout: false,
                    stripId: _addedData.item.stripId
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

                const signature = resp.data.signature;
                if( signature ) {
                    if( signature.startsWith('data:') ) {
                        setSignature(signature);
                    }
                    else {    
                        setSignature(`data:/image/*;base64,${signature}`);
                    }
                }


                setAssignee(resp.data.direct_manager);
                setEmployeeKind(resp.data.kind);

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
                    dataContext.API.get(`/me/reports/${year}/${month}`),
                    dataContext.API.get(`system_notes`)
                ]);

                // 1. Process work off days
                data = respArr[0].data.items.map( item => 
                    new Date( Date.parse(item.date) )
                );
                setDaysOff( data );

                // 2. process manual updates
                data = respArr[1].data.items;
                setManualUpdates(data.map( item => {
                    let {whenUpdated, ...x} = item;
                    return x;
                }));

                // 3. process report data
                let report = respArr[2].data;
                defineAlert(report);
                setSpareHours({
                    actual: report.spareHours,
                    granted: report.spaceHoursLimit
                })
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
                setReportCodes(resp.data.codes);

                // Now process the report items
                data = report.items.map( (item, index ) => {
        
                    // Map short description of the report code to the 'normal' description.
                    // At this moment, reportCodes is not yet updated to state, so we use resp.data.items instead of additional useEffect()
                    const reportCode = resp.data.codes.find( (el) => 
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

                // 4. Process system notes
                data = respArr[3].data.notes;
                setCriticalSystemNotes( data.filter( item => 
                    item.severityCode === 1
                ))

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
                // const _totals = recalculateTotals();
                // setTotals(_totals);

                await onSave();
            }

        }

        applyEffect();

    }, [reportData])

    useEffect( () => {

        const postData = async () => { 

                    try {

                        // post the manual updates to the server 
                        const requestBody = {
                            Year: year,
                            Month: month,
                            UserID: dataContext.user.account_name,
                            items: manualUpdates
                        }
                        await dataContext.API.post('/me/reports/manual_updates', 
                                                    requestBody);
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

    // const recalculateTotals = () => {

    //     const lTotal = reportData.reduce( ( accu, item ) => {
            
    //         const dayDuration = moment.duration(item.total);
    //         return accu.add(dayDuration);

    //     }, moment.duration('00:00'))
      
    //     return `${Math.floor(lTotal.asHours())}:${lTotal.minutes().toString().padStart(2, '0')}`;
        
    // }

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

            if( data.isEditable ) {
                setAlert({
                    type: 'info',
                    message: `דוח שעות לחודש ${month}/${year} טרם נשלח לאישור`
                });
            } else if( !data.isApproved ) {

                if ( data.isRejected ) {
                    setAlert({
                        type: 'error',
                        message: t('rejected_note') + data.note
                    })
                } else {

                    let _alertMessage = `דוח שעות לחודש ${month}/${year} טרם אושר`
                    setAlert({
                        type: 'warning',
                        message : _alertMessage
                    });
                }
            } else {
                const whenApproved = moment(data.whenApproved).format(DATE_FORMAT)
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
            setInvalidReportItems(res.items);
            setValidateModalOpen(true);
        }
        else {

            if( res.items ) {
                message.warning(t('valid_not_completed'))
            } else {
                setValidateModalOpen(false); 
                setInvalidReportItems(null);
    
                setReportDataValid( true );
                message.info(t('report_validated'));
            }

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

    const isReportDataValid = () => {

        const invalidItems = _.intersectionWith(reportData, criticalSystemNotes, ( (a, b) =>
            a.systemNotes === b.name
            && !a.isUpdated
        ));

        if( invalidItems.length === 0 )
            return {
                isValid: true,
                items: null
            }

        const invalidData = invalidItems.filter( item =>
             moment(item.rdate).isBefore(moment())
        )
        if( invalidData.length !== 0 )
            return {
                isValid: false,
                items: invalidData
            }
        else
            return {
                isValid: true,
                items: invalidData
            }

    }

    const onShowPDF = () => {
        setPrintModalVisible(!printModalVisible);
    }

    const onShowExtraHours = () => {
        setExtraHoursModalVisible(!extraHoursModalVisible)
    }

    const onSubmit = async () => {
        
        let _message = `דוח שעות לחודש ${month}/${year} נשלח לאישור`;
        
        try {
            
            await dataContext.API.post(`/me/reports?month=${month}&year=${year}&assignee=${assignee.userAccountName}`,
                                        reportData);
            
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

    const getSpareHoursPercentage = () => {
        if( !spareHours.granted 
            || spareHours.granted === 0 
            || !spareHours.actual 
            || spareHours.actual === 0)
            return '0';

        return Math.floor(spareHours.actual/spareHours.granted * 100)

    }

    const operations = <div>
                            <Tooltip placement='bottom' title={getSubmitTitle}>
                                <Popconfirm title={t('send_to_approval')} 
                                    onConfirm={onSubmit}>
                                    <Button type="primary"
                                            disabled={ isReportEditable || !reportDataValid }
                                            icon={<IssuesCloseOutlined />}
                                            style={{
                                                marginRight: '6px'
                                            }}>
                                        {t('submit')}
                                    </Button>
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


    const onReportDataChanged = async ( item, inouts ) => {
        item.isUpdated = true;
        dispatch(action_updateItem(item)) 

        // No manual updates were passed
        if( !inouts )
            return;

        // This nor wants to be immutable
        let _manualChanges = [...manualUpdates]; // new Set(manualUpdates)

        if( inouts[0] ) {
            _manualChanges.push({
                day: parseInt(item.day),
                stripId: item.stripId,
                inout: true
            })
        }

        if( inouts[1] ) {
            _manualChanges.push({
                day: parseInt(item.day),
                stripId: item.stripId,
                inout: false
            })
        }

        // Make this list unique.
        // This is the same idea as new Set(), but Set uses only built-in JS reference comparison
        // Thanks to compararer function (2-nd operand to _uniqWith)
        // it work for object values too.
        _manualChanges = _.uniqWith(_manualChanges, (arrVal, othVal) => {
            return arrVal.day === othVal.day
                && arrVal.stripId === othVal.stripId
                && arrVal.inout === othVal.inout
        })

        setManualUpdates([..._manualChanges]);
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

    const lazyShowValidationReport = () => (
        validateModalOpen ?
            <ValidationReport visible={validateModalOpen}
                onClosed={setValidateModalOpen}
                invalidItems={invalidReportItems}
            /> :
            null
    )

    const lazyShowExtraHours = () => (
        extraHoursModalVisible ?
            <ExtraHoursModal
                title={`${getMonthName(month)} ${year} `}
                dataSource={getExtraHoursDataSet()}
                visible={extraHoursModalVisible}
                cancel={onShowExtraHours}/> :
            null
    )

    const getExtraHoursDataSet = () => {
        const data = reportData.map( item => (
            {
                key: uniqid(),
                day: item.day,
                dayOfWeek: item.dayOfWeek,
                rdate: item.rdate,
                extra_hours75: item.extra_hours75,
                extra_hours100: item.extra_hours100,
                extra_hours125: item.extra_hours125,
                extra_hours150: item.extra_hours150,
                extra_hours200: item.extra_hours200
            }
        ))

        return data.filter( record => 
            moment(record.rdate).isBefore(moment())
            && ( (record.extra_hours75 && record.extra_hours75 !== '0:00' )
                || (record.extra_hours100 && record.extra_hours100 !== '0:00' )
                || (record.extra_hours125 && record.extra_hours125 !== '0:00' )
                || (record.extra_hours150 && record.extra_hours150 !== '0:00' )
                || (record.extra_hours200 && record.extra_hours200 !== '0:00' )
            )
        )

    }

    const alertOpacity = loadingData ? 0.2 : 1.0;   

    return (
        <Content>
            <Suspense fallback={<div>Loading Validation Report...</div>}>
            {
                lazyShowValidationReport()
            }
            </Suspense>
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
                            <Card title={ `${t('extra_hours')}: ${getMonthName(month)} ${year} ` } 
                                style={{ width: 270}}
                                bordered={false}
                                className='rtl' loading={loadingData}>
                                <Pie 
                                    percent={ getSpareHoursPercentage()} 
                                    total={ `% ${getSpareHoursPercentage()}` } 
                                    title={ `סיכום חודשי: ${getMonthName(month)} ${year} `}
                                    animate={false}
                                    subTitle={ `${spareHours.actual ?? 0} שעות`}
                                    height={140} />
                                <Card.Grid hoverable={false} style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        }}>
                                    <Button type="primary" 
                                        disabled={!spareHours.actual 
                                                    || spareHours.actual === 0}
                                        onClick={onShowExtraHours}>
                                        {t('details')}
                                    </Button>
                                </Card.Grid>                      
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
                                            {t('calendar')}
                                        </span>
                                    </span>
                                }
                                key="1">
                            <div style={{
                                border: '1px solid rgb(240, 242, 245)',
                                margin: '12px'
                            }}>
                                <CalendarReport
                                    month={month}
                                    dataSource={reportData}
                                    employeeKind={employeeKind}
                                    reportCodes={reportCodes}
                                    daysOff={daysOff}
                                    manualUpdates={manualUpdates}
                                    onChange={( item, inouts ) => onReportDataChanged(item, inouts) } 
                                />
                            </div>
                            {/* <NestedTableReport 
                                dataSource={reportData}
                                employeeKind={employeeKind}
                                reportCodes={reportCodes}
                                daysOff={daysOff}
                                manualUpdates={manualUpdates}
                                scroll={{y: '400px'}}
                                onChange={( item, inouts ) => onReportDataChanged(item, inouts) } 
                                editable={isReportEditable}
                            />         */}
                            {/* <TableReport dataSource={reportData}
                                        employeeKind={employeeKind}
                                        reportCodes={reportCodes}
                                        daysOff={daysOff}
                                        manualUpdates={manualUpdates}
                                        loading={loadingData && !reportDataLoaded}
                                        scroll={{y: '400px'}}
                                        onChange={( item, inouts ) => onReportDataChanged(item, inouts) } 
                                        editable={isReportEditable}>
                            </TableReport> */}
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
            <Suspense fallback={<div>Loading Extra Hours...</div>}>
            {
                lazyShowExtraHours()
            }
            </Suspense>
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
                                employeeKind={employeeKind}
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
                            <div className='footer-print'>{t('printed_when')} {moment().format(DATE_FORMAT)}</div>
                        </Col> 
                    </Row>
                </div>
            </Modal>
        </Content>
    )
}

export default Home;
