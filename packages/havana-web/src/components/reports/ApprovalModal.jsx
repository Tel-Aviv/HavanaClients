import React from 'react';
import { Modal, Steps, Button, Typography } from 'antd';
const { Title } = Typography;

const { Step } = Steps;
import { useTranslation } from "react-i18next";

import ExtraHoursDiff from './approval/ExtraHoursDiff';
import FinalApproval  from './approval/FinalApproval';

const ApprovalModal = ({visible, onCancel, onOk, extraHours}) => {

    const [currentStep, setCurrentStep] = React.useState(0);

    const { t } = useTranslation();

    const steps = [{
        title: t('extra_hours'),
        content: <ExtraHoursDiff extraHours={extraHours} />
    }, {
        title: t('approve'),
        content: <FinalApproval />
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
                <Button type="primary">
                    Done
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