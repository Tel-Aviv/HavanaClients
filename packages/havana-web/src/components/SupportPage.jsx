import React, { useState, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { Collapse, Icon, Button, 
    Layout, Row, Col, Typography } from 'antd';
const { Panel } = Collapse;
const { Title } = Typography;

import { API, DEFAULT_BASE_URL } from '../utils';

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

const SupportPage = () => {

    // The order of hooks is important here.
    // Firstly useParams() to populate steps array.
    // Later this array will be passed to useReducer() as initial state
    const routeParams = useParams();
    const [activePanelKeys, setActivePanelKeys] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading , setLoading] = useState(false);
    const [incidentData, setIncidentData] = useState();
 
    const steps = [
        {
            name: 'me',
            url: '/me'
        },
        {
            name: 'Days Off',
            url: `/daysoff`,
            params: {
                year: routeParams.year,
                month: routeParams.month
            }
        },
        {
            name: 'Manual Updates',
            url: '/me/reports/manual_updates',
            params: {
                year: routeParams.year,
                month: routeParams.month
            }
        },
        {
            name: 'Report Data',
            url: `/me/reports/${routeParams.year}/${routeParams.month}`
        }, 
        {
            name: 'Report Codes',
            url: `/me/report_codes?id=308680768&employerCode=1&year=${routeParams.year}&month=${routeParams.month}`
        }
    ]

    const [state, dispatch] = useReducer(reducer, steps);

    const action_Update = (item) => {
        dispatch({
            type: 'UPDATE',
            payload: item
        })
    }
    
    const fetchData = async() => {

        const incident = {
            items: []
        }

        const _steps = await Promise.all(steps.map( async(item) => {

            let _step = {...item};

            try {
                
                const resp = await API.get(item.url, {
                    params: item.params
                })
                _step.status = resp.status;
                _step.result = resp.data;

            } catch(error) { // if some API call is failed, this catch allows to move on

                let _message = `${error.message} when reaching ${DEFAULT_BASE_URL}/${item.url}`;
                let _status = 0;
                const { response } = error;
                if( response ) {
                    _message = `${response.config.url} => ${response.statusText} (${response.status})`;
                    _status = response.status;
                }

                _step.status = _status;
                _step.result = _message;
            } finally {
                action_Update(_step);
                console.log(_step);
                return _step;
            }
        }))

        setIncidentData(_steps);
    }

    useEffect( () => {
        setLoading(true);
        fetchData();
        setLoading(false);
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
                                    <Panel header={item.name + ' (' + item.url + ')'} 
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