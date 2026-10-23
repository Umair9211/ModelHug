"use client";

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
          desc: MODELS["image-gen"].id,
          href: "/models/vision/image-gen",
          icon: "🎨",
          badge: "New",
        },
        {
          name: "Image Captioning",
          desc: MODELS["captioning"].id,
          href: "/models/vision/captioning",
          icon: "💬",
        },
        {
          name: "Object Detection",
          desc: MODELS["detection"].id,
          href: "/models/vision/object-detection",
          icon: "🔍",
        },
      ],
    },
    {
      id: "audio",
      label: "Audio",
      items: [
        {
          name: "Speech to Text",
          desc: MODELS["whisper"].id,
          href: "/models/audio/whisper",
          icon: "🎙️",
        },
        {
          name: "Text to Speech",          // type anything → hear it
          desc: MODELS["tts"].id,
          href: "/models/audio/tts",
          icon: "🔊",
          badge: "Fun",
        },
        {
          name: "Voice Emotion",           // listen voice → emotion
          desc: MODELS["audio-emotion"].id,
          href: "/models/audio/audio-emotion",
          icon: "🎭",
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

export function useNav() {
  return useContext(NavContext);
}