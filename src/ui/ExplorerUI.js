import TerrainMinimap from './TerrainMinimap.js'

const ICONS = {
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-7h6v7"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>',
  fullscreen: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  leaf: '<path d="M20 4C8 1 2 8 5 15s16 5 15-11ZM4 21 15 10"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  sound: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  muted: '<path d="m11 4-6 5H2v6h3l6 5ZM16 9l6 6M16 15l6-6"/>',
}
const BIOMES = {
  forest: '푸른 숲', autumnForest: '가을 숲', desert: '황금 사구',
  volcano: '용암 계곡', snowForest: '눈 덮인 숲', meadow: '꽃 들판', wetland: '물가 습지',
}
const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`
const button = (action, icon, label, extra = '') => `<button type="button" class="icon-button" data-action="${action}" title="${label}" aria-label="${label}" ${extra}>${svg(icon)}</button>`
const CLOUD_REVEAL_MS = 1800
const CLOUD_PUFFS = [
  ['16%', '24%', '46vw', '26vw', '-38vw', '-22vh'],
  ['50%', '12%', '52vw', '24vw', '2vw', '-34vh'],
  ['86%', '22%', '44vw', '26vw', '40vw', '-20vh'],
  ['6%', '52%', '38vw', '30vw', '-44vw', '2vh'],
  ['32%', '46%', '34vw', '22vw', '-26vw', '-4vh'],
  ['70%', '48%', '34vw', '22vw', '28vw', '2vh'],
  ['96%', '54%', '40vw', '28vw', '46vw', '6vh'],
  ['18%', '80%', '46vw', '26vw', '-30vw', '32vh'],
  ['52%', '88%', '54vw', '26vw', '4vw', '36vh'],
  ['86%', '78%', '42vw', '24vw', '36vw', '30vh'],
]
const cloudVeilMarkup = () => {
  const puffs = CLOUD_PUFFS.map(([x, y, w, h, dx, dy]) => `<span class="puff" style="--x:${x};--y:${y};--w:${w};--h:${h};--dx:${dx};--dy:${dy}"></span>`).join('')
  return `<div class="cloud-veil" aria-hidden="true"><div class="cloud-sky"></div><div class="cloud-burst"></div><div class="cloud-field">${puffs}</div></div>`
}

export default class ExplorerUI {
  constructor(root, experience) {
    this.root = root
    this.experience = experience
    this.ready = false
    this.flightPaused = false
    this.mapExpanded = false
    this.lastUpdate = -Infinity
    this.events = new AbortController()
    root.className = 'explorer-ui'
    root.innerHTML = `
      <header class="hud-header">
        <div class="brand hud-part">
          <span class="brick-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <div><h1>브릭랜드<span>BRICKLAND</span></h1><p>끝나지 않는 작은 모험</p></div>
        </div>
        <div class="header-tools">
          <span class="explore-badge hud-part"><i></i><span data-flight-status>자유 탐험</span></span>
          <nav class="surface action-bar" aria-label="탐험 도구">
            ${button('pause', 'pause', '비행 일시정지 (스페이스)', 'aria-pressed="false" disabled')}
            ${button('home', 'home', '시작 지점으로', 'disabled')}
            <span class="tool-divider"></span>
            ${button('sound', 'sound', '효과음 끄기 (M)', 'aria-pressed="false"')}
            ${button('help', 'help', '조작 도움말', 'disabled')}
            ${button('fullscreen', 'fullscreen', '전체 화면 전환')}
            ${button('cinema', 'eye', '화면 숨기기 (H)', 'aria-pressed="false"')}
          </nav>
        </div>
      </header>
      <section class="surface location-card hud-part flight-panel" aria-label="비행 정보">
        <div class="eyebrow">탐험 중 <span class="live-dot"></span></div>
        <h2>${svg('leaf')}<span data-biome>들녘 어딘가</span></h2>
        <div class="flight-readings"><div><strong data-speed>0.0</strong><span>칸 / 초</span></div><div class="coordinates"><span>X <b data-x>—</b></span><span>Z <b data-z>—</b></span></div></div>
        <div class="speed-track" aria-hidden="true"><i data-speed-bar></i></div>
      </section>
      <div class="surface control-hint hud-part flight-panel" aria-label="조작 안내">
        <span class="key-cluster"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span>
        <span class="hint-copy"><b>떠나세요, 마음 가는 대로</b><span>방향키로도 조종 <i>·</i> 드래그로 둘러보기 <i>·</i> 휠로 확대/축소</span></span>
        <button type="button" data-action="help" class="text-button">조작 가이드 <span>↗</span></button>
      </div>
      <aside class="surface map-card hud-part flight-panel" aria-label="주변 지형 미니맵">
        <div class="map-heading"><div><span>들녘 한켠</span><span class="eyebrow">LOCAL MAP</span></div><button type="button" class="map-expand" data-action="map" aria-label="미니맵 크게" title="미니맵 크게" aria-expanded="false">${svg('fullscreen')}</button></div>
        <canvas class="terrain-minimap" aria-label="주변의 탐험한 지형과 비행 방향"></canvas>
        <div class="map-footer"><span><i></i> 내 위치</span><span data-seed></span></div>
      </aside>
      <div class="touch-controls hud-part flight-panel" aria-label="터치 조종">
        <button type="button" data-flight-code="KeyA" aria-label="좌회전">↶</button>
        <button type="button" data-flight-code="KeyW" aria-label="전진">↑</button>
        <button type="button" data-flight-code="KeyS" aria-label="후진">↓</button>
        <button type="button" data-flight-code="KeyD" aria-label="우회전">↷</button>
      </div>
      ${cloudVeilMarkup()}
      <div class="loading-card surface" role="status"><span class="eyebrow">A LITTLE WORLD, A BIG ADVENTURE</span><h2>들녘이 자라는 중</h2><p data-stage>이 작은 세상을 깨우는 중…</p><div class="loading-track"><i></i></div></div>
      <div class="hud-toast surface" role="status" hidden></div>
      <dialog class="help-dialog surface" aria-labelledby="help-title">
        ${button('close-help', 'close', '조작 도움말 닫기')}
        <span class="eyebrow">LET'S WANDER</span><h2 id="help-title">방향은 호기심에 맡기세요</h2><p class="help-intro">작은 비행기를 몰아 숲과 강, 언덕 위를 스쳐 지나가 보세요.</p>
        <dl class="help-keys"><div><dt><kbd>W</kbd> / <kbd>↑</kbd></dt><dd>앞으로 비행</dd></div><div><dt><kbd>S</kbd> / <kbd>↓</kbd></dt><dd>후진</dd></div><div><dt><kbd>A</kbd> <kbd>D</kbd> / <kbd>←</kbd> <kbd>→</kbd></dt><dd>좌우 회전</dd></div><div><dt>마우스 드래그 / 휠</dt><dd>둘러보기 / 확대·축소</dd></div><div><dt><kbd>Space</kbd></dt><dd>비행 일시정지 / 계속</dd></div><div><dt><kbd>H</kbd></dt><dd>화면 숨기기 / 보이기</dd></div><div><dt><kbd>M</kbd></dt><dd>음소거 / 효과음 켜기</dd></div><div><dt>미니맵 우상단 / <kbd>Esc</kbd></dt><dd>지도 펼치기 / 접기</dd></div></dl>
        <p class="help-note">터치 기기에서는 화면의 방향 버튼으로도 조종할 수 있습니다.</p><button type="button" class="primary-button" data-action="close-help">탐험 시작 <span>→</span></button>
      </dialog>`
    this.speed = root.querySelector('[data-speed]')
    this.speedBar = root.querySelector('[data-speed-bar]')
    this.biome = root.querySelector('[data-biome]')
    this.x = root.querySelector('[data-x]')
    this.z = root.querySelector('[data-z]')
    this.dialog = root.querySelector('dialog')
    this.minimap = new TerrainMinimap(root.querySelector('.terrain-minimap'), experience)
    this.syncAudioControl()
    root.querySelector('[data-seed]').textContent = `# ${experience.world.config.seed}`
    const options = { signal: this.events.signal }
    root.addEventListener('click', event => this.onAction(event.target.closest('[data-action]')?.dataset.action), options)
    window.addEventListener('keydown', event => this.onKeyDown(event), { ...options, capture: true })
    this.dialog.addEventListener('close', () => this.syncPause(), options)
    document.addEventListener('fullscreenchange', () => {
      const control = root.querySelector('[data-action="fullscreen"]')
      control.setAttribute('aria-label', document.fullscreenElement ? '전체 화면 종료' : '전체 화면 전환')
    }, options)
    if (!document.fullscreenEnabled) root.querySelector('[data-action="fullscreen"]').hidden = true
    for (const control of root.querySelectorAll('[data-flight-code]')) {
      const release = () => this.experience.world.playerAircraft?.input.setVirtualKey(control.dataset.flightCode, false)
      control.addEventListener('pointerdown', (event) => {
        const player = this.experience.world.playerAircraft
        if (!this.ready || !player?.enabled || player.paused) return
        event.preventDefault()
        control.setPointerCapture(event.pointerId)
        player.input.setVirtualKey(control.dataset.flightCode, true)
      }, options)
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) control.addEventListener(type, release, options)
    }
  }

  setStage(message) {
    this.root.querySelector('[data-stage]').textContent = message
  }

  playCloudReveal() {
    const sky = this.root.querySelector('.cloud-sky')
    const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!sky || reduceMotion || this.ready) return Promise.resolve()
    this.root.classList.add('is-revealing')
    return new Promise((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        sky.removeEventListener('animationend', onEnd)
        clearTimeout(timer)
        this._cancelReveal = null
        resolve()
      }
      const onEnd = (event) => {
        if (event.target === sky) finish()
      }
      const timer = setTimeout(finish, CLOUD_REVEAL_MS)
      this._cancelReveal = finish
      sky.addEventListener('animationend', onEnd)
    })
  }

  setReady() {
    this.ready = true
    this.root.classList.add('is-ready')
    this.root.classList.remove('is-revealing')
    this.root.querySelector('.cloud-veil')?.remove()
    for (const control of this.root.querySelectorAll('button[disabled]')) control.disabled = false
    if (!this.experience.world.playerAircraft?.enabled) {
      for (const control of this.root.querySelectorAll('[data-action="pause"], [data-action="home"], [data-flight-code]')) control.disabled = true
      this.root.querySelector('[data-flight-status]').textContent = '풍경 산책'
    }
    this.update(0)
  }

  syncPause() {
    this.experience.world.playerAircraft?.setPaused(this.flightPaused || this.dialog.open)
    const control = this.root.querySelector('[data-action="pause"]')
    control.setAttribute('aria-pressed', String(this.flightPaused))
    control.setAttribute('aria-label', this.flightPaused ? '비행 계속 (스페이스)' : '비행 일시정지 (스페이스)')
    control.title = control.getAttribute('aria-label')
    control.innerHTML = svg(this.flightPaused ? 'play' : 'pause')
    this.root.querySelector('[data-flight-status]').textContent = !this.experience.world.playerAircraft?.enabled ? '풍경 산책' : this.flightPaused ? '비행 일시정지됨' : '자유 탐험'
    this.root.classList.toggle('is-paused', this.flightPaused)
  }

  onAction(action) {
    if (!action) return
    const audio = this.experience.audio
    if (action === 'sound' && audio) {
      audio.setMuted(!audio.muted)
      this.syncAudioControl()
      if (!audio.muted) audio.play('click')
      return
    }
    audio?.play(action === 'pause' ? this.flightPaused ? 'resume' : 'pause' : action === 'home' ? 'home' : 'click')
    if (action === 'cinema') {
      if (this.mapExpanded) this.toggleMap(false)
      const hidden = this.root.classList.toggle('is-cinema')
      const control = this.root.querySelector('[data-action="cinema"]')
      control.setAttribute('aria-pressed', String(hidden))
      control.setAttribute('aria-label', hidden ? '화면 보이기 (H)' : '화면 숨기기 (H)')
      control.title = control.getAttribute('aria-label')
      return
    }
    if (action === 'fullscreen') {
      const operation = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
      operation.catch(() => this.toast('현재 브라우저에서는 전체 화면을 전환할 수 없습니다'))
      return
    }
    if (!this.ready) return
    if (action === 'map') this.toggleMap()
    if (action === 'help') {
      this.dialog.showModal()
      this.syncPause()
    }
    if (action === 'close-help') this.dialog.close()
    const player = this.experience.world.playerAircraft
    if (!player?.enabled) return
    if (action === 'pause') {
      this.flightPaused = !this.flightPaused
      this.syncPause()
    }
    if (action === 'home') {
      player.reset()
      this.experience.world.regenerate()
      this.experience.worldCamera.resetView(player.state.position)
      this.toast('출발했던 곳으로 돌아왔습니다')
    }
  }

  onKeyDown(event) {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return
    if (this.dialog.open) return
    if (event.code === 'Escape' && this.mapExpanded) {
      event.preventDefault()
      event.stopPropagation()
      this.toggleMap(false)
      this.experience.audio?.play('click')
      return
    }
    const interactive = event.target.closest('button, a')
    const action = event.code === 'KeyH' ? 'cinema' : event.code === 'KeyM' ? 'sound' : event.code === 'Space' && !interactive ? 'pause' : event.key === '?' ? 'help' : null
    if (action) {
      event.preventDefault()
      event.stopPropagation()
      this.onAction(action)
    }
  }

  update(timestamp) {
    if (!this.ready || timestamp - this.lastUpdate < 100) return
    this.lastUpdate = timestamp
    if (this.root.classList.contains('is-cinema')) return
    const player = this.experience.world.playerAircraft
    if (!player) return
    const cellSize = this.experience.world.config.terrain.cellSize
    const speed = player.paused ? 0 : player.state.velocity.length()
    this.speed.textContent = (speed / cellSize).toFixed(1)
    this.speedBar.style.width = `${Math.min(100, speed / player.motionConfig.maxSpeed * 100)}%`
    this.x.textContent = String(Math.floor(player.state.position.x / cellSize)).padStart(4, '0')
    this.z.textContent = String(Math.floor(player.state.position.z / cellSize)).padStart(4, '0')
    this.minimap.update()
    const biomeId = this.minimap.getCurrentBiomeId()
    if (biomeId && this.lastBiomeId && biomeId !== this.lastBiomeId) this.experience.audio?.play('biome')
    if (biomeId) this.lastBiomeId = biomeId
    this.biome.textContent = BIOMES[biomeId] ?? '들녘 어딘가'
  }

  syncAudioControl() {
    const muted = this.experience.audio?.muted ?? true
    const control = this.root.querySelector('[data-action="sound"]')
    control.setAttribute('aria-pressed', String(muted))
    control.setAttribute('aria-label', muted ? '효과음 켜기 (M)' : '효과음 끄기 (M)')
    control.title = control.getAttribute('aria-label')
    control.innerHTML = svg(muted ? 'muted' : 'sound')
  }

  toggleMap(expanded = !this.mapExpanded) {
    this.mapExpanded = expanded
    this.root.classList.toggle('is-map-expanded', expanded)
    this.root.querySelector('.map-card').classList.toggle('is-expanded', expanded)
    const control = this.root.querySelector('[data-action="map"]')
    control.setAttribute('aria-expanded', String(expanded))
    control.setAttribute('aria-label', expanded ? '지도 접기' : '미니맵 크게')
    control.title = control.getAttribute('aria-label')
    control.innerHTML = svg(expanded ? 'close' : 'fullscreen')
    this.minimap.update()
  }

  toast(message) {
    const element = this.root.querySelector('.hud-toast')
    element.textContent = message
    element.hidden = false
    clearTimeout(this.toastTimer)
    this.toastTimer = setTimeout(() => { element.hidden = true }, 2600)
  }

  dispose() {
    this._cancelReveal?.()
    this.events.abort()
    clearTimeout(this.toastTimer)
    if (this.dialog.open) this.dialog.close()
    this.minimap.dispose()
    this.root.replaceChildren()
  }
}
