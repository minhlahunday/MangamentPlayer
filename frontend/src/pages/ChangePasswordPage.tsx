import React, { useState } from 'react';
import type { FormEvent } from 'react';
import '../styles/ChangePasswordPage.css'; // Don't forget to create this CSS file
import { useAuth } from '../contexts/useAuth';
import { accountApi } from '../api/accountApi';

const ChangePasswordPage: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { user } = useAuth();

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!currentPassword) {
            newErrors.currentPassword = 'Mật khẩu hiện tại không được để trống.';
        }

        if (!newPassword) {
            newErrors.newPassword = 'Mật khẩu mới không được để trống.';
        } else if (newPassword.length < 5 || newPassword.length > 8) {
            newErrors.newPassword = 'Mật khẩu mới phải có từ 5 đến 8 ký tự.';
        }

        if (!confirmNewPassword) {
            newErrors.confirmNewPassword = 'Xác nhận mật khẩu mới không được để trống.';
        } else if (newPassword !== confirmNewPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setMessage(null); // Clear previous messages
        setErrors({});    // Clear previous errors

        if (!validateForm()) {
            setMessage({ type: 'error', text: 'Vui lòng kiểm tra lại các trường nhập liệu.' });
            return;
        }

        if (!user?.id) {
            setMessage({ type: 'error', text: 'Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.' });
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setMessage({ type: 'error', text: 'Không tìm thấy token đăng nhập.' });
            return;
        }

        try {
            await accountApi.changePassword(user.id, currentPassword, newPassword, token);
                setMessage({ type: 'success', text: 'Mật khẩu của bạn đã được thay đổi thành công!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
        } catch {
                setMessage({ type: 'error', text: 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại hoặc thử lại.' });
        }
    };

    return (
        <div className="change-password-page">
            <div className="password-card">
                <h2>Đổi mật khẩu</h2>
                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={errors.currentPassword ? 'input-error' : ''}
                        />
                        {errors.currentPassword && <p className="error-text">{errors.currentPassword}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={errors.newPassword ? 'input-error' : ''}
                        />
                        {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={errors.confirmNewPassword || errors.confirmPassword ? 'input-error' : ''}
                        />
                        {(errors.confirmNewPassword || errors.confirmPassword) && <p className="error-text">{errors.confirmNewPassword || errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className="submit-button">Đổi mật khẩu</button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;