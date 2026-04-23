// src/data/mockData.js
export const mockCategories = [
    { id: 1, name: 'Chuyên ngành', color: '#3b82f6' },
    { id: 2, name: 'Đại cương', color: '#10b981' },
    { id: 3, name: 'Đồ án', color: '#8b5cf6' },
    { id: 4, name: 'Hoạt động ngoại khóa', color: '#f59e0b' }
  ];

  export const mockTasks = [
    {
      id: 1,
      title: 'Thiết kế Database cho Manage Student',
      categoryId: 1,
      deadline: '2024-04-15', // Cập nhật lại năm
      createdAt: '2024-04-01', // Ngày giao
      priority: 'High',
      status: 'In Progress',
      description: 'Hoàn thành ERD và lược đồ quan hệ.',
    },
    {
      id: 2,
      title: 'Làm slide báo cáo giữa kỳ',
      categoryId: 2,
      deadline: '2024-04-20',
      createdAt: '2024-04-05',
      priority: 'Medium',
      status: 'Pending',
      description: 'Soạn 15 slide về chủ đề triết học Mác.',
    },
    {
      id: 3,
      title: 'Đọc tài liệu React Hooks',
      categoryId: 1,
      deadline: '2024-04-18',
      createdAt: '2024-04-10',
      priority: 'Low',
      status: 'Pending',
      description: 'Đọc chương useEffect và useState.',
    },
    {
      id: 4,
      title: 'Họp nhóm môn Công nghệ phần mềm',
      categoryId: 1,
      deadline: '2024-04-12', // Trễ hạn
      createdAt: '2024-04-08',
      priority: 'High',
      status: 'Pending',
      description: 'Chốt requirements cho đồ án.',
    },
    {
      id: 5,
      title: 'Nộp bài tập Tiếng Anh',
      categoryId: 2,
      deadline: '2024-03-25', // Task cũ đã hoàn thành
      createdAt: '2024-03-20',
      priority: 'Medium',
      status: 'Completed',
      description: 'Làm bài trắc nghiệm Unit 5.',
    },
    {
      id: 6,
      title: 'Viết báo cáo thực tập',
      categoryId: 3,
      deadline: '2024-05-10',
      createdAt: '2024-04-12',
      priority: 'High',
      status: 'In Progress',
      description: 'Chương 1 và Chương 2.',
    },
    {
      id: 7,
      title: 'Tham gia hội thảo IT',
      categoryId: 4,
      deadline: '2024-04-25',
      createdAt: '2024-04-10',
      priority: 'Low',
      status: 'Pending',
      description: 'Đăng ký vé tại nhà thi đấu.',
    },
    {
      id: 8,
      title: 'Code UI cho trang Dashboard',
      categoryId: 1,
      deadline: '2024-02-15',
      createdAt: '2024-02-01',
      priority: 'High',
      status: 'Completed',
      description: 'Hoàn thiện bằng React và CSS thuần.',
    },
    {
      id: 9,
      title: 'Làm bài test Kỹ năng mềm',
      categoryId: 2,
      deadline: '2024-03-10',
      createdAt: '2024-03-01',
      priority: 'Medium',
      status: 'Completed',
      description: 'Đạt điểm trên 80/100.',
    },
    {
      id: 10,
      title: 'Setup Redux cho dự án',
      categoryId: 1,
      deadline: '2024-04-16',
      createdAt: '2024-04-10',
      priority: 'High',
      status: 'In Progress',
      description: 'Cấu hình store, slice và provider.',
    }
  ];
  // Thêm đoạn này vào dưới cùng của file src/data/mockData.js

export const mockUser = {
  name: 'Student_Pro',
  role: 'Student',
  avatar: 'https://i.pravatar.cc/150?u=student_pro' // Link ảnh avatar giả lập
};