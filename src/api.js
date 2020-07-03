import axios from "axios";

const API_URL = "http://pizzapi.omarwais.com/api/";

const apiCall = (url, method, data, config, callback, err) => {
  switch (method) {
    case "post":
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
