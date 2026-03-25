import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on home page
    if (location.pathname === '/') return null;

    return (
        <button
            onClick={() => navigate(-1)}
            className="desktop-back-button"
            title="Go back"
            aria-label="Go back"
        >
            <ArrowLeft size={18} />
            <span>Back</span>
        </button>
    );
};

export default BackButton;
