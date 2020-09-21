import React from 'react';

const styles = {
    container: {
        position: 'relative',
        width: '100%',
        height: '100%'
    },
    badge: {
        borderRadius: '10px',
        display: 'inline-block',
        padding: '3px 7px',
        top: '-2px',
        right: '-2px',
        lineHeight: '1',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '700',
        verticalAlign: 'baseline',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        position: 'absolute',
        minWidth: '10px',
        backgroundColor: 'rgba(212,19,13,1)'
    }
}

const Badge = ({count}) => {
    return (
        <div>
            <div style={styles.container}>                                
                <span style={styles.badge}>
                    {count}
                </span>
            </div>
        </div>
    )
}

export default Badge;