import React, { useState, useEffect, useContext, useRef, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import uniqid from 'uniqid';

import { useTranslation } from "react-i18next";

import { Button, Typography, 
        Row, Col, Card, Tooltip, 
        Alert, Space,
        Input, Modal 
} from 'antd';

const { Title } = Typography;    

import { Layout } from 'antd';
const { Content } = Layout;
import { 
    PrinterOutlined
} 
from '@ant-design/icons'
import { Pie } from 'ant-design-pro/lib/Charts';        
import ReactToPrint from 'react-to-print';

import { DataContext } from './DataContext';
import TableReport from '@reports/TableReport';
import DocsUploader from '@components/DocsUploader';
const ExtraHoursModal = React.lazy( () => import('@reports/ExtraHoursModal') )
const ApprovalModal = React.lazy( ()=> import('@reports/approval/ApprovalModal') )

import { DECREASE_NOTIFICATIONS_COUNT,
         INCREASE_NOTIFICATION_COUNT } from "./redux/actionTypes";

import { TIME_FORMAT, DATE_FORMAT } from './globals'         

const ref = React.createRef();

const Confirm = (props) => {
    
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);
    const [savedReportId, setSavedReportId] = useState(0);
    const [reportOwnerName, setReportOwnerName] = useState('');
    const [totals, setTotals] = useState(0);
    const [tableData, setTableData] = useState([])
    const [title, setTitle] = useState('');
    const [isReportApproved, setIsReportApproved] = useState(false);
    const [isReportRejected, setReportRejected] = useState(false);
    const [isReportResubmitted, setReportResubmitted] = useState(false);
    const [reportNote, setReportNote] = useState('')
    const [whenApproved, setWhenApproved] = useState();
    const [loadingData, setLoadingData] = useState(false);
    const [notesModalVisible, setNotesModalVisible] = useState(false);
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [note, setNote] = useState('');
    const [approvalSending, setApprovalSending] = useState(false);
    const [manualUpdates, setManualUpdates] = useState();
    const [extraHoursModalVisible, setExtraHoursModalVisible] = useState(false);
    const [spareHours, setSpareHours] = useState({});
    const [approvalModalVisible, setApprovalModalVisible] = useState(false);
    const [hrOfficers, serHROfficers] = useState();

    const history = useHistory();
    const componentRef = useRef();
    const context = useContext(DataContext)
    const { t } = useTranslation();
    const routeParams = useParams();
    const dispatch = useDispatch();

    useEffect( () => {

        async function fetchData() {

            setSavedReportId(routeParams.saveReportId);
            setLoadingData(true)
            try {

                let resp = await context.API.get(`/me/employees/reports/${routeParams.saveReportId}`, {
                    withCredentials: true
                }); 

                let data = resp.data.items.map( (item, index ) => {
                    const _item = {...item, 
                        entry: moment(item.entry, TIME_FORMAT),
                        exit: moment(item.exit, TIME_FORMAT),
                        key: index};
                    return _item;
                })
                setTableData(data);            
                setTotals(`${Math.floor(resp.data.totalHours)}:${Math.round(resp.data.totalHours % 1 * 60).toString().padStart(2, '0')}`);   
                setIsReportApproved(resp.data.isApproved);
                setMonth(resp.data.month);
                setYear(resp.data.year);
                setReportOwnerName(resp.data.ownerName);
                setWhenApproved(moment(resp.data.whenApproved));
                setReportRejected(resp.data.isRejected);
                setReportResubmitted(resp.data.reSubmitted);
                setReportNote(resp.data.note);
                setSpareHours({
                    actual: resp.data.spareHours,
                    granted: resp.data.spaceHoursLimit
                })
                setTitle(`אישור דוח נוכחות של ${resp.data.ownerName} ל ${resp.data.month}/${resp.data.year}`);

                resp = await context.API.get(`/me/employees/manual_updates/${routeParams.userid}?year=${resp.data.year}&month=${resp.data.month}`, {
                    withCredentials: true
                })
                setManualUpdates(resp.data.items)

                resp = await context.API.get('/me/hr_officers', {
                    withCredentials: true
                });
                data = resp.data.map( item => (
                    {
                        email: item.email,
                        name: item.userName,
                        accountName: item.userAccountName
                    }
                ))
                serHROfficers(data);

            } catch(err) {
                console.error(err);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData();
    }, []);

    const action_decreaseNotificationCount = () => ({
        type: DECREASE_NOTIFICATIONS_COUNT
    })

    const action_increaseNotificationCount = () => ({
        type: INCREASE_NOTIFICATION_COUNT
    })

    const onContinue = () => {
        setNotesModalVisible(true);
    }    

    const onForward = async() => {
        try {
        
            const _note = note || '';
            await context.API.get(`/me/forwardSavedReport?savedReportGuid=${savedReportId}&note=${_note}`, {
                withCredentials: true
            })

            dispatch(action_decreaseNotificationCount());

        } catch(err) {
            console.error(err)
        } finally {

            const timer = setTimeout(() => {
                setApprovalSending(false);
                setNotesModalVisible(false);

                clearTimeout(timer);
                
                history.push(`/confirmlist`);
            }, 2500);            
        }

    }

    const onApprove = async() => {

        try {

            setApprovalSending(true);
            const timer = setTimeout(() => {
                setApprovalSending(false);
                setNotesModalVisible(false);

                clearTimeout(timer);
                
                history.push(`/confirmlist`);
            }, 4000);

            dispatch( action_decreaseNotificationCount() );

            await context.API.post(`/me/pendings/saved/${savedReportId}`, {
                    html: ref.current.outerHTML
                }, 
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                })
            
        } catch( err ) {
            console.error(err.message)
        }
    }

    const onReject = async() => {
        try {

            setApprovalSending(true);
            const timer = setTimeout(() => {
                setApprovalSending(false);
                setNotesModalVisible(false);

                clearTimeout(timer);
                
                history.push(`/confirmlist`);
            }, 4000);

            await context.API.patch(`/me/pendings/rejected/${savedReportId}?note=${note}`, 
                {}, 
                { withCredentials: true })
            
        } catch( err ) {
            console.error(err.message)
        }
    }
    
    const onNotesModalClosed = () => {
        setNotesModalVisible(false)
    }

    const onNotesChanged = evt => {
        setNote(evt.target.value)
    }

    const getSpareHoursPercentage = () => {
        if( !spareHours.granted 
            || spareHours.granted === 0 
            || !spareHours.actual 
            || spareHours.actual === 0)
            return '0';

        return Math.floor(spareHours.actual/spareHours.granted * 100)

    }
    const onPrint = () => {
        setPrintModalVisible(!printModalVisible);
    }

    const handlePrintCancel = () => {
        setPrintModalVisible(false);
    }

    const formatAlertMessage = () => {
        if( isReportResubmitted )
            return `${t('resubmitted_header')} : ${reportNote}`;
        else if( isReportRejected )
            return `${t('rejected_note')} : ${reportNote}`;
        else    
            return t('approval_status');
    }

    const getMonthName = (monthNum) => {
        return t('m'+monthNum)
    }

    const alertOpacity = loadingData ? 0.2 : 1.0; 

    const getExtraHoursDataSet = () => {
        const data = tableData.map( item => (
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

    const onShowExtraHours = () => {
        setExtraHoursModalVisible(!extraHoursModalVisible)
    }

    const lazyShowExtraHours = () => (
        extraHoursModalVisible ?
            <ExtraHoursModal
                title={`${getMonthName(month)} ${year} `}
                dataSource={getExtraHoursDataSet()}
                visible={extraHoursModalVisible}
                cancel={onShowExtraHours}/> :
            null
    )

    const onShowAppovalModal = () => {
        setApprovalModalVisible(!approvalModalVisible)
    }

    const lazyShowApprovalModal = () => (
        approvalModalVisible ?
            <ApprovalModal visible={true}
                hrOfficers={hrOfficers}
                reportId={savedReportId}
                onOk={onApprove}
                onCancel={onApproveCanceled}
                extraHours={spareHours}
            /> :
            null
    )

    const onApproved = (param1) => {
        setApprovalModalVisible(false)
    }

    const onApproveCanceled = () => {
        setApprovalModalVisible(false)
    }

    return (
        <Content>
            <Title level={1} className='hvn-title'>{title}</Title>
            <Row  className='hvn-item-ltr' align={'middle'} type='flex'>
                <Col span={5}>
                    <Space>
                        <Button type='primary' loading={approvalSending} disabled={loadingData}
                                onClick={ () => onShowAppovalModal() }>
                                    {'...' + t('approve')}
                        </Button>
                        <Tooltip key='reject' title={t('reject_tooltip')}>
                            <Button type='danger' loading={loadingData} disabled={loadingData}>
                                {t('reject')}
                            </Button>
                        </Tooltip>
                        <Tooltip key='forward' title={t('forward_tooltip')}>
                            <Button loading={loadingData} disabled={loadingData}>
                                {t('move_to')}
                            </Button>
                        </Tooltip>                        
                        <Button  loading={loadingData} disabled={loadingData}
                            icon={<PrinterOutlined />}
                            onClick={onPrint}>
                                {t('print')}
                        </Button>
                    </Space>
                    </Col>
                <Col span={19} style={{
                    direction: 'rtl'
                }}>
                    <Alert closable={false} 
                        style={{
                            opacity: alertOpacity,
                            width: '98%'
                        }}
                        message={formatAlertMessage()}
                        showIcon
                        type={ isReportRejected ? 'error' : 'info'}/>
                </Col>
            </Row>
            <Row gutter={[32, 0]}>
                <Col span={5} style={{
                    paddingTop: '16px'
                }}>
                    <Row gutter={[32, 32]}>
                        <Col style={{
                            paddingRight: '0px'
                        }}>
                            <Card title={ `${t('extra_hours')}: ${getMonthName(month)} ${year} ` } 
                                bordered={false}
                                style={{ width: 270}}
                                className='rtl' 
                                loading={loadingData}>
                                <Pie percent={ getSpareHoursPercentage() } 
                                    total={`% ${getSpareHoursPercentage()}` } 
                                    title={ `סיכום חודשי: ${getMonthName(month)} ${year} `}
                                    animate={false}
                                    height={140} />
                                <Card.Grid  hoverable={false} style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        }}>
                                    <Button type="primary" onClick={onShowExtraHours}>
                                        {t('details')}
                                    </Button>
                                </Card.Grid>
                            </Card>                
                        </Col>
                    </Row>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={t('abs_docs')} 
                                bordered={true}
                                style={{ width: 270}}
                                className='rtl'
                                loading={loadingData}>
                                <DocsUploader year={year} month={month} 
                                            employeeId={routeParams.userid}
                                            isOperational={false}/>
                            </Card>
                        </Col>                    
                    </Row>
                </Col>
                <Col span={19} style={{
                    paddingLeft: '16px',
                    paddingTop: '16px'
                }}>
                    <div ref={ref}>
                        <TableReport dataSource={tableData} 
                                    loading={loadingData} 
                                    manualUpdates={manualUpdates}
                                    scroll={{y: '400px'}}
                                    editable={false} />

                    </div>
                </Col>
            </Row>
            <Suspense fallback={<div>Loading Extra Hours...</div>}>
            {
                lazyShowExtraHours()
            }
            </Suspense>
            <Modal width='54%'
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
                <div className='pdf-title'>{reportOwnerName}</div>
                    <div className='pdf-title'>{t('summary')} {month}/{year}</div>
                    <TableReport dataSource={tableData} 
                                        loading={loadingData} 
                                        manualUpdates={manualUpdates}
                                        editable={false} />
                    <Row>
                        <Col span={6}>
                            <div className='footer-print'>סה"כ { totals } שעות</div>
                        </Col>
                        <Col span={6}>
                            { 
                                whenApproved && whenApproved.isValid() ?
                                    <div className='footer-print'>{t('approved_when')} {whenApproved.format(DATE_FORMAT)}</div> :
                                    null
                            }
                        </Col>                        
                    </Row>
                </div>                                        
            </Modal>
            <Suspense>
                {
                    lazyShowApprovalModal()
                }
            </Suspense>
            <Modal closable={false} 
                    className='rtl'
                    visible={notesModalVisible}
                    title={t('notes_for_report')}
                    footer={
                        [
                            <Button key='cancel' onClick={onNotesModalClosed} style={{
                                marginRight: '8px'
                            }}>{t('cancel')}</Button>,
                            <Tooltip key='reject' title={t('reject_tooltip')}>
                                <Button onClick={onReject} type='danger' style={{
                                    marginLeft: '8px'
                                }}>
                                    {t('reject')}
                                </Button>
                            </Tooltip>,
                            <Tooltip key='forward' title={t('forward_tooltip')}>
                                <Button type="primary"
                                        style={{
                                            direction: 'ltr',
                                            marginRight: '8px'
                                        }} onClick={onForward}>
                                    {t('move_to')}
                                </Button>
                            </Tooltip>,
                            <Tooltip key='approve' title={t('approve_tooltip')}>
                                <Button type="primary" 
                                    style={{
                                        direction: 'ltr'
                                    }}
                                     onClick={onApprove} >
                                         {t('approve')}
                                </Button> 
                            </Tooltip>                                    
                        ]
                    }
                   >
                <div>   
                    <Input placeholder='הזן הערות במידת הצורך'
                        className='rtl' 
                        onChange={onNotesChanged} />
                    <div style={{
                        marginTop: '8px'
                    }}>הערות תשלחנה בדוא"ל לבעל הדוח</div>
                </div>       
            </Modal>
        </Content>
    )
}

export default Confirm;