const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const outDir = path.join(__dirname, "output");

const STYLE = `Bright, cheerful, pop Japanese manga / webtoon style hero image, clean modern flat illustration with soft cel shading, friendly rounded line art. Sunny warm yellow and cream palette with warm orange-clay accents. 9:16 vertical.
Character "Yuta": a Japanese man in his late 20s, short slightly messy black hair, round glasses, beige crew-neck sweater (keep him consistent in both halves).
All Japanese text must be rendered EXACTLY as specified, large and perfectly legible with bold rounded-gothic manga lettering, no garbling. Do NOT add any other text. No watermark, no logo.`;

const v1 = `${STYLE}

Layout (top to bottom):
1) A small rounded badge near the top with text: 元お笑い芸人が、たどり着いた答え
2) A HUGE bold headline, near-black with a thick white outline, the largest text on the image: 笑わせなくていい。
3) A clear BEFORE → AFTER comparison occupying the lower 60%, split left/right with a big bold orange arrow in the middle pointing right:
   - LEFT (cool, slightly grey, tense): Yuta sweating and stiff in front of a cold, silent small audience. A small tag label on this side reads: BEFORE
   - Under the left tag, a short line: 人前で、消耗…
   - RIGHT (bright, warm, sparkly, cheerful): Yuta relaxed and smiling, a small friendly audience smiling warmly around him. A small tag label on this side reads: AFTER
   - Under the right tag, a short line: 空気が、味方に！
Punchy, high-impact, uncluttered.`;

const v2 = `${STYLE}

Layout: a vertical BEFORE / AFTER stacked comparison.
- TOP HALF (labeled with a tag: BEFORE / 人前で、消耗…): cool grey-tinted, Yuta sweating, tense, an awkward silence with a tiny speech bubble: シーン…
- A big bold downward orange arrow in the center.
- BOTTOM HALF (labeled with a tag: AFTER / 空気が、味方に！): bright warm sunny, Yuta relaxed and beaming, a small audience smiling warmly.
- Across the very bottom, a HUGE bold headline band, near-black text on a yellow ribbon with white outline: 笑わせなくていい。
High-impact, clean, pop.`;

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
(async () => { await Promise.allSettled([gen("hero_ba1", v1), gen("hero_ba2", v2)]); console.log("DONE"); })();
