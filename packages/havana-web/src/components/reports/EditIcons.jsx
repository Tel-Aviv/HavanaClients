// @flow
import React from 'react'
import { Popconfirm, Icon, Tooltip } from 'antd';
import { CheckCircleTwoTone,
  CloseCircleTwoTone,
  ClockCircleTwoTone,
  EditTwoTone } 
from '@ant-design/icons';
import { useTranslation } from "react-i18next";

import { ReportContext } from "./TableContext";

const iconStyle = {
    margin: 8,
    fontSize: '100%'
}

export default ({record, editing, disable, edit, editFullDay, save, cancel}) => {

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
            (<ClockCircleTwoTone style={iconStyle} />) :
            (<>
              {
                !record.isFullDay ? 
                <Tooltip title={t('edit_record')}>
                  <ClockCircleTwoTone
                      onClick={() => edit(record)} 
                      style={iconStyle} />
                </Tooltip> : null
              }
              <Tooltip title={t('report_full_day')}>
                    <EditTwoTone  
                          onClick={() => editFullDay(record)} 
                          style={iconStyle} />
                  </Tooltip>              
            </>) 
    )
  }
