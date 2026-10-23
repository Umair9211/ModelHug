'use client';
import { useState, useEffect, useRef, use } from 'react';
import { Container, Form, Button, Badge } from 'react-bootstrap';
import styles from './styles/model.module.css';
import { useNav } from '@/app/context/NavContext';

// ── Feature config ─────────────────────────────────────────
const VISION_FEATURES = {
  'image-gen': {
    label: 'Image Generation',
    placeholder: 'Describe the image you want to generate...',
    actionLabel: 'Generate',
    emptyIcon: '🎨',
    emptyMsg: "Describe anything — I'll paint it into existence.",
    inputType: 'text',
  },
  'captioning': {
    label: 'Image Captioning',
    actionLabel: 'Generate Caption',
    emptyIcon: '💬',
    emptyMsg: "Upload an image and I'll describe what I see.",
    inputType: 'upload',
    task: 'captioning',
  },
  'object-detection': {
    label: 'Object Detection',
    actionLabel: 'Detect Objects',
    emptyIcon: '🔍',
    emptyMsg: "Upload an image and I'll identify what's inside.",
    inputType: 'upload',
    task: 'object-detection',
  },
};

// ── Color palette for bounding boxes ──────────────────────
const BOX_COLORS = [
  '#38bdf8', '#f472b6', '#34d399', '#fb923c',
  '#a78bfa', '#facc15', '#f87171', '#4ade80',
];

// ── Bounding box canvas ────────────────────────────────────
function DetectionCanvas({ previewUrl, objects }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!previewUrl || !objects?.length) return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const img    = new Image();
    img.src      = previewUrl;

    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const labelColorMap = {};
      let colorIdx = 0;

      objects.forEach(({ label, confidence, box }) => {
        if (!box) return;
        const { xmin, ymin, xmax, ymax } = box;
        const w = xmax - xmin;
        const h = ymax - ymin;

        if (!labelColorMap[label]) {
          labelColorMap[label] = BOX_COLORS[colorIdx % BOX_COLORS.length];
          colorIdx++;
        }
        const color = labelColorMap[label];

        ctx.strokeStyle = color;
        ctx.lineWidth   = Math.max(2, canvas.width * 0.003);
        ctx.strokeRect(xmin, ymin, w, h);

        ctx.fillStyle = color + '22';
        ctx.fillRect(xmin, ymin, w, h);

        const text     = `${label} ${Math.round(confidence * 100)}%`;
        const fontSize = Math.max(13, canvas.width * 0.018);
        ctx.font       = `600 ${fontSize}px sans-serif`;
        const textW    = ctx.measureText(text).width;
        const padX     = 8;
        const padY     = 5;
        const pillH    = fontSize + padY * 2;
        const pillY    = ymin - pillH < 0 ? ymin : ymin - pillH;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(xmin, pillY, textW + padX * 2, pillH, 4);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillText(text, xmin + padX, pillY + fontSize + padY - 2);
      });
    };
  }, [previewUrl, objects]);

  return <canvas ref={canvasRef} />;
}

// ── Main page ──────────────────────────────────────────────
export default function VisionPage({ params }) {
  const { category: featureParam } = use(params);
  const feature = (featureParam || 'image-gen').toLowerCase();

  const [input, setInput]                               = useState('');
  const [uploadedImage, setUploadedImage]               = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [results, setResults]                           = useState([]);
  const [isLoading, setIsLoading]                       = useState(false);

  const fileInputRef = useRef(null);
  const scrollRef    = useRef(null);
  const { navCategories } = useNav();

  const meta         = VISION_FEATURES[feature] || VISION_FEATURES['image-gen'];
  const isUploadMode = meta.inputType === 'upload';
  const canSubmit    = isUploadMode ? !!uploadedImage : !!input.trim();

  // reset on feature switch
  useEffect(() => {
    setResults([]);
    setInput('');
    setUploadedImage(null);
    setUploadedImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [feature]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedImage(file);
    setUploadedImagePreview(URL.createObjectURL(file));
  };

  const handleClear = () => {
    setResults([]);
    setInput('');
    setUploadedImage(null);
    setUploadedImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (isLoading || !canSubmit) return;

    setIsLoading(true);

    try {
      // ── Image Generation ──────────────────────────────
      if (feature === 'image-gen') {
        const promptText = input.trim();
        setInput('');

        setResults((prev) => [
          ...prev,
          { type: 'user-prompt', text: promptText },
        ]);

        const res  = await fetch('/api/mistral/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Image generation failed');

        setResults((prev) => [
          ...prev,
          { type: 'generated-image', url: data.imageUrl, prompt: promptText },
        ]);

      // ── Captioning or Object Detection ────────────────
      } else {
        const previewUrl = uploadedImagePreview;
        const fileName   = uploadedImage.name;

        // show uploaded image immediately
        setResults((prev) => [
          ...prev,
          { type: 'uploaded-image', previewUrl, fileName },
        ]);

        const formData = new FormData();
        formData.append('task', meta.task); // 'captioning' | 'object-detection'
        formData.append('image', uploadedImage);

        // clear input right away
        setUploadedImage(null);
        setUploadedImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        const res  = await fetch('/api/mistral/vision', {
          method: 'POST',
          body: formData, // no Content-Type — browser sets boundary
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Request failed');

        // ── caption result
        if (feature === 'captioning') {
          setResults((prev) => [
            ...prev,
            { type: 'caption-result', caption: data.caption, previewUrl },
          ]);
        }

        // ── detection result
        if (feature === 'object-detection') {
          setResults((prev) => [
            ...prev,
            {
              type: 'detection-result',
              objects: data.objects || [],
              previewUrl,
            },
          ]);
        }
      }

    } catch (err) {
      setResults((prev) => [
        ...prev,
        { type: 'error', text: `Error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // loading label varies per feature
  const loadingLabel = {
    'image-gen':        'Generating image…',
    'captioning':       'Generating caption…',
    'object-detection': 'Detecting objects…',
  }[feature] || 'Processing…';

  return (
    <div>
      <div className={styles.pageWrapper}>

        {/* ── Header ── */}
        <div className={styles.headerRow}>
          <Container className="d-flex align-items-center justify-content-between">
            <div>
              <h5 className="mb-0 text-white">{meta.label}</h5>
              <Badge className={styles.modelBadge}>Hugging Face Live</Badge>
            </div>
            <Button variant="outline-light" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </Container>
        </div>

        {/* ── Results ── */}
        <div className={styles.canvasWindow}>
          <div className={styles.canvasThread}>

            {results.length === 0 && !isLoading && (
              <div className={styles.emptyState}>
                <h3>{meta.emptyIcon}</h3>
                <p>{meta.emptyMsg}</p>
              </div>
            )}

            {results.map((item, i) => {

              // user typed prompt
              if (item.type === 'user-prompt') {
                return (
                  <div key={i} className={styles.promptTag}>
                    <span>"{item.text}"</span>
                  </div>
                );
              }

              // generated image
              if (item.type === 'generated-image') {
                return (
                  <div key={i} className={styles.imageCard}>
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className={styles.generatedImage}
                    />
                    <div className={styles.imageCaption}>{item.prompt}</div>
                    <div className={`${styles.imageActions} justify-content-center d-flex align-items-center gap-3`}>
                      <a
                        href={item.url}
                        download={"modelhug-generated.png"}
                        className={`${styles.downloadBtn} w-50 justify-content-center d-flex align-items-center gap-2`}
                      >
                        <span className={styles.downloadIcon}>
                          <i className="bi bi-download" />
                        </span>
                        <span className={styles.downloadText}>Download Image</span>
                        <span className={styles.downloadArrow}>
                          <i className="bi bi-arrow-right" />
                        </span>
                      </a>
                    </div>
                  </div>
                );
              }

              // uploaded image preview
              if (item.type === 'uploaded-image') {
                return (
                  <div key={i} className={styles.uploadedImageCard}>
                    <img
                      src={item.previewUrl}
                      alt={item.fileName}
                      className={styles.uploadedImage}
                    />
                    <div className={styles.imageCaption}>📎 {item.fileName}</div>
                  </div>
                );
              }

              // ── caption result ─────────────────────────
              if (item.type === 'caption-result') {
                return (
                  <div key={i} className={styles.captionCard}>
                    <div className={styles.captionIcon}>💬</div>
                    <div className={styles.captionBody}>
                      <div className={styles.captionLabel}>Caption</div>
                      <p className={styles.captionText}>{item.caption}</p>
                    </div>
                  </div>
                );
              }

              // ── detection result ───────────────────────
              if (item.type === 'detection-result') {
                const uniqueLabels = [...new Set(item.objects.map((o) => o.label))];
                return (
                  <div key={i} className={styles.detectionCard}>
                    {item.objects.length > 0 && item.previewUrl && (
                      <DetectionCanvas
                        previewUrl={item.previewUrl}
                        objects={item.objects}
                      />
                    )}
                    <div className={styles.objectList}>
                      {item.objects.length > 0 ? (
                        item.objects.map((obj, j) => (
                          <span key={j} className={styles.objectTag}>
                            {obj.label}
                            <span className={styles.confidence}>
                              {Math.round(obj.confidence * 100)}%
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className={styles.noObjects}>No objects detected.</span>
                      )}
                    </div>
                    {uniqueLabels.length > 0 && (
                      <div className={styles.detectionSummary}>
                        Detected: {uniqueLabels.join(', ')}
                      </div>
                    )}
                  </div>
                );
              }

              // error
              if (item.type === 'error') {
                return (
                  <div key={i} className={styles.errorCard}>
                    {item.text}
                  </div>
                );
              }

              return null;
            })}

            {isLoading && (
              <div className={styles.loadingCard}>
                <span className={styles.loadingDots}>
                  <span /><span /><span />
                </span>
                <span className={styles.loadingLabel}>{loadingLabel}</span>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </div>

        {/* ── Input ── */}
        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <Form
              onSubmit={handleSend}
              className="d-flex w-100 align-items-center gap-2"
            >
              <div className="row w-100 gap-2">
                <div className="col-12 col-md-auto flex-grow-1">
                  {isUploadMode ? (
                    <label
                      className={`${styles.uploadZone} w-100 ${isLoading ? styles.uploadDisabled : ''}`}
                      htmlFor="vision-file-upload"
                    >
                      {uploadedImagePreview ? (
                        <>
                          <img
                            src={uploadedImagePreview}
                            alt="preview"
                            className={styles.uploadPreviewThumb}
                          />
                          <span className={styles.uploadFileName}>
                            {uploadedImage?.name}
                          </span>
                        </>
                      ) : (
                        <span className={styles.uploadPlaceholder}>
                          📂 Click to upload image
                        </span>
                      )}
                      <input
                        id="vision-file-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={isLoading}
                      />
                    </label>
                  ) : (
                    <Form.Control
                      className={styles.chatInput}
                      placeholder={meta.placeholder}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
                      }}
                      disabled={isLoading}
                    />
                  )}
                </div>

                <div className="col-12 col-md-auto">
                  <Button
                    type="submit"
                    className={`${styles.sendBtn} w-100`}
                    disabled={!canSubmit || isLoading}
                  >
                    {isLoading ? (
                      <span className={styles.loadingDots}>
                        <span /><span /><span />
                      </span>
                    ) : (
                      meta.actionLabel
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>

      </div>
    </div>
  );
}