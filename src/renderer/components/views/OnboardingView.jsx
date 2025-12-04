import React, { useState } from 'react';

const OnboardingView = ({ onComplete = () => {}, onClose = () => {} }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [contextText, setContextText] = useState('');

    const completeOnboarding = () => {
        if (contextText.trim()) {
            localStorage.setItem('customPrompt', contextText.trim());
        }
        localStorage.setItem('onboardingCompleted', 'true');
        onComplete();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px'
        }}>
            <div style={{ maxWidth: '500px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#fff' }}>
                    Welcome to Cheating Daddy
                </h1>
                <p style={{ fontSize: '16px', marginBottom: '24px', color: '#b8b8b8' }}>
                    Your AI assistant that listens and watches, then provides intelligent suggestions automatically.
                </p>
                {currentSlide === 1 && (
                    <textarea
                        style={{
                            width: '100%',
                            height: '120px',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#e5e5e5',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            marginBottom: '24px'
                        }}
                        placeholder="Paste your resume, job description, or any relevant context here..."
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                    />
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {currentSlide === 0 ? (
                        <button
                            style={{
                                padding: '12px 24px',
                                background: 'white',
                                color: 'black',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                            onClick={() => setCurrentSlide(1)}
                        >
                            Continue
                        </button>
                    ) : (
                        <>
                            <button
                                style={{
                                    padding: '12px 24px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: '#e5e5e5',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                onClick={() => setCurrentSlide(0)}
                            >
                                Back
                            </button>
                            <button
                                style={{
                                    padding: '12px 24px',
                                    background: 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                                onClick={completeOnboarding}
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;
