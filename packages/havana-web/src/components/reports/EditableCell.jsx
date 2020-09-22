// @flow
import React, { useState, useContext } from 'react'
import { Input, Select, Form } from 'antd';
const { Option } = Select;       
const moment = require('moment');
import uniqid from 'uniqid';

import { ReportContext } from "./TableContext";
import CustomTimePicker from '../CustomTimePicker'
const format = 'H:mm';

const EditableCell = (props) => {

    const reportContext = useContext(ReportContext);
    
    const onReportCodeChanged = (value) => {
        console.log(value)
    }

    const getInput = (type) => {
        const controls = {
            time: () => {
                return  <CustomTimePicker />;
            },
            select: () => {
                return <Select
                            size="small" style={{margin: '2px'}} 
                            style={{width: '120px'}}
                            onChange={onReportCodeChanged}> 
                            {
                                reportContext.codes.map( item => 
                                    <Option key={uniqid()} 
                                        value={item.Description}>
                                            {item.Description}
                                    </Option>)
                            }
                        </Select>;
            },
            default: () => {
                return <Input size="small"/>;
            }
        }

        return (controls[type] || controls['default'])();
    }

    return <ReportContext.Consumer>
        {( {form, codes} ) => {
            const {
                rowEditing,
                dataIndex,
                title,
                inputType,
                record,
                index,
                children,
                ...restProps
            } = props;

            return (
                <td {...restProps}>
                    {rowEditing /*&& cellEditable*/ ?  (
                        <Form.Item style={{ margin: 0 }}>
                            {form.getFieldDecorator(dataIndex, {
                                rules: [
                                    {
                                        required: true,
                                        message: `אנא הזן ${title}!`,
                                    },
                                ],
                                initialValue: (record[dataIndex] && props.inputType === 'time') ?
                                            moment.utc(record[dataIndex], format) : (record[dataIndex])
                            })
                                (getInput(inputType))
                            }
                        </Form.Item>
                    ) : (
                            children
                        )}
                </td>
            );
        }}
    </ReportContext.Consumer>;
}

export default EditableCell