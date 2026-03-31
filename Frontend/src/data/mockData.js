// src/data/mockData.js
export const mockUser = {
  id: 1,
  username: "Student_Pro",
  email: "student@university.edu.vn",
  avatar: "https://i.pravatar.cc/150?img=11"
};

export const mockCategories = [
  { id: 1, name: "Đồ án chuyên ngành", color: "#3b82f6" },
  { id: 2, name: "Bài tập về nhà", color: "#f59e0b" },
  { id: 3, name: "Hoạt động ngoại khóa", color: "#10b981" }
];

export const mockTasks = [
  {
    id: 1,
    title: "Thiết kế Database cho Manage Student",
    description: "Vẽ ERD và viết script SQL",
    categoryId: 1,
    deadline: "2026-04-05T10:00:00",
    priority: "High",
    status: "In Progress"
  },
  {
    id: 2,
    title: "Làm slide báo cáo giữa kỳ",
    description: "Gồm 15 slide tóm tắt tiến độ",
    categoryId: 2,
    deadline: "2026-04-10T23:59:00",
    priority: "Medium",
    status: "Pending"
  }
];