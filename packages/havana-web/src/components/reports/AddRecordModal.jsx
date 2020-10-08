import React, {useContext} from 'react';
import moment from 'moment';
import { Modal, Form, Icon, Button, TimePicker,
    Typography , Input, Select, Row, Col } from 'antd';
const { Option } = Select;
const { Title } = Typography;    
import { useTranslation } from "react-i18next";   
import uniqid from 'uniqid';

const format = 'HH:mm';

import { ReportContext } from "./TableContext";

const AddRecordModal = (props) => {

    const reportContext = useContext(ReportContext);
    const { t } = useTranslation();

    const visible = props.visible;
    const onCancel = props.onCancel;
    const _addRecord = props.onAddRecord;

    const _onSubmit = e => {

        e.preventDefault();

        const fieldsValue = props.form.getFieldsValue();
        console.log(fieldsValue);
        if( moment(fieldsValue.entryTime).format("HH:mm") >= moment(fieldsValue.exitTime).format("HH:mm") ) {
            props.form.setFields({
                entryTime: {
                value: fieldsValue.entryTime,
                errors: [new Error(t('exit_before_entry'))],
              },
            });
            return;
        }

        props.form.validateFields( (err, values) => {

            if (err) {
                return;
            }

            console.log(values);    
            
            const _values = {
                inTime: values["entryTime"],
                outTime: values["exitTime"],
                note: values["notes"]
            }   
            
            if( _addRecord )
                _addRecord(_values);
        })
    }    

    return (
        <Modal visible={visible}
              closable={false}
              className='rtl'
              footer={[
                <Button key='cancel' onClick={onCancel}>
                    {t('cancel')}
                </Button>,
                <Button key='submit' onClick={_onSubmit} 
                        type="primary" htmlType="submit">
                    {t('add_record')}
                </Button>
              ]}>
            <Title level={3} className='rtl'
                style={{
                    marginTop: '12px'
                }}>
                {t('add_record')}{ t('to_day')} 
                { 
                    props.record ?  
                    props.record.rdate : null
                }
            </Title> 

            <Form layout="vertical"
                    size='small'
                    onSubmit={_onSubmit}>
                <Form.Item name={t('in')}
                        rules={ [{ 
                                type: 'object', 
                                required: true, 
                                message: t('add_entry_error') 
                                }]
                            }
                    >
                    <TimePicker
                            className='ltr'
                            format={format}
                            allowClear={false}
                            showNow={false} />
                </Form.Item>
                <Form.Item name={t('out')}
                        rules={ [{ 
                                type: 'object', 
                                required: true, 
                                message: t('add_exit_error') 
                                }]
                            }                
                >
                    <TimePicker
                            className='ltr'
                            format={format}
                            allowClear={false}
                            showNow={false} />
                </Form.Item>
                <Form.Item>
                    <Select
                        size="small" style={{margin: '2px'}} 
                        style={{width: '120px'}}>
                        {
                            reportContext.codes.map( item => 
                                <Option key={uniqid()} 
                                    value={item.Description}>
                                        {item.Description}
                                </Option>)
                            }
                    </Select>
                </Form.Item>
                <Form.Item name={t('notes')}
                        rules={ [{ 
                            required: true, 
                            message: t('add_notes_error') }]
                    }
                >    
                        <Input />                
                </Form.Item>                
            </Form>
        </Modal>        
    )
}

export default AddRecordModal;