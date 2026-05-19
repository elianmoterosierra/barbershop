/**
 * barbero-panel-component.js
 * Panel exclusivo para usuarios con rol 'barbero'.
 * Muestra SOLO las citas de ese barbero con control de estado igual al panel admin.
 */
class BarberoPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._citas    = [];
        this._filtro   = 'todas';
        this._guardando = new Set();
    }

    connectedCallback() { this._render(); }

    _getSession() {
        try { return JSON.parse(localStorage.getItem('zhola_user')) || null; }
        catch { return null; }
    }

    _isBarbero() {
        const s = this._getSession();
        return s && (s.role === 'barbero' || s.role === 'admin');
    }

    _render() {
        const session = this._getSession();
        const nombre  = session?.nombre || 'Barbero';

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: none; position: fixed; inset: 0;
                background: rgba(0,0,0,.82); backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 1100; justify-content: center;
                align-items: center; padding: 20px; box-sizing: border-box;
            }
            :host(.active) { display: flex; animation: fadeIn .25s ease; }
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }

            /* BOX */
            .modal-box {
                position: relative; background: #0d111a;
                border: 1px solid rgba(212,175,55,.4); border-radius: 20px;
                width: 100%; max-width: 900px; max-height: 90vh;
                overflow: hidden; display: flex; flex-direction: column;
                animation: slideUp .3s cubic-bezier(.34,1.56,.64,1);
            }
            @keyframes slideUp {
                from{opacity:0;transform:translateY(40px) scale(.96)} to{opacity:1;transform:none}
            }

            /* CLOSE */
            .modal-close {
                position: absolute; top: 14px; right: 16px;
                background: rgba(255,255,255,.06); border: none; color: #94a3b8;
                font-size: 1.4rem; width: 34px; height: 34px; border-radius: 50%;
                cursor: pointer; transition: .2s; display: flex;
                align-items: center; justify-content: center; z-index: 10;
            }
            .modal-close:hover { background: rgba(212,175,55,.15); color: #D4AF37; }

            /* BANNER */
            .modal-banner {
                background: linear-gradient(135deg,#1a1f2b,#0e1119);
                border-bottom: 1px solid rgba(212,175,55,.2);
                padding: 26px 24px 18px; display: flex; align-items: center;
                gap: 14px; flex-shrink: 0;
            }
            .banner-icon {
                width: 46px; height: 46px; border-radius: 13px;
                background: linear-gradient(135deg,#D4AF37,#b8922e);
                display: flex; align-items: center; justify-content: center;
                font-size: 1.4rem; flex-shrink: 0;
            }
            .banner-title {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 1.3rem; font-weight: 700; font-style: italic;
                color: #f6f6f8; margin: 0 0 3px;
            }
            .banner-sub { font-family: 'Manrope', sans-serif; font-size: .8rem; color: #64748b; margin: 0; }

            /* TOOLBAR */
            .toolbar {
                background: rgba(255,255,255,.02);
                border-bottom: 1px solid rgba(255,255,255,.06);
                padding: 12px 20px; display: flex; align-items: center;
                gap: 8px; flex-wrap: wrap; flex-shrink: 0;
            }
            .filter-label {
                font-family: 'Manrope', sans-serif; font-size: .76rem;
                font-weight: 700; color: #64748b;
                text-transform: uppercase; letter-spacing: .06em; margin-right: 4px;
            }
            .filter-btn {
                font-family: 'Manrope', sans-serif; font-size: .78rem; font-weight: 700;
                padding: 5px 14px; border-radius: 20px;
                border: 1px solid rgba(255,255,255,.1);
                background: transparent; color: #94a3b8; cursor: pointer; transition: all .18s;
            }
            .filter-btn:hover { border-color: rgba(212,175,55,.35); color: #D4AF37; }
            .filter-btn.active {
                background: rgba(212,175,55,.15); border-color: rgba(212,175,55,.5); color: #D4AF37;
            }
            .total-badge { margin-left: auto; font-family: 'Manrope', sans-serif; font-size: .78rem; color: #475569; }

            /* SCROLL AREA */
            .scroll-area {
                flex: 1; overflow-y: auto;
                scrollbar-width: thin; scrollbar-color: #D4AF37 transparent;
                padding: 16px 20px 20px;
            }

            /* STATES */
            .state-center { text-align: center; padding: 48px 20px; font-family: 'Manrope', sans-serif; }
            .loading-dots { display:flex; justify-content:center; gap:8px; margin-bottom:14px; }
            .loading-dots span {
                width: 8px; height: 8px; border-radius: 50%; background: #D4AF37;
                animation: bounce 1.2s infinite ease-in-out;
            }
            .loading-dots span:nth-child(2){animation-delay:.2s}
            .loading-dots span:nth-child(3){animation-delay:.4s}
            @keyframes bounce {
                0%,80%,100%{transform:scale(.6);opacity:.4}
                40%{transform:scale(1);opacity:1}
            }
            .loading-text { color: #64748b; font-size: .9rem; }
            .empty-icon   { font-size: 2.8rem; margin-bottom: 12px; opacity: .5; }
            .empty-title  { font-family:'Playfair Display',serif; font-size:1.1rem; color:#f6f6f8; margin:0 0 6px; }
            .empty-sub    { color: #64748b; font-size: .85rem; margin: 0; }
            .error-msg {
                font-family: 'Manrope', sans-serif; font-size: .9rem; color: #fca5a5;
                background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
                border-radius: 10px; padding: 14px; text-align: center;
            }
            .hidden { display: none !important; }

            /* TABLE */
            .citas-table { width: 100%; border-collapse: collapse; font-family: 'Manrope', sans-serif; }
            .citas-table th {
                font-size: .7rem; font-weight: 700; letter-spacing: .08em;
                text-transform: uppercase; color: #475569;
                border-bottom: 1px solid rgba(255,255,255,.08);
                padding: 8px 12px; text-align: left;
                position: sticky; top: 0; background: #0d111a; z-index: 1;
            }
            .citas-table td {
                padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,.04);
                vertical-align: middle; font-size: .82rem; color: #cbd5e1;
            }
            .citas-table tr:last-child td { border-bottom: none; }
            .citas-table tr:hover td { background: rgba(255,255,255,.02); }

            .td-id      { color: #475569; font-size: .72rem; width: 40px; }
            .td-cliente { font-weight: 700; color: #f1f5f9; }
            .td-servicio { color: #94a3b8; }

            .fecha-hora { display:flex; flex-direction:column; gap:2px; }
            .fecha-hora .fh-date { font-weight:600; font-size:.81rem; color:#e2e8f0; }
            .fecha-hora .fh-time { font-size:.74rem; color:#64748b; }

            /* status badge */
            .status-badge {
                font-size: .67rem; font-weight: 700; padding: 3px 9px;
                border-radius: 20px; letter-spacing: .06em;
                text-transform: uppercase; display: inline-block;
            }
            .status-pendiente  { background:rgba(251,191,36,.12); color:#fbbf24; border:1px solid rgba(251,191,36,.3); }
            .status-completada { background:rgba(52,211,153,.10);  color:#6ee7b7; border:1px solid rgba(52,211,153,.3); }
            .status-cancelada  { background:rgba(239,68,68,.10);   color:#fca5a5; border:1px solid rgba(239,68,68,.3); }

            /* select estado */
            .select-status {
                background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12);
                color: #f1f5f9; font-family: 'Manrope', sans-serif; font-size: .8rem;
                padding: 5px 8px; border-radius: 8px; outline: none;
                cursor: pointer; transition: border-color .2s; min-width: 120px;
            }
            .select-status:focus { border-color: #D4AF37; }
            .select-status option { background: #1a1f2b; }

            /* guardar btn */
            .btn-guardar {
                padding: 5px 14px;
                background: linear-gradient(135deg,#D4AF37,#b8922e);
                color: #111621; border: none; border-radius: 8px;
                font-family: 'Manrope', sans-serif; font-size: .78rem;
                font-weight: 700; cursor: pointer;
                transition: transform .15s, box-shadow .2s, opacity .2s; white-space: nowrap;
            }
            .btn-guardar:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(212,175,55,.3); }
            .btn-guardar:disabled { opacity:.45; cursor:not-allowed; }
            .btn-guardar.saving   { opacity:.6; }

            /* inline feedback */
            .row-msg {
                font-size: .72rem; padding: 2px 8px;
                border-radius: 6px; display: none; white-space: nowrap;
            }
            .row-msg.ok    { display:inline-block; background:rgba(52,211,153,.12); color:#6ee7b7; border:1px solid rgba(52,211,153,.3); }
            .row-msg.error { display:inline-block; background:rgba(239,68,68,.1);   color:#fca5a5; border:1px solid rgba(239,68,68,.3); }

            .td-acciones { display:flex; align-items:center; gap:8px; min-width:210px; }

            /* TABS */
            .main-tabs { display:flex; gap:0; border-bottom:1px solid rgba(255,255,255,.07); flex-shrink:0; padding:0 20px; background:rgba(255,255,255,.01); }
            .main-tab { background:transparent; border:none; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; color:#64748b; padding:12px 20px; cursor:pointer; border-bottom:2px solid transparent; transition:.2s; }
            .main-tab:hover { color:#94a3b8; }
            .main-tab.active { color:#D4AF37; border-bottom-color:#D4AF37; }
            .tab-section { display:none; flex:1; overflow:hidden; flex-direction:column; }
            .tab-section.active { display:flex; flex-direction:column; }

            /* ESTADO BARBERO */
            .estado-scroll { flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#D4AF37 transparent; padding:28px 24px 28px; }
            .estado-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:28px 24px; text-align:center; max-width:400px; margin:0 auto; }
            .estado-avatar { width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid rgba(212,175,55,.4); margin:0 auto 14px; display:block; background:#1a1f2b; }
            .estado-nombre { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; color:#f6f6f8; margin:0 0 4px; }
            .estado-grado { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#D4AF37; text-transform:uppercase; letter-spacing:.06em; margin:0 0 20px; }
            .estado-badge { display:inline-flex; align-items:center; gap:8px; padding:10px 22px; border-radius:50px; font-family:'Manrope',sans-serif; font-size:.9rem; font-weight:700; margin-bottom:24px; }
            .estado-badge.activo { background:rgba(52,211,153,.12); border:1px solid rgba(52,211,153,.35); color:#6ee7b7; }
            .estado-badge.inactivo { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); color:#fca5a5; }
            .estado-badge .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
            .estado-badge.activo .dot { background:#34d399; }
            .estado-badge.inactivo .dot { background:#f87171; }
            .btn-toggle-estado { width:100%; padding:13px; border-radius:12px; border:none; font-family:'Manrope',sans-serif; font-size:.95rem; font-weight:800; cursor:pointer; transition:.2s; margin-bottom:14px; letter-spacing:.02em; }
            .btn-toggle-estado.set-inactivo { background:rgba(239,68,68,.1); color:#fca5a5; border:1px solid rgba(239,68,68,.3); }
            .btn-toggle-estado.set-inactivo:hover { background:rgba(239,68,68,.22); }
            .btn-toggle-estado.set-activo { background:rgba(52,211,153,.1); color:#6ee7b7; border:1px solid rgba(52,211,153,.3); }
            .btn-toggle-estado.set-activo:hover { background:rgba(52,211,153,.22); }
            .btn-toggle-estado:disabled { opacity:.45; cursor:not-allowed; }
            .estado-hint { font-family:'Manrope',sans-serif; font-size:.78rem; color:#475569; line-height:1.5; margin:0; }
            .estado-msg { margin-top:14px; padding:9px 14px; border-radius:8px; font-family:'Manrope',sans-serif; font-size:.82rem; text-align:center; display:none; }
            .estado-msg.ok  { display:block; background:rgba(52,211,153,.12); border:1px solid rgba(52,211,153,.4); color:#6ee7b7; }
            .estado-msg.err { display:block; background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.4); color:#fca5a5; }
            .estado-loading { text-align:center; color:#64748b; font-family:'Manrope',sans-serif; font-size:.9rem; padding:40px 0; }

            /* CORTES */
            .cortes-scroll { flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#D4AF37 transparent; padding:20px 24px 24px; }
            .section-label { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#D4AF37; letter-spacing:.08em; text-transform:uppercase; margin:0 0 14px; }
            .form-group { margin-bottom:12px; }
            .form-group label { display:block; font-family:'Manrope',sans-serif; font-size:.76rem; font-weight:700; color:#94a3b8; letter-spacing:.05em; margin-bottom:5px; }
            .form-input { width:100%; padding:9px 13px; box-sizing:border-box; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:9px; color:#f6f6f8; font-family:'Manrope',sans-serif; font-size:.9rem; outline:none; transition:border-color .2s; }
            .form-input:focus { border-color:rgba(212,175,55,.6); }
            .form-input::placeholder { color:rgba(255,255,255,.3); }
            .form-textarea { resize:vertical; min-height:56px; }
            .form-actions { display:flex; gap:10px; margin-top:4px; }
            .btn-gold { flex:1; padding:11px; background:#D4AF37; color:#111621; border:none; border-radius:9px; font-family:'Manrope',sans-serif; font-size:.9rem; font-weight:800; cursor:pointer; transition:.2s; }
            .btn-gold:hover { background:#c49b2a; transform:translateY(-1px); }
            .btn-cancel-form { padding:11px 18px; background:rgba(255,255,255,.06); color:#94a3b8; border:1px solid rgba(255,255,255,.1); border-radius:9px; font-family:'Manrope',sans-serif; font-size:.9rem; font-weight:700; cursor:pointer; transition:.2s; }
            .btn-cancel-form:hover { background:rgba(255,255,255,.1); color:#f6f6f8; }
            .msg-form { margin-top:10px; padding:9px 13px; border-radius:8px; display:none; font-family:'Manrope',sans-serif; font-size:.85rem; text-align:center; }
            .msg-form.ok  { display:block; background:rgba(52,211,153,.12); border:1px solid rgba(52,211,153,.4); color:#6ee7b7; }
            .msg-form.err { display:block; background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.4); color:#fca5a5; }
            .divider { border:none; border-top:1px solid rgba(255,255,255,.07); margin:18px 0; }
            .cortes-list { display:flex; flex-direction:column; gap:10px; }
            .corte-card { display:flex; gap:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:13px; transition:border-color .2s; }
            .corte-card:hover { border-color:rgba(212,175,55,.25); }
            .corte-img { width:72px; height:72px; border-radius:9px; object-fit:cover; flex-shrink:0; }
            .corte-img-placeholder { width:72px; height:72px; border-radius:9px; flex-shrink:0; background:rgba(212,175,55,.08); border:1px solid rgba(212,175,55,.15); display:flex; align-items:center; justify-content:center; font-size:1.6rem; }
            .corte-info { flex:1; min-width:0; }
            .corte-nombre { font-family:'Playfair Display',Georgia,serif; font-size:1rem; font-weight:700; color:#f6f6f8; margin:0 0 3px; }
            .corte-precio { font-family:'Playfair Display',Georgia,serif; font-size:1.05rem; font-weight:700; color:#D4AF37; margin:0 0 3px; }
            .corte-desc { font-family:'Manrope',sans-serif; font-size:.8rem; color:#94a3b8; margin:0; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
            .corte-btns { display:flex; flex-direction:column; gap:5px; flex-shrink:0; justify-content:center; }
            .btn-edit-c,.btn-del-c { padding:6px 12px; border:none; border-radius:7px; font-family:'Manrope',sans-serif; font-size:.76rem; font-weight:700; cursor:pointer; transition:.2s; white-space:nowrap; }
            .btn-edit-c { background:rgba(212,175,55,.12); color:#D4AF37; border:1px solid rgba(212,175,55,.25); }
            .btn-edit-c:hover { background:rgba(212,175,55,.25); }
            .btn-del-c { background:rgba(239,68,68,.1); color:#fca5a5; border:1px solid rgba(239,68,68,.25); }
            .btn-del-c:hover { background:rgba(239,68,68,.25); }
            .empty-list { text-align:center; color:#64748b; font-family:'Manrope',sans-serif; font-size:.88rem; padding:24px 0; }

            /* ── RESPONSIVE ─────────────────────────────────── */

            /* Tablet (≤ 780px) */
            @media(max-width: 780px) {
                :host { padding: 12px; }

                .modal-box { border-radius: 16px; max-height: 95dvh; }

                .modal-banner { padding: 20px 18px 14px; gap: 11px; }
                .banner-icon  { width: 38px; height: 38px; font-size: 1.1rem; }
                .banner-title { font-size: 1.1rem; }

                .main-tabs { padding: 0 12px; }
                .main-tab  { padding: 10px 14px; font-size: .82rem; }

                .toolbar { padding: 10px 14px; gap: 6px; }
                .filter-btn { padding: 4px 10px; font-size: .74rem; }

                .scroll-area  { padding: 12px 14px 16px; }
                .cortes-scroll { padding: 14px 14px 18px; }

                /* Ocultar columna # y Barbero en tabla */
                .citas-table th:nth-child(1),
                .citas-table td:nth-child(1) { display: none; }

                .citas-table th { padding: 7px 8px; font-size: .65rem; }
                .citas-table td { padding: 8px 8px; font-size: .78rem; }

                .td-acciones { min-width: 0; flex-wrap: wrap; gap: 6px; }
                .select-status { min-width: 100px; font-size: .76rem; }
            }

            /* Mobile (≤ 560px) — modal centrado, full ancho */
            @media(max-width: 560px) {
                :host {
                    padding: 10px;
                    align-items: center;   /* CENTRADO — no bottom sheet */
                }

                .modal-box {
                    border-radius: 16px;
                    max-height: 92dvh;
                    width: 100%;
                    border-bottom: 1px solid rgba(212,175,55,.4); /* restaurar borde */
                }

                /* Sin drag handle en modo centrado */
                .modal-box::before { display: none; }

                .modal-banner { padding: 14px 14px 12px; gap: 10px; }
                .banner-icon  { width: 34px; height: 34px; font-size: 1rem; border-radius: 10px; }
                .banner-title { font-size: .95rem; }
                .banner-sub   { font-size: .72rem; }
                .modal-close  { top: 10px; right: 12px; width: 30px; height: 30px; }

                .main-tabs { padding: 0 8px; }
                .main-tab  { padding: 8px 10px; font-size: .78rem; flex: 1; text-align: center; }

                .toolbar { padding: 8px 10px; gap: 5px; }
                .filter-label { display: none; }
                .filter-btn { padding: 4px 8px; font-size: .71rem; }
                .total-badge { margin-left: auto; font-size: .72rem; }

                /* Tabla → modo tarjeta */
                .citas-table thead { display: none; }
                .citas-table,
                .citas-table tbody,
                .citas-table tr,
                .citas-table td { display: block; width: 100%; box-sizing: border-box; }

                .citas-table tr {
                    background: rgba(255,255,255,.03);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 12px;
                    padding: 10px 12px;
                    margin-bottom: 8px;
                }
                .citas-table tr:last-child { margin-bottom: 0; }
                .citas-table td { border: none; padding: 2px 0; color: #cbd5e1; font-size: .82rem; }
                .citas-table td:nth-child(1) { display: none; }

                .citas-table td::before {
                    content: attr(data-label);
                    font-size: .6rem; font-weight: 700; color: #475569;
                    text-transform: uppercase; letter-spacing: .07em;
                    display: block; margin-top: 5px; margin-bottom: 1px;
                }
                .citas-table td:nth-child(2)::before { margin-top: 0; }

                .td-cliente { font-size: .9rem !important; font-weight: 700; color: #f1f5f9 !important; }

                .td-acciones {
                    display: flex; flex-direction: row; align-items: center;
                    flex-wrap: nowrap; gap: 6px;
                    margin-top: 8px; padding-top: 8px;
                    border-top: 1px solid rgba(255,255,255,.06);
                    width: 100%; box-sizing: border-box;
                }
                .select-status { flex: 1; min-width: 0; font-size: .78rem; padding: 6px 6px; }
                .btn-guardar   { flex-shrink: 0; padding: 6px 12px; font-size: .76rem; white-space: nowrap; }
                .row-msg       { display: none !important; }
                .row-msg.ok, .row-msg.error { display: none !important; } /* Ocultar en mobile — ya no caben */

                /* Cortes */
                .cortes-scroll { padding: 10px 10px 14px; }
                .corte-card    { flex-wrap: wrap; gap: 8px; padding: 10px; }
                .corte-img,
                .corte-img-placeholder { width: 48px; height: 48px; font-size: 1.1rem; border-radius: 8px; }
                .corte-nombre  { font-size: .92rem; }
                .corte-precio  { font-size: .95rem; }
                .corte-btns    { flex-direction: row; width: 100%; justify-content: flex-end; gap: 6px; }
                .btn-edit-c, .btn-del-c { flex: 1; text-align: center; padding: 6px 6px; font-size: .73rem; }

                .scroll-area { padding: 10px 10px 12px; }
            }

            /* Extra small (≤ 380px) */
            @media(max-width: 380px) {
                :host { padding: 6px; }
                .modal-box { border-radius: 14px; max-height: 94dvh; }
                .banner-title { font-size: .88rem; }
                .banner-icon  { width: 30px; height: 30px; font-size: .9rem; }
                .main-tab  { font-size: .73rem; padding: 7px 6px; }
                .filter-btn { padding: 3px 6px; font-size: .68rem; }
                .select-status { font-size: .74rem; }
                .btn-guardar   { padding: 6px 10px; font-size: .72rem; }
                .btn-edit-c, .btn-del-c { font-size: .68rem; padding: 5px 4px; }
            }



        </style>

        <div class="modal-box" part="box">
            <button class="modal-close" id="btnCerrar">&times;</button>

            <!-- BANNER -->
            <div class="modal-banner">
                <div class="banner-icon">✂️</div>
                <div>
                    <p class="banner-title">Panel Barbero — ${nombre}</p>
                    <p class="banner-sub">Gestiona tus citas y servicios</p>
                </div>
            </div>

            <!-- MAIN TABS -->
            <div class="main-tabs">
                <button class="main-tab active" data-tab="citas">📋 Mis Citas</button>
                <button class="main-tab" data-tab="estado">🟢 Mi Estado</button>
                <button class="main-tab" data-tab="cortes">✂️ Mis Servicios</button>
            </div>

            <!-- TAB: CITAS -->
            <div class="tab-section active" id="secCitas">
                <div class="toolbar">
                    <span class="filter-label">Filtrar:</span>
                    <button class="filter-btn active" data-filtro="todas">Todas</button>
                    <button class="filter-btn" data-filtro="pendiente">Pendientes</button>
                    <button class="filter-btn" data-filtro="completada">Completadas</button>
                    <button class="filter-btn" data-filtro="cancelada">Canceladas</button>
                    <span class="total-badge" id="totalBadge"></span>
                </div>
                <div class="scroll-area">
                    <div class="state-center" id="stateLoading">
                        <div class="loading-dots"><span></span><span></span><span></span></div>
                        <p class="loading-text">Cargando citas...</p>
                    </div>
                    <div class="state-center hidden" id="stateVacio">
                        <div class="empty-icon">📅</div>
                        <p class="empty-title">Sin citas registradas</p>
                        <p class="empty-sub">No hay citas que coincidan con el filtro.</p>
                    </div>
                    <div class="hidden" id="stateError"><p class="error-msg">❌ Error al cargar. Intenta de nuevo.</p></div>
                    <table class="citas-table hidden" id="citasTable">
                        <thead><tr><th>#</th><th>Cliente</th><th>Fecha / Hora</th><th>Servicio</th><th>Estado</th><th>Cambiar</th></tr></thead>
                        <tbody id="citasTbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- TAB: ESTADO -->
            <div class="tab-section" id="secEstado">
                <div class="estado-scroll">
                    <div class="estado-loading" id="estadoLoading">Cargando...</div>
                    <div class="estado-card" id="estadoCard" style="display:none">
                        <img class="estado-avatar" id="estadoAvatar" src="" alt="">
                        <p class="estado-nombre" id="estadoNombre"></p>
                        <p class="estado-grado" id="estadoGrado"></p>
                        <div class="estado-badge" id="estadoBadge">
                            <span class="dot"></span>
                            <span id="estadoBadgeText"></span>
                        </div>
                        <button class="btn-toggle-estado" id="btnToggleEstado">⚠️ Marcar Fuera de Servicio</button>
                        <p class="estado-hint">Cuando estés <strong>fuera de servicio</strong>, no aparecerás en el selector de reservas y los clientes no podrán agendar citas contigo.</p>
                        <div class="estado-msg" id="estadoMsg"></div>
                    </div>
                </div>
            </div>

            <!-- TAB: CORTES -->
            <div class="tab-section" id="secCortes">
                <div class="cortes-scroll">
                    <p class="section-label" id="formTitleC">➕ Añadir nuevo servicio</p>
                    <div class="form-group">
                        <label>✂️ Nombre del corte</label>
                        <input class="form-input" type="text" id="cNombre" placeholder="Ej: Degradado Moderno">
                    </div>
                    <div class="form-group">
                        <label>💰 Precio ($)</label>
                        <input class="form-input" type="number" id="cPrecio" placeholder="35.00" min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>📷 Foto (URL)</label>
                        <input class="form-input" type="url" id="cFoto" placeholder="https://ejemplo.com/foto.jpg">
                    </div>
                    <div class="form-group">
                        <label>📝 Descripción</label>
                        <textarea class="form-input form-textarea" id="cDesc" rows="3" placeholder="Describe el servicio..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button class="btn-gold" id="btnGuardarC">💾 Guardar</button>
                        <button class="btn-cancel-form" id="btnCancelarC" style="display:none">Cancelar</button>
                    </div>
                    <div class="msg-form" id="msgCortes"></div>
                    <hr class="divider">
                    <p class="section-label">Lista de servicios</p>
                    <div class="cortes-list" id="listaCortes"><div class="empty-list">Cargando...</div></div>
                </div>
            </div>
        </div>`;

        this._bindEvents();
    }

    open() {
        if (!this._isBarbero()) return;
        this._cortes    = [];
        this._editandoC = null;
        this._miBarberoPerfil = null;
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
        this._cargarCitas();
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── Helpers ──────────────────────────────────────────────

    _formatFecha(v) {
        if (!v) return '—';
        const d = new Date(v);
        if (isNaN(d.getTime())) return v;
        const local = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        return local.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
    }

    _formatHora(v) {
        if (!v) return '—';
        const d = new Date(v);
        let h, m;
        if (!isNaN(d.getTime())) { h = d.getUTCHours(); m = d.getUTCMinutes(); }
        else { const p = String(v).split(':'); h = parseInt(p[0])||0; m = parseInt(p[1])||0; }
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
    }

    _statusClass(s) {
        return { pendiente:'status-pendiente', completada:'status-completada', cancelada:'status-cancelada' }[s] || 'status-pendiente';
    }

    _esc(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Carga ────────────────────────────────────────────────

    async _cargarCitas() {
        const sr      = this.shadowRoot;
        const loading = sr.getElementById('stateLoading');
        const vacio   = sr.getElementById('stateVacio');
        const error   = sr.getElementById('stateError');
        const table   = sr.getElementById('citasTable');

        loading.classList.remove('hidden');
        vacio.classList.add('hidden');
        error.classList.add('hidden');
        table.classList.add('hidden');

        const token = localStorage.getItem('token');
        if (!token) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            error.querySelector('p').textContent = '⚠️ Debes iniciar sesión.';
            return;
        }

        try {
            const res  = await fetch('/api/citas/mis-citas-barbero', {
                headers: { Authorization: token }
            });
            const data = await res.json();
            loading.classList.add('hidden');

            if (!data.ok) {
                error.classList.remove('hidden');
                error.querySelector('p').textContent = `❌ ${data.error || 'Error al cargar las citas.'}`;
                return;
            }

            this._citas = data.citas || [];
            this._renderTabla();

        } catch (err) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            error.querySelector('p').textContent = '❌ Error de conexión. Intenta de nuevo.';
        }
    }

    _renderTabla() {
        const sr    = this.shadowRoot;
        const vacio = sr.getElementById('stateVacio');
        const table = sr.getElementById('citasTable');
        const tbody = sr.getElementById('citasTbody');
        const badge = sr.getElementById('totalBadge');

        const filtradas = this._filtro === 'todas'
            ? this._citas
            : this._citas.filter(c => c.status === this._filtro);

        badge.textContent = `${filtradas.length} cita${filtradas.length !== 1 ? 's' : ''}`;

        if (!filtradas.length) {
            table.classList.add('hidden');
            vacio.classList.remove('hidden');
            return;
        }

        vacio.classList.add('hidden');
        table.classList.remove('hidden');

        tbody.innerHTML = filtradas.map(c => `
            <tr id="row-${c.id}">
                <td class="td-id" data-label="#">${c.id}</td>
                <td class="td-cliente" data-label="Cliente">${this._esc(c.nombre_cliente || '—')}</td>
                <td data-label="Fecha / Hora">
                    <div class="fecha-hora">
                        <span class="fh-date">${this._formatFecha(c.fecha)}</span>
                        <span class="fh-time">${this._formatHora(c.hora)}</span>
                    </div>
                </td>
                <td class="td-servicio" data-label="Servicio">${this._esc(c.servicio || '—')}</td>
                <td data-label="Estado">
                    <span class="status-badge ${this._statusClass(c.status)}" id="badge-${c.id}">
                        ${c.status || 'pendiente'}
                    </span>
                </td>
                <td data-label="Cambiar estado">
                    <div class="td-acciones">
                        <select class="select-status" id="sel-${c.id}" data-original="${c.status}">
                            <option value="pendiente"  ${c.status === 'pendiente'  ? 'selected' : ''}>Pendiente</option>
                            <option value="completada" ${c.status === 'completada' ? 'selected' : ''}>Completada</option>
                            <option value="cancelada"  ${c.status === 'cancelada'  ? 'selected' : ''}>Cancelada</option>
                        </select>
                        <button class="btn-guardar" id="btn-${c.id}" data-id="${c.id}">Guardar</button>
                        <span class="row-msg" id="msg-${c.id}"></span>
                    </div>
                </td>
            </tr>
        `).join('');

        // Event delegation en tbody
        tbody.onclick = (e) => {
            const btn = e.target.closest('.btn-guardar');
            if (btn) this._guardarEstado(parseInt(btn.dataset.id));
        };
    }

    // ── Cambio de estado ─────────────────────────────────────

    async _guardarEstado(id_cita) {
        if (this._guardando.has(id_cita)) return;

        const sr    = this.shadowRoot;
        const sel   = sr.getElementById(`sel-${id_cita}`);
        const btn   = sr.getElementById(`btn-${id_cita}`);
        const msg   = sr.getElementById(`msg-${id_cita}`);
        const badge = sr.getElementById(`badge-${id_cita}`);

        const nuevo_status = sel.value;
        const token = localStorage.getItem('token');
        if (!token) return;

        // UI: loading
        this._guardando.add(id_cita);
        btn.disabled    = true;
        btn.textContent = '...';
        btn.classList.add('saving');
        msg.className   = 'row-msg';
        msg.textContent = '';

        try {
            const res  = await fetch(`/api/citas/${id_cita}/estado-barbero`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: token },
                body:    JSON.stringify({ status: nuevo_status })
            });
            const data = await res.json();

            if (!data.ok) {
                msg.className   = 'row-msg error';
                msg.textContent = data.error || 'Error';
            } else {
                badge.textContent = nuevo_status;
                badge.className   = `status-badge ${this._statusClass(nuevo_status)}`;
                sel.dataset.original = nuevo_status;

                const cita = this._citas.find(c => c.id === id_cita);
                if (cita) cita.status = nuevo_status;

                msg.className   = 'row-msg ok';
                msg.textContent = '✓ Guardado';
                setTimeout(() => { msg.className = 'row-msg'; msg.textContent = ''; }, 2500);
            }
        } catch {
            msg.className   = 'row-msg error';
            msg.textContent = 'Error de red';
        } finally {
            this._guardando.delete(id_cita);
            btn.disabled    = false;
            btn.textContent = 'Guardar';
            btn.classList.remove('saving');
        }
    }

    // ── ESTADO PROPIO ─────────────────────────────────────────

    async _cargarEstado() {
        const sr = this.shadowRoot;
        const loading = sr.getElementById('estadoLoading');
        const card    = sr.getElementById('estadoCard');
        loading.style.display = 'block';
        loading.textContent = 'Cargando tu perfil...';
        card.style.display = 'none';
        const token = localStorage.getItem('token');
        try {
            const res  = await fetch('/api/barberos/mi-perfil', { headers: { Authorization: token } });
            const data = await res.json();
            loading.style.display = 'none';
            if (!data.ok) {
                loading.textContent = '❌ ' + (data.error || 'No se encontró tu perfil de barbero.');
                loading.style.display = 'block';
                return;
            }
            this._miBarberoPerfil = data.barbero;
            this._renderEstado();
        } catch {
            loading.style.display = 'none';
            loading.textContent = '❌ Error de conexión.';
        }
    }

    _renderEstado() {
        const sr = this.shadowRoot;
        const b  = this._miBarberoPerfil;
        if (!b) return;
        const DEFAULT = 'https://img.freepik.com/foto-gratis/retrato-estilista-barbudo-que-mira-camara_23-2147839834.jpg?semt=ais_hybrid&w=740&q=80';
        sr.getElementById('estadoAvatar').src  = b.foto_url || DEFAULT;
        sr.getElementById('estadoNombre').textContent = b.nombre;
        sr.getElementById('estadoGrado').textContent  = b.grado;
        const badge = sr.getElementById('estadoBadge');
        const badgeText = sr.getElementById('estadoBadgeText');
        const btn = sr.getElementById('btnToggleEstado');
        badge.className = 'estado-badge ' + (b.activo ? 'activo' : 'inactivo');
        badgeText.textContent = b.activo ? '✅ Activo' : '⚠️ Fuera de servicio';
        if (b.activo) {
            btn.className   = 'btn-toggle-estado set-inactivo';
            btn.textContent = '⚠️ Marcar como Fuera de Servicio';
        } else {
            btn.className   = 'btn-toggle-estado set-activo';
            btn.textContent = '✅ Marcar como Activo';
        }
        sr.getElementById('estadoCard').style.display = '';
        sr.getElementById('estadoMsg').className = 'estado-msg';
    }

    async _toggleMiEstado() {
        const sr  = this.shadowRoot;
        const btn = sr.getElementById('btnToggleEstado');
        const msg = sr.getElementById('estadoMsg');
        const b   = this._miBarberoPerfil;
        if (!b) return;
        btn.disabled = true;
        msg.className = 'estado-msg';
        const token = localStorage.getItem('token');
        try {
            const res  = await fetch(`/api/barberos/${b.id}/estado`, { method: 'PATCH', headers: { Authorization: token } });
            const data = await res.json();
            if (data.ok) {
                this._miBarberoPerfil.activo = data.barbero.activo;
                this._renderEstado();
                msg.className = 'estado-msg ok';
                msg.textContent = data.barbero.activo ? '✅ Ahora estás Activo. Los clientes pueden reservar citas contigo.' : '⚠️ Ahora estás Fuera de Servicio. No aparecerás en las reservas.';
                setTimeout(() => { msg.className = 'estado-msg'; }, 4000);
            } else {
                msg.className = 'estado-msg err';
                msg.textContent = '❌ ' + (data.error || 'No se pudo cambiar el estado.');
            }
        } catch {
            msg.className = 'estado-msg err';
            msg.textContent = '❌ Error de conexión.';
        } finally {
            btn.disabled = false;
        }
    }

    // ── CORTES ───────────────────────────────────────────────

    async _cargarCortes() {
        const lista = this.shadowRoot.getElementById('listaCortes');
        lista.innerHTML = '<div class="empty-list">Cargando...</div>';
        try {
            const res  = await fetch('/api/cortes');
            const data = await res.json();
            if (data.ok) { this._cortes = data.cortes; this._renderCortes(); }
            else lista.innerHTML = '<div class="empty-list">Error al cargar.</div>';
        } catch { lista.innerHTML = '<div class="empty-list">❌ Sin conexión.</div>'; }
    }

    _renderCortes() {
        const lista = this.shadowRoot.getElementById('listaCortes');
        if (!this._cortes.length) { lista.innerHTML = '<div class="empty-list">Sin servicios registrados.</div>'; return; }
        lista.innerHTML = this._cortes.map(c => `
            <div class="corte-card" data-id="${c.id}">
                ${c.foto_url
                    ? `<img class="corte-img" src="${c.foto_url}" alt="${c.nombre}" onerror="this.style.display='none'">`
                    : `<div class="corte-img-placeholder">✂️</div>`}
                <div class="corte-info">
                    <p class="corte-nombre">${this._esc(c.nombre)}</p>
                    <p class="corte-precio">$${Number(c.precio).toFixed(2)}</p>
                    <p class="corte-desc">${this._esc(c.descripcion || 'Sin descripción')}</p>
                </div>
                <div class="corte-btns">
                    <button class="btn-edit-c" data-id="${c.id}">✏️ Editar</button>
                    <button class="btn-del-c"  data-id="${c.id}">🗑️ Eliminar</button>
                </div>
            </div>`).join('');
        lista.querySelectorAll('.btn-edit-c').forEach(b => b.addEventListener('click', () => this._editarCorte(Number(b.dataset.id))));
        lista.querySelectorAll('.btn-del-c').forEach(b  => b.addEventListener('click', () => this._eliminarCorte(Number(b.dataset.id))));
    }

    _editarCorte(id) {
        const c = this._cortes.find(x => x.id === id); if (!c) return;
        const sr = this.shadowRoot;
        sr.getElementById('cNombre').value = c.nombre;
        sr.getElementById('cPrecio').value = c.precio;
        sr.getElementById('cFoto').value   = c.foto_url || '';
        sr.getElementById('cDesc').value   = c.descripcion || '';
        sr.getElementById('formTitleC').textContent = '✏️ Editando: ' + c.nombre;
        sr.getElementById('btnGuardarC').textContent = '💾 Guardar Cambios';
        sr.getElementById('btnCancelarC').style.display = 'block';
        this._editandoC = id;
        sr.getElementById('cNombre').scrollIntoView({ behavior:'smooth', block:'start' });
    }

    _resetFormC() {
        const sr = this.shadowRoot;
        ['cNombre','cPrecio','cFoto','cDesc'].forEach(id => sr.getElementById(id).value = '');
        sr.getElementById('formTitleC').textContent = '➕ Añadir nuevo servicio';
        sr.getElementById('btnGuardarC').textContent = '💾 Guardar';
        sr.getElementById('btnCancelarC').style.display = 'none';
        sr.getElementById('msgCortes').className = 'msg-form';
        this._editandoC = null;
    }

    async _guardarCorte() {
        const sr  = this.shadowRoot;
        const msg = sr.getElementById('msgCortes');
        const nombre      = sr.getElementById('cNombre').value.trim();
        const precio      = sr.getElementById('cPrecio').value;
        const foto_url    = sr.getElementById('cFoto').value.trim();
        const descripcion = sr.getElementById('cDesc').value.trim();
        const token = localStorage.getItem('token');

        // Reset estilos previos
        ['cNombre','cPrecio','cFoto','cDesc'].forEach(id => {
            const el = sr.getElementById(id);
            if (el) el.style.borderColor = '';
        });
        msg.className = 'msg-form';
        msg.textContent = '';

        // Validar todos los campos
        let errores = [];
        if (!nombre) errores.push('✂️ El nombre del corte es obligatorio.');
        else if (nombre.length < 2) errores.push('✂️ Mínimo 2 caracteres en el nombre.');

        if (!precio || isNaN(precio) || Number(precio) <= 0)
            errores.push('💰 El precio es obligatorio y debe ser mayor a 0.');

        if (!descripcion) errores.push('📝 La descripción es obligatoria.');
        else if (descripcion.length < 5) errores.push('📝 Mínimo 5 caracteres en la descripción.');

        if (!foto_url) errores.push('📷 La URL de la foto es obligatoria.');
        else if (!/^https?:\/\/.+/.test(foto_url)) errores.push('📷 URL inválida. Debe empezar con http:// o https://.');

        if (errores.length > 0) {
            msg.className = 'msg-form err';
            msg.innerHTML = errores.join('<br>');
            if (!nombre)                           { const el=sr.getElementById('cNombre');  if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            if (!precio || Number(precio)<=0)      { const el=sr.getElementById('cPrecio');  if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            if (!descripcion)                      { const el=sr.getElementById('cDesc');    if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            if (!foto_url)                         { const el=sr.getElementById('cFoto');    if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            return;
        }

        const isEdit = this._editandoC !== null;
        const url    = isEdit ? `/api/cortes/${this._editandoC}` : '/api/cortes';
        const method = isEdit ? 'PUT' : 'POST';
        try {
            const res  = await fetch(url, { method, headers:{'Content-Type':'application/json','Authorization':token}, body: JSON.stringify({nombre, precio:Number(precio), descripcion, foto_url, tipo:'normal'}) });
            const data = await res.json();
            if (data.ok) {
                msg.className='msg-form ok'; msg.textContent = isEdit ? '✅ Corte actualizado.' : '✅ Corte creado.';
                this._resetFormC(); this._cargarCortes();
                setTimeout(() => { msg.className='msg-form'; }, 3000);
            } else { msg.className='msg-form err'; msg.textContent='❌ '+(data.error||'Error al guardar.'); }
        } catch { msg.className='msg-form err'; msg.textContent='❌ Error de conexión.'; }
    }

    async _eliminarCorte(id) {
        const c = this._cortes.find(x => x.id === id); if (!c) return;
        if (!confirm(`¿Eliminar "${c.nombre}"? Esta acción no se puede deshacer.`)) return;
        const token = localStorage.getItem('token');
        const msg   = this.shadowRoot.getElementById('msgCortes');
        try {
            const res  = await fetch(`/api/cortes/${id}`, { method:'DELETE', headers:{'Authorization':token} });
            const data = await res.json();
            if (data.ok) { msg.className='msg-form ok'; msg.textContent='✅ Corte eliminado.'; this._cargarCortes(); setTimeout(()=>{msg.className='msg-form';},2500); }
            else { msg.className='msg-form err'; msg.textContent='❌ '+(data.error||'Error al eliminar.'); }
        } catch { msg.className='msg-form err'; msg.textContent='❌ Error de conexión.'; }
    }

    // ── Events ───────────────────────────────────────────────

    _bindEvents() {
        const sr = this.shadowRoot;

        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());
        this.addEventListener('click', e => { if (e.composedPath()[0] === this) this.close(); });
        this._onKey = e => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKey);

        // Main tabs
        sr.querySelectorAll('.main-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                sr.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
                sr.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                const secMap = { citas: 'secCitas', estado: 'secEstado', cortes: 'secCortes' };
                sr.getElementById(secMap[tab.dataset.tab]).classList.add('active');
                if (tab.dataset.tab === 'cortes') this._cargarCortes();
                if (tab.dataset.tab === 'estado') this._cargarEstado();
            });
        });

        // Filtros citas
        sr.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sr.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._filtro = btn.dataset.filtro;
                this._renderTabla();
            });
        });

        // Cortes form
        sr.getElementById('btnGuardarC').addEventListener('click', () => this._guardarCorte());
        sr.getElementById('btnCancelarC').addEventListener('click', () => this._resetFormC());

        // Toggle estado propio
        sr.getElementById('btnToggleEstado').addEventListener('click', () => this._toggleMiEstado());
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._onKey);
    }
}

customElements.define('barbero-panel-component', BarberoPanel);
