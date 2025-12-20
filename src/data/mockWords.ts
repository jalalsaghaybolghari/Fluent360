import appleImg from "../assets/images/apple.svg";
import beach from "../assets/images/beach.svg";
import bookImg from "../assets/images/book.svg";
import cat from "../assets/images/cat.svg";
import city from "../assets/images/city.svg";
import coffeeImg from "../assets/images/coffee.svg";
import dog from "../assets/images/dog.svg";
import east from "../assets/images/east.svg";
import expensive from "../assets/images/expensive.svg";
import flower from "../assets/images/flower.svg";
import fragile from "../assets/images/fragile.svg";
import friend from "../assets/images/friend.svg";
import generous from "../assets/images/generous.svg";
import moon from "../assets/images/moon.svg";
import mountain from "../assets/images/mountain.svg";
import music from "../assets/images/music.svg";
import rain from "../assets/images/rain.svg";
import river from "../assets/images/river.svg";
import snow from "../assets/images/snow.svg";
import study from "../assets/images/study.svg";
import sun from "../assets/images/sun.svg";
import travel from "../assets/images/travel.svg";
import tree from "../assets/images/tree.svg";
import victory from "../assets/images/victory.svg";
import { wordMeta } from "./wordMeta";

export type Word = {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  exampleSentence: string;
  imageUrl: string;
  imageAlt: string;
  audioPronunciationUrl: string;
  audioSentenceUrl: string;
};

const imageMap: Record<string, string> = {
  apple: appleImg,
  beach,
  book: bookImg,
  cat,
  city,
  coffee: coffeeImg,
  dog,
  east,
  expensive,
  flower,
  fragile,
  friend,
  generous,
  moon,
  mountain,
  music,
  rain,
  river,
  snow,
  study,
  sun,
  travel,
  tree,
  victory,
};

const altMap: Record<string, string> = {
  apple: "Red apple illustration",
  beach: "Sun over waves",
  book: "Open book",
  cat: "Cat face",
  city: "City skyline",
  coffee: "Coffee cup",
  dog: "Happy dog",
  east: "Sun rising over hills",
  expensive: "Shiny car",
  flower: "Flower bouquet",
  fragile: "Cracked glass label",
  friend: "Two smiling faces",
  generous: "Hands holding heart",
  moon: "Crescent moon",
  mountain: "Mountain peaks",
  music: "Musical note",
  rain: "Cloud with raindrops",
  river: "Curved river",
  snow: "Snowflake",
  study: "Notebook and pencil",
  sun: "Bright sun",
  travel: "Airplane icon",
  tree: "Green tree",
  victory: "Trophy",
};

const audioBase = (id: string) => ({
  audioPronunciationUrl: `${import.meta.env.BASE_URL ?? "/"}audio/pronunciation_${id}.wav`,
  audioSentenceUrl: `${import.meta.env.BASE_URL ?? "/"}audio/sentence_${id}.wav`,
});

export const words: Word[] = wordMeta.map((meta) => ({
  ...meta,
  imageUrl: imageMap[meta.id] ?? sun,
  imageAlt: altMap[meta.id] ?? `${meta.word} illustration`,
  ...audioBase(meta.id),
}));
