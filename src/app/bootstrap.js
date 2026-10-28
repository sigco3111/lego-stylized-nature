import Experience from './Experience.js'

/**
 * @param {HTMLCanvasElement} canvas
 */
export async function bootstrap(canvas) {
  const experience = new Experience(canvas)

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__experience = experience
  }

  try {
    await experience.init({ deferReady: true })
    experience.start()
    await experience.present()
  }
  catch (err) {
    experience.dispose()
    if (typeof window !== 'undefined' && window.__experience === experience) {
      delete window.__experience
    }
    console.error(err)
    const uiRoot = document.getElementById('explorer-ui')
    if (uiRoot) {
      uiRoot.className = 'startup-error'
      uiRoot.innerHTML = '<div class="surface error-card" role="alert"><span class="eyebrow">BRICKLAND EXPLORER</span><h1>들녘이 아직 준비되지 않았습니다</h1><p>장면을 불러오지 못했습니다. 브라우저가 WebGPU를 지원하는지 확인한 뒤 다시 시도하세요.</p><button type="button" class="primary-button">다시 불러오기</button></div>'
      uiRoot.querySelector('button').addEventListener('click', () => window.location.reload())
    }
  }
}
