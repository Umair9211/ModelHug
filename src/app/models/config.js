// Centralized model configuration
// This file contains all model definitions used across the app

export const TRANSLATION_LANGUAGES = [
  { code: "fr", label: "French"     },
  { code: "de", label: "German"     },
  { code: "es", label: "Spanish"    },
  { code: "ar", label: "Arabic"     },
  { code: "zh", label: "Chinese"    },
  { code: "ru", label: "Russian"    },
  { code: "tr", label: "Turkish"    },
  { code: "ur", label: "Urdu"       },
  { code: "hi", label: "Hindi"      },
  { code: "it", label: "Italian"    },
  { code: "nl", label: "Dutch"      },
  { code: "ja", label: "Japanese"   },
];

export const MODELS = {
  "text-generation": {
    id: "meta-llama/Llama-3.1-8B-Instruct",
    type: "chat",
    systemPrompt: "You are a helpful assistant.",
  },
  // translation model id is built dynamically from targetLang
  "translation": {
    type: "translation",
  },
  "emotion": {
    id: "j-hartmann/emotion-english-distilroberta-base",
    type: "classification",
  },
  // Future models can be added here, e.g.:
  // "image-gen": {
  //   id: "blackforestlabs/FLUX.1-schnell",
  //   type: "image-generation",
  // },
};