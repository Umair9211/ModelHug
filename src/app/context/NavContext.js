"use client"; // required for context

import { createContext, useContext } from "react";
import { MODELS } from "@/app/models/config.js";

const NavContext = createContext();

export function NavProvider({ children }) {
 const navCategories = [
  {
    id: "text",
    label: "Text & Chat",
    items: [
      {
        name: "Text Generation",
        desc: MODELS["text-generation"].id,
        href: "/models/text-and-chat/text-generation",
        icon: "✍️",
        badge: "Hot",
      },
      {
        name: "Language Translation",
        desc: "Helsinki-NLP/opus-mt",
        href: "/models/text-and-chat/translation",
        icon: "🌐",
      },
      {
        name: "Emotion Detection",
        desc: MODELS["emotion"].id,
        href: "/models/text-and-chat/emotion",
        icon: "💜",
      },
    ],
  },
  {
    id: "vision",
    label: "Vision",
    items: [
      {
        name: "Image Generation",
        desc: "FLUX.1-schnell",
        href: "/models/vision/image-gen",
        icon: "🎨",
        badge: "New",
      },
      {
        name: "Object Detection",
        desc: "DETR ResNet-50",
        href: "/models/vision/detection",
        icon: "🔍",
      },
      {
        name: "Image Captioning",
        desc: "BLIP Large",
        href: "/models/vision/captioning",
        icon: "💬",
      },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    items: [
      {
        name: "Music Generation",
        desc: "MusicGen Small",
        href: "/models/audio/music",
        icon: "🎵",
      },
      {
        name: "Speech to Text",
        desc: "Whisper Large v3",
        href: "/models/audio/whisper",
        icon: "🎙️",
      },
    ],
  },
];

  return (
    <NavContext.Provider value={{ navCategories }}>
      {children}
    </NavContext.Provider>
  );
}

// custom hook (easy access)
export function useNav() {
  return useContext(NavContext);
}
