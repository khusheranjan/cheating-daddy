import React from 'react';

const CustomizeView = (props) => {
    return (
        <div className="settings-container" style={{ padding: '12px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2 style={{ marginBottom: '16px' }}>Customization View</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
                    This view is being migrated to React. The functionality will be available soon.
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                    Note: Settings are still available through localStorage for now.
                </p>
            </div>
        </div>
    );
};

export default CustomizeView;
