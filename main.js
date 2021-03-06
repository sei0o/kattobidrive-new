const COLORS = {
  D: "rgba(0,0,0,0)",
  C: "rgba(0,0,0,0)",
  B: "rgba(0,0,0,0)",
  BB: "rgba(0,0,0,0)",
  BBB: "rgba(0,0,0,0)",
  A: "rgba(0,0,0,0)",
  AA: "rgba(0,0,0,0)",
  AAA: "rgba(0,0,0,0)",
  S: "#6146d2",
  SP: "#482db8",
  SS: "#20af75",
  SSP: "#136745",
  SSS: "#d30000",
  SSSP: "#b40000",
  AJC: "#e51188",
  EXP: "#ff0262",
  ULT: "#862333",
  FULLCHAIN: "#ff9c52",
};

const CACHE_ENDPOINT = "https://clever-hopper-c8bb47.netlify.app";

const resultsEl = document.getElementById("results");

const generateFillTable = (records, tracks) => {
  generateForLevel(15, records, tracks, false);
  generateForLevel(14, records, tracks, false);
  generateForLevel(13, records, tracks, false);
  generateForLevel(12, records, tracks, false);
  generateForLevel(11, records, tracks, false);
};

const generateTemplate = (tracks) => {
  return [
    generateForLevel(15, [], tracks, true),
    generateForLevel(14, [], tracks, true),
    generateForLevel(13, [], tracks, true),
    generateForLevel(12, [], tracks, true),
    generateForLevel(11, [], tracks, true),
  ];
};

const generateOnTemplate = (records, tracks) => {
  generateOnTemplateForLevel(15, records, tracks);
  generateOnTemplateForLevel(14, records, tracks);
  generateOnTemplateForLevel(13, records, tracks);
  generateOnTemplateForLevel(12, records, tracks);
  generateOnTemplateForLevel(11, records, tracks);
};

const convertTracks = (tracks, excludeExp) => {
  const ret = [];

  // For example, ret[13][9] should contain tracks with constant 13.9
  for (let i = 1; i <= 15; i++) {
    ret[i] = [];
    for (let k = 0; k <= 9; k++) {
      ret[i][k] = [];
    }
  }

  for (const track of tracks) {
    const id = track.meta.id;
    for (const diff of ["EXP", "MAS", "ULT"]) {
      if (diff === "EXP" && excludeExp) continue;

      const dic = track.data[diff];
      if (dic === undefined || dic.const === 0 || dic.is_const_unknown === 1)
        continue;

      const lv = Math.floor(dic.level);
      const sp = dic.const.toString().split(".");
      const dec = sp.length === 2 ? parseInt(sp[1]) : 0;
      console.log(lv, dec);
      ret[lv][dec].push({
        id: id,
        diff: diff,
      });
    }
  }

  return ret;
};

const generateForLevel = (lv, records, tracks, generateTemplate) => {
  let usedRow = 0; // ???????????????????????????
  let loadedImage = 0;
  const topMargin = 110;

  const tracksLen = tracks[lv].flat().length;
  const rowsRequired = tracks[lv]
    .map((tracksInConst, _idx, _arr) => Math.ceil(tracksInConst.length / 10.0))
    .reduce((sum, cur) => sum + cur, 0);

  const height = 150 + rowsRequired * 60;
  const canvas = setupCanvas(700, height);
  document.body.append(canvas);

  const ctx = canvas.getContext("2d");

  drawInfo(ctx);

  for (let dec = 9; dec >= 0; dec--) {
    if (tracks[lv][dec].length === 0) continue;

    // ?????????
    ctx.fillStyle = "#555";
    ctx.fillText((lv + dec * 0.1).toString(10), 10, topMargin + usedRow * 60); // ??????margin 50, artwork???60x60px

    for (let k in tracks[lv][dec]) {
      let track = tracks[lv][dec][k];
      let artwork = new Image();

      // 60 * (i % 10): artwork????????????60 + ???????????????
      // usedRow * 60 ?????????????????????????????????????????????10????????????
      let imgX = 60 + 60 * (k % 10);
      let imgY = topMargin + 60 * (usedRow + Math.floor(k / 10));

      artwork.crossOrigin = "*";
      artwork.onload = () => {
        if (generateTemplate) {
          drawArtwork(
            ctx,
            artwork,
            imgX,
            imgY,
            undefined,
            track,
            generateTemplate
          );
        } else {
          const record = records.find((a) => {
            return a.id === track.id && a.diff == track.diff;
          });
          drawArtwork(
            ctx,
            artwork,
            imgX,
            imgY,
            record,
            track,
            generateTemplate
          );
        }

        loadedImage++;
        if (loadedImage === tracksLen) {
          exportPNG(lv, canvas);
        }
      };

      artwork.src = `${CACHE_ENDPOINT}/covers/${track.id}.jpg`;
    }

    usedRow += Math.ceil(tracks[lv][dec].length / 10); // 10??????????????????????????????
  }
};

const generateOnTemplateForLevel = (lv, records, tracks) => {
  let usedRow = 0; // ???????????????????????????
  const topMargin = 110;

  const rowsRequired = tracks[lv]
    .map((tracksInConst, _idx, _arr) => Math.ceil(tracksInConst.length / 10.0))
    .reduce((sum, cur) => sum + cur, 0);

  const height = 150 + rowsRequired * 60;
  const canvas = setupCanvas(700, height);
  document.body.append(canvas);

  const ctx = canvas.getContext("2d");

  const template = new Image();
  template.onload = () => {
    ctx.drawImage(template, 0, 0);

    for (let dec = 9; dec >= 0; dec--) {
      if (tracks[lv][dec].length === 0) continue;

      for (let k in tracks[lv][dec]) {
        let track = tracks[lv][dec][k];

        // 60 * (i % 10): artwork????????????60 + ???????????????
        // usedRow * 60 ?????????????????????????????????????????????10????????????
        let imgX = 60 + 60 * (k % 10);
        let imgY = topMargin + 60 * (usedRow + Math.floor(k / 10));

        const record = records.find((a) => {
          return a.id === track.id && a.diff == track.diff;
        });

        if (record === undefined) {
          ctx.fillStyle = "rgba(255, 255,255, 0.7)";
          ctx.fillRect(imgX, imgY, 60, 60);
        } else {
          putMark(ctx, imgX, imgY, record);
        }
      }

      usedRow += Math.ceil(tracks[lv][dec].length / 10); // 10??????????????????????????????
    }

    exportPNG(lv, canvas);
  };

  //template.src = `${CACHE_ENDPOINT}/templates/${lv}.png`;
  template.src = `/templates/${lv}.png`;
};

const putMark = (ctx, x, y, record) => {
  ctx.fillStyle = colorForScore(record.score);
  ctx.fillRect(x, y, 30, 30);

  ctx.fillStyle = record.is_fullchain ? COLORS.FULLCHAIN : "white";

  ctx.font = "bold 30px Helvetica Neue";
  ctx.textBaseline = "top";

  if (record.is_alljustice) {
    ctx.fillText("A", x + 5, y);
  } else if (record.is_fullcombo) {
    ctx.fillText("F", x + 5, y);
  }
};

const exportPNG = (lv, canv) => {
  let elm = document.createElement("a");
  elm.href = canv.toDataURL();
  elm.download = `${lv}.png`;
  elm.innerHTML = `Lv${lv} ?????????????????????`;
  resultsEl.append(elm);
  resultsEl.append(document.createElement("br"));
};

const drawArtwork = (ctx, artwork, x, y, result, track, generateTemplate) => {
  if (result === undefined && !generateTemplate) ctx.globalAlpha = 0.5; // ???????????????????????????

  ctx.drawImage(artwork, x, y, 60, 60);

  if (result !== undefined && !generateTemplate) {
    putMark(ctx, x, y, result);
  }

  if (track.diff === "EXP") {
    ctx.fillStyle = COLORS.EXP;
    ctx.fillRect(x, y + 50, 60, 10);
  }

  if (track.diff === "ULT") {
    ctx.fillStyle = COLORS.ULT;
    ctx.fillRect(x, y + 50, 60, 10);
  }

  ctx.globalAlpha = 1.0;
};

const drawInfo = (ctx) => {
  ctx.font = "30px Helvetica Neue";
  ctx.fillStyle = "#333";
  ctx.textBaseline = "top";
  ctx.fillText("CHUNITHM?????????????????????", 10, 10);

  ctx.font = "10px Helvetica Neue";
  ctx.fillStyle = "#555";
  ctx.fillText("???????????? @kattobidrive ????????????!", 470, 20);

  ctx.font = "18px Helvetica Neue";

  ctx.fillStyle = COLORS.S;
  ctx.fillText("S", 20, 50);

  ctx.fillStyle = COLORS.SP;
  ctx.fillText("S+", 50, 50);

  ctx.fillStyle = COLORS.SS;
  ctx.fillText("SS", 90, 50);

  ctx.fillStyle = COLORS.SSP;
  ctx.fillText("SS+", 130, 50);

  ctx.fillStyle = COLORS.SSS;
  ctx.fillText("SSS", 170, 50);

  ctx.fillStyle = COLORS.SSSP;
  ctx.fillText("SSS+", 210, 50);

  ctx.fillStyle = COLORS.AJC;
  ctx.fillText("AJC", 260, 50);

  ctx.fillStyle = COLORS.FULLCHAIN;
  ctx.fillText("FULLCHAIN", 300, 50);

  ctx.fillStyle = "#333";
  ctx.fillText("A???AJ???F???FC", 410, 50);

  ctx.fillStyle = "#333";
  ctx.fillText("??????: ", 15, 80);

  ctx.fillStyle = COLORS.EXP;
  ctx.fillText("EXPERT", 75, 80);

  ctx.fillStyle = COLORS.ULT;
  ctx.fillText("ULTIMA", 155, 80);
};

const setupCanvas = (width, height) => {
  let canvas = document.createElement("canvas");
  canvas.style.display = "none";
  let ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
};

const colorForScore = (score) => {
  if (score == 1010000) return COLORS.AJC;
  if (score >= 1009000) return COLORS.SSSP;
  if (score >= 1007500) return COLORS.SSS;
  if (score >= 1005000) return COLORS.SSP;
  if (score >= 1000000) return COLORS.SS;
  if (score >= 990000) return COLORS.SP;
  if (score >= 975000) return COLORS.S;
  if (score >= 950000) return COLORS.AAA;
  if (score >= 925000) return COLORS.AA;
  if (score >= 900000) return COLORS.A;
  if (score >= 800000) return COLORS.BBB;
  if (score >= 700000) return COLORS.BB;
  if (score >= 600000) return COLORS.B;
  if (score >= 500000) return COLORS.C;
  return COLORS.D;
};

const getRecords = async (userName) => {
  const json = await fetch("/.netlify/functions/call_api", {
    method: "POST",
    body: JSON.stringify({ user_name: userName }),
  });

  return (await json.json()).records;
};

// For debugging purpose
/*
const getRecords = async (userName) => {
  const ACCESS_TOKEN = "PUT_YOUR_TOKEN_HERE";
  const ENDPOINT = "https://api.chunirec.net/2.0/records/showall.json";

  const resp = await fetch(
    ENDPOINT + `?user_name=${userName}&region=jp2&token=${ACCESS_TOKEN}`
  );
  return (await resp.json()).records;
};
*/

const getTracks = async () => {
  const resp = await fetch(`${CACHE_ENDPOINT}/tracks.json`);
  return await resp.json();
};

const start = async () => {
  resultsEl.innerHTML = "";

  const userName = document.getElementById("user_name").value;
  const records = await getRecords(userName);
  const tracksInResponse = await getTracks();
  const tracks = convertTracks(tracksInResponse, false);

  //generateFillTable(records, tracks, false);
  generateOnTemplate(records, tracks);
};

const startConst = async () => {
  resultsEl.innerHTML = "";

  const tracksInResponse = await getTracks();
  const tracks = convertTracks(tracksInResponse, false);

  return generateTemplate(tracks);
};

const btn = document.getElementById("generate");
btn.addEventListener("click", start);
