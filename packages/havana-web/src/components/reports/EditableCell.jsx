import React, { useState, useContext } from 'react'
import { Input, Select, Form, TimePicker } from 'antd';
const { Option } = Select;       
import uniqid from 'uniqid';

import { ReportContext } from "./TableContext";
const format = 'HH:mm';

const EditableCell = ({
    rowEditing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {

    const reportContext = useContext(ReportContext);
    
    const onReportCodeChanged = (value) => {
        console.log(value)
    }

    const getInput = (type) => {
        const controls = {
            time: () => {
                return  <TimePicker
                            className='ltr'
                            format={format}
                            allowClear={false}
                            showNow={false} />
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

    const inputNode = getInput(inputType);
    return (
        <td {...restProps}>
            {rowEditing /*&& cellEditable*/ ?  (
                <Form.Item style={{ margin: 0 }}
                        name={dataIndex}
                            rules={[
                            {
                                required: true,
                                message: `אנא הזן ${title}!`,
                            },
                        ]}>
                    { inputNode }
                </Form.Item>
            ) : (
                    children
                )}
        </td>
     );

}

export default EditableCell