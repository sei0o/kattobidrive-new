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
  SSS: "red",
  AJC: "#e51188",
  EXP: "#ff0262",
  ULT: "#862333",
  FULLCHAIN: "#ff9c52",
};

const CACHE_ENDPOINT = "https://clever-hopper-c8bb47.netlify.app";

const generateFillTable = (records, tracks) => {
  generateForLevel(15, records, tracks);
  generateForLevel(14, records, tracks);
  generateForLevel(13, records, tracks);
  generateForLevel(12, records, tracks);
  generateForLevel(11, records, tracks);
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
      ret[lv][Math.floor((dic.const - lv) * 10)].push({
        id: id,
        diff: diff,
      });
    }
  }

  return ret;
};

const generateForLevel = (lv, records, tracks) => {
  let usedRow = 0; // 画像を入れた行の数
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

    // 見出し
    ctx.fillStyle = "#555";
    ctx.fillText((lv + dec * 0.1).toString(10), 10, topMargin + usedRow * 60); // 上にmargin 50, artworkは60x60px

    for (let k in tracks[lv][dec]) {
      let track = tracks[lv][dec][k];
      let artwork = new Image();

      // 60 * (i % 10): artworkを表示、60 + はマージン
      // usedRow * 60 ですでに使われた行から、さらに10曲で改行
      let imgX = 60 + 60 * (k % 10);
      let imgY = topMargin + 60 * (usedRow + Math.floor(k / 10));

      artwork.onload = () => {
        const record = records.find((a) => {
          return a.id === track.id && a.diff == track.diff;
        });
        drawArtwork(ctx, artwork, imgX, imgY, record, track);

        loadedImage++;
        if (loadedImage === tracksLen) {
          exportPNG(lv, canvas);
        }
      };

      artwork.src = `${CACHE_ENDPOINT}/covers/${track.id}.jpg`;
    }

    usedRow += Math.ceil(tracks[lv][dec].length / 10); // 10曲ごとに下の行へ改行
  }
};

const putMark = (ctx, x, y, result) => {
  ctx.fillStyle = colorForScore(result.score);
  ctx.fillRect(x, y, 30, 30);

  ctx.fillStyle = result.is_fullchain ? COLORS.FULLCHAIN : "white";

  ctx.font = "bold 30px Helvetica Neue";
  ctx.textBaseline = "top";

  if (result.is_alljustice) {
    ctx.fillText("A", x + 5, y);
  } else if (result.is_fullcombo) {
    ctx.fillText("F", x + 5, y);
  }
};

const exportPNG = (lv, canv) => {
  let elm = document.createElement("a");
  elm.href = canv.toDataURL();
  elm.download = `${lv}.png`;
  elm.innerHTML = `Lv${lv} をダウンロード`;
  document.body.append(elm);
  document.body.append(document.createElement("br"));
};

const drawArtwork = (ctx, artwork, x, y, result, track) => {
  if (result === undefined) ctx.globalAlpha = 0.5; // 未プレイ曲は半透明

  ctx.drawImage(artwork, x, y, 60, 60);

  if (result !== undefined) {
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
  ctx.fillText("CHUNITHMフィルテーブル", 10, 10);

  ctx.font = "10px Helvetica Neue";
  ctx.fillStyle = "#555";
  ctx.fillText("作り方は @kattobidrive を見てね!", 430, 20);

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

  ctx.fillStyle = COLORS.AJC;
  ctx.fillText("AJC", 210, 50);

  ctx.fillStyle = COLORS.FULLCHAIN;
  ctx.fillText("FULLCHAIN", 250, 50);

  ctx.fillStyle = "#333";
  ctx.fillText("AはAJ・FはFC", 360, 50);

  ctx.fillStyle = "#333";
  ctx.fillText("下線: ", 15, 80);

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
  const userName = document.getElementById("user_name").value;
  const records = await getRecords(userName);
  const tracksInResponse = await getTracks();
  const tracks = convertTracks(tracksInResponse);

  generateFillTable(records, tracks);
};

const btn = document.getElementById("generate");
btn.addEventListener("click", start);
