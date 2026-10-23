# ModelHug — Multimodal AI Playground

ModelHug is a web-based AI playground that brings multiple Hugging Face models together in one interface. It allows users to explore text generation, translation, emotion classification, image generation, computer vision, and audio processing without building separate applications for each task.

Built with Next.js and React, ModelHug provides a responsive interface for interacting with pretrained AI models through the Hugging Face Inference API.

## Features

### Natural Language Processing
- **Text Generation:** Generate text using instruction-following language models.
- **Text Translation:** Translate text using pretrained translation models.
- **Emotion Classification:** Analyze text to identify its associated emotion.

### Computer Vision and Image Generation
- **Image Generation:** Generate images from text prompts.
- **Image Captioning:** Generate descriptive captions for images.
- **Object Detection:** Identify and visualize detected objects in uploaded images.

### Audio Processing
- **Speech-to-Text:** Convert audio into written text.
- **Text-to-Speech:** Generate speech from text.
- **Audio Emotion Recognition:** Analyze audio to identify emotional characteristics.
- **Audio Input:** Support audio uploads and microphone-based recording where available.

### User Interface
- Responsive interface built with Next.js and React.
- Dedicated interfaces for different AI tasks.
- Image upload, preview, and object-detection visualization.
- Audio upload, recording, and playback functionality.
- Centralized model configuration for easier maintenance.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework and server-side API routes |
| React | Component-based user interface |
| JavaScript | Application logic |
| Hugging Face Inference API | Access to pretrained AI models |
| REST APIs | Communication between the application and AI services |
| React Bootstrap | UI components |
| Bootstrap 5 | Responsive layout and styling |
| CSS | Custom interface styling |
| Environment Variables | Secure configuration of API credentials |

## AI Models

ModelHug integrates pretrained models for different AI tasks.

| Task | Model |
|---|---|
| Text Generation | Llama 3.1 8B Instruct |
| Translation | Helsinki-NLP translation models |
| Text Emotion Classification | DistilRoBERTa emotion classifier |
| Image Generation | FLUX.1-schnell |
| Image Captioning | Qwen2.5-VL |
| Object Detection | DETR ResNet-50 |
| Speech-to-Text | Whisper large-v3-turbo |
| Text-to-Speech | MMS-TTS |
| Audio Emotion Recognition | wav2vec2-based emotion recognition model |

**Note:** Model availability, inference requirements, and supported inputs depend on the selected Hugging Face model and the availability of the corresponding inference service.

## Architecture Overview

ModelHug uses a client-server architecture to connect its web interface to external AI inference services.

1. **User Interface:** React components provide forms and controls for text, image, and audio inputs.
2. **Next.js API Routes:** Server-side endpoints handle requests to the AI inference service.
3. **Hugging Face Inference API:** Requests are sent to the configured pretrained models.
4. **Response Processing:** The application processes the returned results and presents generated text, classifications, images, captions, detections, or audio to the user.

The Hugging Face API token is configured as a server-side environment variable rather than being embedded directly in client-side code.

## Getting Started

### Prerequisites

Before running ModelHug locally, ensure you have:

- Node.js installed.
- npm installed.
- A Hugging Face account and API token.
- Access to the inference models you intend to use.

### 1. Clone the Repository

```bash
git clone https://github.com/Umair9211/ModelHug.git
cd ModelHug
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
HF_API_KEY=your_hugging_face_api_token
```

Replace `your_hugging_face_api_token` with your actual Hugging Face API token.

**Security:** Never commit `.env.local` or expose your API token in browser-side JavaScript. Ensure environment files containing secrets are excluded through `.gitignore`.

### 4. Start the Development Server

```bash
npm run dev
```

Open the following address in your browser:

```text
http://localhost:3000
```

You can now explore the available AI tools through the application interface.

### 5. Build for Production

To create a production build:

```bash
npm run build
```

To start the production server after a successful build:

```bash
npm start
```

## Configuration

ModelHug uses the Hugging Face Inference API to access pretrained models.

When configuring or extending the application, verify the following:

- The API token is valid and has the necessary permissions.
- The selected model is available through the inference service.
- The model supports the required input and output formats.
- The relevant API route points to the correct model and endpoint.
- Error handling accounts for unavailable models, rate limits, and unsuccessful requests.

Model inference may require additional time or resources depending on the model, input size, and service availability.

## Project Structure

The application uses the Next.js App Router. A simplified representation of the expected project structure is shown below; exact filenames may vary.

```text
ModelHug/
├── app/
│   ├── api/          # Server-side API routes
│   ├── ...           # Application pages and layouts
├── public/           # Static assets
├── .env.local        # Local environment variables (not committed)
├── package.json      # Dependencies and scripts
└── README.md
```

## Security Considerations

- Keep API credentials on the server.
- Store secrets in environment variables.
- Never commit API tokens or other sensitive credentials.
- Validate user inputs before sending requests to external inference services.
- Handle API errors without exposing sensitive configuration details.
- Be mindful of API usage limits and any associated inference costs.

## Limitations

- Model availability depends on Hugging Face's inference infrastructure and the selected model.
- Some models may have usage limits, latency, or access restrictions.
- Output quality depends on the selected model and the supplied input.
- Image and audio processing capabilities depend on each model's supported formats and requirements.
- The application provides access to pretrained models; it does not imply that these models were trained from scratch as part of this project.

## Future Improvements

Potential improvements include:

- Add stronger input validation and consistent error handling.
- Improve loading indicators and user-facing API error messages.
- Organize API routes around their corresponding AI tasks.
- Add configurable model selection and inference parameters.
- Improve accessibility and mobile usability.
- Add automated testing for API routes and core UI components.
- Expand documentation with screenshots and deployment instructions.

## Skills Demonstrated

This project demonstrates practical experience with:

- Building AI-powered web applications.
- Integrating pretrained models through an inference API.
- Working with natural language processing, computer vision, and audio AI.
- Developing server-side API routes using Next.js.
- Handling text, image, and audio inputs.
- Managing API credentials through environment variables.
- Building responsive interfaces with React and Bootstrap.
- Integrating multiple AI capabilities into a unified application.


## Author

**Umair Farooq**

- GitHub: [Umair9211](https://github.com/Umair9211)
- Project: [ModelHug](https://github.com/Umair9211/ModelHug)
