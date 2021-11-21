exports.handler = async (event, _context) => {
  const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

  const ACCESS_TOKEN = "PUT_YOUR_TOKEN_HERE";
  const ENDPOINT = "https://api.chunirec.net/2.0/records/showall.json";

  const userName = JSON.parse(event.body)["user_name"];

  const resp = await fetch(
    ENDPOINT + `?user_name=${userName}&region=jp2&token=${ACCESS_TOKEN}`
  );
  const json = await resp.json();

  return {
    statusCode: 200,
    body: JSON.stringify(json),
  };
};
