import React, { useEffect, useContext } from 'react';
import { Modal, Form, 
    Input, Select,
    Typography,
    Space, 
    Tooltip} from 'antd';

const { Text, Title } = Typography;
import {
    QuestionCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from "react-i18next"; 
import uniqid from 'uniqid';

import { ReportContext } from "./TableContext";

const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

const FullDayReport = ({visible, onOk, onCancel, record}) => {

    const reportContext = useContext(ReportContext);
    const { t } = useTranslation();
    const [form] = Form.useForm();

    useEffect( () => {
        if( record ) 
            form.setFieldsValue({
                userNotes: record.userNotes,
                reportCode: record.reportCode
            })
    }
    ,[record])

    const onOkHandle = async() => {
        try {
            const values = await form.validateFields();
            //form.resetFields();
            onOk && onOk(values, record.key);
        } catch( err ) {
            console.error(err);
        }
    }

    const onCancelHandle = async() => {
        form.resetFields();
        onCancel && onCancel();
    }

    const allowedReportCodes = reportContext.codes.filter( (reportCode) => {
        return reportCode.goodFor === 2
    })

    return <Modal visible={visible}
                    closable={true}
                    className='rtl'
                    onOk={onOkHandle}
                    onCancel={onCancelHandle}>
            <Title level={3} className='rtl'
                style={{
                    marginTop: '12px'
                }}>
                {t('report_full_day')} { record? record.rdate: ''}
            </Title>
            <Form {...layout} form={form}
                    size='small'>
                <Form.Item name='userNotes'
                        label={
                            <Space size={'small'}>
                                <Text>{t('job_description')}</Text>
                                <Tooltip title={t('job_description_tooltip')}>
                                    <QuestionCircleOutlined /> 
                                </Tooltip>
                            </Space>
                        }
                        rules={
                            [ {required: true,
                                message: t('job_description_error'),
                                whitespace: true }]
                        }>
                    <Input />
                </Form.Item>
                <Form.Item label={t('report_code')}
                    name="reportCode"
                    rules={[
                        {
                            required: true,
                        }
                    ]}>
                    <Select size="small">
                        {
                                allowedReportCodes.map( item => 
                                    <Select.Option key={uniqid()} 
                                        value={item.Description}>
                                            {item.Description}
                                    </Select.Option>)
                        }
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
}

export default FullDayReport;