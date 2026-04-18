import axiosClient from '../api/axiosClient';

const boardService = {
    // Lấy dữ liệu bảng Board (tổng hợp Kanban)
    getBoardData: async () => {
        try {
            const response = await axiosClient.get('/Board/board');
            return response;
        } catch (error) {
            console.error('Error fetching board data:', error);
            throw error;
        }
    }
};

export default boardService;
