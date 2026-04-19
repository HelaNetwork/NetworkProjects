import React from 'react';
import './Card.css';

const Card = ({ children, className = '', hover = false, gradient = false, onClick }) => {
    const baseClass = 'card glass-card';
    const hoverClass = hover ? 'glass-card-hover' : '';
    const gradientClass = gradient ? 'card-gradient' : '';
    const clickableClass = onClick ? 'card-clickable' : '';

    const allClasses = [baseClass, hoverClass, gradientClass, clickableClass, className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={allClasses} onClick={onClick}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`card-header ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`card-footer ${className}`}>{children}</div>
);

export default Card;
