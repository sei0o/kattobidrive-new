const axios = require("axios");

exports.handler = async (event, _context) => {
  const ACCESS_TOKEN = "PUT_YOUR_TOKEN_HERE";
  const ENDPOINT = "https://api.chunirec.net/2.0/records/showall.json";

  const userName = JSON.parse(event.body)["user_name"];

  const resp = await axios.get(
    ENDPOINT + `?user_name=${userName}&region=jp2&token=${ACCESS_TOKEN}`
  );

  return {
    statusCode: 200,
    body: JSON.stringify(resp.data),
  };
};
