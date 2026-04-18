import axiosClient from '../api/axiosClient';

const userService = {
    // Lấy thông tin cá nhân
    getProfile: async () => {
        try {
            const response = await axiosClient.get('/User');
            return response;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    // Cập nhật thông tin cá nhân
    updateProfile: async (userData) => {
        try {
            const response = await axiosClient.put('/User', userData);
            return response;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    // Đổi mật khẩu
    changePassword: async (passwordData) => {
        try {
            const response = await axiosClient.put('/User/password', passwordData);
            return response;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }
};

export default userService;
