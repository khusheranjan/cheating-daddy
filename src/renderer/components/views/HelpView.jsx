import React from 'react';

const HelpView = ({ onExternalLinkClick = () => {} }) => {
    return (
        <div style={{ padding: '12px' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2 style={{ marginBottom: '16px' }}>Help & Shortcuts</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
                    This view is being migrated to React. Full help documentation will be available soon.
                </p>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginTop: '24px'
                }}>
                    <button
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            color: '#007aff',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        onClick={() => onExternalLinkClick('https://cheatingdaddy.com')}
                    >
                        🌐 Website
                    </button>
                    <button
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            color: '#007aff',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        onClick={() => onExternalLinkClick('https://github.com/sohzm/cheating-daddy')}
                    >
                        📂 GitHub
                    </button>
                    <button
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            color: '#007aff',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        onClick={() => onExternalLinkClick('https://discord.gg/GCBdubnXfJ')}
                    >
                        💬 Discord
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpView;
