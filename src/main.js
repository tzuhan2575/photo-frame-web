import './style.css'

let currentScreen = 'home'
let stream = null
let facingMode = 'environment'

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
      <main class="min-h-screen bg-black text-white">
        <section class="mx-auto flex min-h-screen max-w-md flex-col">
          <header class="flex items-center justify-between px-4 py-4">
            <button
              id="back-btn"
              class="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur"
            >
              返回
            </button>

            <h1 class="text-sm font-medium">拍照預覽</h1>

            <div class="w-[68px]"></div>
          </header>

          <div class="relative flex-1 px-4 pb-4">
            <div class="relative h-full min-h-[60vh] overflow-hidden rounded-3xl bg-neutral-900">
              <video
                id="camera-preview"
                autoplay
                playsinline
                muted
                class="h-full w-full object-cover"
              ></video>

              <div class="pointer-events-none absolute inset-0 border-[12px] border-white/20 rounded-3xl"></div>

              <div class="pointer-events-none absolute inset-x-8 top-8 rounded-2xl border border-dashed border-white/40 p-3 text-center text-xs text-white/80">
                這裡之後會放活動拍照框
              </div>
            </div>
          </div>

          <footer class="px-4 pb-6">
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

    startCamera()
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
    alert('無法開啟相機，請確認你已允許相機權限，並使用手機瀏覽器開啟。')
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

render()