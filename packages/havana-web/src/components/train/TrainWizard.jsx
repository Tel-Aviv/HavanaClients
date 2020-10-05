import React, { useState } from 'react';
import moment from 'moment';

import { Modal, Steps, TimePicker, Button, message,
    Row, Col, Checkbox} from 'antd';
const { Step } = Steps;

import { useTranslation } from "react-i18next";
import { useCookies } from 'react-cookie';

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

const TrainWizard = (props) => {

    const [currentStep, setCurrentStep] = useState(0)
    const [currentStepSucceeded, SetCurrentStepSucceeded] = useState(undefined);
    const [modalVisible, setModalVisible] = useState(true);
    const [showOnStart, setShowOnStart] = useState(props.showOnStart)

    const { t } = useTranslation();
    const [cookies, setCookie] = useCookies(['showTrain']);

    //#region Modal appearance
    const handleOk = () => {
        setModalVisible(false);
    }
    
    const handleShowOnStart = () => {
        setCookie('showTrain', !showOnStart, { path: '/'})
        setShowOnStart(!showOnStart);
    }
    //#endregion

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
        <Modal title={t('train')}
            className='rtl'
            visible={modalVisible}
            closable={true}
            footer={[
                <Button key='close' type='primary' onClick={handleOk}>{t('got_it')}</Button>,
                <Row key='gotit'>
                    <Col span={24}>
                        <Checkbox onChange={handleShowOnStart}
                                    checked={showOnStart}>
                                    {t('show_on_start')}
                        </Checkbox>
                    </Col>
                </Row>
            ]}>
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
                    <Button style={{ margin: '0 8 px'}} onClick={prev}>
                        Previous
                    </Button>
                )}
            </div>
        </Modal>)
}

export default TrainWizard;