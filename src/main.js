import "./style.css";

let currentScreen = "home";
let stream = null;
let facingMode = "environment";
let capturedImage = null;
let selectedFrame = "a";
let currentTrack = null;
let imageCapture = null;
let isProcessingPhoto = false;

const FRAME_OPTIONS = {
  a: {
    id: "a",
    name: "樣式 A",
    description: "可愛版",
    previewSrc: `${import.meta.env.BASE_URL}preview-a.png`,
    frameSrc: `${import.meta.env.BASE_URL}frame-a.png`,
  },
  b: {
    id: "b",
    name: "樣式 B",
    description: "簡約版",
    previewSrc: `${import.meta.env.BASE_URL}preview-b.png`,
    frameSrc: `${import.meta.env.BASE_URL}frame-b.png`,
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
              <div class="mb-3 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-neutral-900">選擇拍照框樣式</h2>
                <span class="text-xs text-neutral-500">目前：${selectedOption.name}</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                ${renderFrameCard(FRAME_OPTIONS.a)}
                ${renderFrameCard(FRAME_OPTIONS.b)}
              </div>
            </div>

            <div class="mb-6 rounded-2xl bg-neutral-50 p-5">
              <h2 class="text-sm font-semibold text-neutral-900">使用方式</h2>
              <div class="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                <p>1. 先選擇喜歡的拍照框樣式</p>
                <p>2. 點擊「開始拍照」</p>
                <p class="pl-4 text-xs text-neutral-500">（點擊後請允許使用相機功能）</p>
                <p>3. 拍完後可儲存或分享圖片</p>
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
  }

  if (currentScreen === "camera") {
    const frameOption = getSelectedFrameOption();

    app.innerHTML = `
      <main class="h-[100dvh] overflow-hidden bg-black text-white">
        <section class="mx-auto flex h-full max-w-md flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
          <header class="flex shrink-0 items-center justify-between py-2">
            <button
              id="back-btn"
              class="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur"
            >
              返回
            </button>

            <div class="text-center">
              <h1 class="text-sm font-medium">拍照預覽</h1>
              <p class="mt-1 text-xs text-white/60">${frameOption.name}・${frameOption.description}</p>
            </div>

            <div class="w-[68px]"></div>
          </header>

          <div class="flex min-h-0 flex-1 items-center py-3">
            <div class="relative mx-auto aspect-[9/16] max-h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
              <video
                id="camera-preview"
                autoplay
                playsinline
                muted
                class="h-full w-full object-cover"
              ></video>

              <img
                id="frame-overlay"
                src="${frameOption.frameSrc}"
                alt="拍照框"
                class="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />

              ${
                isProcessingPhoto
                  ? `
                    <div class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm">
                      <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
                      <p class="mt-4 text-sm font-medium text-white">處理中...</p>
                    </div>
                  `
                  : ""
              }
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
      <div class="aspect-[9/16] w-full overflow-hidden bg-neutral-100">
        <img
          src="${option.previewSrc}"
          alt="${option.name}"
          class="h-full w-full object-cover"
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
      constraints.aspectRatio = { ideal: 9 / 16 };
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

      if ("ImageCapture" in window) {
        try {
          imageCapture = new ImageCapture(currentTrack);
        } catch (error) {
          console.warn(
            "ImageCapture 初始化失敗，將退回 video frame 擷取：",
            error,
          );
          imageCapture = null;
        }
      } else {
        imageCapture = null;
      }
    }

    video.srcObject = stream;
    await video.play().catch(() => {});
  } catch (error) {
    console.error("無法開啟相機：", error);
    alert("無法開啟相機，請確認你已允許相機權限。");
    isProcessingPhoto = false;
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  stream = null;
  currentTrack = null;
  imageCapture = null;
}

function goHome() {
  stopCamera();
  isProcessingPhoto = false;
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
  render();

  await new Promise((resolve) => requestAnimationFrame(resolve));

  const outputWidth = 1080;
  const outputHeight = 1920;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  try {
    let sourceImage = null;
    let sourceWidth = 0;
    let sourceHeight = 0;

    if (imageCapture && typeof imageCapture.takePhoto === "function") {
      try {
        const blob = await imageCapture.takePhoto();
        const bitmap = await createImageBitmap(blob);
        sourceImage = bitmap;
        sourceWidth = bitmap.width;
        sourceHeight = bitmap.height;
      } catch (error) {
        console.warn("takePhoto 失敗，改用 video frame：", error);
      }
    }

    if (!sourceImage) {
      const fallbackWidth = video.videoWidth;
      const fallbackHeight = video.videoHeight;

      if (!fallbackWidth || !fallbackHeight) {
        isProcessingPhoto = false;
        render();
        alert("相機畫面尚未準備完成，請稍後再試一次。");
        return;
      }

      sourceImage = video;
      sourceWidth = fallbackWidth;
      sourceHeight = fallbackHeight;
    }

    const sourceRatio = sourceWidth / sourceHeight;
    const outputRatio = outputWidth / outputHeight;

    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;
    let cropX = 0;
    let cropY = 0;

    if (sourceRatio > outputRatio) {
      cropWidth = sourceHeight * outputRatio;
      cropX = (sourceWidth - cropWidth) / 2;
    } else {
      cropHeight = sourceWidth / outputRatio;
      cropY = (sourceHeight - cropHeight) / 2;
    }

    if (facingMode === "user") {
      ctx.save();
      ctx.translate(outputWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        sourceImage,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        sourceImage,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );
    }

    const cachedFrameImg = await preloadImage(
      getSelectedFrameOption().frameSrc,
    );
    ctx.drawImage(cachedFrameImg, 0, 0, outputWidth, outputHeight);

    capturedImage = canvas.toDataURL("image/png");

    if (sourceImage && typeof sourceImage.close === "function") {
      sourceImage.close();
    }

    stopCamera();
    isProcessingPhoto = false;
    currentScreen = "preview";
    render();
  } catch (error) {
    console.error("拍照失敗：", error);
    stopCamera();
    isProcessingPhoto = false;
    currentScreen = "camera";
    render();
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
        title: "活動拍照打卡框",
        text: "我的拍照成品",
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

render();
preloadAllAssetsInBackground();
