import React from 'react';
import { Col, Row, Input, Divider } from 'antd';
const { TextArea } = Input;

import { useTranslation } from "react-i18next";

const FinalApproval = ({onNotesChanged}) => {

    const { t } = useTranslation();

    return (
        <> 
            <Divider orientation="left">{t('notes_for_report')}</Divider>
            <Col>
                <Row>
                    <TextArea allowClear={true} onChange={onNotesChanged} />
                </Row>
            </Col>
        </>
    )
}

export default FinalApproval;