import axiosClient from './axiosClient';

const taskFileApi = {
  // GET /api/taskfile/:taskId/files — get all files of a task
  getFiles: (taskId) => axiosClient.get(`/taskfile/${taskId}/files`),

  // POST /api/taskfile/:taskId/files — upload files (multipart/form-data)
  upload: (taskId, files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return axiosClient.post(`/taskfile/${taskId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // DELETE /api/taskfile/files/:id — delete a file by id
  delete: (fileId) => axiosClient.delete(`/taskfile/files/${fileId}`),
};

export default taskFileApi;
