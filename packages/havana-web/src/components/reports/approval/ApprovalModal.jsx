import React , { useState, useContext } from 'react';
import { Modal, Steps, Button, Typography } from 'antd';
const { Title } = Typography;

const { Step } = Steps;
import { useTranslation } from "react-i18next";

import { DataContext } from '../../../DataContext';
import ExtraHoursDiff from './ExtraHoursDiff';
import HRContact from './HRContact';
import FinalApproval  from './FinalApproval';

const ApprovalModal = ({hrOfficers, reportId, visible, onCancel, onOk, extraHours}) => {

    const [currentStep, setCurrentStep] = React.useState(0);
    const [vacationHours, setVacationHours] = useState(0);
    const [paymentHours, setPaymentHours] = useState(extraHours.granted);
    const [hrOfficer, setHROfficer] = useState();
    const [hrNotes, setHRNotes] = useState();
    const [reportNotes, setReportNotes] = useState();

    const context = useContext(DataContext)
    const { t } = useTranslation();

    const onVacationHoursChanged = (value) => {
        setVacationHours(value)
    }

    const onPaymentHoursChanged = (value) => {
        setPaymentHours(value);
    }

    const onHROfficerChanged = (value) => {
        setHROfficer(value)
    }

    const onHRNotesChanged = (event) => {
        setHRNotes(event.target.value)
    }

    const onReportNotesChanged = (event) => {
        setReportNotes(event.target.value);
    }

    const onApprove = async () => {

        const approvalParams = {
            reportNotes: reportNotes,
            hrNotes: hrNotes,
            hrOfficer: hrOfficer,
            vacationHours: vacationHours,
            paymentHours: paymentHours
        }

        try {

            await context.API.put(`/me/reports/approved/${reportId}`, approvalParams, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true              
            })

            // pass the rest of work to parent
            onOk();
        } catch(err) {
            console.error(err.message)
        }
    }

    const steps = [{
        title: t('extra_hours'),
        content: <ExtraHoursDiff extraHours={extraHours} 
                        vacationHoursChanged={onVacationHoursChanged} 
                        paymentHoursChanged={onPaymentHoursChanged}/>
    }, {
        title: '',
        content: <HRContact contacts={hrOfficers}
                            contactChanged={onHROfficerChanged}
                            hrNotesChanged={onHRNotesChanged}/>
    }, {
        title: t('approve'),
        content: <FinalApproval onNotesChanged={onReportNotesChanged}/>
    }]

    const next = () => {
        setCurrentStep(currentStep + 1);
      };
    
    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    return <Modal visible={visible}
                    className='rtl'
                    closable={true}
                    footer={null}
                    onCancel={onCancel}
                    onOk={onOk}>
        <Title level={3} className='rtl'>
            {t('approve')}
        </Title>
        <Steps current={currentStep}
            style={{
                direction: 'rtl'
            }}>
            {
                steps.map( (step, index) => 
                    <Step key={index} title={step.title} />
                )
            }
        </Steps>
        <div className="steps-content">
        {
            steps[currentStep].content
        }
        </div>
        <div className="steps-action">
            {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={() => next()}>
                    {t('next')}
                </Button>
            )}
            {currentStep === steps.length - 1 && (
                <Button type="primary" onClick={onApprove}>
                    {t('approve')}
                </Button>
            )}            
            {currentStep > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                    {t('previous')}
                </Button>
            )}
        </div>
    </Modal>
    
}

export default ApprovalModal;