// @flow
import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Upload, Button, Icon, message } from 'antd'
import { saveAs } from 'file-saver';

import { DataContext } from "../DataContext";

const DocsUploader = ({year, month, isOperational, employeeId}) => {

    const [docs, setDocs] = useState([]);
    const [_year, _setYear] = useState( year);
    const [_month, _setMonth] = useState(month);

    const dataContext = useContext(DataContext);

    const { t } = useTranslation();

    useEffect( () => {
        
        let mounted = true;

        const fetchData = async () => {            

            try {
                const url = (isOperational) ?
                    `/me/reports/${year}/${month}/docs/` :
                    `/me/employees/${employeeId}/reports/${year}/${month}/docs`;

                // API is already wrapped with credentials = true
                const res = await dataContext.API.get(url)
                    
                if (mounted) {
                    const _docs = res.data.map( (item, index) => {
                        return {
                            uid: index,
                            status: 'done',
                            name: item
                        }
                    })
                    setDocs(_docs);
                }

            } catch( err ) {
                console.error(err);
            }
        }
        _setYear(year);
        _setMonth(month);

        fetchData();

        return () => {
            // When cleanup is called, toggle the mounted variable to false
            mounted = false;
        }

    }, [year, month])

    const removeDoc = async(file) => {

        try {
            const docName = file.name;
            await dataContext.API.delete(`/me/reports/${_year}/${_month}/docs?docName=${docName}`)
        } catch(err) {

            const _doc = docs.find( doc => 
                doc.uid === file.uid
            )
            if( _doc ) {
                _doc.status = 'error';
                _doc.response = err.response.data; // string-formatted content
                setDocs([...docs]);
            }

            throw err;
        }
        
    } 

    const previewDoc = (file) => {
        console.log(file);
    }

    const downloadDoc = async (file) => {
        console.log(file);
        try {
            let url = (isOperational) ?
                `/me/reports/${_year}/${_month}/doc?docName=${file.name}` :
                `/me/employees/${employeeId}/reports/${_year}/${_month}/doc?docName=${file.name}`;
            let res = await dataContext.API(url);
            url = res.data;

            saveAs(url, file.name);

        } catch(err) {
            console.error(err);
        }
    }

    const beforeUpload = (file) => {

        // prevent uploading files with the same name
        var alreadyUploaded = docs.find( doc => {
             return doc.name === file.name
        });
        if( alreadyUploaded ) {
            message.error('The file with the same name is already uploaded');
            return false;
        }

        const isValidForUpload = file.type === 'image/jpeg' 
                            || file.type === 'image/png' 
                            || file.type === 'application/pdf';
        if (!isValidForUpload) {
            message.error('You can only upload JPG/PNG/PDF files!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
             message.error('Image must smaller than 2MB!');
        }

        return isValidForUpload && isLt2M;
    }

    const docsUploadProps = {

        action: `${dataContext.protocol}://${dataContext.host}/me/reports/${_year}/${_month}/docs/`,
        onChange({ file, fileList }) {
            fileList = fileList.map(file => {
                  if (file.response) {
                    // Component will show file.url as link
                    file.url = file.response.url;
                  }
                  return file;
                });

            if( file. status )    
                setDocs(fileList);
        },
        withCredentials: true,
        showUploadList: {
            showDownloadIcon: true,
            showPreviewIcon: true,
            showRemoveIcon: true
        },
        defaultFileList: docs,
        fileList: docs,
        beforeUpload: beforeUpload,
        onRemove: removeDoc,
        onPreview: previewDoc,
        onDownload: downloadDoc
    }

    return (
        <Upload fileList={docs} className='rtl'
                listType='text'
                disabled={!isOperational}
                {...docsUploadProps} className='ltr'>
            { 
                isOperational ? 
                    <Button>
                        <Icon type="upload" /> {t('upload')}
                    </Button> :
                    null
            }
        </Upload>
    )

}

export default DocsUploader;