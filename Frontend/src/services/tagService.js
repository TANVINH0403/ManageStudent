import axiosClient from '../api/axiosClient';

const tagService = {
    // Lấy tất cả tag của user
    getAllTags: async () => {
        try {
            const response = await axiosClient.get('/Tag');
            return response;
        } catch (error) {
            console.error('Error fetching tags:', error);
            throw error;
        }
    },

    // Lấy tag theo ID
    getTagById: async (id) => {
        try {
            const response = await axiosClient.get(`/Tag/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching tag by ID:', error);
            throw error;
        }
    },

    // Tạo tag mới
    createTag: async (tagData) => {
        try {
            const response = await axiosClient.post('/Tag', tagData);
            return response;
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    },

    // Cập nhật tag
    updateTag: async (id, tagData) => {
        try {
            const response = await axiosClient.put(`/Tag/${id}`, tagData);
            return response;
        } catch (error) {
            console.error('Error updating tag:', error);
            throw error;
        }
    },

    // Xóa tag
    deleteTag: async (id) => {
        try {
            const response = await axiosClient.delete(`/Tag/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting tag:', error);
            throw error;
        }
    }
};

export default tagService;
