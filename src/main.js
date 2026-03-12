import './style.css'

let currentScreen = 'home'
let stream = null
let facingMode = 'environment'
let capturedImage = null

const FRAME_SRC = `${import.meta.env.BASE_URL}frame.png`

function render() {
  const app = document.querySelector('#app')

  if (currentScreen === 'home') {
    app.innerHTML = `
      <main class="min-h-screen bg-neutral-100 text-neutral-900">
        <section class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
          <div class="w-full rounded-3xl bg-white p-6 shadow-lg">
            <div class="mb-6 text-center">
              <h1 class="text-2xl font-bold">活動拍照打卡框</h1>
              <p class="mt-2 text-sm leading-6 text-neutral-600">
                打開相機，套上拍照框，拍完後即可下載圖片。
              </p>
            </div>

            <div class="mb-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center">
              <p class="text-sm text-neutral-500">這裡之後會放相機預覽畫面</p>
            </div>

            <div class="flex flex-col gap-3">
              <button
                id="start-camera-btn"
                class="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                開始拍照
              </button>

              <button
                class="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800"
              >
                使用說明
              </button>
            </div>
          </div>
        </section>
      </main>
    `

    document
      .querySelector('#start-camera-btn')
      .addEventListener('click', openCameraScreen)
  }

  if (currentScreen === 'camera') {
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

          <h1 class="text-sm font-medium">拍照預覽</h1>

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
              src="${FRAME_SRC}"
              alt="拍照框"
              class="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <footer class="shrink-0 py-2">
          <div class="grid grid-cols-2 gap-3">
            <button
              id="switch-camera-btn"
              class="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur"
            >
              切換鏡頭
            </button>

            <button
              id="capture-btn"
              class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
            >
              拍照
            </button>
          </div>
        </footer>
      </section>
    </main>
  `

  document.querySelector('#back-btn').addEventListener('click', goHome)
  document
    .querySelector('#switch-camera-btn')
    .addEventListener('click', switchCamera)
  document
    .querySelector('#capture-btn')
    .addEventListener('click', capturePhoto)

  startCamera()
}

  if (currentScreen === 'preview') {
  app.innerHTML = `
    <main class="h-[100dvh] overflow-hidden bg-neutral-950 text-white">
      <section class="mx-auto flex h-full max-w-md flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
        <header class="mb-2 flex shrink-0 items-center justify-between py-2">
          <button
            id="retake-btn-top"
            class="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur"
          >
            重拍
          </button>

          <h1 class="text-sm font-medium">預覽成品</h1>

          <div class="w-[68px]"></div>
        </header>

        <div class="flex min-h-0 flex-1 items-center py-3">
          <div class="mx-auto aspect-[9/16] max-h-full w-full overflow-hidden rounded-3xl bg-black">
            <img
              src="${capturedImage ?? ''}"
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
  `

  document.querySelector('#retake-btn-top').addEventListener('click', reopenCamera)
  document.querySelector('#retake-btn').addEventListener('click', reopenCamera)
  document.querySelector('#share-btn').addEventListener('click', saveOrShareImage)
}
}

async function openCameraScreen() {
  currentScreen = 'camera'
  render()
}

async function startCamera() {
  const video = document.querySelector('#camera-preview')
  if (!video) return

  try {
    if (stream) {
      stopCamera()
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
      },
      audio: false,
    })

    video.srcObject = stream
  } catch (error) {
    console.error('無法開啟相機：', error)
    alert('無法開啟相機，請確認你已允許相機權限。')
  }
}

function stopCamera() {
  if (!stream) return

  stream.getTracks().forEach((track) => track.stop())
  stream = null
}

function goHome() {
  stopCamera()
  currentScreen = 'home'
  render()
}

async function switchCamera() {
  facingMode = facingMode === 'environment' ? 'user' : 'environment'
  await startCamera()
}

async function capturePhoto() {
  const video = document.querySelector('#camera-preview')
  if (!video) return

  const sourceWidth = video.videoWidth
  const sourceHeight = video.videoHeight

  if (!sourceWidth || !sourceHeight) {
    alert('相機畫面尚未準備完成，請稍後再試一次。')
    return
  }

  const outputWidth = 1080
  const outputHeight = 1920

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = outputWidth
  canvas.height = outputHeight

  const sourceRatio = sourceWidth / sourceHeight
  const outputRatio = outputWidth / outputHeight

  let cropWidth = sourceWidth
  let cropHeight = sourceHeight
  let cropX = 0
  let cropY = 0

  if (sourceRatio > outputRatio) {
    cropWidth = sourceHeight * outputRatio
    cropX = (sourceWidth - cropWidth) / 2
  } else {
    cropHeight = sourceWidth / outputRatio
    cropY = (sourceHeight - cropHeight) / 2
  }

  if (facingMode === 'user') {
    ctx.save()
    ctx.translate(outputWidth, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    )
    ctx.restore()
  } else {
    ctx.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    )
  }

  const frameImg = await loadImage(FRAME_SRC)
  ctx.drawImage(frameImg, 0, 0, outputWidth, outputHeight)

  capturedImage = canvas.toDataURL('image/png')

  stopCamera()
  currentScreen = 'preview'
  render()
}

function reopenCamera() {
  currentScreen = 'camera'
  render()
}

async function saveOrShareImage() {
  if (!capturedImage) return

  try {
    const file = dataUrlToFile(capturedImage, 'photo-frame.png')

    if (
      navigator.canShare &&
      navigator.share &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: '活動拍照打卡框',
        text: '我的拍照成品',
      })
      return
    }

    downloadImageFallback()
  } catch (error) {
    console.error('分享失敗，改用下載方式：', error)
    downloadImageFallback()
  }
}

function downloadImageFallback() {
  if (!capturedImage) return

  const link = document.createElement('a')
  link.href = capturedImage
  link.download = 'photo-frame.png'
  link.click()
}

function dataUrlToFile(dataUrl, filename) {
  const [meta, base64] = dataUrl.split(',')
  const mimeMatch = meta.match(/data:(.*?);base64/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'

  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new File([bytes], filename, { type: mime })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

render()