import api from './api'

export const personalFileService = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // api interceptor will automatically unwrap the ApiResponse.data
    const response = await api.post('/personal-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response
  },

  getUserFiles: async () => {
    const response = await api.get('/personal-files')
    return response
  },

  deleteFile: async (id) => {
    await api.delete(`/personal-files/${id}`)
  },

  getViewUrl: (id) => {
    const baseUrl = api.defaults.baseURL || '/api/v1'
    return `${baseUrl}/personal-files/${id}/view`
  },

  fetchFileBlob: async (id) => {
    // Note: Use axios defaults or similar if needed, but here we want the raw response for blob
    // However, our interceptor might interfere if it looks like an ApiResponse
    // But since it's a blob, response.data will be a Blob object, not a JSON
    const response = await api.get(`/personal-files/${id}/view`, {
      responseType: 'blob'
    })
    
    // If it's a blob, the interceptor shouldn't have unwrapped it (no .hasOwnProperty('success'))
    // Wait, axios response object has 'data' property.
    // My interceptor checks response.data.hasOwnProperty('success').
    // Blob doesn't have hasOwnProperty('success').
    
    return {
      blobUrl: URL.createObjectURL(response.data),
      type: response.headers['content-type']
    }
  }
}
