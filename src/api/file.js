import axios from 'axios';

export const uploadFile_post = async (token, file) => {
  const response = await axios.post(`${process.env.VUE_APP_BASE_API}/file/upload`,
    file, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};