import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
            alert("Registration successful! Please login.");
            navigate('/login');
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="auth-card">
            <h2>Staff Registration</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <input type="email" placeholder="Work Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                <button type="submit">Create Account</button>
            </form>
        </div>
    );
}

export default Register;