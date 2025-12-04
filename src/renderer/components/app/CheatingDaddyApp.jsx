import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from './AppHeader.jsx';
import MainView from '../views/MainView.jsx';
import CustomizeView from '../views/CustomizeView.jsx';
import HelpView from '../views/HelpView.jsx';
import HistoryView from '../views/HistoryView.jsx';
import AssistantView from '../views/AssistantView.jsx';
import OnboardingView from '../views/OnboardingView.jsx';
import AdvancedView from '../views/AdvancedView.jsx';

const CheatingDaddyApp = () => {
    // Always start with onboarding (can be changed to check localStorage later)
    const [currentView, setCurrentView] = useState('onboarding');
    const [statusText, setStatusText] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(
        localStorage.getItem('selectedProfile') || 'interview'
    );
    const [selectedLanguage, setSelectedLanguage] = useState(
        localStorage.getItem('selectedLanguage') || 'en-US'
    );
    const [selectedScreenshotInterval, setSelectedScreenshotInterval] = useState(
        localStorage.getItem('selectedScreenshotInterval') || '5'
    );
    const [selectedImageQuality, setSelectedImageQuality] = useState(
        localStorage.getItem('selectedImageQuality') || 'medium'
    );
    const [layoutMode, setLayoutMode] = useState(
        localStorage.getItem('layoutMode') || 'normal'
    );
    const [advancedMode, setAdvancedMode] = useState(
        localStorage.getItem('advancedMode') === 'true'
    );
    const [responses, setResponses] = useState([]);
    const [currentResponseIndex, setCurrentResponseIndex] = useState(-1);
    const [isClickThrough, setIsClickThrough] = useState(false);
    const [awaitingNewResponse, setAwaitingNewResponse] = useState(false);
    const [shouldAnimateResponse, setShouldAnimateResponse] = useState(false);
    const [currentResponseIsComplete, setCurrentResponseIsComplete] = useState(true);

    // Apply layout mode on mount and when it changes
    useEffect(() => {
        updateLayoutMode();
    }, [layoutMode]);

    // Expose app methods to window.cheddar for backwards compatibility
    useEffect(() => {
        if (window.cheddar) {
            window.cheddar.getCurrentView = () => currentView;
            window.cheddar.getLayoutMode = () => layoutMode;
            window.cheddar.setStatus = handleSetStatus;
            window.cheddar.setResponse = handleSetResponse;
        }
    }, [currentView, layoutMode]);

    const updateLayoutMode = () => {
        if (layoutMode === 'compact') {
            document.documentElement.classList.add('compact-layout');
        } else {
            document.documentElement.classList.remove('compact-layout');
        }
    };

    // Set up IPC listeners
    useEffect(() => {
        if (!window.require) return;

        const { ipcRenderer } = window.require('electron');

        const handleUpdateResponse = (_, response) => {
            handleSetResponse(response);
        };

        const handleUpdateStatus = (_, status) => {
            handleSetStatus(status);
        };

        const handleClickThroughToggled = (_, isEnabled) => {
            setIsClickThrough(isEnabled);
        };

        ipcRenderer.on('update-response', handleUpdateResponse);
        ipcRenderer.on('update-status', handleUpdateStatus);
        ipcRenderer.on('click-through-toggled', handleClickThroughToggled);

        return () => {
            ipcRenderer.removeAllListeners('update-response');
            ipcRenderer.removeAllListeners('update-status');
            ipcRenderer.removeAllListeners('click-through-toggled');
        };
    }, []);

    const handleSetStatus = (text) => {
        setStatusText(text);

        // Mark response as complete when we get certain status messages
        if (text.includes('Ready') || text.includes('Listening') || text.includes('Error')) {
            setCurrentResponseIsComplete(true);
            console.log('[setStatus] Marked current response as complete');
        }
    };

    const handleSetResponse = (response) => {
        // Check if this looks like a filler response
        const isFillerResponse =
            response.length < 30 &&
            (response.toLowerCase().includes('hmm') ||
                response.toLowerCase().includes('okay') ||
                response.toLowerCase().includes('next') ||
                response.toLowerCase().includes('go on') ||
                response.toLowerCase().includes('continue'));

        setResponses((prevResponses) => {
            if (awaitingNewResponse || prevResponses.length === 0) {
                // Always add as new response when explicitly waiting for one
                setCurrentResponseIndex(prevResponses.length);
                setAwaitingNewResponse(false);
                setCurrentResponseIsComplete(false);
                console.log('[setResponse] Pushed new response:', response);
                return [...prevResponses, response];
            } else if (!currentResponseIsComplete && !isFillerResponse && prevResponses.length > 0) {
                // For substantial responses, update the last one (streaming behavior)
                console.log('[setResponse] Updated last response:', response);
                return [...prevResponses.slice(0, prevResponses.length - 1), response];
            } else {
                // For filler responses or when current response is complete, add as new
                setCurrentResponseIndex(prevResponses.length);
                setCurrentResponseIsComplete(false);
                console.log('[setResponse] Added response as new:', response);
                return [...prevResponses, response];
            }
        });
        setShouldAnimateResponse(true);
    };

    // Header event handlers
    const handleCustomizeClick = () => setCurrentView('customize');
    const handleHelpClick = () => setCurrentView('help');
    const handleHistoryClick = () => setCurrentView('history');
    const handleAdvancedClick = () => setCurrentView('advanced');

    const handleClose = async () => {
        if (currentView === 'customize' || currentView === 'help' || currentView === 'history') {
            setCurrentView('main');
        } else if (currentView === 'assistant') {
            window.cheddar.stopCapture();

            // Close the session
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('close-session');
            }
            setSessionActive(false);
            setCurrentView('main');
            console.log('Session closed');
        } else {
            // Quit the entire application
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('quit-application');
            }
        }
    };

    const handleHideToggle = async () => {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('toggle-window-visibility');
        }
    };

    const handleBackClick = () => setCurrentView('main');

    // Main view event handlers
    const handleStart = async () => {
        const apiKey = localStorage.getItem('apiKey')?.trim();
        if (!apiKey || apiKey === '') {
            // Trigger error in MainView
            return;
        }

        await window.cheddar.initializeGemini(selectedProfile, selectedLanguage);
        window.cheddar.startCapture(selectedScreenshotInterval, selectedImageQuality);
        setResponses([]);
        setCurrentResponseIndex(-1);
        setStartTime(Date.now());
        setCurrentView('assistant');
    };

    const handleAPIKeyHelp = async () => {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', 'https://cheatingdaddy.com/help/api-key');
        }
    };

    // Customize view event handlers
    const handleProfileChange = (profile) => {
        setSelectedProfile(profile);
        localStorage.setItem('selectedProfile', profile);
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        localStorage.setItem('selectedLanguage', language);
    };

    const handleScreenshotIntervalChange = (interval) => {
        setSelectedScreenshotInterval(interval);
        localStorage.setItem('selectedScreenshotInterval', interval);
    };

    const handleImageQualityChange = (quality) => {
        setSelectedImageQuality(quality);
        localStorage.setItem('selectedImageQuality', quality);
    };

    const handleAdvancedModeChange = (advancedModeValue) => {
        setAdvancedMode(advancedModeValue);
        localStorage.setItem('advancedMode', advancedModeValue.toString());
    };

    const handleLayoutModeChange = async (newLayoutMode) => {
        setLayoutMode(newLayoutMode);
        localStorage.setItem('layoutMode', newLayoutMode);

        // Notify main process about layout change for window resizing
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('update-sizes');
            } catch (error) {
                console.error('Failed to update sizes in main process:', error);
            }
        }
    };

    // Help view event handlers
    const handleExternalLinkClick = async (url) => {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', url);
        }
    };

    // Assistant view event handlers
    const handleSendText = async (message) => {
        const result = await window.cheddar.sendTextMessage(message);

        if (!result.success) {
            console.error('Failed to send message:', result.error);
            handleSetStatus('Error sending message: ' + result.error);
        } else {
            handleSetStatus('Message sent...');
            setAwaitingNewResponse(true);
        }
    };

    const handleResponseIndexChanged = (index) => {
        setCurrentResponseIndex(index);
        setShouldAnimateResponse(false);
    };

    const handleResponseAnimationComplete = () => {
        setShouldAnimateResponse(false);
        setCurrentResponseIsComplete(true);
        console.log('[response-animation-complete] Marked current response as complete');
    };

    // Onboarding event handlers
    const handleOnboardingComplete = () => setCurrentView('main');

    // Notify main process of view changes
    useEffect(() => {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('view-changed', currentView);
        }
    }, [currentView]);

    const renderCurrentView = () => {
        switch (currentView) {
            case 'onboarding':
                return (
                    <OnboardingView
                        onComplete={handleOnboardingComplete}
                        onClose={handleClose}
                    />
                );

            case 'main':
                return (
                    <MainView
                        onStart={handleStart}
                        onAPIKeyHelp={handleAPIKeyHelp}
                        onLayoutModeChange={handleLayoutModeChange}
                    />
                );

            case 'customize':
                return (
                    <CustomizeView
                        selectedProfile={selectedProfile}
                        selectedLanguage={selectedLanguage}
                        selectedScreenshotInterval={selectedScreenshotInterval}
                        selectedImageQuality={selectedImageQuality}
                        layoutMode={layoutMode}
                        advancedMode={advancedMode}
                        onProfileChange={handleProfileChange}
                        onLanguageChange={handleLanguageChange}
                        onScreenshotIntervalChange={handleScreenshotIntervalChange}
                        onImageQualityChange={handleImageQualityChange}
                        onLayoutModeChange={handleLayoutModeChange}
                        onAdvancedModeChange={handleAdvancedModeChange}
                    />
                );

            case 'help':
                return <HelpView onExternalLinkClick={handleExternalLinkClick} />;

            case 'history':
                return <HistoryView />;

            case 'advanced':
                return <AdvancedView />;

            case 'assistant':
                return (
                    <AssistantView
                        responses={responses}
                        currentResponseIndex={currentResponseIndex}
                        selectedProfile={selectedProfile}
                        onSendText={handleSendText}
                        shouldAnimateResponse={shouldAnimateResponse}
                        onResponseIndexChanged={handleResponseIndexChanged}
                        onResponseAnimationComplete={handleResponseAnimationComplete}
                    />
                );

            default:
                return <div>Unknown view: {currentView}</div>;
        }
    };

    const mainContentClass = `main-content ${
        currentView === 'assistant'
            ? 'assistant-view'
            : currentView === 'onboarding'
            ? 'onboarding-view'
            : 'with-border'
    }`;

    return (
        <div className="window-container">
            <div className="container">
                <AppHeader
                    currentView={currentView}
                    statusText={statusText}
                    startTime={startTime}
                    advancedMode={advancedMode}
                    onCustomizeClick={handleCustomizeClick}
                    onHelpClick={handleHelpClick}
                    onHistoryClick={handleHistoryClick}
                    onAdvancedClick={handleAdvancedClick}
                    onCloseClick={handleClose}
                    onBackClick={handleBackClick}
                    onHideToggleClick={handleHideToggle}
                    isClickThrough={isClickThrough}
                />
                <div className={mainContentClass}>
                    <div className="view-container">{renderCurrentView()}</div>
                </div>
            </div>
        </div>
    );
};

export default CheatingDaddyApp;
