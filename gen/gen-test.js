const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const outDir = path.join(__dirname, "output");

const CHAR = `Main character: a friendly Japanese man in his late 20s named Yuta, short slightly messy black hair, round glasses, a beige crew-neck sweater, expressive cartoon face. Keep him visually consistent.`;

const yonkoma = `Bright, cheerful, pop Japanese manga in a clean modern webtoon style, soft cel shading, friendly rounded line art.
Vertical 4-panel manga strip (4コマ), 9:16, panels stacked top-to-bottom with thin rounded white gutters.
Warm cheerful palette: sunny yellow and cream background tones, with warm orange-clay accents.
${CHAR}

Panel 1: Yuta stands in front of a small group of people, looking nervous with a sweat drop, an awkward silence. Small speech bubble text: 「し、シーン…」
Panel 2: Close-up of Yuta looking down, troubled. Thought bubble text: 「うまく話さなきゃ…」
Panel 3: A friendly mentor man (brown cap, glasses, white tee, warm smile) gives a relaxed thumbs-up. His speech bubble text: 「笑わせなくていいんだよ」
Panel 4: Yuta smiling, relaxed and relieved, the group around him also smiling warmly. Yuta's small bubble: 「ラクになった！」

All Japanese text inside the speech bubbles must be rendered EXACTLY and legibly, clean handwritten-style manga lettering. Keep bubbles uncluttered. No watermark, no logo, no extra text.`;

const heroIll = `Bright, cheerful, pop Japanese illustration in a clean modern flat style with soft shading, friendly and approachable.
9:16 vertical composition. Sunny warm yellow and cream background. NO text anywhere (text will be added later).
${CHAR}
Scene: Yuta stands on a small simple stage under a warm spotlight, slightly nervous but hopeful, a few friendly cartoon audience silhouettes in the foreground from behind. Leave generous empty space in the upper third for a title to be added later. Cheerful, inviting, pop poster style. No text, no speech bubbles, no logo.`;

async function gen(name, prompt) {
  const res = await ai.models.generateContent({
    model: "nano-banana-pro-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseModalities: ["image", "text"], imageConfig: { aspectRatio: "9:16" } },
  });
  for (const p of (res.candidates?.[0]?.content?.parts || [])) {
    if (p.inlineData) { fs.writeFileSync(path.join(outDir, `${name}.jpeg`), Buffer.from(p.inlineData.data, "base64")); console.log("OK", name); return; }
  }
  console.error("NO IMAGE", name);
}
(async () => { await Promise.allSettled([gen("test_4koma", yonkoma), gen("test_hero", heroIll)]); console.log("DONE"); })();
