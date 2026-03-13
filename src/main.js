import "./style.css";

let currentScreen = "home";
let currentLanguage = "zh";
let stream = null;
let facingMode = "environment";
let capturedImage = null;
let selectedFrame = "a";
let selectedDate = "";
let selectedDateLabel = "";
let selectedFilter = "original";
let currentTrack = null;
let isProcessingPhoto = false;

let previewLoaded = {
  a: false,
  b: false,
};

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;
const OUTPUT_RATIO = OUTPUT_WIDTH / OUTPUT_HEIGHT;

const TEXTS = {
  zh: {
    langZh: "中文",
    langEn: "EN",
    langJa: "日本語",
    langKo: "한국어",

    title: "拍照打卡框",
    studio: "企鵝吃鯊魚工作室製作",
    chooseFrame: "選擇拍照框樣式",
    currentStyle: "目前",
    previewLoadingHint: "第一次開啟時，預覽圖可能需要加載十幾秒。",
    chooseDate: "選擇日期（可不選）",
    noDate: "不顯示",
    usage: "使用方式",
    step1: "1. 先選擇喜歡的拍照框樣式",
    step2: "2. 選擇是否顯示日期",
    step3: "3. 點擊「開始拍照」",
    step3Hint: "（點擊後請允許使用相機功能）",
    step4: "4. 拍完後可儲存或分享圖片",
    startPhoto: "開始拍照",
    noStore1: "我們不會讀取、儲存或備份任何拍攝內容",
    noStore2: "拍完後請記得先儲存圖片",

    previewTitle: "拍照預覽",
    back: "返回",
    switchCamera: "切換鏡頭",
    capture: "拍照",
    processing: "處理中...",

    resultTitle: "預覽成品",
    retake: "重新拍照",
    saveShare: "儲存 / 分享",
    iphoneHint: "iPhone 可點「儲存 / 分享」後，選擇「儲存影像」。",

    styleA: "樣式 A",
    styleB: "樣式 B",
    cute: "可愛版",
    simple: "簡約版",

    filterTitle: "濾鏡",
    filterOriginal: "原圖",
    filterSoft: "柔亮",
    filterLowLight: "低光加強",

    cameraError: "無法開啟相機，請確認你已允許相機權限。",
    cameraNotReady: "相機畫面尚未準備完成，請稍後再試一次。",
    captureError: "拍照失敗，請再試一次。",
  },

  en: {
    langZh: "中文",
    langEn: "EN",
    langJa: "日本語",
    langKo: "한국어",

    title: "Photo Frame",
    studio: "Made by PenguShark Studio",
    chooseFrame: "Choose a frame style",
    currentStyle: "Current",
    previewLoadingHint:
      "On first load, preview images may take several seconds to appear.",
    chooseDate: "Choose a date (optional)",
    noDate: "None",
    usage: "How to use",
    step1: "1. Choose your preferred frame style",
    step2: "2. Choose whether to show the date",
    step3: '3. Tap "Start"',
    step3Hint: "(Please allow camera access after tapping.)",
    step4: "4. Save or share your photo after taking it",
    startPhoto: "Start",
    noStore1: "We do not read, store, or back up any photo content.",
    noStore2: "Please remember to save your image after taking it.",

    previewTitle: "Camera Preview",
    back: "Back",
    switchCamera: "Switch Camera",
    capture: "Capture",
    processing: "Processing...",

    resultTitle: "Preview Result",
    retake: "Retake",
    saveShare: "Save / Share",
    iphoneHint: 'On iPhone, tap "Save / Share" and choose "Save Image".',

    styleA: "Style A",
    styleB: "Style B",
    cute: "Cute",
    simple: "Simple",

    filterTitle: "Filter",
    filterOriginal: "Original",
    filterSoft: "Soft Glow",
    filterLowLight: "Low Light",

    cameraError:
      "Unable to access the camera. Please make sure camera permission is allowed.",
    cameraNotReady:
      "The camera preview is not ready yet. Please try again in a moment.",
    captureError: "Failed to capture the photo. Please try again.",
  },

  ja: {
    langZh: "中文",
    langEn: "EN",
    langJa: "日本語",
    langKo: "한국어",

    title: "フォトフレーム",
    studio: "PenguShark Studio 制作",
    chooseFrame: "フレームを選択",
    currentStyle: "現在",
    previewLoadingHint:
      "初回はプレビュー画像の読み込みに数秒かかる場合があります。",
    chooseDate: "日付を選択（任意）",
    noDate: "表示しない",
    usage: "使い方",
    step1: "1. お好みのフレームを選択",
    step2: "2. 日付を表示するか選択",
    step3: "3. 「撮影開始」をタップ",
    step3Hint: "（タップ後、カメラの使用を許可してください）",
    step4: "4. 撮影後に画像を保存または共有",
    startPhoto: "撮影開始",
    noStore1:
      "撮影内容を読み取ったり、保存したり、バックアップしたりすることはありません。",
    noStore2: "撮影後は画像の保存をお忘れなく。",

    previewTitle: "撮影プレビュー",
    back: "戻る",
    switchCamera: "カメラ切替",
    capture: "撮影",
    processing: "処理中...",

    resultTitle: "完成プレビュー",
    retake: "撮り直し",
    saveShare: "保存 / 共有",
    iphoneHint:
      "iPhoneでは「保存 / 共有」を押して「画像を保存」を選択してください。",

    styleA: "スタイル A",
    styleB: "スタイル B",
    cute: "かわいい",
    simple: "シンプル",

    filterTitle: "フィルター",
    filterOriginal: "オリジナル",
    filterSoft: "やわらか",
    filterLowLight: "低光補正",

    cameraError: "カメラを開けません。カメラの使用許可を確認してください。",
    cameraNotReady:
      "カメラ映像の準備がまだできていません。少し待ってからもう一度お試しください。",
    captureError: "撮影に失敗しました。もう一度お試しください。",
  },

  ko: {
    langZh: "中文",
    langEn: "EN",
    langJa: "日本語",
    langKo: "한국어",

    title: "포토 프레임",
    studio: "PenguShark Studio 제작",
    chooseFrame: "프레임 선택",
    currentStyle: "현재",
    previewLoadingHint:
      "처음 열 때 미리보기 이미지가 표시되기까지 몇 초 걸릴 수 있습니다.",
    chooseDate: "날짜 선택 (선택 사항)",
    noDate: "표시 안 함",
    usage: "사용 방법",
    step1: "1. 원하는 프레임 스타일을 선택하세요",
    step2: "2. 날짜 표시 여부를 선택하세요",
    step3: '3. "촬영 시작"을 누르세요',
    step3Hint: "(누른 후 카메라 권한을 허용해 주세요.)",
    step4: "4. 촬영 후 사진을 저장하거나 공유하세요",
    startPhoto: "촬영 시작",
    noStore1: "촬영한 내용은 읽거나 저장하거나 백업하지 않습니다.",
    noStore2: "촬영 후 이미지를 꼭 저장해 주세요.",

    previewTitle: "촬영 미리보기",
    back: "뒤로",
    switchCamera: "카메라 전환",
    capture: "촬영",
    processing: "처리 중...",

    resultTitle: "결과 미리보기",
    retake: "다시 촬영",
    saveShare: "저장 / 공유",
    iphoneHint:
      'iPhone에서는 "저장 / 공유"를 누른 뒤 "이미지 저장"을 선택하세요.',

    styleA: "스타일 A",
    styleB: "스타일 B",
    cute: "귀여움",
    simple: "심플",

    filterTitle: "필터",
    filterOriginal: "원본",
    filterSoft: "부드럽게",
    filterLowLight: "저조도 보정",

    cameraError:
      "카메라를 열 수 없습니다. 카메라 권한을 허용했는지 확인해 주세요.",
    cameraNotReady:
      "카메라 화면이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.",
    captureError: "촬영에 실패했습니다. 다시 시도해 주세요。",
  },
};

const DATE_OPTIONS = [
  { id: "", label: "不顯示", value: "" },
  { id: "03.20", label: "03.20", value: "2026.03.20" },
  { id: "03.21", label: "03.21", value: "2026.03.21" },
  { id: "03.22", label: "03.22", value: "2026.03.22" },
];

const FILTER_OPTIONS = {
  original: {
    id: "original",
    textKey: "filterOriginal",
    previewCss: "none",
    canvasFilter: "none",
    overlayColor: null,
    overlayAlpha: 0,
  },
  soft: {
    id: "soft",
    textKey: "filterSoft",
    previewCss: "brightness(1.12) contrast(0.98) saturate(1.06)",
    canvasFilter: "brightness(1.12) contrast(0.98) saturate(1.06)",
    overlayColor: "#FFE8D9",
    overlayAlpha: 0.08,
  },
};

const FRAME_OPTIONS = {
  a: {
    id: "a",
    nameKey: "styleA",
    descriptionKey: "cute",
    previewSrc: `${import.meta.env.BASE_URL}preview-a.png`,
    frameSrc: `${import.meta.env.BASE_URL}frame-a.png`,
    dateText: {
      enabled: true,
      x: 930,
      y: 1880,
      fontSize: 34,
      color: "#FFFFFF",
      strokeColor: "transparent",
      strokeWidth: 0,
      align: "center",
      fontWeight: "700",
      fontFamily:
        '"Arial Rounded MT Bold", "Trebuchet MS", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
    },
  },
  b: {
    id: "b",
    nameKey: "styleB",
    descriptionKey: "simple",
    previewSrc: `${import.meta.env.BASE_URL}preview-b.png`,
    frameSrc: `${import.meta.env.BASE_URL}frame-b.png`,
    dateText: {
      enabled: true,
      x: 930,
      y: 1880,
      fontSize: 34,
      color: "#FFFFFF",
      strokeColor: "transparent",
      strokeWidth: 0,
      align: "center",
      fontWeight: "700",
      fontFamily:
        '"Arial Rounded MT Bold", "Trebuchet MS", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
    },
  },
};

const imagePreloadCache = new Map();

function getSelectedFilterOption() {
  return FILTER_OPTIONS[selectedFilter] || FILTER_OPTIONS.original;
}

function preloadImage(src) {
  if (!src) return Promise.resolve(null);

  if (imagePreloadCache.has(src)) {
    return imagePreloadCache.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  imagePreloadCache.set(src, promise);
  return promise;
}

function preloadAllAssetsInBackground() {
  const sources = Object.values(FRAME_OPTIONS).flatMap((option) => [
    option.previewSrc,
    option.frameSrc,
  ]);

  Promise.allSettled(sources.map(preloadImage)).catch(() => {});
}

function getSelectedFrameOption() {
  return FRAME_OPTIONS[selectedFrame];
}

function getTranslatedDateOptions() {
  const t = TEXTS[currentLanguage];
  return DATE_OPTIONS.map((option) =>
    option.id === "" ? { ...option, label: t.noDate } : option,
  );
}

function markPreviewLoaded(frameId) {
  previewLoaded[frameId] = true;

  const skeleton = document.querySelector(
    `[data-preview-skeleton="${frameId}"]`,
  );
  const image = document.querySelector(`[data-preview-image="${frameId}"]`);

  if (skeleton) {
    skeleton.classList.add("hidden");
  }

  if (image) {
    image.classList.remove("opacity-0");
    image.classList.add("opacity-100");
  }
}

function applyPreviewFilter() {
  const video = document.querySelector("#camera-preview");
  const overlay = document.querySelector("#filter-overlay");
  const filter = getSelectedFilterOption();

  if (video) {
    video.style.filter = filter.previewCss || "none";
  }

  if (overlay) {
    if (filter.overlayColor && filter.overlayAlpha > 0) {
      overlay.style.background = filter.overlayColor;
      overlay.style.opacity = `${filter.overlayAlpha}`;
      overlay.classList.remove("hidden");
    } else {
      overlay.style.background = "transparent";
      overlay.style.opacity = "0";
      overlay.classList.add("hidden");
    }
  }
}

function showProcessingOverlay() {
  const t = TEXTS[currentLanguage];
  const overlay = document.querySelector("#camera-processing-overlay");
  const captureBtn = document.querySelector("#capture-btn");
  const switchBtn = document.querySelector("#switch-camera-btn");
  const backBtn = document.querySelector("#back-btn");

  if (overlay) {
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
  }

  if (captureBtn) {
    captureBtn.disabled = true;
    captureBtn.textContent = t.processing;
    captureBtn.classList.add("opacity-50");
  }

  if (switchBtn) {
    switchBtn.disabled = true;
    switchBtn.classList.add("opacity-50");
  }

  if (backBtn) {
    backBtn.disabled = true;
    backBtn.classList.add("opacity-50");
  }
}

function hideProcessingOverlay() {
  const t = TEXTS[currentLanguage];
  const overlay = document.querySelector("#camera-processing-overlay");
  const captureBtn = document.querySelector("#capture-btn");
  const switchBtn = document.querySelector("#switch-camera-btn");
  const backBtn = document.querySelector("#back-btn");

  if (overlay) {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
  }

  if (captureBtn) {
    captureBtn.disabled = false;
    captureBtn.textContent = t.capture;
    captureBtn.classList.remove("opacity-50");
  }

  if (switchBtn) {
    switchBtn.disabled = false;
    switchBtn.classList.remove("opacity-50");
  }

  if (backBtn) {
    backBtn.disabled = false;
    backBtn.classList.remove("opacity-50");
  }
}

function getCoverCrop(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let cropX = 0;
  let cropY = 0;

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
    cropX = (sourceWidth - cropWidth) / 2;
  } else {
    cropHeight = sourceWidth / targetRatio;
    cropY = (sourceHeight - cropHeight) / 2;
  }

  return {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
  };
}

function layoutPreviewFrame() {
  const stage = document.querySelector("#camera-preview-stage");
  const wrapper = document.querySelector("#camera-frame-wrapper");

  if (!stage || !wrapper) return;

  const stageRect = stage.getBoundingClientRect();
  const availableWidth = stageRect.width;
  const availableHeight = stageRect.height;

  if (!availableWidth || !availableHeight) return;

  let frameWidth = availableWidth;
  let frameHeight = frameWidth / OUTPUT_RATIO;

  if (frameHeight > availableHeight) {
    frameHeight = availableHeight;
    frameWidth = frameHeight * OUTPUT_RATIO;
  }

  wrapper.style.width = `${frameWidth}px`;
  wrapper.style.height = `${frameHeight}px`;
}

function layoutPreviewVideo() {
  const wrapper = document.querySelector("#camera-frame-wrapper");
  const video = document.querySelector("#camera-preview");

  if (!wrapper || !video) return;
  if (!video.videoWidth || !video.videoHeight) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const targetWidth = wrapperRect.width;
  const targetHeight = wrapperRect.height;

  if (!targetWidth || !targetHeight) return;

  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;

  const { cropX, cropY, cropWidth, cropHeight } = getCoverCrop(
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
  );

  const scale = targetWidth / cropWidth;
  const displayWidth = sourceWidth * scale;
  const displayHeight = sourceHeight * scale;

  const offsetX = -cropX * scale;
  const offsetY = -cropY * scale;

  video.style.width = `${displayWidth}px`;
  video.style.height = `${displayHeight}px`;
  video.style.maxWidth = "none";
  video.style.maxHeight = "none";
  video.style.transformOrigin = "top left";

  if (facingMode === "user") {
    video.style.transform = `translate(${offsetX + displayWidth}px, ${offsetY}px) scaleX(-1)`;
  } else {
    video.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
}

function layoutPreviewDateText() {
  const wrapper = document.querySelector("#camera-frame-wrapper");
  const label = document.querySelector("#date-preview-label");
  const frameOption = getSelectedFrameOption();

  if (!wrapper || !label) return;
  if (!frameOption.dateText || !frameOption.dateText.enabled) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const scaleX = wrapperRect.width / OUTPUT_WIDTH;
  const scaleY = wrapperRect.height / OUTPUT_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  const left = frameOption.dateText.x * scaleX;
  const top = frameOption.dateText.y * scaleY;
  const fontSize = frameOption.dateText.fontSize * scale;
  const strokeWidth = (frameOption.dateText.strokeWidth || 0) * scale;

  label.style.left = `${left}px`;
  label.style.top = `${top}px`;
  label.style.transform = "translate(-50%, -50%)";
  label.style.fontSize = `${fontSize}px`;

  if ((frameOption.dateText.strokeWidth || 0) > 0) {
    label.style.webkitTextStroke = `${strokeWidth}px ${frameOption.dateText.strokeColor}`;
  } else {
    label.style.webkitTextStroke = "0px transparent";
  }
}

function updatePreviewLayout() {
  layoutPreviewFrame();
  requestAnimationFrame(() => {
    layoutPreviewVideo();
    layoutPreviewDateText();
    applyPreviewFilter();
  });
}

function bindPreviewResize() {
  window.removeEventListener("resize", updatePreviewLayout);
  window.addEventListener("resize", updatePreviewLayout);
}

function unbindPreviewResize() {
  window.removeEventListener("resize", updatePreviewLayout);
}

function applyCanvasFilter(ctx) {
  const filter = getSelectedFilterOption();
  ctx.filter = filter.canvasFilter || "none";
}

function drawFilterOverlay(ctx) {
  const filter = getSelectedFilterOption();

  if (!filter.overlayColor || !(filter.overlayAlpha > 0)) return;

  ctx.save();
  ctx.globalAlpha = filter.overlayAlpha;
  ctx.fillStyle = filter.overlayColor;
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  ctx.restore();
}

function drawDateText(ctx, frameOption, text) {
  if (!text) return;
  if (!frameOption.dateText || !frameOption.dateText.enabled) return;

  const {
    x,
    y,
    fontSize,
    color,
    strokeColor,
    strokeWidth,
    align,
    fontWeight,
    fontFamily,
  } = frameOption.dateText;

  ctx.save();
  ctx.textAlign = align || "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = strokeWidth ?? 0;
  ctx.strokeStyle = strokeColor || "transparent";
  ctx.fillStyle = color || "#FFFFFF";
  ctx.font = `${fontWeight || "700"} ${fontSize || 42}px ${fontFamily || "sans-serif"}`;

  if ((strokeWidth || 0) > 0) {
    ctx.strokeText(text, x, y);
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

function renderLanguageSwitcher(t) {
  return `
    <div class="mb-5 flex justify-center gap-2">
      <button type="button" data-lang="zh" class="rounded-full border px-2.5 py-1 text-[11px] transition ${
        currentLanguage === "zh"
          ? "border-black bg-black text-white"
          : "border-neutral-300 bg-white text-neutral-700"
      }">${t.langZh}</button>
      <button type="button" data-lang="en" class="rounded-full border px-2.5 py-1 text-[11px] transition ${
        currentLanguage === "en"
          ? "border-black bg-black text-white"
          : "border-neutral-300 bg-white text-neutral-700"
      }">${t.langEn}</button>
      <button type="button" data-lang="ja" class="rounded-full border px-2.5 py-1 text-[11px] transition ${
        currentLanguage === "ja"
          ? "border-black bg-black text-white"
          : "border-neutral-300 bg-white text-neutral-700"
      }">${t.langJa}</button>
      <button type="button" data-lang="ko" class="rounded-full border px-2.5 py-1 text-[11px] transition ${
        currentLanguage === "ko"
          ? "border-black bg-black text-white"
          : "border-neutral-300 bg-white text-neutral-700"
      }">${t.langKo}</button>
    </div>
  `;
}

function renderFilterButtons(t) {
  return `
    <div class="shrink-0 py-2">
      <div class="flex justify-center gap-3">
        ${Object.values(FILTER_OPTIONS)
          .map(
            (filter) => `
              <button
                type="button"
                data-filter-select="${filter.id}"
                class="min-w-[88px] rounded-full border px-4 py-2 text-sm transition ${
                  selectedFilter === filter.id
                    ? "border-white bg-white text-black"
                    : "border-white/20 bg-white/10 text-white"
                }"
              >
                ${t[filter.textKey]}
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function render() {
  const app = document.querySelector("#app");
  const t = TEXTS[currentLanguage];
  const selectedOption = getSelectedFrameOption();
  const translatedDates = getTranslatedDateOptions();

  if (currentScreen === "home") {
    app.innerHTML = `
      <main class="min-h-screen bg-neutral-100 text-neutral-900">
        <section class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-8">
          <div class="w-full rounded-3xl bg-white p-6 shadow-lg">
            <div class="mb-3 text-center">
              <h1 class="text-2xl font-bold">${t.title}</h1>
            </div>

            <p class="mb-3 text-center text-sm text-neutral-500">
              ${t.studio}
            </p>

            ${renderLanguageSwitcher(t)}

            <div class="mb-5">
              <div class="mb-2 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-neutral-900">${t.chooseFrame}</h2>
                <span class="text-xs text-neutral-500">${t.currentStyle}：${t[selectedOption.nameKey]}</span>
              </div>

              <p class="mb-3 text-xs leading-5 text-neutral-500">
                ${t.previewLoadingHint}
              </p>

              <div class="grid grid-cols-2 gap-3">
                ${renderFrameCard(FRAME_OPTIONS.a, t)}
                ${renderFrameCard(FRAME_OPTIONS.b, t)}
              </div>
            </div>

            <div class="mb-5">
              <div class="mb-2 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-neutral-900">${t.chooseDate}</h2>
                <span class="text-xs text-neutral-500">
                  ${selectedDateLabel || t.noDate}
                </span>
              </div>

              <div class="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                ${translatedDates
                  .map(
                    (option) => `
                      <button
                        type="button"
                        data-date-select="${option.id}"
                        data-date-value="${option.value}"
                        class="rounded-full border px-3 py-2 text-sm transition shrink-0 ${
                          selectedDateLabel === option.id
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 bg-white text-neutral-700"
                        }"
                      >
                        ${option.label}
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>

            <div class="mb-6 rounded-2xl bg-neutral-50 p-5">
              <h2 class="text-sm font-semibold text-neutral-900">${t.usage}</h2>
              <div class="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                <p>${t.step1}</p>
                <p>${t.step2}</p>
                <p>${t.step3}</p>
                <p class="pl-4 text-xs text-neutral-500">${t.step3Hint}</p>
                <p>${t.step4}</p>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <button
                id="start-camera-btn"
                class="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                ${t.startPhoto}
              </button>
            </div>

            <div class="mt-4 text-center text-xs leading-5 text-neutral-500">
              <p>${t.noStore1}</p>
              <p>${t.noStore2}</p>
            </div>
          </div>
        </section>
      </main>
    `;

    document
      .querySelector("#start-camera-btn")
      .addEventListener("click", openCameraScreen);

    document.querySelectorAll("[data-frame-select]").forEach((button) => {
      button.addEventListener("click", () => {
        const frameId = button.dataset.frameSelect;
        if (!frameId) return;
        selectedFrame = frameId;
        render();
      });
    });

    document.querySelectorAll("[data-date-select]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedDate = button.dataset.dateValue ?? "";
        selectedDateLabel = button.dataset.dateSelect ?? "";
        render();
      });
    });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        const lang = button.dataset.lang;
        if (!lang) return;
        currentLanguage = lang;
        render();
      });
    });

    document.querySelectorAll("[data-preview-id]").forEach((img) => {
      const frameId = img.dataset.previewId;

      if (img.complete) {
        markPreviewLoaded(frameId);
      } else {
        img.addEventListener(
          "load",
          () => {
            markPreviewLoaded(frameId);
          },
          { once: true },
        );
      }
    });
  }

  if (currentScreen === "camera") {
    app.innerHTML = `
      <main class="h-[100dvh] overflow-hidden bg-black text-white">
        <section class="mx-auto flex h-full max-w-md flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
          <header class="flex shrink-0 items-center justify-between py-2">
            <button
              id="back-btn"
              class="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur disabled:opacity-50"
              ${isProcessingPhoto ? "disabled" : ""}
            >
              ${t.back}
            </button>

            <div class="text-center">
              <h1 class="text-sm font-medium">${t.previewTitle}</h1>
              <p class="mt-1 text-xs text-white/60">${t[selectedOption.nameKey]}・${t[selectedOption.descriptionKey]}</p>
            </div>

            <div class="w-[68px]"></div>
          </header>

          <div
            id="camera-preview-stage"
            class="flex min-h-0 flex-1 items-center justify-center py-3"
          >
            <div
              id="camera-frame-wrapper"
              class="relative overflow-hidden rounded-3xl bg-neutral-900"
              style="width: 100%; height: auto;"
            >
              <video
                id="camera-preview"
                autoplay
                playsinline
                muted
                class="absolute top-0 left-0"
              ></video>

              <div
                id="filter-overlay"
                class="pointer-events-none absolute inset-0 hidden"
              ></div>

              <img
                id="frame-overlay"
                src="${selectedOption.frameSrc}"
                alt="拍照框"
                class="pointer-events-none absolute inset-0 h-full w-full object-fill"
              />

              ${
                selectedDate && selectedOption.dateText?.enabled
                  ? `
                    <div
                      id="date-preview-text"
                      class="pointer-events-none absolute inset-0"
                    >
                      <div
                        id="date-preview-label"
                        style="
                          position: absolute;
                          color: ${selectedOption.dateText.color};
                          font-weight: ${selectedOption.dateText.fontWeight};
                          font-family: ${selectedOption.dateText.fontFamily};
                          text-align: ${selectedOption.dateText.align};
                          white-space: nowrap;
                          line-height: 1;
                        "
                      >
                        ${selectedDate}
                      </div>
                    </div>
                  `
                  : ""
              }

              <div
                id="camera-processing-overlay"
                class="absolute inset-0 z-10 hidden flex-col items-center justify-center bg-black/55 backdrop-blur-sm"
              >
                <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
                <p class="mt-4 text-sm font-medium text-white">${t.processing}</p>
              </div>
            </div>
          </div>

          ${renderFilterButtons(t)}

          <footer class="shrink-0 py-2">
            <div class="grid grid-cols-2 gap-3">
              <button
                id="switch-camera-btn"
                class="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur disabled:opacity-50"
                ${isProcessingPhoto ? "disabled" : ""}
              >
                ${t.switchCamera}
              </button>

              <button
                id="capture-btn"
                class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
                ${isProcessingPhoto ? "disabled" : ""}
              >
                ${isProcessingPhoto ? t.processing : t.capture}
              </button>
            </div>
          </footer>
        </section>
      </main>
    `;

    document.querySelector("#back-btn").addEventListener("click", goHome);

    if (!isProcessingPhoto) {
      document
        .querySelector("#switch-camera-btn")
        .addEventListener("click", switchCamera);
      document
        .querySelector("#capture-btn")
        .addEventListener("click", capturePhoto);
    }

    document.querySelectorAll("[data-filter-select]").forEach((button) => {
      button.addEventListener("click", () => {
        const filterId = button.dataset.filterSelect;
        if (!filterId) return;
        selectedFilter = filterId;
        render();
      });
    });

    startCamera();
    requestAnimationFrame(() => {
      updatePreviewLayout();
      bindPreviewResize();
    });
  }

  if (currentScreen === "preview") {
    app.innerHTML = `
      <main class="h-[100dvh] overflow-hidden bg-neutral-950 text-white">
        <section class="mx-auto flex h-full max-w-md flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
          <header class="mb-2 flex shrink-0 items-center justify-center py-2">
            <div class="text-center">
              <h1 class="text-sm font-medium">${t.resultTitle}</h1>
              <p class="mt-1 text-xs text-white/60">${t[selectedOption.nameKey]}</p>
            </div>
          </header>

          <div class="flex min-h-0 flex-1 items-center py-3">
            <div class="mx-auto aspect-[9/16] max-h-full w-full overflow-hidden rounded-3xl bg-black">
              <img
                src="${capturedImage ?? ""}"
                alt="拍照成品"
                class="h-full w-full object-contain"
              />
            </div>
          </div>

          <footer class="shrink-0 py-2">
            <div class="grid grid-cols-2 gap-3">
              <button
                id="retake-btn"
                class="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur"
              >
                ${t.retake}
              </button>

              <button
                id="share-btn"
                class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
              >
                ${t.saveShare}
              </button>
            </div>

            <p class="mt-3 text-center text-xs leading-5 text-white/60">
              ${t.iphoneHint}
            </p>
          </footer>
        </section>
      </main>
    `;

    document
      .querySelector("#retake-btn")
      .addEventListener("click", reopenCamera);
    document
      .querySelector("#share-btn")
      .addEventListener("click", saveOrShareImage);
  }
}

function renderFrameCard(option, t) {
  const isSelected = selectedFrame === option.id;
  const isLoaded = previewLoaded[option.id];

  return `
    <button
      type="button"
      data-frame-select="${option.id}"
      class="overflow-hidden rounded-2xl border text-left transition ${
        isSelected
          ? "border-black bg-neutral-50 ring-2 ring-black/10"
          : "border-neutral-200 bg-white"
      }"
    >
      <div class="relative aspect-[9/16] w-full overflow-hidden bg-neutral-100">
        <div
          data-preview-skeleton="${option.id}"
          class="${isLoaded ? "hidden" : "flex"} absolute inset-0 flex-col items-center justify-center bg-neutral-100"
        >
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-500"></div>
          <p class="mt-3 text-xs text-neutral-500">Loading...</p>
        </div>

        <img
          src="${option.previewSrc}"
          alt="${t[option.nameKey]}"
          data-preview-image="${option.id}"
          data-preview-id="${option.id}"
          class="h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }"
          loading="eager"
          decoding="async"
        />
      </div>

      <div class="flex items-start justify-between p-3">
        <div>
          <p class="text-sm font-semibold text-neutral-900">${t[option.nameKey]}</p>
          <p class="mt-1 text-xs text-neutral-500">${t[option.descriptionKey]}</p>
        </div>
        ${
          isSelected
            ? `<span class="rounded-full bg-black px-2 py-1 text-[10px] font-medium text-white">✓</span>`
            : ""
        }
      </div>
    </button>
  `;
}

async function setupHighQualityCamera(track) {
  if (!track) return;

  try {
    const capabilities =
      typeof track.getCapabilities === "function"
        ? track.getCapabilities()
        : {};

    const constraints = {};

    if (capabilities.width && capabilities.height) {
      constraints.width = {
        ideal: Math.min(capabilities.width.max ?? 1920, 2560),
      };
      constraints.height = {
        ideal: Math.min(capabilities.height.max ?? 1440, 2560),
      };
    }

    if (capabilities.aspectRatio) {
      constraints.aspectRatio = { ideal: OUTPUT_RATIO };
    }

    if (capabilities.focusMode && Array.isArray(capabilities.focusMode)) {
      if (capabilities.focusMode.includes("continuous")) {
        constraints.focusMode = "continuous";
      } else if (capabilities.focusMode.includes("single-shot")) {
        constraints.focusMode = "single-shot";
      }
    }

    if (Object.keys(constraints).length > 0) {
      await track.applyConstraints(constraints);
    }
  } catch (error) {
    console.warn("Unable to apply camera constraints:", error);
  }
}

function resetScrollPosition() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function lockPageScroll() {
  document.body.style.overflow = "hidden";
}

function unlockPageScroll() {
  document.body.style.overflow = "";
}

async function openCameraScreen() {
  resetScrollPosition();
  lockPageScroll();

  const selectedOption = getSelectedFrameOption();
  await preloadImage(selectedOption.frameSrc);

  currentScreen = "camera";
  render();
  resetScrollPosition();
}

async function startCamera() {
  const t = TEXTS[currentLanguage];
  const video = document.querySelector("#camera-preview");
  if (!video) return;

  const frameOption = getSelectedFrameOption();
  preloadImage(frameOption.frameSrc).catch(() => {});

  try {
    if (stream) {
      stopCamera();
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    currentTrack = stream.getVideoTracks()[0] ?? null;

    if (currentTrack) {
      await setupHighQualityCamera(currentTrack);
    }

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      updatePreviewLayout();
    };

    await video.play().catch(() => {});
    updatePreviewLayout();
  } catch (error) {
    console.error("Unable to access camera:", error);
    alert(t.cameraError);
    isProcessingPhoto = false;
    hideProcessingOverlay();
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  stream = null;
  currentTrack = null;
}

function goHome() {
  stopCamera();
  isProcessingPhoto = false;
  unbindPreviewResize();
  unlockPageScroll();
  resetScrollPosition();
  currentScreen = "home";
  render();
  resetScrollPosition();
}

async function switchCamera() {
  facingMode = facingMode === "environment" ? "user" : "environment";
  await startCamera();
}

async function capturePhoto() {
  const t = TEXTS[currentLanguage];

  if (isProcessingPhoto) return;

  const video = document.querySelector("#camera-preview");
  if (!video) return;

  isProcessingPhoto = true;
  showProcessingOverlay();

  await new Promise((resolve) => requestAnimationFrame(resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  try {
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;

    if (!sourceWidth || !sourceHeight) {
      isProcessingPhoto = false;
      hideProcessingOverlay();
      alert(t.cameraNotReady);
      return;
    }

    const { cropX, cropY, cropWidth, cropHeight } = getCoverCrop(
      sourceWidth,
      sourceHeight,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT,
    );

    ctx.save();
    applyCanvasFilter(ctx);

    if (facingMode === "user") {
      ctx.translate(OUTPUT_WIDTH, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        video,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT,
      );
    } else {
      ctx.drawImage(
        video,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT,
      );
    }

    ctx.restore();
    drawFilterOverlay(ctx);

    const frameOption = getSelectedFrameOption();
    const cachedFrameImg = await preloadImage(frameOption.frameSrc);
    ctx.drawImage(cachedFrameImg, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    drawDateText(ctx, frameOption, selectedDate);

    capturedImage = canvas.toDataURL("image/png");

    stopCamera();
    isProcessingPhoto = false;
    unbindPreviewResize();
    currentScreen = "preview";
    render();
  } catch (error) {
    console.error("Capture failed:", error);
    isProcessingPhoto = false;
    hideProcessingOverlay();
    unbindPreviewResize();
    alert(t.captureError);
  }
}

async function reopenCamera() {
  resetScrollPosition();
  lockPageScroll();

  const selectedOption = getSelectedFrameOption();
  await preloadImage(selectedOption.frameSrc);

  isProcessingPhoto = false;
  currentScreen = "camera";
  render();
  resetScrollPosition();
}

async function saveOrShareImage() {
  if (!capturedImage) return;

  try {
    const file = dataUrlToFile(capturedImage, "photo-frame.png");

    if (
      navigator.canShare &&
      navigator.share &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
      });
      return;
    }

    downloadImageFallback();
  } catch (error) {
    console.error("Share failed, fallback to download:", error);
    downloadImageFallback();
  }
}

function downloadImageFallback() {
  if (!capturedImage) return;

  const link = document.createElement("a");
  link.href = capturedImage;
  link.download = "photo-frame.png";
  link.click();
}

function dataUrlToFile(dataUrl, filename) {
  const [meta, base64] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";

  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mime });
}

render();
requestAnimationFrame(() => {
  preloadAllAssetsInBackground();
});
