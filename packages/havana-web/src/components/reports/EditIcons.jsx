// @flow
import React from 'react'
import { Popconfirm, Icon, Tooltip } from 'antd';
import { CheckCircleTwoTone,
  CloseCircleTwoTone,
  EditTwoTone } 
from '@ant-design/icons';
import { useTranslation } from "react-i18next";

import { ReportContext } from "./TableContext";

const iconStyle = {
    margin: 8,
    fontSize: '100%'
}

export default ({record, editing, disable, edit, save, cancel}) => {

    const {t} = useTranslation();

    return editing ? (
      <span>
        <Popconfirm title={t('cancel_edit')} onConfirm={() => cancel()}
                    className='rtl'>
          <CloseCircleTwoTone twoToneColor="#eb2f96" style={iconStyle} />
        </Popconfirm>
            <CheckCircleTwoTone twoToneColor="#52c41a"
              onClick={() => save(record.key)}
              style={iconStyle} />
      </span>
    ) : (
          disable ?
            (<EditTwoTone style={iconStyle} />) :
            (<Tooltip title={t('edit_record')}>
                <EditTwoTone
                      onClick={() => edit(record)} 
                      style={iconStyle} />
              </Tooltip>) 
    )
  }
