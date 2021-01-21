import React from 'react'; 
import { Select, Divider, Input } from 'antd';
const { TextArea } = Input;
const { Option } = Select;
import uniqid from 'uniqid';
import { useTranslation } from "react-i18next";

const HRContact = ({contacts, contactChanged, hrNotesChanged}) => {
    
    const { t } = useTranslation();
    
    return (
        <>
            <Divider orientation="left">{t('select_hr_contact')}</Divider>
            <Select size="small" style={{ 
                width: 220,
                float: 'right'
            }}
                    onChange={contactChanged}>
            {
                contacts.map( item => (
                    <Option key={uniqid()}
                            style={{
                                float: 'right'
                            }} 
                            value={item.email}>
                        {item.name}
                    </Option>
                ))
            }
            </Select>
            <Divider>&nbsp;</Divider>
            <Divider orientation="left">{t('notes_for_hr_officer')}</Divider>
            <TextArea allowClear={true} onChange={hrNotesChanged}/>
        </>
    )
}

export default HRContact;