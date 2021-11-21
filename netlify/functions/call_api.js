const axios = require("axios");

exports.handler = async (event, _context) => {
  //const ACCESS_TOKEN = "PUT_YOUR_TOKEN_HERE";
  const ACCESS_TOKEN =
    "f7ffdccb43c4483dd0b3f81384b20195ce65d1007737d6b72868f0c85b80cd193f72d6efba1065a3be13137026ea1a3b5a74e5dcbc5478e5d9a6f0b1e2690ae3";
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
