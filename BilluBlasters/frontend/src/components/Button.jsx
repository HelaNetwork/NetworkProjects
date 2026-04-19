import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon = null,
    onClick,
    type = 'button',
    className = ''
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const fullWidthClass = fullWidth ? 'btn-full-width' : '';
    const loadingClass = loading ? 'btn-loading' : '';

    const allClasses = [baseClass, variantClass, sizeClass, fullWidthClass, loadingClass, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={allClasses}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? (
                <>
                    <span className="btn-spinner"></span>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon && <span className="btn-icon">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
