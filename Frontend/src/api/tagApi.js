import axiosClient from './axiosClient';

const tagApi = {
  // GET /api/tag — get all tags for current user
  getAll: () => axiosClient.get('/tag'),

  // POST /api/tag — create new tag
  create: (data) => axiosClient.post('/tag', data),
  // data: { tagName }

  // PUT /api/tag/:id — update tag
  update: (id, data) => axiosClient.put(`/tag/${id}`, data),

  // DELETE /api/tag/:id — delete tag
  delete: (id) => axiosClient.delete(`/tag/${id}`),
};

export default tagApi;
