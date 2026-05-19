class ReservaComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                /* ===== HOST / OVERLAY ===== */
                :host {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    z-index: 1000;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    box-sizing: border-box;
                }

                :host(.active) {
                    display: flex;
                    animation: fadeInOverlay 0.25s ease;
                }

                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                /* ===== MODAL BOX ===== */
                .modal-box {
                    position: relative;
                    background: #1a1f2b;
                    border: 1px solid #D4AF37;
                    border-radius: 16px;
                    padding: 40px 36px 36px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    scrollbar-width: thin;
                    scrollbar-color: #D4AF37 transparent;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }

                /* ===== CLOSE BUTTON ===== */
                .modal-close {
                    position: absolute;
                    top: 14px;
                    right: 18px;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.8rem;
                    line-height: 1;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .modal-close:hover { color: #D4AF37; }

                /* ===== HEADER ===== */
                .modal-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 6px;
                }
                .modal-header svg { color: #D4AF37; flex-shrink: 0; }
                .modal-header h2 {
                    margin: 0;
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.6rem;
                    font-style: italic;
                    font-weight: 700;
                    color: #f6f6f8;
                    letter-spacing: -0.02em;
                }

                .modal-subtitle {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.95rem;
                    color: #94a3b8;
                    margin: 0 0 28px;
                }

                /* ===== FORM ===== */
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 18px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                label {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #D4AF37;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                input, select {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 8px;
                    color: #f6f6f8;
                    font-family: 'Manrope', sans-serif;
                    font-size: 1rem;
                    padding: 11px 14px;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                    appearance: none;
                    -webkit-appearance: none;
                }

                input::placeholder { color: rgba(255,255,255,0.3); }

                input:focus, select:focus {
                    border-color: #D4AF37;
                    background: rgba(212, 175, 55, 0.08);
                }

                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1) opacity(0.6);
                    cursor: pointer;
                }

                select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 18px;
                    padding-right: 38px;
                }

                select option {
                    background: #1a1f2b;
                    color: #f6f6f8;
                }

                /* ===== SUBMIT BUTTON ===== */
                .btn-submit {
                    width: 100%;
                    padding: 14px;
                    background: #D4AF37;
                    color: #111621;
                    border: none;
                    border-radius: 10px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 1rem;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: background 0.2s, transform 0.15s;
                }
                .btn-submit:hover { background: #c49b2a; transform: translateY(-1px); }
                .btn-submit:active { transform: translateY(0); }

                /* ===== MENSAJE ===== */
                .mensaje-cita {
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.95rem;
                    margin-bottom: 12px;
                    line-height: 1.5;
                    display: none;
                }
                .mensaje-cita.exito {
                    display: block;
                    background: rgba(52, 211, 153, 0.12);
                    border: 1px solid rgba(52, 211, 153, 0.4);
                    color: #6ee7b7;
                }
                .mensaje-cita.error {
                    display: block;
                    background: rgba(239, 68, 68, 0.12);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    color: #fca5a5;
                }

                /* ===== PASO INDICADOR ===== */
                .steps-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 22px;
                }
                .step-dot {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2px solid rgba(212,175,55,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    transition: all 0.3s;
                }
                .step-dot.active {
                    background: #D4AF37;
                    border-color: #D4AF37;
                    color: #111621;
                }
                .step-dot.done {
                    background: rgba(212,175,55,0.15);
                    border-color: #D4AF37;
                    color: #D4AF37;
                }
                .step-line {
                    flex: 1;
                    height: 2px;
                    background: rgba(212,175,55,0.2);
                    border-radius: 2px;
                    transition: background 0.3s;
                }
                .step-line.done { background: rgba(212,175,55,0.5); }

                /* ===== PANEL COBRO ===== */
                .panel-cobro { display: none; }
                .panel-cobro.visible {
                    display: block;
                    animation: fadeSlide 0.3s ease;
                }
                @keyframes fadeSlide {
                    from { opacity: 0; transform: translateX(18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .resumen-card {
                    background: rgba(212,175,55,0.06);
                    border: 1px solid rgba(212,175,55,0.25);
                    border-radius: 12px;
                    padding: 16px 18px;
                    margin-bottom: 20px;
                }
                .resumen-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.9rem;
                    color: #94a3b8;
                    padding: 5px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .resumen-row:last-child { border-bottom: none; }
                .resumen-row span:last-child { color: #f6f6f8; font-weight: 600; }
                .resumen-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 14px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(212,175,55,0.25);
                    font-family: 'Manrope', sans-serif;
                }
                .resumen-total .label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #D4AF37;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .resumen-total .precio {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.7rem;
                    font-weight: 700;
                    color: #D4AF37;
                }

                .metodo-label {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #D4AF37;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }
                .metodos-grid {
                    display: grid;
                    grid-template-columns: repeat(3,1fr);
                    gap: 10px;
                    margin-bottom: 22px;
                }
                .metodo-opcion input { display: none; }
                .metodo-opcion label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px 8px;
                    background: rgba(255,255,255,0.04);
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.78rem;
                    color: #94a3b8;
                    font-weight: 600;
                    text-transform: none;
                    letter-spacing: 0;
                }
                .metodo-opcion label:hover { border-color: rgba(212,175,55,0.4); color: #f6f6f8; }
                .metodo-opcion input:checked + label {
                    border-color: #D4AF37;
                    background: rgba(212,175,55,0.1);
                    color: #D4AF37;
                }
                .metodo-icon { font-size: 1.3rem; }

                .btn-volver {
                    background: none;
                    border: none;
                    color: #64748b;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.85rem;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-bottom: 16px;
                    transition: color 0.2s;
                }
                .btn-volver:hover { color: #D4AF37; }

                .msg-cobro {
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.95rem;
                    margin-bottom: 12px;
                    line-height: 1.5;
                    display: none;
                }
                .msg-cobro.exito {
                    display: block;
                    background: rgba(52, 211, 153, 0.12);
                    border: 1px solid rgba(52, 211, 153, 0.4);
                    color: #6ee7b7;
                }
                .msg-cobro.error {
                    display: block;
                    background: rgba(239, 68, 68, 0.12);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    color: #fca5a5;
                }

                /* ===== PANELES DE PAGO ===== */
                .pago-panel {
                    display: none;
                    margin-bottom: 18px;
                }
                .pago-panel.visible {
                    display: block;
                    animation: fadeSlide 0.3s ease;
                }

                .pago-banco-card {
                    background: rgba(212,175,55,0.06);
                    border: 1px solid rgba(212,175,55,0.25);
                    border-radius: 12px;
                    padding: 16px 18px;
                    margin-bottom: 16px;
                }
                .pago-banco-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.88rem;
                    color: #94a3b8;
                    padding: 5px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .pago-banco-row:last-child { border-bottom: none; }
                .pago-banco-row span:last-child { color: #f6f6f8; font-weight: 600; }

                .pago-efectivo-msg {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(52,211,153,0.08);
                    border: 1px solid rgba(52,211,153,0.25);
                    border-radius: 10px;
                    padding: 14px 16px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.9rem;
                    color: #6ee7b7;
                    margin-bottom: 4px;
                }

                .cvv-wrapper { position: relative; }
                .cvv-wrapper input { padding-right: 40px; }
                .cvv-toggle {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    color: #64748b;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }
                .cvv-toggle:hover { color: #D4AF37; }

                /* ===== SELECTOR BARBERO ===== */
                .barberos-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 4px;
                }
                .barbero-opcion input[type="radio"] { display: none; }
                .barbero-opcion label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 8px 10px;
                    background: rgba(255,255,255,0.04);
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-transform: none;
                    letter-spacing: 0;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #94a3b8;
                }
                .barbero-opcion label:hover { border-color: rgba(212,175,55,0.4); color: #f6f6f8; }
                .barbero-opcion input[type="radio"]:checked + label {
                    border-color: #D4AF37;
                    background: rgba(212,175,55,0.10);
                    color: #D4AF37;
                }
                .barbero-avatar {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    object-fit: cover;
                    filter: grayscale(55%);
                    transition: filter 0.2s, border 0.2s;
                    border: 2px solid transparent;
                }
                .barbero-opcion input[type="radio"]:checked + label .barbero-avatar {
                    filter: grayscale(0%);
                    border-color: #D4AF37;
                }
                /* Barbero fuera de servicio */
                .barbero-opcion.fuera-servicio label {
                    opacity: .45;
                    cursor: not-allowed;
                    position: relative;
                }
                .barbero-opcion.fuera-servicio label::after {
                    content: 'Fuera de servicio';
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: .62rem;
                    color: #f87171;
                    white-space: nowrap;
                    font-weight: 700;
                    letter-spacing: .03em;
                }
                .barbero-opcion.fuera-servicio input[type="radio"] { pointer-events: none; }
                .barberos-loading { text-align:center; color:#64748b; font-family:'Manrope',sans-serif; font-size:.82rem; padding:16px; grid-column:1/-1; }

                /* ===== BOTÓN HORARIO ===== */
                .btn-horario {
                    width: 100%; padding: 14px;
                    background: transparent; color: #D4AF37;
                    border: 2px solid #D4AF37; border-radius: 50px;
                    font-family: 'Manrope', sans-serif; font-size: 1rem; font-weight: 700;
                    letter-spacing: .03em; cursor: pointer;
                    margin-top: 8px; margin-bottom: 4px;
                    transition: background .2s, transform .15s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .btn-horario:hover { background: rgba(212,175,55,.12); transform: translateY(-1px); }
                .btn-horario.done { background: rgba(212,175,55,.12); }

                /* ===== OVERLAYS INTERNOS (calendario y hora) ===== */
                .sub-overlay {
                    display: none; position: fixed; inset: 0;
                    background: rgba(0,0,0,.72); backdrop-filter: blur(5px);
                    z-index: 2000; justify-content: center; align-items: center;
                }
                .sub-overlay.open { display: flex; animation: fadeInOverlay .2s ease; }

                .sub-modal {
                    background: #0f1b2d; border-radius: 20px;
                    width: min(340px, 92vw); padding: 28px 22px 22px;
                    box-shadow: 0 24px 60px rgba(0,0,0,.8);
                    animation: slideUp .3s cubic-bezier(.34,1.56,.64,1);
                    position: relative; font-family: 'Manrope', sans-serif;
                }
                .sub-close {
                    position: absolute; top: 14px; right: 16px;
                    background: none; border: none; color: #5a6a82;
                    font-size: 1.6rem; line-height: 1; cursor: pointer; transition: color .2s;
                }
                .sub-close:hover { color: #D4AF37; }
                .sub-steps { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
                .ss-dot {
                    width: 26px; height: 26px; border-radius: 50%;
                    border: 2px solid rgba(212,175,55,.3);
                    display: flex; align-items: center; justify-content: center;
                    font-size: .72rem; font-weight: 700; color: #5a6a82; transition: all .3s;
                }
                .ss-dot.active { background: #D4AF37; border-color: #D4AF37; color: #0f1b2d; }
                .ss-dot.done  { background: rgba(212,175,55,.15); border-color: #D4AF37; color: #D4AF37; }
                .ss-line { flex: 1; height: 2px; background: rgba(212,175,55,.2); border-radius: 2px; }
                .ss-line.done { background: rgba(212,175,55,.5); }
                .sub-title { text-align: center; font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
                .sub-subtitle { font-size: .84rem; color: #5a6a82; margin: 0 0 14px; }

                /* ── CALENDARIO ── */
                .cal-nav { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:12px; }
                .cal-nav button { background:none; border:none; color:#5a6a82; font-size:1.3rem; cursor:pointer; padding:4px 8px; border-radius:6px; transition:color .2s; }
                .cal-nav button:hover { color:#D4AF37; }
                .cal-nav span { color:#cdd6e0; font-weight:600; font-size:.9rem; min-width:150px; text-align:center; }
                .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; text-align:center; }
                .cal-head { font-size:.68rem; font-weight:700; color:#5a6a82; padding:4px 0 8px; letter-spacing:.04em; }
                .cal-day {
                    padding:6px 2px; font-size:.86rem; color:#8b9ab5; border-radius:50%;
                    cursor:pointer; transition:all .15s;
                    aspect-ratio:1; display:flex; align-items:center; justify-content:center;
                }
                .cal-day:hover:not(.empty):not(.past) { color:#fff; background:rgba(212,175,55,.2); }
                .cal-day.empty, .cal-day.past { pointer-events:none; color:#2e3d50; }
                .cal-day.today { color:#D4AF37; font-weight:700; }
                .cal-day.selected { background:#D4AF37; color:#0f1b2d; font-weight:700; box-shadow:0 0 0 3px rgba(212,175,55,.25); }
                /* Día completamente ocupado (todos los slots reservados) */
                .cal-day.full {
                    color: #f87171;
                    background: rgba(239,68,68,0.10);
                    border: 1px solid rgba(239,68,68,0.30);
                    pointer-events: none;
                    opacity: 0.75;
                }

                /* ── GRILLA DE HORARIOS ── */
                .time-slots-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin: 4px 0 18px;
                    max-height: 240px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #D4AF37 transparent;
                    padding-right: 2px;
                }
                .time-slot-btn {
                    padding: 9px 4px;
                    border-radius: 8px;
                    border: 1.5px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.04);
                    color: #8b9ab5;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                    text-align: center;
                }
                .time-slot-btn:hover {
                    border-color: rgba(212,175,55,0.45);
                    color: #f6f6f8;
                    background: rgba(212,175,55,0.07);
                }
                .time-slot-btn.selected {
                    background: rgba(212,175,55,0.15);
                    border-color: #D4AF37;
                    color: #D4AF37;
                    font-weight: 700;
                }
                .time-slots-empty {
                    grid-column: 1 / -1;
                    text-align: center;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.85rem;
                    color: #64748b;
                    padding: 24px 0;
                }

                /* ── BOTÓN CONFIRMAR SUB-MODAL ── */
                .sub-confirm {
                    width:100%; padding:13px; border-radius:50px; border:none;
                    background:#D4AF37; color:#0f1b2d;
                    font-family:'Manrope',sans-serif; font-size:1rem; font-weight:800;
                    cursor:pointer; transition:opacity .2s, transform .15s;
                    letter-spacing:.03em; margin-top:4px;
                }
                .sub-confirm:disabled { opacity:.3; cursor:not-allowed; }
                .sub-confirm:not(:disabled):hover { opacity:.86; transform:translateY(-1px); }

                /* Slot ocupado (rojo, no seleccionable para confirmar) */
                .time-slot-btn.occupied {
                    background: rgba(239,68,68,0.10);
                    border-color: rgba(239,68,68,0.40);
                    color: #f87171;
                    cursor: not-allowed;
                }
                .time-slot-btn.occupied:hover {
                    background: rgba(239,68,68,0.16);
                    border-color: rgba(239,68,68,0.55);
                    color: #fca5a5;
                }
                /* Nota de conflicto (debajo de la grilla) */
                .conflict-note {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.78rem;
                    color: #f87171;
                    margin: -10px 0 10px;
                    min-height: 18px;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 500px) {
                    .modal-box { padding: 30px 20px 24px; }
                    .form-row { grid-template-columns: 1fr; }
                    .metodos-grid { grid-template-columns: repeat(3,1fr); }
                    .barberos-grid { grid-template-columns: repeat(3, 1fr); }
                }
            </style>

            <div class="modal-box" part="box">
                <button class="modal-close" id="btnCerrar" aria-label="Cerrar">&times;</button>

                <!-- Indicador de pasos -->
                <div class="steps-bar">
                    <div class="step-dot active" id="stepDot1">1</div>
                    <div class="step-line" id="stepLine"></div>
                    <div class="step-dot" id="stepDot2">2</div>
                </div>

                <div class="modal-header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M3 7a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                        <path d="M3 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                        <path d="M8.6 8.6l10.4 10.4"/>
                        <path d="M8.6 15.4l10.4 -10.4"/>
                    </svg>
                    <h2>Reservar Cita</h2>
                </div>
                <p class="modal-subtitle">Completa los campos para agendar tu visita</p>

                <form id="formCita">
                    <div class="form-group">
                        <label for="nombreCliente">Nombre completo</label>
                        <input type="text" id="nombreCliente" name="nombre"
                               placeholder="Tu nombre" required />
                    </div>

                    <div class="form-group">
                        <label for="servicio">Servicio</label>
                        <select id="servicio" name="servicio" required>
                            <option value="" disabled selected>Cargando servicios...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Barbero</label>
                        <div class="barberos-grid" id="barberosGrid">
                            <div class="barberos-loading">Cargando barberos...</div>
                        </div>
                    </div>

                    <!-- Botón trigger horario -->
                    <button type="button" class="btn-horario" id="btnHorario">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span id="horarioLabel">Seleccionar horario</span>
                    </button>

                    <div class="mensaje-cita" id="mensajeCita"></div>
                    <button type="submit" class="btn-submit">Siguiente &rarr;</button>
                </form>

                <!-- ===== MODAL DÍA (overlay interno) ===== -->
                <div class="sub-overlay" id="overlayDia">
                  <div class="sub-modal">
                    <button class="sub-close" id="closeDia">&times;</button>
                    <div class="sub-steps">
                        <div class="ss-dot active">1</div>
                        <div class="ss-line"></div>
                        <div class="ss-dot">2</div>
                    </div>
                    <h2 class="sub-title">Día</h2>
                    <div class="cal-nav">
                        <button id="calPrev">&#8249;</button>
                        <span id="calLabel"></span>
                        <button id="calNext">&#8250;</button>
                    </div>
                    <div class="cal-grid" id="calGrid"></div>
                    <button class="sub-confirm" id="btnContinuarHora" disabled style="margin-top:18px">Continuar</button>
                  </div>
                </div>

                <!-- ===== MODAL HORA (overlay interno) ===== -->
                <div class="sub-overlay" id="overlayHora">
                  <div class="sub-modal">
                    <button class="sub-close" id="closeHora">&times;</button>
                    <div class="sub-steps">
                        <div class="ss-dot done">&#10003;</div>
                        <div class="ss-line done"></div>
                        <div class="ss-dot active">2</div>
                    </div>
                    <h2 class="sub-title" style="text-align:left;font-size:1.2rem;margin-bottom:2px">Hora</h2>
                    <p class="sub-subtitle">Selecciona la hora de tu cita</p>

                    <!-- Grilla de TODOS los horarios (ocupados en rojo) -->
                    <div class="time-slots-grid" id="timeSlotsGrid"></div>
                    <p class="conflict-note" id="conflictNote"></p>
                    <button class="sub-confirm" id="btnConfirmarHora">Confirmar &rarr;</button>
                  </div>
                </div>

                <!-- ===== PANEL DE COBRO ===== -->
                <div class="panel-cobro" id="panelCobro">
                    <button class="btn-volver" id="btnVolver">&#8592; Volver</button>

                    <div class="resumen-card">
                        <div class="resumen-row"><span>Cliente</span><span id="rNombre">—</span></div>
                        <div class="resumen-row"><span>Servicio</span><span id="rServicio">—</span></div>
                        <div class="resumen-row"><span>Fecha</span><span id="rFecha">—</span></div>
                        <div class="resumen-row"><span>Hora</span><span id="rHora">—</span></div>
                        <div class="resumen-row"><span>Barbero</span><span id="rBarbero">—</span></div>
                    </div>

                    <div class="resumen-total">
                        <span class="label">Total a pagar</span>
                        <span class="precio" id="rPrecio">$0</span>
                    </div>

                    <p class="metodo-label" style="margin-top:20px;">Método de pago</p>
                    <div class="metodos-grid">
                        <div class="metodo-opcion">
                            <input type="radio" name="metodoPago" id="pagoEfectivo" value="efectivo" checked>
                            <label for="pagoEfectivo"><span class="metodo-icon">💵</span>Efectivo</label>
                        </div>
                        <div class="metodo-opcion">
                            <input type="radio" name="metodoPago" id="pagoTarjeta" value="tarjeta">
                            <label for="pagoTarjeta"><span class="metodo-icon">💳</span>Tarjeta</label>
                        </div>
                        <div class="metodo-opcion">
                            <input type="radio" name="metodoPago" id="pagoTransferencia" value="transferencia">
                            <label for="pagoTransferencia"><span class="metodo-icon">🏦</span>Transferencia</label>
                        </div>
                    </div>

                    <!-- Panel: Tarjeta -->
                    <div class="pago-panel" id="panelTarjeta">
                        <div class="form-group">
                            <label for="cardNumber">Número de tarjeta</label>
                            <input type="text" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX"
                                   maxlength="19" inputmode="numeric" autocomplete="cc-number" />
                        </div>
                        <div class="form-group">
                            <label for="cardName">Nombre en la tarjeta</label>
                            <input type="text" id="cardName" placeholder="Como aparece en la tarjeta"
                                   autocomplete="cc-name" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cardExpiry">Vencimiento</label>
                                <input type="text" id="cardExpiry" placeholder="MM/YY"
                                       maxlength="5" inputmode="numeric" autocomplete="cc-exp" />
                            </div>
                            <div class="form-group">
                                <label for="cardCvv">CVV</label>
                                <div class="cvv-wrapper">
                                    <input type="password" id="cardCvv" placeholder="•••"
                                           maxlength="4" inputmode="numeric" autocomplete="cc-csc" />
                                    <button type="button" class="cvv-toggle" id="cvvToggle" title="Mostrar/Ocultar CVV">👁</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Panel: Transferencia -->
                    <div class="pago-panel" id="panelTransferencia">
                        <div class="pago-banco-card">
                            <div class="pago-banco-row"><span>Banco</span><span>Banreservas</span></div>
                            <div class="pago-banco-row"><span>Cuenta</span><span>123-456789-0</span></div>
                            <div class="pago-banco-row"><span>Titular</span><span>Classic Barbers</span></div>
                            <div class="pago-banco-row"><span>RNC/Cédula</span><span>001-0000000-0</span></div>
                        </div>
                        <div class="form-group">
                            <label for="refTransferencia">Número de referencia</label>
                            <input type="text" id="refTransferencia"
                                   placeholder="Ingresa o sube el # de referencia" />
                        </div>
                    </div>

                    <!-- Panel: Efectivo -->
                    <div class="pago-panel visible" id="panelEfectivo">
                        <div class="pago-efectivo-msg">
                            <span style="font-size:1.5rem;">💵</span>
                            <span>Paga en el local al llegar. Tu cita quedará reservada de inmediato.</span>
                        </div>
                    </div>

                    <div class="msg-cobro" id="msgCobro"></div>

                    <button class="btn-submit" id="btnConfirmarPago">💳 Confirmar Pago</button>
                </div>

            </div>
        `;

        this._bindEvents();
    }

    /** Abre el modal (llamable desde cualquier parte: modal.open()) */
    open() {
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
        this._slotsOcupados = [];
        this._loadCortes();
        this._loadBarberos();
    }

    /* ═══════════ VALIDACIÓN DE CONFLICTOS ═══════════ */

    /**
     * Consulta el endpoint público de disponibilidad y guarda los slots
     * ocupados (formato 'HH:MM' 24h) en this._slotsOcupados.
     * @param {string} barbero - Nombre exacto del barbero
     * @param {string} fecha   - 'YYYY-MM-DD'
     */
    async _fetchSlotsOcupados(barbero, fecha) {
        if (!barbero || !fecha) { this._slotsOcupados = []; return; }
        try {
            const url = `/api/citas/disponibilidad?barbero=${encodeURIComponent(barbero)}&fecha=${fecha}`;
            const res  = await fetch(url);
            const data = await res.json();
            this._slotsOcupados = data.ok ? (data.slotsOcupados || []) : [];
        } catch (e) {
            console.warn('No se pudo verificar disponibilidad:', e.message);
            this._slotsOcupados = [];
        }
    }

    /**
     * Convierte la selección actual del drum a formato 24h 'HH:MM'.
     * El drum muestra horas en formato 12h (07-12 AM / 01-07 PM).
     */
    _getSlot24h() {
        const h  = parseInt(this._drumH, 10);
        const m  = this._drumM;          // '00','15','30','45'
        const p  = this._drumP;          // 'AM' | 'PM'
        let hour24;
        if (p === 'AM') {
            // 12 AM = medianoche (00:xx) — no aplica en horario de barbería, pero por completitud:
            hour24 = h === 12 ? 0 : h;
        } else {
            // 12 PM = mediodía (12:xx), resto sumar 12
            hour24 = h === 12 ? 12 : h + 12;
        }
        return `${String(hour24).padStart(2,'0')}:${m}`;
    }

    /**
     * Devuelve el siguiente slot disponible (bloques de 30 min) a partir
     * del slot indicado, saltando los que están en ocupados[].
     * Rango del negocio: 07:00 – 19:00.
     * @param {string} slotActual  - 'HH:MM' 24h del slot conflictivo
     * @param {string[]} ocupados  - Array de 'HH:MM' 24h ocupados
     * @returns {string|null}      - 'HH:MM' 24h del próximo libre, o null si no hay
     */
    _findNextSlot(slotActual, ocupados) {
        const [hh, mm] = slotActual.split(':').map(Number);
        let totalMin = hh * 60 + mm + 30; // empezar en el siguiente bloque
        const endMin = 19 * 60;           // límite 19:00
        while (totalMin <= endMin) {
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            const candidate = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            if (!ocupados.includes(candidate)) return candidate;
            totalMin += 30;
        }
        return null;
    }

    /**
     * Construye la grilla completa de horarios (07:00 – 19:00, bloques de 30 min).
     * Los slots ocupados se muestran en ROJO; los libres con el estilo normal.
     * Al hacer clic en uno ocupado se muestra una nota y se bloquea el botón.
     */
    _buildTimeSlots() {
        const sr    = this.shadowRoot;
        const grid  = sr.getElementById('timeSlotsGrid');
        const btnOk = sr.getElementById('btnConfirmarHora');
        const note  = sr.getElementById('conflictNote');
        if (!grid) return;

        grid.innerHTML = '';
        this._selectedSlot24 = null;
        if (btnOk) btnOk.disabled = true;
        if (note)  note.textContent = '';

        const ocupados = this._slotsOcupados || [];

        // Generar TODOS los slots del día
        for (let totalMin = 7 * 60; totalMin <= 19 * 60; totalMin += 30) {
            const h   = Math.floor(totalMin / 60);
            const m   = totalMin % 60;
            const s24 = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const label = this._slot24ToLabel(s24);
            const isOcupado = ocupados.includes(s24);

            const btn = document.createElement('button');
            btn.type        = 'button';
            btn.textContent = label;
            btn.dataset.slot = s24;
            btn.className   = isOcupado ? 'time-slot-btn occupied' : 'time-slot-btn';

            btn.addEventListener('click', () => {
                // Limpiar selección anterior
                grid.querySelectorAll('.time-slot-btn').forEach(b => {
                    b.classList.remove('selected');
                });

                if (isOcupado) {
                    // Slot ocupado: marcar visualmente pero bloquear confirm
                    btn.classList.add('selected');
                    this._selectedSlot24 = null;
                    if (btnOk) btnOk.disabled = true;
                    if (note)  note.textContent = '⛔ Este horario ya está reservado con este barbero.';
                } else {
                    // Slot libre: seleccionar y habilitar confirm
                    btn.classList.add('selected');
                    this._selectedSlot24 = s24;
                    if (btnOk) btnOk.disabled = false;
                    if (note)  note.textContent = '';
                }
            });

            grid.appendChild(btn);
        }
    }

    /**
     * Convierte una hora 24h 'HH:MM' al formato de etiqueta 12h legible.
     * @param {string} slot24 - 'HH:MM'
     * @returns {string}      - 'HH:MM AM/PM'
     */
    _slot24ToLabel(slot24) {
        const [h, m] = slot24.split(':').map(Number);
        const period = h < 12 ? 'AM' : 'PM';
        const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${period}`;
    }

    /**
     * Mueve el drum de hora y minuto al slot indicado (24h 'HH:MM').
     * Útil para saltar al siguiente slot disponible con un clic.
     * @param {string} slot24 - 'HH:MM'
     */
    _jumpDrumToSlot(slot24) {
        if (!this._drumDefs) return;
        const [h, m] = slot24.split(':').map(Number);
        const period = h < 12 ? 'AM' : 'PM';
        const h12Str = String(h === 0 ? 12 : h > 12 ? h - 12 : h).padStart(2,'0');
        const mStr   = String(m).padStart(2,'0');

        // Cambiar período si hace falta
        const periodDrum = this._drumDefs.period;
        const pIdx = periodDrum.items.indexOf(period);
        if (pIdx >= 0 && periodDrum.idx % periodDrum.items.length !== pIdx) {
            periodDrum.idx = pIdx;
            this._snapDrum(periodDrum); // esto reconstruye el drum de horas
        }

        // Ajustar hora
        const hourDrum = this._drumDefs.hour;
        const hIdx = hourDrum.items.indexOf(h12Str);
        if (hIdx >= 0) {
            const HALF = Math.floor((hourDrum.REPEATS || 7) / 2);
            hourDrum.idx = HALF * hourDrum.items.length + hIdx;
            this._snapDrum(hourDrum);
        }

        // Ajustar minuto
        const minDrum = this._drumDefs.min;
        const minIdx = minDrum.items.indexOf(mStr);
        if (minIdx >= 0) {
            const HALF = Math.floor((minDrum.REPEATS || 7) / 2);
            minDrum.idx = HALF * minDrum.items.length + minIdx;
            this._snapDrum(minDrum);
        }

        // Refrescar valores en memoria
        this._syncDrumValues();
    }

    /**
     * Consulta qué días del mes están completamente llenos para el barbero dado.
     * Guarda el resultado en this._diasCompletos (array de 'YYYY-MM-DD').
     * @param {string} barbero
     * @param {number} year
     * @param {number} month  - 0-indexed (igual que Date)
     */
    async _fetchDiasCompletos(barbero, year, month) {
        if (!barbero) { this._diasCompletos = []; return; }
        try {
            const inicio = `${year}-${String(month + 1).padStart(2,'0')}-01`;
            const lastDay = new Date(year, month + 1, 0).getDate();
            const fin    = `${year}-${String(month + 1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
            const url = `/api/citas/dias-completos?barbero=${encodeURIComponent(barbero)}&inicio=${inicio}&fin=${fin}`;
            const res  = await fetch(url);
            const data = await res.json();
            this._diasCompletos = data.ok ? (data.diasCompletos || []) : [];
        } catch (e) {
            console.warn('No se pudo consultar días completos:', e.message);
            this._diasCompletos = [];
        }
    }

    /* ═══════════ FIN VALIDACIÓN DE CONFLICTOS ═══════════ */

    /** Carga los barberos activos desde la API */
    async _loadBarberos() {
        const grid = this.shadowRoot.getElementById('barberosGrid');
        if (!grid) return;
        grid.innerHTML = '<div class="barberos-loading">Cargando barberos...</div>';
        try {
            const res = await fetch('/api/barberos/publico');
            const data = await res.json();
            if (!data.ok || !data.barberos.length) {
                grid.innerHTML = '<div class="barberos-loading">No hay barberos disponibles.</div>';
                return;
            }
            const DEFAULT_IMG = 'https://img.freepik.com/foto-gratis/retrato-estilista-barbudo-que-mira-camara_23-2147839834.jpg?semt=ais_hybrid&w=740&q=80';
            grid.innerHTML = data.barberos.map((b, i) => {
                const safeId = 'b' + b.id;
                const img = b.foto_url || DEFAULT_IMG;
                return `
                <div class="barbero-opcion">
                    <input type="radio" name="barbero" id="${safeId}" value="${b.nombre}">
                    <label for="${safeId}">
                        <img class="barbero-avatar" src="${img}" alt="${b.nombre}" onerror="this.src='${DEFAULT_IMG}'">
                        <span>${b.nombre}</span>
                    </label>
                </div>`;
            }).join('');
        } catch {
            grid.innerHTML = '<div class="barberos-loading">❌ Error al cargar barberos.</div>';
        }
    }

    /** Carga los cortes dinámicamente desde la API */
    async _loadCortes() {
        const select = this.shadowRoot.getElementById('servicio');
        try {
            const res = await fetch('/api/cortes');
            const data = await res.json();

            if (data.ok) {
                this._cortesDisponibles = data.cortes;
                
                select.innerHTML = '<option value="" disabled selected>Selecciona un servicio</option>';
                
                // 1. Añadir cortes normales
                const normales = data.cortes.filter(c => c.tipo !== 'vip');
                normales.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.nombre;
                    opt.textContent = `✂️ ${c.nombre} — $${Number(c.precio).toFixed(2)}`;
                    select.appendChild(opt);
                });
                
                // 2. Añadir paquetes VIP
                const vips = data.cortes.filter(c => c.tipo === 'vip');
                if (vips.length > 0) {
                    const optSeparator = document.createElement('option');
                    optSeparator.style.color = '#D4AF37';
                    optSeparator.value = '';
                    optSeparator.disabled = true;
                    optSeparator.textContent = 'Servicios VIP';
                    select.appendChild(optSeparator);
                    
                    vips.forEach(p => {
                        const opt = document.createElement('option');
                        opt.value = p.nombre;
                        opt.textContent = `👑 ${p.nombre} — $${Number(p.precio).toFixed(2)}`;
                        select.appendChild(opt);
                    });
                }
                
            } else {
                select.innerHTML = '<option value="" disabled selected>No hay servicios disponibles</option>';
            }
        } catch (e) {
            console.error('Error cargando cortes en el modal de reserva', e);
            select.innerHTML = '<option value="" disabled selected>Error al cargar servicios</option>';
        }
    }

    /** Cierra y resetea el modal */
    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
        this._irAPaso1();
    }

    /** Vuelve al paso 1 (formulario) y resetea todo */
    _irAPaso1() {
        const sr = this.shadowRoot;
        sr.getElementById('formCita').style.display = '';
        sr.getElementById('panelCobro').classList.remove('visible');
        sr.getElementById('formCita').reset();
        sr.getElementById('mensajeCita').className = 'mensaje-cita';
        sr.getElementById('mensajeCita').textContent = '';
        sr.getElementById('msgCobro').className = 'msg-cobro';
        sr.getElementById('msgCobro').textContent = '';
        // Resetear steps
        sr.getElementById('stepDot1').className = 'step-dot active';
        sr.getElementById('stepDot2').className = 'step-dot';
        sr.getElementById('stepLine').className = 'step-line';
        // Resetear paneles de pago y radio buttons
        const efectivo = sr.getElementById('pagoEfectivo');
        if (efectivo) efectivo.checked = true;
        this._mostrarPanelPago('efectivo');
        // Resetear selección de barbero
        sr.querySelectorAll('input[name="barbero"]').forEach(r => r.checked = false);
        // Limpiar campos de tarjeta y transferencia
        ['cardNumber','cardName','cardExpiry','cardCvv','refTransferencia']
            .forEach(id => { const el = sr.getElementById(id); if (el) el.value = ''; });
        sr.getElementById('btnConfirmarPago').disabled = false;
        // Resetear horario
        this._horarioData    = null;
        this._selectedDay    = null;
        this._selectedSlot24 = null;
        const lbl = sr.getElementById('horarioLabel');
        if (lbl) lbl.textContent = 'Seleccionar horario';
        const btnH = sr.getElementById('btnHorario');
        if (btnH) btnH.classList.remove('done');
        // Resetear calendario
        this._calMonth = new Date().getMonth();
        this._calYear  = new Date().getFullYear();
        const contBtn = sr.getElementById('btnContinuarHora');
        if (contBtn) contBtn.disabled = true;
    }

    /** Muestra el panel de cobro con los datos del formulario */
    _irAPaso2(datos) {
        const sr = this.shadowRoot;
        
        // Buscar el precio dinámicamente en los cortes cargados
        const corteSelec = (this._cortesDisponibles || []).find(c => c.nombre === datos.servicioVal);
        const precio = corteSelec ? Number(corteSelec.precio).toFixed(2) : '?';

        sr.getElementById('rNombre').textContent = datos.nombre;
        sr.getElementById('rServicio').textContent = datos.servicio;
        sr.getElementById('rFecha').textContent = datos.fecha;
        sr.getElementById('rHora').textContent = datos.hora;
        sr.getElementById('rBarbero').textContent = datos.barbero || 'Sin especificar';
        sr.getElementById('rPrecio').textContent = `$${precio}`;

        sr.getElementById('formCita').style.display = 'none';
        sr.getElementById('panelCobro').classList.add('visible');

        // Actualizar steps
        sr.getElementById('stepDot1').className = 'step-dot done';
        sr.getElementById('stepDot1').textContent = '✓';
        sr.getElementById('stepDot2').className = 'step-dot active';
        sr.getElementById('stepLine').className = 'step-line done';
    }

    /** Muestra el panel de pago correspondiente al método */
    _mostrarPanelPago(metodo) {
        const sr = this.shadowRoot;
        ['panelTarjeta','panelTransferencia','panelEfectivo'].forEach(id => {
            sr.getElementById(id).classList.remove('visible');
        });
        const map = { tarjeta: 'panelTarjeta', transferencia: 'panelTransferencia', efectivo: 'panelEfectivo' };
        if (map[metodo]) sr.getElementById(map[metodo]).classList.add('visible');
        // Habilitar/deshabilitar botón confirmar
        this._actualizarBtnPago(metodo);
    }

    /** Habilita o deshabilita el botón de confirmar según el método */
    _actualizarBtnPago(metodo) {
        const sr = this.shadowRoot;
        const btn = sr.getElementById('btnConfirmarPago');
        if (metodo === 'transferencia') {
            const ref = (sr.getElementById('refTransferencia')?.value || '').trim();
            btn.disabled = ref.length === 0;
        } else {
            btn.disabled = false;
        }
    }

    /** Valida el formulario de tarjeta; retorna mensaje de error o null si OK */
    _validarTarjeta() {
        const sr = this.shadowRoot;
        const num = (sr.getElementById('cardNumber').value || '').replace(/\s/g, '');
        const nombre = (sr.getElementById('cardName').value || '').trim();
        const expiry = (sr.getElementById('cardExpiry').value || '').trim();
        const cvv = (sr.getElementById('cardCvv').value || '').trim();

        if (num.length !== 16 || !/^\d{16}$/.test(num))
            return '⚠️ El número de tarjeta debe tener exactamente 16 dígitos.';
        if (!nombre)
            return '⚠️ El nombre en la tarjeta es obligatorio.';
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
            return '⚠️ La fecha de vencimiento debe tener formato MM/YY.';
        } else {
            const [mes, anio] = expiry.split('/').map(Number);
            const ahora = new Date();
            const expDate = new Date(2000 + anio, mes - 1, 1);
            if (expDate < new Date(ahora.getFullYear(), ahora.getMonth(), 1))
                return '⚠️ La tarjeta está vencida.';
        }
        if (!/^\d{3,4}$/.test(cvv))
            return '⚠️ El CVV debe tener 3 o 4 dígitos.';
        return null;
    }

    /* ═══════════ CALENDARIO ═══════════ */
    _buildCalendar() {
        const sr = this.shadowRoot;
        if (!this._calMonth && this._calMonth !== 0) {
            this._calMonth = new Date().getMonth();
            this._calYear  = new Date().getFullYear();
        }
        const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const today = new Date(); today.setHours(0,0,0,0);
        sr.getElementById('calLabel').textContent = `${MONTHS[this._calMonth]} ${this._calYear}`;

        const grid = sr.getElementById('calGrid');
        grid.innerHTML = '';
        ['L','M','M','J','V','S','D'].forEach(d => {
            const h = document.createElement('div');
            h.className = 'cal-head'; h.textContent = d; grid.appendChild(h);
        });
        let startDow = new Date(this._calYear, this._calMonth, 1).getDay();
        startDow = startDow === 0 ? 6 : startDow - 1;
        for (let i = 0; i < startDow; i++) {
            const e = document.createElement('div'); e.className = 'cal-day empty'; grid.appendChild(e);
        }
        const daysInMonth = new Date(this._calYear, this._calMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = 'cal-day';
            cell.textContent = d;
            const cellDate = new Date(this._calYear, this._calMonth, d);
            const fechaISO = `${this._calYear}-${String(this._calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

            if (cellDate < today)  cell.classList.add('past');
            if (cellDate.toDateString() === today.toDateString()) cell.classList.add('today');
            // Día completamente ocupado — marcar en rojo e impedir selección
            if ((this._diasCompletos || []).includes(fechaISO)) cell.classList.add('full');
            if (this._selectedDay && d === this._selectedDay.d &&
                this._calMonth === this._selectedDay.m && this._calYear === this._selectedDay.y) {
                cell.classList.add('selected');
            }
            cell.addEventListener('click', () => {
                this._selectedDay = { d, m: this._calMonth, y: this._calYear };
                this._buildCalendar();
                sr.getElementById('btnContinuarHora').disabled = false;
            });
            grid.appendChild(cell);
        }
    }

    /* ═══════════ DRUM ROLLER ═══════════ */

    /** Horas válidas según período */
    _hoursForPeriod(period) {
        return period === 'AM'
            ? ['07','08','09','10','11']          // 7 AM – 11 AM
            : ['12','01','02','03','04','05','06','07']; // 12 PM – 7 PM
    }

    _buildDrums() {
        const sr = this.shadowRoot;
        const ITEM_H = 52, PAD = 2, REPEATS = 7;
        const hoursAM = this._hoursForPeriod('AM');
        const minutes = ['00','15','30','45'];
        const periods = ['AM','PM'];

        const HALF = Math.floor(REPEATS / 2);
        const makeStartIdx = (arr, val) => {
            const i = arr.indexOf(val);
            return HALF * arr.length + (i >= 0 ? i : 0);
        };

        this._drumDefs = {
            // hora: infinita, arranca con horas AM
            hour:   { el: sr.getElementById('drumHour'),   items: hoursAM, idx: makeStartIdx(hoursAM,'10'), REPEATS, ITEM_H, PAD, loop: true  },
            min:    { el: sr.getElementById('drumMin'),     items: minutes, idx: makeStartIdx(minutes,'00'), REPEATS, ITEM_H, PAD, loop: true  },
            // periodo: NO infinito — sólo AM y PM, se detiene en los bordes
            period: { el: sr.getElementById('drumPeriod'), items: periods, idx: 0,                          REPEATS: 1, ITEM_H, PAD, loop: false }
        };

        for (const drum of Object.values(this._drumDefs)) {
            this._renderDrumInner(drum);
            this._initDrumDrag(drum);
        }
    }

    /** Construye (o reconstruye) el contenido interno de un drum */
    _renderDrumInner(drum) {
        const ITEM_H = drum.ITEM_H || 52;
        const PAD    = drum.PAD    || 2;
        const REPEATS = drum.loop === false ? 1 : (drum.REPEATS || 7);

        drum.el.innerHTML = '';
        const inner = document.createElement('div'); inner.className = 'drum-inner';
        for (let i = 0; i < PAD; i++) { const e = document.createElement('div'); e.className='drum-item'; inner.appendChild(e); }
        const total = drum.items.length * REPEATS;
        for (let i = 0; i < total; i++) {
            const e = document.createElement('div');
            e.className = 'drum-item';
            e.textContent = drum.items[i % drum.items.length];
            inner.appendChild(e);
        }
        for (let i = 0; i < PAD; i++) { const e = document.createElement('div'); e.className='drum-item'; inner.appendChild(e); }
        drum.el.appendChild(inner);
        drum._inner = inner;
        drum._total = total;
        inner.style.transition = 'none';
        inner.style.transform  = `translateY(${-drum.idx * ITEM_H}px)`;
        this._updateDrumClasses(drum);
    }

    /**
     * Cambia la lista de horas disponibles según el período seleccionado.
     * Intenta conservar la hora actualmente seleccionada; si no es válida, va al primero.
     */
    _rebuildHourDrum(period) {
        const drum   = this._drumDefs.hour;
        const ITEM_H = drum.ITEM_H || 52;
        const PAD    = drum.PAD    || 2;
        const REPEATS = drum.REPEATS || 7;
        const HALF   = Math.floor(REPEATS / 2);

        const currentHour = drum.items[drum.idx % drum.items.length];
        const newItems    = this._hoursForPeriod(period);
        const kept        = newItems.indexOf(currentHour);

        drum.items = newItems;

        // Si la hora seleccionada no está en la nueva lista, usar la primera
        const baseIdx = kept >= 0 ? kept : 0;
        drum.idx      = HALF * newItems.length + baseIdx;

        // Reconstruir el DOM interno sin quitar los event listeners
        const inner = drum._inner;
        inner.style.transition = 'none';

        // Limpiar y volver a llenar (preservar nodos de padding)
        inner.innerHTML = '';
        for (let i = 0; i < PAD; i++) { const e = document.createElement('div'); e.className='drum-item'; inner.appendChild(e); }
        const total = newItems.length * REPEATS;
        for (let i = 0; i < total; i++) {
            const e = document.createElement('div');
            e.className = 'drum-item';
            e.textContent = newItems[i % newItems.length];
            inner.appendChild(e);
        }
        for (let i = 0; i < PAD; i++) { const e = document.createElement('div'); e.className='drum-item'; inner.appendChild(e); }

        drum._total = total;
        inner.style.transform = `translateY(${-drum.idx * ITEM_H}px)`;
        this._updateDrumClasses(drum);
    }

    /** Refresca clases active/near sin mover posición */
    _updateDrumClasses(drum) {
        const PAD = drum.PAD || 2;
        drum._inner.querySelectorAll('.drum-item').forEach((el, i) => {
            const di = i - PAD;
            el.classList.remove('active','near');
            if (di === drum.idx) el.classList.add('active');
            else if (Math.abs(di - drum.idx) === 1) el.classList.add('near');
        });
    }

    _snapDrum(drum) {
        const ITEM_H  = drum.ITEM_H  || 52;
        const len     = drum.items.length;
        const REPEATS = drum.loop === false ? 1 : (drum.REPEATS || 7);
        const total   = drum._total  || len * REPEATS;

        // Clamp (siempre)
        drum.idx = Math.max(0, Math.min(total - 1, drum.idx));

        // Teleport infinito sólo para drums con loop=true
        if (drum.loop !== false && (drum.idx < len || drum.idx >= total - len)) {
            const mod = ((drum.idx % len) + len) % len;
            drum.idx  = Math.floor(REPEATS / 2) * len + mod;
            drum._inner.style.transition = 'none';
            drum._inner.style.transform  = `translateY(${-drum.idx * ITEM_H}px)`;
            drum._inner.getBoundingClientRect(); // forzar reflow
        }

        drum._inner.style.transition = 'transform .18s cubic-bezier(.25,.46,.45,.94)';
        drum._inner.style.transform  = `translateY(${-drum.idx * ITEM_H}px)`;
        this._updateDrumClasses(drum);

        // Cuando cambia el período, reconstruir las horas disponibles
        if (drum === this._drumDefs?.period) {
            const selectedPeriod = drum.items[drum.idx % drum.items.length];
            this._rebuildHourDrum(selectedPeriod);
        }
    }

    _initDrumDrag(drum) {
        const ITEM_H  = drum.ITEM_H  || 52;
        let startY = 0, startIdx = 0, dragging = false;

        const onStart = y => { dragging=true; startY=y; startIdx=drum.idx; drum._inner.style.transition='none'; };
        const onMove  = y => {
            if (!dragging) return;
            const total = drum._total || drum.items.length;
            drum.idx = Math.max(0, Math.min(total - 1, startIdx + Math.round((startY - y) / ITEM_H)));
            drum._inner.style.transform = `translateY(${-drum.idx * ITEM_H}px)`;
            this._updateDrumClasses(drum);
        };
        const onEnd = () => { if (!dragging) return; dragging=false; this._snapDrum(drum); };

        drum.el.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientY); });
        window.addEventListener('mousemove',   e => onMove(e.clientY));
        window.addEventListener('mouseup',     onEnd);
        drum.el.addEventListener('touchstart', e => onStart(e.touches[0].clientY), {passive:true});
        drum.el.addEventListener('touchmove',  e => { onMove(e.touches[0].clientY); e.preventDefault(); }, {passive:false});
        drum.el.addEventListener('touchend',   onEnd);
        drum.el.addEventListener('wheel', e => {
            e.preventDefault();
            const total = drum._total || drum.items.length;
            drum.idx = Math.max(0, Math.min(total - 1, drum.idx + (e.deltaY > 0 ? 1 : -1)));
            this._snapDrum(drum);
        }, {passive:false});
    }

    _syncDrumValues() {
        if (!this._drumDefs) return;
        const mod = (def) => def.items[def.idx % def.items.length];
        this._drumH = mod(this._drumDefs.hour);
        this._drumM = mod(this._drumDefs.min);
        this._drumP = mod(this._drumDefs.period);
    }

    _bindEvents() {

        const sr = this.shadowRoot;

        // Botón X
        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());

        // Clic fuera del modal-box
        this.addEventListener('click', (e) => {
            if (e.composedPath()[0] === this) this.close();
        });

        // Tecla Escape
        this._onKeydown = (e) => {
            if (e.key !== 'Escape') return;
            if (sr.getElementById('overlayHora').classList.contains('open')) { sr.getElementById('overlayHora').classList.remove('open'); return; }
            if (sr.getElementById('overlayDia').classList.contains('open'))  { sr.getElementById('overlayDia').classList.remove('open');  return; }
            this.close();
        };
        document.addEventListener('keydown', this._onKeydown);

        // ─── HORARIO: Botón trigger ───
        sr.getElementById('btnHorario').addEventListener('click', async () => {
            // Pre-cargar días completos del mes actual según barbero seleccionado
            const barbero = sr.querySelector('input[name="barbero"]:checked')?.value || '';
            await this._fetchDiasCompletos(barbero, this._calYear || new Date().getFullYear(),
                this._calMonth !== undefined ? this._calMonth : new Date().getMonth());
            this._buildCalendar();
            sr.getElementById('overlayDia').classList.add('open');
        });

        // ─── MODAL DÍA: cerrar ───
        sr.getElementById('closeDia').addEventListener('click', () => sr.getElementById('overlayDia').classList.remove('open'));
        sr.getElementById('overlayDia').addEventListener('click', e => { if (e.target === sr.getElementById('overlayDia')) sr.getElementById('overlayDia').classList.remove('open'); });

        // ─── MODAL DÍA: navegar meses ───
        sr.getElementById('calPrev').addEventListener('click', async () => {
            if (this._calMonth === 0) { this._calMonth = 11; this._calYear--; }
            else this._calMonth--;
            const barberoPrev = sr.querySelector('input[name="barbero"]:checked')?.value || '';
            await this._fetchDiasCompletos(barberoPrev, this._calYear, this._calMonth);
            this._buildCalendar();
        });
        sr.getElementById('calNext').addEventListener('click', async () => {
            if (this._calMonth === 11) { this._calMonth = 0; this._calYear++; }
            else this._calMonth++;
            const barberoNext = sr.querySelector('input[name="barbero"]:checked')?.value || '';
            await this._fetchDiasCompletos(barberoNext, this._calYear, this._calMonth);
            this._buildCalendar();
        });

        // ─── MODAL DÍA: continuar a Hora ───
        sr.getElementById('btnContinuarHora').addEventListener('click', async () => {
            sr.getElementById('overlayDia').classList.remove('open');

            // Obtener barbero y fecha seleccionados
            const barbero = sr.querySelector('input[name="barbero"]:checked')?.value || '';
            const d = this._selectedDay;
            if (barbero && d) {
                const fechaISO = `${d.y}-${String(d.m+1).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
                await this._fetchSlotsOcupados(barbero, fechaISO);
            } else {
                this._slotsOcupados = [];
            }

            // Renderizar grilla (todos los slots, ocupados en rojo)
            this._buildTimeSlots();

            sr.getElementById('overlayHora').classList.add('open');
        });

        // ─── MODAL HORA: cerrar ───
        sr.getElementById('closeHora').addEventListener('click', () => sr.getElementById('overlayHora').classList.remove('open'));
        sr.getElementById('overlayHora').addEventListener('click', e => { if (e.target === sr.getElementById('overlayHora')) sr.getElementById('overlayHora').classList.remove('open'); });

        // ─── MODAL HORA: confirmar ───
        sr.getElementById('btnConfirmarHora').addEventListener('click', () => {
            const slot24 = this._selectedSlot24;
            if (!slot24) return;

            sr.getElementById('overlayHora').classList.remove('open');

            // Actualizar botón trigger con la selección
            const d      = this._selectedDay;
            const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
            const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const dow    = new Date(d.y, d.m, d.d).getDay();
            const horaLabel = this._slot24ToLabel(slot24);
            const label  = `${DAYS[dow]} ${d.d} ${MONTHS[d.m]} · ${horaLabel}`;
            sr.getElementById('horarioLabel').textContent = label;
            sr.getElementById('btnHorario').classList.add('done');

            // Guardar para submit
            const fechaISO = `${d.y}-${String(d.m+1).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
            this._horarioData = { day: d, label, fecha: fechaISO, hora: horaLabel, slot24 };
        });

        // Cambio de método de pago → mostrar panel dinámico
        sr.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this._mostrarPanelPago(e.target.value);
            });
        });

        // Máscara: número de tarjeta (XXXX XXXX XXXX XXXX)
        sr.getElementById('cardNumber').addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').slice(0, 16);
            e.target.value = val.match(/.{1,4}/g)?.join(' ') ?? val;
        });

        // Máscara: fecha vencimiento (MM/YY)
        sr.getElementById('cardExpiry').addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
            if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);
            e.target.value = val;
        });

        // Toggle visibilidad CVV
        sr.getElementById('cvvToggle').addEventListener('click', () => {
            const cvv = sr.getElementById('cardCvv');
            const btn = sr.getElementById('cvvToggle');
            if (cvv.type === 'password') { cvv.type = 'text'; btn.textContent = '🙈'; }
            else { cvv.type = 'password'; btn.textContent = '👁'; }
        });

        // Referencia transferencia → habilitar/deshabilitar botón
        sr.getElementById('refTransferencia').addEventListener('input', () => {
            const metodo = sr.querySelector('input[name="metodoPago"]:checked')?.value ?? 'efectivo';
            this._actualizarBtnPago(metodo);
        });

        // PASO 1 → PASO 2: validar formulario (+ re-validar conflicto) y mostrar cobro
        sr.getElementById('formCita').addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = sr.getElementById('mensajeCita');
            const nombre = sr.getElementById('nombreCliente').value.trim();
            const servSel = sr.getElementById('servicio');
            const servicioVal = servSel.value;
            const servicio = servicioVal ? servSel.options[servSel.selectedIndex].text : '';
            const barbero = sr.querySelector('input[name="barbero"]:checked')?.value || '';
            const horario = this._horarioData;

            if (!nombre || !servicioVal) {
                msg.className = 'mensaje-cita error';
                msg.textContent = '⚠️ Completa tu nombre y selecciona un servicio.';
                return;
            }
            if (!horario) {
                msg.className = 'mensaje-cita error';
                msg.textContent = '⚠️ Por favor selecciona un horario.';
                return;
            }
            if (!barbero) {
                msg.className = 'mensaje-cita error';
                msg.textContent = '⚠️ Por favor selecciona un barbero.';
                return;
            }

            // ── Re-validación de conflicto en el submit ──────────────────
            // Necesaria si el usuario cambia el barbero después de elegir hora.
            msg.className = 'mensaje-cita';
            msg.textContent = '';

            // Convertir la hora guardada (ej. '12:30 PM') a 24h para comparar
            const horaGuardada = horario.hora; // '12:30 PM'
            const [timePart, period] = horaGuardada.split(' ');
            const [hStr, mStr] = timePart.split(':');
            let h = parseInt(hStr, 10);
            const m = mStr;
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            const slot24Submit = `${String(h).padStart(2,'0')}:${m}`;

            // Volver a consultar (por si cambió el barbero)
            await this._fetchSlotsOcupados(barbero, horario.fecha);
            const ocupadosSubmit = this._slotsOcupados || [];

            if (ocupadosSubmit.includes(slot24Submit)) {
                const siguiente = this._findNextSlot(slot24Submit, ocupadosSubmit);
                let errMsg = `⛔ El horario ${horaGuardada} no está disponible con ${barbero}.`;
                if (siguiente) {
                    errMsg += ` Próximo libre: ${this._slot24ToLabel(siguiente)}.`;
                }
                msg.className = 'mensaje-cita error';
                msg.textContent = errMsg;
                return;
            }
            // ────────────────────────────────────────────────────────────

            this._datosCita = {
                nombre, servicio, servicioVal,
                hora:   horario.hora,
                fecha:  horario.fecha,
                barbero
            };
            this._irAPaso2(this._datosCita);
        });

        // Botón Volver al paso 1
        sr.getElementById('btnVolver').addEventListener('click', () => this._irAPaso1());

        // PASO 2: Confirmar pago → validar y enviar al servidor
        sr.getElementById('btnConfirmarPago').addEventListener('click', async () => {
            const msg = sr.getElementById('msgCobro');
            const metodoPago = sr.querySelector('input[name="metodoPago"]:checked')?.value ?? 'efectivo';
            const { nombre, servicio, servicioVal, hora, fecha } = this._datosCita;
            const btnPagar = sr.getElementById('btnConfirmarPago');

            // Validaciones específicas por método
            if (metodoPago === 'tarjeta') {
                const errTarjeta = this._validarTarjeta();
                if (errTarjeta) {
                    msg.className = 'msg-cobro error';
                    msg.textContent = errTarjeta;
                    return;
                }
            }
            if (metodoPago === 'transferencia') {
                const ref = (sr.getElementById('refTransferencia').value || '').trim();
                if (!ref) {
                    msg.className = 'msg-cobro error';
                    msg.textContent = '⚠️ Ingresa el número de referencia de la transferencia.';
                    return;
                }
            }

            const token = localStorage.getItem('token');
            if (!token) {
                msg.className = 'msg-cobro error';
                msg.textContent = '❌ Debes iniciar sesión para agendar una cita.';
                return;
            }

            btnPagar.disabled = true;
            btnPagar.textContent = 'Procesando...';

            // Construir payload
            const payload = {
                name: nombre,
                service: servicioVal,
                time: hora,
                date: fecha,
                metodoPago,
                barbero: this._datosCita.barbero || ''
            };
            if (metodoPago === 'tarjeta') {
                const num = sr.getElementById('cardNumber').value.replace(/\s/g, '');
                payload.ultimos4 = num.slice(-4);
            }
            if (metodoPago === 'transferencia') {
                payload.referencia = (sr.getElementById('refTransferencia').value || '').trim();
            }

            try {
                const respuesta = await fetch('/api/citas/agendar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify(payload)
                });

                const data = await respuesta.json();

                if (!data.ok) {
                    msg.className = 'msg-cobro error';
                    msg.textContent = `❌ ${data.error || 'Error al agendar la cita.'}`;
                    btnPagar.disabled = false;
                    btnPagar.textContent = '💳 Confirmar Pago';
                    return;
                }

                msg.className = 'msg-cobro exito';
                msg.innerHTML = `✅ <strong>¡Pago confirmado!</strong> Tu cita está reservada.`;

                this.dispatchEvent(new CustomEvent('cita-confirmada', {
                    bubbles: true, composed: true,
                    detail: { nombre, servicio, hora, fecha, metodoPago }
                }));

                setTimeout(() => {
                    btnPagar.disabled = false;
                    btnPagar.textContent = '💳 Confirmar Pago';
                    this.close();
                }, 2500);

            } catch (error) {
                msg.className = 'msg-cobro error';
                msg.textContent = '❌ Error al conectar con el servidor. Intenta de nuevo.';
                btnPagar.disabled = false;
                btnPagar.textContent = '💳 Confirmar Pago';
            }
        });
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._onKeydown);
    }
}

customElements.define('reserva-component', ReservaComponent);