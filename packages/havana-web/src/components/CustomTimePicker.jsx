

import React, { useState } from 'react'

import { TimePicker, Button } from 'antd';

const format = 'H:mm';
export default React.forwardRef( (props, ref) => {
    const [open, setOpen] = useState(false);

    const handleOk = (e) => {
        setOpen(false)
    }

    return (
        <TimePicker
            ref={ref}
            className='ltr'
            {...props}
            format={format}
            open={open}
            size='small'
            allowClear={false}
            showNow={false}
            onOpenChange={(e) => setOpen(e)}
            // renderExtraFooter={() => (
            //     <Button size="small"
            //             type="primary"
            //             style={{
            //                 width: '100%'
            //             }}    
            //             onClick={(e) => handleOk(e)}> Ok </Button>
            // )} 
            />
    )
})