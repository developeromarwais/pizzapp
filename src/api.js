import axios from "axios";

const API_URL = "http://pizzapi.omarwais.com/api/";
// const API_URL = "http://127.0.0.1:8000/api/";

const apiCall = (url, method, data, config, callback, err) => {
  switch (method) {
    case "post":
    case "put":
      axios[method](`${API_URL}${url}`, data, config)
        .then((res) => {
          callback(res);
        })
        .catch((error) => {
          err(error);
        });
      break;
    case "get":
    case "delete":
      axios[method](`${API_URL}${url}`, config)
        .then((res) => {
          callback(res);
        })
        .catch((error) => {
          err(error);
        });
      break;
    default:
      err("method not allowed");
      break;
  }
};
export default apiCall;
