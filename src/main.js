import "./style.css";

let currentScreen = "home";
let stream = null;
let facingMode = "environment";
let capturedImage = null;
let selectedFrame = "a";
let selectedDate = "";
let selectedDateLabel = "";
let currentTrack = null;
let isProcessingPhoto = false;

let previewLoaded = {
  a: false,
  b: false,
};

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;
const OUTPUT_RATIO = OUTPUT_WIDTH / OUTPUT_HEIGHT;

const DATE_OPTIONS = [
  { id: "", label: "不顯示", value: "" },
  { id: "03.20", label: "03.20", value: "2026.03.20" },
  { id: "03.21", label: "03.21", value: "2026.03.21" },
  { id: "03.22", label: "03.22", value: "2026.03.22" },
];

const FRAME_OPTIONS = {
  a: {
    id: "a",
    name: "樣式 A",
    description: "可愛版",
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
    name: "樣式 B",
    description: "簡約版",
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

function showProcessingOverlay() {
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
    captureBtn.textContent = "處理中...";
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
    captureBtn.textContent = "拍照";
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

function updatePreviewLayout() {
  layoutPreviewFrame();
  requestAnimationFrame(() => {
    layoutPreviewVideo();
    layoutPreviewDateText();
  });
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
  const strokeWidth = (frameOption.dateText.strokeWidth || 3) * scale;

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

function bindPreviewResize() {
  window.removeEventListener("resize", updatePreviewLayout);
  window.addEventListener("resize", updatePreviewLayout);
}

function unbindPreviewResize() {
  window.removeEventListener("resize", updatePreviewLayout);
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
  ctx.lineWidth = strokeWidth ?? 3;
  ctx.strokeStyle = strokeColor || "#333333";
  ctx.fillStyle = color || "#FFFFFF";
  ctx.font = `${fontWeight || "700"} ${fontSize || 42}px ${fontFamily || "sans-serif"}`;

  if (strokeWidth && strokeWidth > 0) {
    ctx.strokeText(text, x, y);
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

function render() {
  const app = document.querySelector("#app");

  if (currentScreen === "home") {
    const selectedOption = getSelectedFrameOption();

    app.innerHTML = `
      <main class="min-h-screen bg-neutral-100 text-neutral-900">
        <section class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-8">
          <div class="w-full rounded-3xl bg-white p-6 shadow-lg">
            <div class="mb-3 text-center">
              <h1 class="text-2xl font-bold">拍照打卡框</h1>
            </div>

            <p class="mb-5 text-center text-sm text-neutral-500">
              企鵝吃鯊魚工作室製作
            </p>

            <div class="mb-5">
              <div class="mb-2 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-neutral-900">選擇拍照框樣式</h2>
                <span class="text-xs text-neutral-500">目前：${selectedOption.name}</span>
              </div>

              <p class="mb-3 text-xs leading-5 text-neutral-500">
                第一次開啟時，預覽圖可能需要加載十幾秒。
              </p>

              <div class="grid grid-cols-2 gap-3">
                ${renderFrameCard(FRAME_OPTIONS.a)}
                ${renderFrameCard(FRAME_OPTIONS.b)}
              </div>
            </div>

            <div class="mb-5">
              <div class="mb-2 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-neutral-900">選擇日期（可不選）</h2>
                <span class="text-xs text-neutral-500">
                  ${selectedDateLabel || "不顯示"}
                </span>
              </div>

              <div class="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                ${DATE_OPTIONS.map(
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
                ).join("")}
              </div>
            </div>

            <div class="mb-6 rounded-2xl bg-neutral-50 p-5">
              <h2 class="text-sm font-semibold text-neutral-900">使用方式</h2>
              <div class="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                <p>1. 先選擇喜歡的拍照框樣式</p>
                <p>2. 選擇是否顯示日期</p>
                <p>3. 點擊「開始拍照」</p>
                <p class="pl-4 text-xs text-neutral-500">（點擊後請允許使用相機功能）</p>
                <p>4. 拍完後可儲存或分享圖片</p>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <button
                id="start-camera-btn"
                class="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                開始拍照
              </button>
            </div>

            <div class="mt-4 text-center text-xs leading-5 text-neutral-500">
              <p>我們不會讀取、儲存或備份任何拍攝內容</p>
              <p>拍完後請記得先儲存圖片</p>
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
    const frameOption = getSelectedFrameOption();

    app.innerHTML = `
      <main class="h-[100dvh] overflow-hidden bg-black text-white">
        <section class="mx-auto flex h-full max-w-md flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
          <header class="flex shrink-0 items-center justify-between py-2">
            <button
              id="back-btn"
              class="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur disabled:opacity-50"
              ${isProcessingPhoto ? "disabled" : ""}
            >
              返回
            </button>

            <div class="text-center">
              <h1 class="text-sm font-medium">拍照預覽</h1>
              <p class="mt-1 text-xs text-white/60">${frameOption.name}・${frameOption.description}</p>
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

              <img
                id="frame-overlay"
                src="${frameOption.frameSrc}"
                alt="拍照框"
                class="pointer-events-none absolute inset-0 h-full w-full object-fill"
              />

              ${
                selectedDate && frameOption.dateText?.enabled
                  ? `
      <div
        id="date-preview-text"
        class="pointer-events-none absolute inset-0"
      >
        <div
          id="date-preview-label"
          style="
            position: absolute;
            color: ${frameOption.dateText.color};
            font-weight: ${frameOption.dateText.fontWeight};
            font-family: ${frameOption.dateText.fontFamily};
            text-align: ${frameOption.dateText.align};
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
                <p class="mt-4 text-sm font-medium text-white">處理中...</p>
              </div>
            </div>
          </div>

          <footer class="shrink-0 py-2">
            <div class="grid grid-cols-2 gap-3">
              <button
                id="switch-camera-btn"
                class="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur disabled:opacity-50"
                ${isProcessingPhoto ? "disabled" : ""}
              >
                切換鏡頭
              </button>

              <button
                id="capture-btn"
                class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
                ${isProcessingPhoto ? "disabled" : ""}
              >
                ${isProcessingPhoto ? "處理中..." : "拍照"}
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

    startCamera();
    requestAnimationFrame(() => {
      updatePreviewLayout();
      bindPreviewResize();
    });
  }

  if (currentScreen === "preview") {
    const frameOption = getSelectedFrameOption();

    app.innerHTML = `
      <main class="h-[100dvh] overflow-hidden bg-neutral-950 text-white">
        <section class="mx-auto flex h-full max-w-md flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
          <header class="mb-2 flex shrink-0 items-center justify-center py-2">
            <div class="text-center">
              <h1 class="text-sm font-medium">預覽成品</h1>
              <p class="mt-1 text-xs text-white/60">${frameOption.name}</p>
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
                重新拍照
              </button>

              <button
                id="share-btn"
                class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
              >
                儲存 / 分享
              </button>
            </div>

            <p class="mt-3 text-center text-xs leading-5 text-white/60">
              iPhone 可點「儲存 / 分享」後，選擇「儲存影像」。
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

function renderFrameCard(option) {
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
          <p class="mt-3 text-xs text-neutral-500">載入預覽圖中...</p>
        </div>

        <img
          src="${option.previewSrc}"
          alt="${option.name}"
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
          <p class="text-sm font-semibold text-neutral-900">${option.name}</p>
          <p class="mt-1 text-xs text-neutral-500">${option.description}</p>
        </div>
        ${
          isSelected
            ? `<span class="rounded-full bg-black px-2 py-1 text-[10px] font-medium text-white">已選擇</span>`
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
    console.warn("無法套用高畫質約束，改用預設設定：", error);
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
    console.error("無法開啟相機：", error);
    alert("無法開啟相機，請確認你已允許相機權限。");
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
      alert("相機畫面尚未準備完成，請稍後再試一次。");
      return;
    }

    const { cropX, cropY, cropWidth, cropHeight } = getCoverCrop(
      sourceWidth,
      sourceHeight,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT,
    );

    if (facingMode === "user") {
      ctx.save();
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
      ctx.restore();
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
    console.error("拍照失敗：", error);
    isProcessingPhoto = false;
    hideProcessingOverlay();
    unbindPreviewResize();
    alert("拍照失敗，請再試一次。");
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
    console.error("分享失敗，改用下載方式：", error);
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
