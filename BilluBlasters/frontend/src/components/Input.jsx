import React from 'react';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    icon,
    disabled = false,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-container">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};

export default Input;
