import axiosClient from '../api/axiosClient';

const fileService = {
    // Lấy danh sách file của một task
    getTaskFiles: async (taskId) => {
        try {
            const response = await axiosClient.get(`/TaskFile/${taskId}/files`);
            return response;
        } catch (error) {
            console.error('Error fetching task files:', error);
            throw error;
        }
    },

    // Upload files cho một task
    uploadFiles: async (taskId, files) => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            const response = await axiosClient.post(`/TaskFile/${taskId}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
        }
    },

    // Xóa file theo ID
    deleteFile: async (fileId) => {
        try {
            const response = await axiosClient.delete(`/TaskFile/files/${fileId}`);
            return response;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};

export default fileService;
