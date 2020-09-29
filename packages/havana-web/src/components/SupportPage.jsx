import React, { useState, useEffect, useReducer, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Collapse, Icon, Button, 
    Layout, Row, Col, Typography } from 'antd';
const { Panel } = Collapse;
const { Title } = Typography;

import { API, DEFAULT_BASE_URL } from '../utils';
import { DataContext } from '../DataContext';

const reducer = (state, action) => {
    if( action.type == 'UPDATE' ) {

        return state.map( step => {
            if( step.url === action.payload.url ) {
                return {...step,
                        result: action.payload.result,
                        status: action.payload.status
                }
            } else 
                return {...step}
        }) 
    }
}

class Step {

    constructor(name, url, params, postProcess) {
        this.name = name;
        this.url = url;
        this.params = params;
        this.postProcess = postProcess;
    }
    
    get queryString() {
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

            console.log(this.params);
            const resp = await API.get(this.url, {
                params: this.params
            })
            this.status = resp.status;
            this.result = resp.data;
            if( this.postProcess ) {
                this.postProcess(resp);
            }
            this.query_string = this.queryString;

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
    const [incidentData, setIncidentData] = useState();

    // Used as shared data for exchange API results between the steps.
    // Passed by reference to some step and may be updated in postProcess() of other.
    let localContext = [{
        id: context.user.userID,
        year: routeParams.year,
        month: routeParams.month,
        employerCode: 0
    }];
 
    const steps = [
        new Step('me', '/me'),
        new Step('Days Off', '/daysoff', 
            {
                year: routeParams.year,
                month: routeParams.month
            }),
        new Step('Manual Updates', '/me/reports/manual_updates',
            {
                year: routeParams.year,
                month: routeParams.month
            }),
        new Step('Report Data', `/me/reports/${routeParams.year}/${routeParams.month}`,
                null,
                (res) => {
                    localContext[0].employerCode = res.data.employerCode;
                }),
        new Step('Report Codes', '/me/report_codes',
                localContext[0])
    ]

    const [state, dispatch] = useReducer(reducer, steps);

    const action_Update = (item) => {
        dispatch({
            type: 'UPDATE',
            payload: item
        })
    }
    
    const fetchData = async() => {

        const results = await Promise.all( steps.map( async(step) => {
            await step.process();
            action_Update(step);
        }));
        setIncidentData(results);
    }

    useEffect( () => {
        onRefresh();
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
            setActivePanelKeys([...steps.keys()]);  

        setExpanded(!expanded)
    }

    const genExtra = (status) => {

        const iconColor = status  == 200 ? 'rgb(24, 144, 255)' : 'rgb(255, 0, 0)';

        return <Icon type='check-circle'
                style={{
                    color: iconColor
                }} />
    }

    const sendOut = async() => {
        try {

            const _steps = incidentData.map( step => {
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
            await API.post('./incidents', incident,
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
                        <Title level={3}>Support Page for Report {routeParams.year}/{routeParams.month}</Title>
                    </Col>
                </Row>
            </Layout.Header>
            <Layout.Content>
                <Row gutter={[0, 16]} type='flex'>
                    <Col span={22}>
                        <Button disabled={loading} onClick={onRefresh}>Refresh</Button>
                    </Col>
                    <Col span={2}>
                        <Button onClick={expandAllPanels}
                                style={{ float: 'right' }}>{
                           expanded? 'Collapse All': 'Expand All'
                        }</Button>
                    </Col>
                </Row>
                <Row gutter={[0, 16]}>
                    <Col>
                        <Collapse 
                            onChange={activePanelChanged}
                            activeKey={activePanelKeys}>
                        {
                            state.map( (item, index) => {

                                return (
                                    <Panel header={item.name + ' (' + item.url + item.query_string + ')'} 
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