import React, { useState, useEffect, useReducer, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Collapse, Button, 
    Layout, Row, Col, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
const { Panel } = Collapse;
const { Title } = Typography;

import { useTranslation } from "react-i18next";

import { API, DEFAULT_BASE_URL } from '../utils';
import { DataContext } from '../DataContext';

const reducer = (state, action) => {
    if( action.type == 'UPDATE' ) {

        return state.map( step => {
            if( step.url === action.payload.url ) {
                return action.payload;
            } else 
                return {...step}
        }) 
    }
}

class Step {

    constructor(name, method, url, params, postProcess) {
        this.name = name;
        this.method = method;
        this.url = url;
        this.params = params;
        this.postProcess = postProcess;
        this.queryString = '';
    }
    
    getQueryString() { // just serialize params

        let _queryString = '';
        if( this.params ) {
            let firstParam = '?'
            Object.entries(this.params).forEach(
                ([key, value]) => {
                    _queryString += `${firstParam}${key}=${value}`;
                    firstParam = '&';
                }
            );
        }

        return _queryString;
    }

    async process() {
        
        try {
            // const resp = await API.get(this.url, {
            //     params: this.params
            // })
            const resp = await API({
                method: this.method,
                url: this.url,
                params: this.params
            })
            this.status = resp.status;
            this.result = resp.data;
            if( this.postProcess ) {
                this.postProcess(resp);
            }
            this.queryString = this.getQueryString();

        } catch(error) {

            let _message = `${error.message} when reaching ${DEFAULT_BASE_URL}/${this.url}`;
            let _status = 0;
            const { response } = error;
            if( response ) {
                _message = `${response.config.url} => ${response.statusText} (${response.status})`;
                _status = response.status;
            }

            this.status = _status || 0;
            this.result = _message;
        }   
    }
}

const SupportPage = () => {

    // The order of following hooks is important here.
    // Firstly useParams() and useContext to populate steps array.
    // Later this array will be passed to useReducer() as initial state.
    const routeParams = useParams();
    const context = useContext(DataContext);
    const [activePanelKeys, setActivePanelKeys] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading , setLoading] = useState(false);

    const { t } = useTranslation();

    // Used as shared data for exchange API results between the steps.
    // Passed by reference to some step and may be updated in postProcess() of other.
    let localContext = [{
        id: context.user.userID,
        year: routeParams.year,
        month: routeParams.month,
        employerCode: 0
    }];
 
    const independent_steps = [
        new Step('me', 'get', '/me'),
        new Step('Docs', 'get', `/me/reports/${routeParams.year}/${routeParams.month}/docs`),
        new Step('Days Off', 'get', '/daysoff', 
            {
                year: routeParams.year,
                month: routeParams.month
            }),
        new Step('Manual Updates', 'get', '/me/reports/manual_updates',
            {
                year: routeParams.year,
                month: routeParams.month
            }),
        new Step('Report Data', 'get', `/me/reports/${routeParams.year}/${routeParams.month}`,
                null,
                (res) => {
                    localContext[0].employerCode = res.data.employerCode;
                })
    ]

    const dependent_steps = [
        new Step('Report Codes', 'get', '/me/report_codes',
                localContext[0]),
        new Step('Save Report', 'post', '/me/report/save',
            localContext[0])
    ]

    const [state, dispatch] = useReducer(reducer, [...independent_steps, ...dependent_steps]);

    const action_Update = (item) => {
        dispatch({
            type: 'UPDATE',
            payload: item
        })
    }
    
    const process_steps = async (steps) => {
        await Promise.all( steps.map( async(step) => {
            await step.process();
            action_Update(step);
            return step;
        }));        
    }

    const fetchData = async() => {

        // Firstly process independent steps.
        // At the finish of each step with postProccess() callback, 
        // the shared parameters are populated in order to be used when dependent steps are processed
        await process_steps(independent_steps);

        // At this point, all shared parameters are guaranteed to be ready
        await process_steps(dependent_steps);
    }

    useEffect( () => {
        fetchData();
    }, [])

    const onRefresh = () => {
        setLoading(true);
        fetchData();
        setLoading(false);
    }

    const activePanelChanged = (key) => {
        setActivePanelKeys(key)
    }

    const expandAllPanels = () => {
        
        expanded ?
            setActivePanelKeys([]) :
            setActivePanelKeys([...state.keys(), ]);  

        setExpanded(!expanded)
    }

    const genExtra = (status) => {

        const iconColor = status  == 200 ? 'rgb(24, 144, 255)' : 'rgb(255, 0, 0)';

        return <CheckCircleOutlined
                style={{
                    color: iconColor
                }} />
    }

    const sendOut = async() => {
        try {

            const _steps = state.map( step => {
                let _step = {...step, 
                    result: JSON.stringify(step.result),
                    callParams: JSON.stringify(step.params)
                }
                delete _step.params;
                return _step;
            })

            const incident = {
                steps: _steps
            };
            await API.post('/incidents', incident,
            {
                params: {
                    year: routeParams.year,
                    month: routeParams.month
                }
            })
        } catch(err) {
            throw err; // be catched in AppErrorBoundaries
        }
    }

    return (
        <Layout>
            <Layout.Header className='ant-layout-header-simple'>
                <Row>
                    <Col offset={9}>
                        <Title level={3}>{t('support_page')} {routeParams.year}/{routeParams.month}</Title>
                    </Col>
                </Row>
            </Layout.Header>
            <Layout.Content>
                <Row gutter={[0, 16]} type='flex'>
                    <Col span={22}>
                        <Button disabled={loading} onClick={onRefresh}>{t('refresh')}</Button>
                    </Col>
                    <Col span={2}>
                        <Button onClick={expandAllPanels}
                                style={{ float: 'right' }}>{
                           expanded? t('collapse') : t('expand')
                        }</Button>
                    </Col>
                </Row>
                <Row gutter={[0, 16]}>
                    <Col span={24}>
                        <Collapse 
                            onChange={activePanelChanged}
                            activeKey={activePanelKeys}>
                        {
                            state.map( (item, index) => {

                                return (
                                    <Panel header={item.name + ' (' + item.url + item.queryString + ')'} 
                                            key={index} 
                                            extra={genExtra(item.status)}>
                                        <div style={{
                                            backgroundColor: 'rgb(252, 246, 219)'
                                        }}>
                                            <pre>{JSON.stringify(item.result, null, 2)}</pre>
                                        </div>
                                    </Panel>
                                )
                            })
                        }
                        </Collapse>
                    </Col>
                </Row>
            </Layout.Content>
            <Layout.Footer>
                <Row>
                    <Col offset={10}>
                        <Button type='primary' onClick={sendOut}>Send to Support Pesonnel</Button>
                    </Col>
                </Row>
            </Layout.Footer>
        </Layout>
    )
}

export default SupportPage;