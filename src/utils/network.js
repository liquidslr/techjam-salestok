/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable indent */
import axios from 'axios';

export const TOKEN_TYPE = 'user-auth-token';

export const addClientIdToBody = (body) => {
  let env = process.env.TARGET_ENV;

  if (process.env.REACT_ENV) {
    env = process.env.REACT_ENV;
  }

  if (env == 'production') {
    return {
      ...body,
      client_id: process.env.REACT_APP_PRODUCTION_CLIENT_ID,
      client_secret: process.env.REACT_APP_PRODUCTION_CLIENT_SECRET,
    };
  }
  if (env == 'staging' || env == 'dev') {
    return {
      ...body,
      client_id: process.env.REACT_APP_STAGING_CLIENT_ID,
      client_secret: process.env.REACT_APP_STAGING_CLIENT_SECRET,
    };
  }
  return {
    ...body,
    client_id: process.env.REACT_APP_CLIENT_ID,
    client_secret: process.env.REACT_APP_CLIENT_SECRET,
  };
};

const getAuth = () => localStorage.getItem(TOKEN_TYPE);

export function request(
  method,
  url,
  data,
  authorized = true,
  contentType = 'application/json',
) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': contentType,
    };
    if (authorized) {
      headers.Authorization = `Bearer ${getAuth()}`;
    }
    axios({
      method,
      url,
      data,
      headers,
      responseType: 'text/json',
    })
      .then((res) => {
        console.log(res, "reposne")
        resolve(res);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          localStorage.removeItem(TOKEN_TYPE);
          // window.location.href = '/auth/login';
        }
        reject(err);
      });
  });
}

export const getErrorBody = (error) => {
  let response = {};
  try {
    response = error.response;
  } catch (err) {
    response = {};
  }
  response = response || {};
  const outputErrorBody = {
    ...response.data,
    status: response.status ? response.status : 408,
  };
  return outputErrorBody;
};

const get_base_api = () => {
  let env = process.env.TARGET_ENV;
  if (process.env.REACT_ENV) {
    env = process.env.REACT_ENV;
  }
  return 'http://localhost:8000';
};

export const BASE_API = get_base_api();

export const getUrl = (relUrl) => `${BASE_API}/api/${relUrl}`;
