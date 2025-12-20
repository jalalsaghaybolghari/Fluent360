import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { wordMeta } from "../src/data/wordMeta.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const audioDir = path.join(projectRoot, "public", "audio");
const imagesDir = path.join(projectRoot, "src", "assets", "images");

const ensureDir = (p: string) => fs.mkdirSync(p, { recursive: true });
ensureDir(audioDir);

type VoiceBin = "espeak-ng" | "espeak" | null;

function detectEspeak(): VoiceBin {
  const bins: VoiceBin[] = ["espeak-ng", "espeak", null];
  for (const bin of bins) {
    if (!bin) continue;
    const result = spawnSync(bin, ["--version"], { stdio: "ignore" });
    if (result.status === 0) return bin;
  }
  return null;
}

function generateWithEspeak(bin: VoiceBin, text: string, output: string) {
  if (!bin) return false;
  const result = spawnSync(bin, ["-w", output, text], {
    stdio: "inherit",
  });
  return result.status === 0;
}

function generateBeep(output: string, seconds: number, freq = 880, amplitude = 20000) {
  const sampleRate = 44100;
  const frames = Math.floor(sampleRate * seconds);

  const header = Buffer.alloc(44);
  const dataSize = frames * 2;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  const data = Buffer.alloc(dataSize);
  for (let i = 0; i < frames; i++) {
    const sample =
      amplitude * Math.sin((2 * Math.PI * freq * i) / sampleRate);
    data.writeInt16LE(sample, i * 2);
  }

  fs.writeFileSync(output, Buffer.concat([header, data]));
}

function validateImages(ids: string[]) {
  const missing: string[] = [];
  ids.forEach((id) => {
    const imgPath = path.join(imagesDir, `${id}.svg`);
    if (!fs.existsSync(imgPath)) {
      missing.push(imgPath);
    }
  });
  if (missing.length) {
    console.warn("Missing image assets:", missing);
  }
}

async function main() {
  const bin = detectEspeak();
  console.log(
    bin
      ? `Using ${bin} for audio generation`
      : "espeak/espeak-ng not found; generating beep placeholders."
  );

  validateImages(wordMeta.map((w) => w.id));

  for (const entry of wordMeta) {
    const pronPath = path.join(audioDir, `pronunciation_${entry.id}.wav`);
    const sentencePath = path.join(audioDir, `sentence_${entry.id}.wav`);

    let pronOk = false;
    let sentOk = false;

    if (bin) {
      pronOk = generateWithEspeak(bin, entry.word, pronPath);
      sentOk = generateWithEspeak(bin, entry.exampleSentence, sentencePath);
    }

    if (!pronOk) {
      generateBeep(pronPath, 0.6, 900, 24000);
    }
    if (!sentOk) {
      generateBeep(sentencePath, 1.1, 650, 22000);
    }
    console.log(`Generated audio for ${entry.word}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
