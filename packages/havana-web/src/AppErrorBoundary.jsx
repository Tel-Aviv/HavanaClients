import React from 'react';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            errorInfo: null
        }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
    }

    render() {

        if( this.state.errorInfo ) {
            return (
                <div>
                    <h2></h2>
                    <details>
                    { this.state.error && this.state.error.toString() }
                    <br />
                    { this.state.errorInfo.componentStack }
                    </details>
                </div>
            )
        }

        // Normally, just render children
        return this.props.children;
    }
}

export default AppErrorBoundary;