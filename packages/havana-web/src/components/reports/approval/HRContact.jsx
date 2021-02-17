import React, {useState} from 'react'; 
import { Select, Divider, Checkbox, Input } from 'antd';
const { TextArea } = Input;
const { Option } = Select;
import uniqid from 'uniqid';
import { useTranslation } from "react-i18next";

const HRContact = ({contacts, contactChanged, hrNotesChanged}) => {
    
    const [rememberHROfficer, setRememberHROfficer] = useState(true);

    const { t } = useTranslation();
    
    const onRemeberOfficerChanged = (event) =>
        setRememberHROfficer(event.target.checked)

    return (
        <>
            <Divider orientation="left">{t('select_hr_contact')}</Divider>
            <Select size="small" 
                    style={{ 
                        width: 220,
                        float: 'right'
                    }}
                    defaultValue={contacts[0].name}
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
            <Checkbox style={{
                marginRigth: '-80px'
            }} 
                checked={rememberHROfficer}
                onChange={onRemeberOfficerChanged}>
                {t('remember_hr_officer')}
            </Checkbox>
            <Divider orientation="left">{t('notes_for_hr_officer')}</Divider>
            <TextArea allowClear={true} onChange={hrNotesChanged}/>
        </>
    )
}

export default HRContact;