import axios from 'axios';

export const swedbankPayPost = async <T>(
  payload: T,
  endpoint: string,
  token: string,
) => {
  try {
    const res = await axios.post(
      `https://${process.env.PAY_BASE_URL}${endpoint}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.data;
    return data;
  } catch (error) {
    return error;
  }
};

export const swedbankPayGet = async (endpoint: string, token: string) => {
  try {
    const res = await axios.get(
      `https://${process.env.PAY_BASE_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.data;
    return data;
  } catch (error) {
    return error;
  }
};
