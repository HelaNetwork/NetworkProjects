import { useState } from "react";
import { addEmployee } from "../supabase";

function HRRegistration({ userEmail, onRegistrationComplete, onCancel }) {
  const [registrationType, setRegistrationType] = useState("employee"); // "employee" or "hr"
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: "",
    walletAddress: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return false;
    }

    // Only validate employee-specific fields if registering as employee
    if (registrationType === "employee") {
      if (!formData.position.trim()) {
        setError("Please enter your position");
        return false;
      }
      if (!formData.salary || parseFloat(formData.salary) <= 0) {
        setError("Please enter a valid salary amount");
        return false;
      }
      if (!formData.walletAddress.trim()) {
        setError("Please enter your HeLa wallet address");
        return false;
      }
      if (!formData.walletAddress.startsWith("0x") || formData.walletAddress.length !== 42) {
        setError("Please enter a valid wallet address (starts with 0x, 42 characters)");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (registrationType === "hr") {
        // HR registration - just store in localStorage or state
        alert("✅ HR registration successful! You now have HR access.");
        onRegistrationComplete({
          role: "hr",
          name: formData.name.trim(),
          email: userEmail,
        });
      } else {
        // Employee registration - add to Supabase
        const newEmployee = await addEmployee({
          name: formData.name.trim(),
          email: userEmail,
          position: formData.position.trim(),
          salary: parseFloat(formData.salary),
          wallet_address: formData.walletAddress.trim(),
        });

        if (newEmployee) {
          alert("✅ Registration successful! You can now log in as an employee.");
          onRegistrationComplete(newEmployee);
        } else {
          setError("Registration failed. Please try again or contact support.");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: "600px" }}>
        
        {/* Header */}
        <div className="login-logo">📝</div>
        <h1 className="login-title" style={{ fontSize: "36px" }}>
          {registrationType === "employee" ? "Employee Registration" : "HR Registration"}
        </h1>
        <p className="login-subtitle" style={{ marginBottom: "32px" }}>
          Welcome! Please complete your registration to access PayStream
        </p>

        {/* Email Display */}
        <div style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
          textAlign: "left"
        }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            REGISTERING WITH EMAIL
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--primary)" }}>
            {userEmail}
          </div>
        </div>

        {/* Registration Type Toggle */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ 
            fontSize: "14px", 
            fontWeight: "600", 
            color: "var(--text-primary)", 
            marginBottom: "12px" 
          }}>
            Register As:
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setRegistrationType("employee")}
              style={{
                flex: 1,
                padding: "14px 20px",
                background: registrationType === "employee" ? "var(--gradient-1)" : "var(--bg-elevated)",
                border: `2px solid ${registrationType === "employee" ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "12px",
                color: registrationType === "employee" ? "var(--bg-dark)" : "var(--text-primary)",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              👤 Employee
            </button>
            <button
              type="button"
              onClick={() => setRegistrationType("hr")}
              style={{
                flex: 1,
                padding: "14px 20px",
                background: registrationType === "hr" ? "var(--gradient-1)" : "var(--bg-elevated)",
                border: `2px solid ${registrationType === "hr" ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "12px",
                color: registrationType === "hr" ? "var(--bg-dark)" : "var(--text-primary)",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              🏢 HR Manager
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          
          {/* Full Name - Required for both */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Employee-Only Fields */}
          {registrationType === "employee" && (
            <>
              {/* Position */}
              <div className="form-group">
                <label className="form-label">Position / Job Title *</label>
                <input
                  type="text"
                  name="position"
                  className="form-input"
                  placeholder="Software Engineer"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Monthly Salary */}
              <div className="form-group">
                <label className="form-label">Monthly Salary (HLUSD) *</label>
                <input
                  type="number"
                  name="salary"
                  className="form-input"
                  placeholder="0.05"
                  step="0.000001"
                  min="0"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                />
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Enter your agreed monthly salary in HLUSD
                </div>
              </div>

              {/* Wallet Address */}
              <div className="form-group">
                <label className="form-label">HeLa Wallet Address *</label>
                <input
                  type="text"
                  name="walletAddress"
                  className="form-input"
                  placeholder="0x..."
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  required
                />
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Your salary will be streamed to this wallet address
                </div>
              </div>
            </>
          )}

          {/* HR Registration Notice */}
          {registrationType === "hr" && (
            <div style={{
              background: "rgba(0, 217, 255, 0.1)",
              border: "1px solid var(--primary)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              <strong style={{ color: "var(--primary)", display: "block", marginBottom: "8px" }}>
                🏢 HR Manager Access
              </strong>
              <div style={{ color: "var(--text-secondary)" }}>
                As an HR Manager, you will have access to:
                <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                  <li>Employee directory management</li>
                  <li>Salary stream creation and management</li>
                  <li>Payroll tracking and reporting</li>
                  <li>Tax vault monitoring</li>
                </ul>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: "rgba(255, 61, 113, 0.1)",
              border: "1px solid var(--accent)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "var(--accent)",
              fontSize: "14px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div style={{
          marginTop: "32px",
          padding: "16px",
          background: "rgba(0, 217, 255, 0.05)",
          border: "1px solid rgba(0, 217, 255, 0.2)",
          borderRadius: "12px",
          fontSize: "13px",
          color: "var(--text-secondary)",
          textAlign: "left",
          lineHeight: "1.6"
        }}>
          <strong style={{ color: "var(--primary)", display: "block", marginBottom: "8px" }}>
            📋 Registration Notes:
          </strong>
          {registrationType === "employee" ? (
            <>
              • All fields are required to complete registration<br />
              • Your salary information is confidential<br />
              • After registration, HR can create your payment stream<br />
              • You can update your wallet address later if needed
            </>
          ) : (
            <>
              • Only your name is required for HR registration<br />
              • You will have full access to manage employees<br />
              • You can add employees and create salary streams<br />
              • HR access is granted immediately after registration
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default HRRegistration;