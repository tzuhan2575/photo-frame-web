import './style.css'

document.querySelector('#app').innerHTML = `
  <main class="min-h-screen bg-neutral-100 text-neutral-900">
    <section class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
      <div class="w-full rounded-3xl bg-white p-6 shadow-lg">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold">活動拍照打卡框</h1>
          <p class="mt-2 text-sm text-neutral-600">
            打開相機，套上拍照框，拍完後即可下載圖片。
          </p>
        </div>

        <div class="mb-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center">
          <p class="text-sm text-neutral-500">這裡之後會放相機預覽畫面</p>
        </div>

        <div class="flex flex-col gap-3">
          <button
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