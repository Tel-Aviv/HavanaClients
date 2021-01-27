import React, { useContext } from 'react';
import { ReportContext } from "./TableContext";     

const DeletableRow = (props) => {

    const context = useContext(ReportContext);
    const record = context.tableData.find( item =>
       item.key === props["data-row-key"]
    )

    const trClassName = record && record.isDeleted ? 'strikeout' : '';

    return <tr className={trClassName}>
        {
            props.children
        }
    </tr>
}

export default DeletableRow;