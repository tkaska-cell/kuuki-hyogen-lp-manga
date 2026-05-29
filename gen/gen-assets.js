const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const outDir = path.join(__dirname, "output");

const STYLE = `Bright, cheerful, pop Japanese illustration, clean modern flat style with soft cel shading, friendly rounded line art, sunny warm yellow and cream palette with warm orange-clay accents. Simple and inviting. NO text, NO speech bubbles, NO logo, NO watermark.`;

const YUTA = `a friendly Japanese man in his late 20s, short slightly messy black hair, round glasses, a beige crew-neck sweater`;
const HIRO = `a warm friendly Japanese man, brown baseball cap, round glasses, white t-shirt, gentle confident smile, like a comedian-turned-mentor`;

const assets = [
  { name: "hero_illust", ar: "9:16", p: `${STYLE}
9:16 vertical poster composition. ${YUTA} stands on a small simple stage under a warm cheerful spotlight, looking a little nervous but hopeful, waving shyly. A few friendly cartoon audience silhouettes from behind in the foreground. Leave the TOP THIRD as open sunny sky space for a title to be added later. Pop, inviting.` },
  { name: "hiroshi_char", ar: "1:1", p: `${STYLE}
1:1 square. Upper-body portrait of ${HIRO}, giving a friendly thumbs-up with one hand, warm encouraging smile, on a plain soft pale-yellow background. Pop mascot-like, approachable.` },
  { name: "yuta_worried", ar: "1:1", p: `${STYLE}
1:1 square. Upper-body of ${YUTA} looking anxious and troubled with a single small sweat drop, awkward worried smile, on a plain pale cream background.` },
  { name: "yuta_happy", ar: "1:1", p: `${STYLE}
1:1 square. Upper-body of ${YUTA} with a bright relieved happy smile, relaxed and confident, a little sparkle, on a plain pale-yellow background.` },
  { name: "group_warm", ar: "4:3", p: `${STYLE}
4:3 landscape. A small group of 4 diverse friendly people sitting in a relaxed circle, chatting and smiling warmly, cozy and light atmosphere, warm yellow tones. Pop flat illustration.` },
  { name: "price_pop", ar: "1:1", p: `${STYLE}
1:1 square. A cheerful burst / starburst shape in warm yellow and orange-clay with confetti and sparkles, an empty center area (for a price number to be added later), pop and exciting, celebratory. NO text, NO numbers.` },
];

async function gen(a) {
  try {
    const res = await ai.models.generateContent({
      model: "nano-banana-pro-preview",
      contents: [{ role: "user", parts: [{ text: a.p }] }],
      config: { responseModalities: ["image", "text"], imageConfig: { aspectRatio: a.ar } },
    });
    for (const p of (res.candidates?.[0]?.content?.parts || [])) {
      if (p.inlineData) { fs.writeFileSync(path.join(outDir, `${a.name}.jpeg`), Buffer.from(p.inlineData.data, "base64")); console.log("OK", a.name); return; }
    }
    console.error("NO IMAGE", a.name);
  } catch (e) { console.error("ERR", a.name, e.message); }
}
(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? assets.filter(a => only.includes(a.name)) : assets;
  for (let i = 0; i < list.length; i += 3) await Promise.allSettled(list.slice(i, i+3).map(gen));
  console.log("DONE");
})();
