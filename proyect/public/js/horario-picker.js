/**
 * <horario-picker> Web Component
 * Trigger button lives in Shadow DOM.
 * Modals are rendered as portals directly in document.body
 * to avoid z-index / stacking-context conflicts with parent Shadow DOM.
 */
class HorarioPicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedDay  = null;
    this._selMonth     = new Date().getMonth();
    this._selYear      = new Date().getFullYear();
    this._hour         = '10';
    this._minute       = '30';
    this._period       = 'AM';
    this._horarioData  = null;
    // Portal nodes (appended to body)
    this._portalDay    = null;
    this._portalTime   = null;
  }

  connectedCallback() {
    /* ── Trigger button (in shadow) ── */
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:inline-block; font-family:'Manrope','Inter',sans-serif; width:100%; }
        .trigger-btn {
          display:inline-flex; align-items:center; gap:9px;
          padding:13px 22px; border-radius:50px; width:100%; box-sizing:border-box;
          border:2px solid #c9a84c; background:transparent;
          color:#c9a84c; font-family:inherit; font-size:.97rem;
          font-weight:700; cursor:pointer; letter-spacing:.03em;
          transition:background .2s, transform .15s; white-space:nowrap;
          justify-content:center;
        }
        .trigger-btn:hover { background:rgba(201,168,76,.12); transform:translateY(-1px); }
        .trigger-btn.has-value { color:#c9a84c; }
        .trigger-btn svg { flex-shrink:0; }
      </style>
      <button class="trigger-btn" id="triggerBtn">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span id="triggerLabel">Seleccionar horario</span>
      </button>`;

    this._buildPortals();
    this._bindEvents();
  }

  disconnectedCallback() {
    // Clean up portals when component is removed
    if (this._portalDay)  this._portalDay.remove();
    if (this._portalTime) this._portalTime.remove();
  }

  /* ════════════════ PORTAL CREATION ════════════════ */
  _buildPortals() {
    const CSS = this._sharedCSS();

    // ── MODAL 1: DAY ──
    this._portalDay = document.createElement('div');
    this._portalDay.id = `hp-day-${Date.now()}`;
    this._portalDay.innerHTML = `
      <style>${CSS}</style>
      <div class="hp-overlay" id="overlayDay">
        <div class="hp-modal">
          <button class="hp-close" id="closeDay">&times;</button>
          <div class="hp-steps">
            <div class="hp-sdot hp-active">1</div>
            <div class="hp-sline"></div>
            <div class="hp-sdot">2</div>
          </div>
          <h2 class="hp-title">Día</h2>
          <div class="hp-cal-nav">
            <button id="prevMonth">&#8249;</button>
            <span id="calLabel"></span>
            <button id="nextMonth">&#8250;</button>
          </div>
          <div class="hp-cal-grid" id="calGrid"></div>
          <button class="hp-btn-confirm" id="continueBtn" disabled>Continuar</button>
        </div>
      </div>`;
    document.body.appendChild(this._portalDay);

    // ── MODAL 2: TIME ──
    this._portalTime = document.createElement('div');
    this._portalTime.id = `hp-time-${Date.now()}`;
    this._portalTime.innerHTML = `
      <style>${CSS}</style>
      <div class="hp-overlay" id="overlayTime">
        <div class="hp-modal">
          <button class="hp-close" id="closeTime">&times;</button>
          <div class="hp-steps">
            <div class="hp-sdot hp-done">✓</div>
            <div class="hp-sline hp-done"></div>
            <div class="hp-sdot hp-active">2</div>
          </div>
          <h2 class="hp-title" style="text-align:left;font-size:1.25rem;margin-bottom:2px">Hora</h2>
          <p class="hp-subtitle">Selecciona la hora de tu cita</p>
          <div class="hp-drum-wrap" id="drumWrap">
            <div class="hp-drum-col" id="colHour"></div>
            <div class="hp-drum-sep">:</div>
            <div class="hp-drum-col" id="colMin"></div>
            <div class="hp-drum-sep" style="width:10px"></div>
            <div class="hp-drum-col hp-drum-col-sm" id="colPeriod"></div>
          </div>
          <button class="hp-btn-confirm" id="confirmBtn">Confirmar &rarr;</button>
        </div>
      </div>`;
    document.body.appendChild(this._portalTime);

    // Build calendar & drums
    this._buildCalendar();
    this._buildDrums();
  }

  _sharedCSS() {
    return `
      /* OVERLAY */
      .hp-overlay {
        display:none; position:fixed; inset:0;
        background:rgba(0,0,0,.72); backdrop-filter:blur(6px);
        z-index:99999; justify-content:center; align-items:center;
      }
      .hp-overlay.open { display:flex; animation:hpFadeIn .2s ease; }
      @keyframes hpFadeIn { from{opacity:0} to{opacity:1} }

      /* MODAL */
      .hp-modal {
        background:#0f1b2d; border-radius:20px;
        width:min(340px,92vw); padding:28px 24px 24px;
        box-shadow:0 24px 60px rgba(0,0,0,.8);
        animation:hpSlideUp .3s cubic-bezier(.34,1.56,.64,1);
        position:relative; font-family:'Manrope','Inter',sans-serif;
      }
      @keyframes hpSlideUp {
        from{opacity:0;transform:translateY(30px) scale(.95)}
        to  {opacity:1;transform:translateY(0)    scale(1)  }
      }

      /* CLOSE */
      .hp-close {
        position:absolute; top:14px; right:16px;
        background:none; border:none; color:#5a6a82;
        font-size:1.6rem; line-height:1; cursor:pointer; transition:color .2s;
      }
      .hp-close:hover{color:#c9a84c;}

      /* STEPS */
      .hp-steps{display:flex;align-items:center;gap:8px;margin-bottom:20px;}
      .hp-sdot{
        width:28px;height:28px;border-radius:50%;
        border:2px solid rgba(201,168,76,.3);
        display:flex;align-items:center;justify-content:center;
        font-size:.75rem;font-weight:700;color:#5a6a82;transition:all .3s;
      }
      .hp-sdot.hp-active{background:#c9a84c;border-color:#c9a84c;color:#0f1b2d;}
      .hp-sdot.hp-done{background:rgba(201,168,76,.15);border-color:#c9a84c;color:#c9a84c;}
      .hp-sline{flex:1;height:2px;background:rgba(201,168,76,.2);border-radius:2px;}
      .hp-sline.hp-done{background:rgba(201,168,76,.5);}

      /* TITLE */
      .hp-title{text-align:center;font-size:1.55rem;font-weight:700;color:#fff;margin:0 0 4px;}
      .hp-subtitle{font-size:.85rem;color:#5a6a82;margin:0 0 16px;}

      /* CALENDAR NAV */
      .hp-cal-nav{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:12px;}
      .hp-cal-nav button{background:none;border:none;color:#5a6a82;font-size:1.3rem;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .2s;}
      .hp-cal-nav button:hover{color:#c9a84c;}
      .hp-cal-nav span{color:#cdd6e0;font-weight:600;font-size:.92rem;min-width:150px;text-align:center;}

      /* CALENDAR GRID */
      .hp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;}
      .hp-cal-head{font-size:.7rem;font-weight:700;color:#5a6a82;padding:4px 0 8px;letter-spacing:.04em;}
      .hp-cal-day{
        padding:7px 2px;font-size:.88rem;color:#8b9ab5;border-radius:50%;
        cursor:pointer;transition:all .15s;
        aspect-ratio:1;display:flex;align-items:center;justify-content:center;
      }
      .hp-cal-day:hover:not(.hp-empty):not(.hp-past){color:#fff;background:rgba(201,168,76,.2);}
      .hp-cal-day.hp-empty,.hp-cal-day.hp-past{pointer-events:none;color:#2e3d50;}
      .hp-cal-day.hp-today{color:#c9a84c;font-weight:700;}
      .hp-cal-day.hp-selected{background:#c9a84c;color:#0f1b2d;font-weight:700;box-shadow:0 0 0 3px rgba(201,168,76,.25);}

      /* DRUM */
      .hp-drum-wrap{
        display:flex;align-items:center;justify-content:center;
        gap:4px;position:relative;margin:8px 0 24px;user-select:none;
      }
      .hp-drum-wrap::before{
        content:'';position:absolute;
        top:50%;left:0;transform:translateY(-50%);
        width:100%;height:52px;
        background:rgba(201,168,76,.1);
        border:1.5px solid #c9a84c;border-radius:10px;
        pointer-events:none;z-index:1;
      }
      .hp-drum-col{
        display:flex;flex-direction:column;
        align-items:center;overflow:hidden;height:260px;
        position:relative;cursor:grab;flex:1;
      }
      .hp-drum-col:active{cursor:grabbing;}
      .hp-drum-col-sm{flex:0.75;}
      .hp-drum-inner{display:flex;flex-direction:column;align-items:center;will-change:transform;}
      .hp-drum-item{
        height:52px;display:flex;align-items:center;justify-content:center;
        font-size:1rem;font-weight:600;color:#2e3d50;
        transition:font-size .15s,color .15s;width:100%;text-align:center;
        pointer-events:none;
      }
      .hp-drum-item.hp-near{color:#6b7e96;font-size:.97rem;}
      .hp-drum-item.hp-active{color:#c9a84c;font-size:1.35rem;font-weight:800;z-index:2;}
      .hp-drum-sep{color:#5a6a82;font-size:1.3rem;font-weight:300;padding:0 2px;align-self:center;z-index:2;}
      .hp-drum-col::before,.hp-drum-col::after{
        content:'';position:absolute;left:0;right:0;height:90px;z-index:2;pointer-events:none;
      }
      .hp-drum-col::before{top:0;background:linear-gradient(to bottom,#0f1b2d 0%,transparent 100%);}
      .hp-drum-col::after{bottom:0;background:linear-gradient(to top,#0f1b2d 0%,transparent 100%);}

      /* CONFIRM BUTTON */
      .hp-btn-confirm{
        width:100%;padding:14px;border-radius:50px;border:none;
        background:#c9a84c;color:#0f1b2d;
        font-family:inherit;font-size:1rem;font-weight:800;
        cursor:pointer;transition:opacity .2s,transform .15s;
        letter-spacing:.03em;margin-top:4px;
      }
      .hp-btn-confirm:disabled{opacity:.3;cursor:not-allowed;}
      .hp-btn-confirm:not(:disabled):hover{opacity:.86;transform:translateY(-1px);}
    `;
  }

  /* ════════════════ CALENDAR ════════════════ */
  _qDay(id) { return this._portalDay.querySelector(`#${id}`); }

  _buildCalendar() {
    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const grid  = this._qDay('calGrid');
    const label = this._qDay('calLabel');
    const today = new Date(); today.setHours(0,0,0,0);

    label.textContent = `${MONTHS[this._selMonth]} ${this._selYear}`;
    grid.innerHTML = '';

    ['L','M','M','J','V','S','D'].forEach(d => {
      const h = document.createElement('div');
      h.className = 'hp-cal-head'; h.textContent = d;
      grid.appendChild(h);
    });

    const first = new Date(this._selYear, this._selMonth, 1);
    let startDow = first.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    for (let i = 0; i < startDow; i++) {
      const e = document.createElement('div');
      e.className = 'hp-cal-day hp-empty';
      grid.appendChild(e);
    }

    const daysInMonth = new Date(this._selYear, this._selMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'hp-cal-day';
      cell.textContent = d;
      const cellDate = new Date(this._selYear, this._selMonth, d);
      if (cellDate < today) cell.classList.add('hp-past');
      if (cellDate.toDateString() === today.toDateString()) cell.classList.add('hp-today');
      if (this._selectedDay &&
          d === this._selectedDay.d &&
          this._selMonth === this._selectedDay.m &&
          this._selYear  === this._selectedDay.y) {
        cell.classList.add('hp-selected');
      }
      cell.addEventListener('click', () => this._pickDay(d));
      grid.appendChild(cell);
    }
  }

  _pickDay(d) {
    this._selectedDay = { d, m: this._selMonth, y: this._selYear };
    this._buildCalendar();
    this._qDay('continueBtn').disabled = false;
  }

  /* ════════════════ DRUM ROLL ════════════════ */
  _qTime(id) { return this._portalTime.querySelector(`#${id}`); }

  _buildDrums() {
    const ITEM_H = 52;
    const PAD    = 2;

    const hours   = ['07','08','09','10','11','12','01','02','03','04','05','06'];
    const minutes = ['00','15','30','45'];
    const periods = ['AM','PM'];

    this._drums = {
      hour:   { el: this._qTime('colHour'),   items: hours,   idx: hours.indexOf('10')   },
      min:    { el: this._qTime('colMin'),     items: minutes, idx: minutes.indexOf('30') },
      period: { el: this._qTime('colPeriod'), items: periods, idx: 0 }
    };

    for (const drum of Object.values(this._drums)) {
      // Build inner
      const inner = document.createElement('div');
      inner.className = 'hp-drum-inner';
      for (let i = 0; i < PAD; i++) {
        const el = document.createElement('div');
        el.className = 'hp-drum-item'; inner.appendChild(el);
      }
      drum.items.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'hp-drum-item' + (i === drum.idx ? ' hp-active' : Math.abs(i - drum.idx) === 1 ? ' hp-near' : '');
        el.textContent = val;
        inner.appendChild(el);
      });
      for (let i = 0; i < PAD; i++) {
        const el = document.createElement('div');
        el.className = 'hp-drum-item'; inner.appendChild(el);
      }
      drum.el.appendChild(inner);
      drum._inner = inner;
      inner.style.transform = `translateY(${-drum.idx * ITEM_H}px)`;

      this._initDrumInteraction(drum, ITEM_H, PAD);
    }
  }

  _snapDrum(drum, ITEM_H, PAD) {
    drum.idx = Math.max(0, Math.min(drum.items.length - 1, drum.idx));
    drum._inner.style.transition = 'transform .2s cubic-bezier(.25,.46,.45,.94)';
    drum._inner.style.transform  = `translateY(${-drum.idx * ITEM_H}px)`;
    // Update classes
    drum._inner.querySelectorAll('.hp-drum-item').forEach((el, i) => {
      const di = i - PAD;
      el.classList.remove('hp-active','hp-near');
      if (di === drum.idx) el.classList.add('hp-active');
      else if (Math.abs(di - drum.idx) === 1) el.classList.add('hp-near');
    });
    this._syncValues();
  }

  _initDrumInteraction(drum, ITEM_H, PAD) {
    let startY = 0, startIdx = 0, dragging = false;

    const onStart = y => {
      dragging = true; startY = y; startIdx = drum.idx;
      drum._inner.style.transition = 'none';
    };
    const onMove = y => {
      if (!dragging) return;
      const steps = Math.round((startY - y) / ITEM_H);
      drum.idx = Math.max(0, Math.min(drum.items.length - 1, startIdx + steps));
      drum._inner.style.transform = `translateY(${-drum.idx * ITEM_H}px)`;
    };
    const onEnd = () => { if (!dragging) return; dragging = false; this._snapDrum(drum, ITEM_H, PAD); };

    drum.el.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientY); });
    window.addEventListener('mousemove',   e => onMove(e.clientY));
    window.addEventListener('mouseup',     onEnd);
    drum.el.addEventListener('touchstart', e => onStart(e.touches[0].clientY), { passive:true });
    drum.el.addEventListener('touchmove',  e => { onMove(e.touches[0].clientY); e.preventDefault(); }, { passive:false });
    drum.el.addEventListener('touchend',   onEnd);
    drum.el.addEventListener('wheel', e => {
      e.preventDefault();
      drum.idx = Math.max(0, Math.min(drum.items.length - 1, drum.idx + (e.deltaY > 0 ? 1 : -1)));
      this._snapDrum(drum, ITEM_H, PAD);
    }, { passive:false });
  }

  _syncValues() {
    this._hour   = this._drums.hour.items[this._drums.hour.idx];
    this._minute = this._drums.min.items[this._drums.min.idx];
    this._period = this._drums.period.items[this._drums.period.idx];
  }

  /* ════════════════ EVENTS ════════════════ */
  _bindEvents() {
    // Trigger
    this.shadowRoot.getElementById('triggerBtn').addEventListener('click', () => this._openDay());

    // Calendar nav
    this._qDay('prevMonth').addEventListener('click', () => {
      if (this._selMonth === 0) { this._selMonth = 11; this._selYear--; }
      else this._selMonth--;
      this._buildCalendar();
    });
    this._qDay('nextMonth').addEventListener('click', () => {
      if (this._selMonth === 11) { this._selMonth = 0; this._selYear++; }
      else this._selMonth++;
      this._buildCalendar();
    });

    // Continue
    this._qDay('continueBtn').addEventListener('click', () => { this._closeDay(); this._openTime(); });
    this._qDay('closeDay').addEventListener('click',    () => this._closeDay());

    // Confirm time
    this._qTime('confirmBtn').addEventListener('click', () => {
      this._syncValues();
      this._closeTime();
      this._confirm();
    });
    this._qTime('closeTime').addEventListener('click', () => this._closeTime());

    // Close on overlay click
    this._portalDay.querySelector('#overlayDay').addEventListener('click', e => {
      if (e.target === this._portalDay.querySelector('#overlayDay')) this._closeDay();
    });
    this._portalTime.querySelector('#overlayTime').addEventListener('click', e => {
      if (e.target === this._portalTime.querySelector('#overlayTime')) this._closeTime();
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (this._portalTime.querySelector('#overlayTime').classList.contains('open')) this._closeTime();
      else if (this._portalDay.querySelector('#overlayDay').classList.contains('open')) this._closeDay();
    });
  }

  _openDay()   { this._portalDay.querySelector('#overlayDay').classList.add('open'); }
  _closeDay()  { this._portalDay.querySelector('#overlayDay').classList.remove('open'); }
  _openTime()  { this._portalTime.querySelector('#overlayTime').classList.add('open'); }
  _closeTime() { this._portalTime.querySelector('#overlayTime').classList.remove('open'); }

  _confirm() {
    if (!this._selectedDay) return;
    const DAYS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const d   = this._selectedDay;
    const dow = new Date(d.y, d.m, d.d).getDay();
    const label = `${DAYS[dow]} ${d.d} ${MONTHS[d.m]} · ${this._hour}:${this._minute} ${this._period}`;

    // Update trigger text
    const span = this.shadowRoot.getElementById('triggerLabel');
    span.textContent = label;
    this.shadowRoot.getElementById('triggerBtn').classList.add('has-value');

    // Dispatch event so parent (reserva-component) can read the data
    this.dispatchEvent(new CustomEvent('horario-selected', {
      bubbles: true, composed: true,
      detail: { day: d, hour: this._hour, minute: this._minute, period: this._period, label }
    }));
  }
}

customElements.define('horario-picker', HorarioPicker);
