import React, { useState } from 'react';
import moment from 'moment';

import { Steps, TimePicker, Button, message,
    Row, Col } from 'antd';
const { Step } = Steps;

const TimesStepLayout = (callback) => {

    const etalonTimeValue = '08:15';

    const timeChanged = (time, timeString) => {
        const stepResult = (  timeString === etalonTimeValue ) ? true : false;
        callback(stepResult)
    }

    return (
    <>
        <Row>
            <Col>
                Please select 08:15
            </Col>
        </Row>
        <Row>
            <Col>
                <TimePicker format='HH:mm' 
                    defaultValue={moment('06:40', 'HH:mm')} 
                    showNow={false}
                    onChange={timeChanged}
                    allowClear={false}/>
            </Col>
        </Row>
    </>)
}

const TrainWizard = () => {

    const [currentStep, setCurrentStep] = useState(0)
    const [currentStepSucceeded, SetCurrentStepSucceeded] = useState(undefined);

    const steps = [{
        title: 'Enterance',
        description: 'Time pick skills',
        content: TimesStepLayout(SetCurrentStepSucceeded)
    }, {
        title: 'People pickup',
        description: 'People selection skills',
        content: 'Pickup'
    }];



    const next = () => {
        setCurrentStep( currentStep + 1)
    }

    const prev = () => {
        setCurrentStep( currentStep - 1)
    }

    return (
    <>
        <Steps>
        {
            steps.map( item => (
                <Step key={item.title} title={item.title}
                    description={item.description} />
            ))
        }
        </Steps>
        <div className='steps-content'>{steps[currentStep].content}</div>
        <Row>
            <Col>
                {
                    currentStepSucceeded ? 'Good Job. Keep going!.. Press Next.' :
                        'Try again'
                }
                
            </Col>
        </Row>        
        <div className='steps-action'>
            { currentStep < steps.length - 1 && (
                <Button type='primary' onClick={next}>
                    Next
                </Button>
            )}
            { currentStep === steps.length - 1 && (
            <Button type='primary' onClick={() => message.success('Complete')}>
                Done
            </Button>
            )}
            { currentStep > 0 && (
                <Button style={{ margin: '0 8 px'}}  onClick={prev}>
                    Previous
                </Button>
            )}
        </div>
    </>)
}

export default TrainWizard;