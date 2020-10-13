import React, {useContext} from 'react';
import { Modal, Form, Button, TimePicker,
    Typography , Input, Select, Tooltip } from 'antd';
const { Option } = Select;
const { Title } = Typography;
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";   
import uniqid from 'uniqid';

const format = 'HH:mm';
const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };
const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
};

import { ReportContext } from "./TableContext";

const AddRecordModal = (props) => {

    const reportContext = useContext(ReportContext);
    const { t } = useTranslation();

    const visible = props.visible;

    const [form] = Form.useForm();

    const onOk = async () => {
        try {
            const values = await form.validateFields();
            form.resetFields();
            props.onAddRecord && props.onAddRecord(values);
        } catch( err ) {
            console.error(err);
        } 
    }

    return (
        <Modal visible={visible}
              closable={true}   
              onCancel={props.onCancel}
              className='rtl'
              onOk={onOk}>
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

            <Form {...layout} form={form}
                    size='small'>
                <Form.Item name='inTime'
                        label={t('in')}
                        rules={ [{ 
                                type: 'object', 
                                required: true, 
                                message: t('add_entry_error') 
                                }]
                            }>
                    <TimePicker
                            className='ltr'
                            format={format}
                            allowClear={false}
                            showNow={false} />
                </Form.Item>
                <Form.Item name='outTime'
                        label={t('out')}
                        rules={ [{ 
                                type: 'object', 
                                required: true, 
                                message: t('add_exit_error') 
                                }]
                            }>
                    <TimePicker
                            className='ltr'
                            format={format}
                            allowClear={false}
                            showNow={false} />
                </Form.Item>
                <Form.Item label={t('report_code')}
                            name="reportCode"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
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
                <Form.Item name='notes' required
                        label={<span>{t('notes')}
                                    <Tooltip title={t('why_add_record')}>
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                               </span>}
                        rules={ [{ 
                            required: true, 
                            message: t('add_notes_error') }]
                    }>    
                     <Input />                
                </Form.Item>
            </Form>
        </Modal>        
    )
}

export default AddRecordModal;