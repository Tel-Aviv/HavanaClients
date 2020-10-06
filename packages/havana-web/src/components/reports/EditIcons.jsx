// @flow
import React from 'react'
import { CloseCircleTwoTone, 
        CheckCircleTwoTone,
        EditTwoTone
} from '@ant-design/icons';
import { Popconfirm, Tooltip } from 'antd';
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
        <Popconfirm title="האם ברצונך לבטל את השינויים ?" onConfirm={() => cancel()}
                    className='rtl'>
          <CloseCircleTwoTone twoToneColor="#eb2f96" style={iconStyle} />
        </Popconfirm>
        <ReportContext.Consumer>
          { ({form}) => (
            <CheckCircleTwoTone twoToneColor="#52c41a"
              onClick={() => save(record.key)}
              style={iconStyle} />
          )}
        </ReportContext.Consumer>
      </span>
    ) : (
          disable ?
            (<EditTwoTone style={iconStyle} />) :
            (<Tooltip title={t('edit_record')}>
                <EditTwoTone onClick={() => edit(record)}
                      style={iconStyle} />
              </Tooltip>) 
    )
  }
