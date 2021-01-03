import React, { useState, useContext, useEffect, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from "react-i18next";

import { Upload, Button, message, 
    Typography, Space,
    Row, Col
} from 'antd';
const { Title, Text, Link } = Typography;

import {
    UploadOutlined,
    SettingTwoTone,
    EditTwoTone,
    DeleteTwoTone } 
from '@ant-design/icons';

import { Menu, Dropdown, Select, Card } from 'antd';
const { Option } = Select;
const { Meta } = Card;

import { TextualEmployeKind } from './utils';

import { DataContext } from './DataContext';
import { UPDATE_ITEM } from "./redux/actionTypes"

// Only let to webpack to know which file to consider,
// but you neither can access its rules or its styles.
// So we refer to CSS-class names like compiled CSS-rule
//import style from './less/components/settings.less';

const Settings = () => {

    const [me, setMe] = useReducer( 
            (state, newState) => ({...state, ...newState}), // trivial reducer
            {
                userName: '',
                userID: '',
                signature: '',
                stamp: '',
                assignee: '',
                employeKind: ''
            }

        )

    const [loading, setLoading] = useState();
    
    const context = useContext(DataContext);
    const dispatch = useDispatch();

    const { t } = useTranslation();

    useEffect( () => {

        async function fetchData() {

            try {
                // API is already wrapped with credentials = true
                const resp = await context.API.get('/me');

                const signature = resp.data.signature;
                const stamp = resp.data.stamp;

                setMe({
                    userName: resp.data.userName,
                    userID: resp.data.ID,
                    signature: signature ?  signature.startsWith('data:') ? signature : `data:/image/*;base64,${signature}` 
                            : null,
                    stamp: stamp ? stamp.startsWith('data:') ? stamp : `data:/image/*;base64,${stamp}`
                            : null,
                    assignee: resp.data.direct_manager,
                    employeKind: resp.data.kind
                })

            } catch( err ) {
                console.log(err)
            }
        }

        fetchData()
        
    }, [])

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
             message.error('The image must be smaller than 2MB!');
        }

        return isJpgOrPng && isLt2M;
    }

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    const uploadStampChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, imageUrl => {
                setLoading(false);
                setStamp(imageUrl);
            })
        }

    }

    const uploadChange  = (info) => {

        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, imageUrl => {
                setLoading(false);
                setSignature(imageUrl);
            })
        }

    }

    const dummyClick = (event) => {
        event.stopPropagation()
    }

    const removeStamp = async (event) => {
        event.stopPropagation()

        await context.API.delete(`${context.protocol}://${context.host}/me/stamp`)
        setStamp(null)        
    }    

    const removeSignature = async (event) => {
        event.stopPropagation()

        await context.API.delete(`${context.protocol}://${context.host}/me/signature`)
        setSignature(null)        
    }    

    const uploadProps = {
        action: `${context.protocol}://${context.host}/me/upload_signature`,
        withCredentials: true,
        multiple: false,
        listType: 'picture-card',
        className: 'avatar-uploader',
        showUploadList: false,
        beforeUpload: beforeUpload,
        onChange: uploadChange,
        onRemove: removeSignature
    }

    const uploadStampProps = {
        action: `${context.protocol}://${context.host}/me/upload_stamp`,
        withCredentials: true,
        multiple: false,
        listType: 'picture-card',
        className: 'avatar-uploader',
        showUploadList: false,
        beforeUpload: beforeUpload,
        onChange: uploadStampChange,
        onRemove: removeStamp
    }

    const uploadButton = (
        <Button>
            <UploadOutlined /> {t('upload')}
        </Button>
    )

    return (
        <div className='rtl' >
            <Row style={{
                    margin: '0% 4%' 
                }}
                >
                <Col>
                    <Title level={2}>{t('setting_title')}</Title>
                </Col>
            </Row>
            <Row gutter={[32, 32]} style={{
                    margin: '0% 2%' 
                }}>
                <Col span={8}>
                <Card title={context.user.name} loading={loading} >
                        <Meta
                            title={'תעודת זהות: ' + me.userID}
                            description={TextualEmployeKind[me.employeKind]}
                        />
                    </Card>
                    <Card title={t('reports_to')}>
                         <Row>
                            <Col span={24}>
                                <Space size='middle'>
                                    <Text>{me.assignee.userName}</Text>
                                    (<Text>{me.assignee.userAccountName}</Text>)
                                </Space>
                            </Col>
                        </Row> 
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={t('signature')}
                        actions={[
                            <SettingTwoTone key="setting" />,
                            <EditTwoTone key="edit" />,
                            <DeleteTwoTone key="delete" onClick={ e => removeSignature(e) }/>,
                        ]}>
                        <Upload {...uploadProps}>
                            { me.signature?  <img src={me.signature} className="avatarUploader" onClick={e => dummyClick(e) }/> 
                                        : uploadButton }
                        </Upload>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={t('stamp')}
                    actions={[
                        <SettingTwoTone key="setting" />,
                        <EditTwoTone key="edit" />,
                        <DeleteTwoTone key="delete" onClick={ e => removeStamp(e) }/>,
                    ]}>
                        <Upload {...uploadStampProps}>
                            { me.stamp? <img src={me.stamp}  className='avatarUploader' onClick={e => dummyClick(e) }/>
                                    : uploadButton }
                        </Upload> 
                    </Card>
                </Col>
            </Row>
        </div>
    )

}

export default Settings;