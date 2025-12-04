import React, { useState, useEffect, useRef } from 'react';

const AssistantView = ({
    responses = [],
    currentResponseIndex = -1,
    selectedProfile = 'interview',
    onSendText = () => {},
    shouldAnimateResponse = false,
    onResponseIndexChanged = () => {},
    onResponseAnimationComplete = () => {},
}) => {
    const [savedResponses, setSavedResponses] = useState([]);
    const responseContainerRef = useRef(null);
    const lastAnimatedWordCountRef = useRef(0);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('savedResponses') || '[]');
            setSavedResponses(saved);
        } catch (e) {
            setSavedResponses([]);
        }
    }, []);

    useEffect(() => {
        if (responseContainerRef.current) {
            updateResponseContent();
        }
    }, [responses, currentResponseIndex, shouldAnimateResponse]);

    const getProfileNames = () => ({
        interview: 'Job Interview',
        sales: 'Sales Call',
        meeting: 'Business Meeting',
        presentation: 'Presentation',
        negotiation: 'Negotiation',
        exam: 'Exam Assistant',
    });

    const getCurrentResponse = () => {
        const profileNames = getProfileNames();
        return responses.length > 0 && currentResponseIndex >= 0
            ? responses[currentResponseIndex]
            : `Hey, Im listening to your ${profileNames[selectedProfile] || 'session'}?`;
    };

    const renderMarkdown = (content) => {
        if (typeof window !== 'undefined' && window.marked) {
            try {
                window.marked.setOptions({
                    breaks: true,
                    gfm: true,
                    sanitize: false,
                });
                let rendered = window.marked.parse(content);
                rendered = wrapWordsInSpans(rendered);
                return rendered;
            } catch (error) {
                console.warn('Error parsing markdown:', error);
                return content;
            }
        }
        return content;
    };

    const wrapWordsInSpans = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tagsToSkip = ['PRE'];

        function wrap(node) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() && !tagsToSkip.includes(node.parentNode.tagName)) {
                const words = node.textContent.split(/(\s+)/);
                const frag = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim()) {
                        const span = document.createElement('span');
                        span.setAttribute('data-word', '');
                        span.textContent = word;
                        frag.appendChild(span);
                    } else {
                        frag.appendChild(document.createTextNode(word));
                    }
                });
                node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === Node.ELEMENT_NODE && !tagsToSkip.includes(node.tagName)) {
                Array.from(node.childNodes).forEach(wrap);
            }
        }
        Array.from(doc.body.childNodes).forEach(wrap);
        return doc.body.innerHTML;
    };

    const updateResponseContent = () => {
        const container = responseContainerRef.current;
        if (container) {
            const currentResponse = getCurrentResponse();
            const renderedResponse = renderMarkdown(currentResponse);
            container.innerHTML = renderedResponse;

            const words = container.querySelectorAll('[data-word]');
            if (shouldAnimateResponse) {
                for (let i = 0; i < lastAnimatedWordCountRef.current && i < words.length; i++) {
                    words[i].classList.add('visible');
                }
                for (let i = lastAnimatedWordCountRef.current; i < words.length; i++) {
                    words[i].classList.remove('visible');
                    setTimeout(() => {
                        words[i].classList.add('visible');
                        if (i === words.length - 1) {
                            onResponseAnimationComplete();
                        }
                    }, (i - lastAnimatedWordCountRef.current) * 100);
                }
                lastAnimatedWordCountRef.current = words.length;
            } else {
                words.forEach(word => word.classList.add('visible'));
                lastAnimatedWordCountRef.current = words.length;
            }
        }
    };

    const navigateToPreviousResponse = () => {
        if (currentResponseIndex > 0) {
            onResponseIndexChanged(currentResponseIndex - 1);
        }
    };

    const navigateToNextResponse = () => {
        if (currentResponseIndex < responses.length - 1) {
            onResponseIndexChanged(currentResponseIndex + 1);
        }
    };

    const handleSendText = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = e.target.value.trim();
            if (message) {
                e.target.value = '';
                onSendText(message);
            }
        }
    };

    const saveCurrentResponse = () => {
        const currentResponse = getCurrentResponse();
        const isAlreadySaved = savedResponses.some(saved => saved.response === currentResponse);
        if (currentResponse && !isAlreadySaved) {
            const newSaved = [
                ...savedResponses,
                {
                    response: currentResponse,
                    timestamp: new Date().toISOString(),
                    profile: selectedProfile,
                },
            ];
            setSavedResponses(newSaved);
            localStorage.setItem('savedResponses', JSON.stringify(newSaved));
        }
    };

    const isResponseSaved = () => {
        const currentResponse = getCurrentResponse();
        return savedResponses.some(saved => saved.response === currentResponse);
    };

    const responseCounter = responses.length > 0 ? `${currentResponseIndex + 1}/${responses.length}` : '';
    const isSaved = isResponseSaved();

    return (
        <>
            <div className="response-container" id="responseContainer" ref={responseContainerRef}></div>

            <div className="text-input-container">
                <button className="nav-button" onClick={navigateToPreviousResponse} disabled={currentResponseIndex <= 0}>
                    <svg width="24px" height="24px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none" color="#ffffff">
                        <path d="M15 6L9 12L15 18" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>

                {responses.length > 0 && <span className="response-counter">{responseCounter}</span>}

                <button className={`save-button ${isSaved ? 'saved' : ''}`} onClick={saveCurrentResponse} title={isSaved ? 'Response saved' : 'Save this response'}>
                    <svg width="24px" height="24px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M5 20V5C5 3.89543 5.89543 3 7 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L19.4142 5.41421C19.7893 5.78929 20 6.29799 20 6.82843V20C20 21.1046 19.1046 22 18 22H7C5.89543 22 5 21 5 20Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                        <path d="M15 22V13H9V22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M9 3V8H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>

                <input type="text" id="textInput" placeholder="Type a message to the AI..." onKeyDown={handleSendText} />

                <button className="nav-button" onClick={navigateToNextResponse} disabled={currentResponseIndex >= responses.length - 1}>
                    <svg width="24px" height="24px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none" color="#ffffff">
                        <path d="M9 6L15 12L9 18" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
            </div>
        </>
    );
};

export default AssistantView;
