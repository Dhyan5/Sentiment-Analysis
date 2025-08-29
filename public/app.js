import React, { useState, useEffect } from 'react';
const componentStyles = `
    /* HIDE DEFAULT CURSOR & APPLY CUSTOM CURSOR TO BODY */
    body, button, textarea {
        cursor: none;
    }
    .dark-bg-grid {
        background-color: #111827;
        background-image:
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
        background-size: 30px 30px;
    }
    .card-glow::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 1.5rem; /* 24px */
        padding: 2px; /* border thickness */
        background: linear-gradient(45deg, #8b5cf6, #3b82f6);
        -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }
    .result-enter {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .result-enter-active {
        opacity: 1;
        transform: translateY(0);
    }
    .loader {
        border-top-color: #a78bfa;
        -webkit-animation: spinner 1.5s linear infinite;
        animation: spinner 1.5s linear infinite;
    }
    @-webkit-keyframes spinner {
        0% { -webkit-transform: rotate(0deg); }
        100% { -webkit-transform: rotate(360deg); }
    }
    @keyframes spinner {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .cursor-dot {
        position: fixed;
        top: 0;
        left: 0;
        width: 8px;
        height: 8px;
        background-color: #c4b5fd;
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 9999;
        transition: transform 0.1s ease-out;
    }
    .cursor-outline {
        position: fixed;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        border: 2px solid rgba(167, 139, 250, 0.5);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 9999;
        transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
    }
    .cursor-outline.hovered {
        width: 60px;
        height: 60px;
        border-color: rgba(196, 181, 253, 0.8);
    }
`;

const TechIcon = () => (
    <svg className="w-12 h-12 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l-3 4 3 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l3 4-3 4" />
    </svg>
);

const CustomCursor = ({ isHovering }) => {
    const [position, setPosition] = useState({ x: -100, y: -100 });

    useEffect(() => {
        const moveCursor = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', moveCursor);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, []);

    return (
        <>
            <div className="cursor-dot" style={{ left: `${position.x}px`, top: `${position.y}px` }}></div>
            <div className={`cursor-outline ${isHovering ? 'hovered' : ''}`} style={{ left: `${position.x}px`, top: `${position.y}px` }}></div>
        </>
    );
};


export default function App() {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHovering, setIsHovering] = useState(false);

    const emotionColors = {
        joy: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
        sadness: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
        anger: 'bg-red-500/10 text-red-300 border border-red-500/20',
        fear: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
        surprise: 'bg-teal-500/10 text-teal-300 border border-teal-500/20',
        neutral: 'bg-gray-500/10 text-gray-300 border border-gray-500/20'
    };

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError('Failed to analyze emotion. Please try again.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const resultColorClass = result ? emotionColors[result.emotion] || emotionColors.neutral : '';

    return (
        <>
            <style>{componentStyles}</style>
            <CustomCursor isHovering={isHovering} />
            <div className="dark-bg-grid flex items-center justify-center min-h-screen font-sans p-4">
                <div 
                    className="relative container mx-auto max-w-2xl bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 card-glow"
                >
                    <div className="flex justify-center items-center mb-6">
                        <TechIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">Emotion Analyzer</h1>
                    <p className="text-center text-gray-400 mb-8">Discover the emotional tone of your text.</p>

                    <div className="mb-6">
                        <textarea
                            id="text-input"
                            className="w-full h-40 p-4 bg-gray-800/50 border border-violet-500/20 rounded-lg text-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 shadow-inner focus:shadow-lg placeholder:text-gray-500"
                            placeholder="Type or paste your text here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isLoading}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        />
                    </div>

                    <div className="text-center">
                        <button
                            id="analyze-btn"
                            className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-violet-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-all duration-300 flex items-center justify-center w-full sm:w-auto mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-500/30"
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <span>{isLoading ? 'Analyzing...' : 'Analyze Emotion'}</span>
                            {isLoading && <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-6 w-6 ml-3"></div>}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}

                    {result && (
                        <div className="mt-8 text-center result-enter result-enter-active">
                            <div className={`result-card p-6 rounded-lg transition-all duration-300 ease-in-out ${resultColorClass}`}>
                                <h2 className="text-2xl font-semibold capitalize">
                                    Dominant Emotion: {result.emotion}
                                </h2>
                                <p className="text-lg opacity-80">
                                    {Object.entries(result.scores).map(([emotion, score]) => `${emotion}: ${score}`).join(', ')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
