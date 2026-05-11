/**
 * admin-citas-component.js
 * Web Component — Panel de administración de citas.
 * Solo debe abrirse cuando el usuario tiene rol 'admin'.
 * Permite ver TODAS las citas del sistema y cambiar su estado.
 */
class AdminCitasComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._citas = [];
        this._filtro = 'todas';
        this._guardando = new Set(); // IDs de filas en proceso de guardado
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,.82);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 1100;
                justify-content: center;
                align-items: center;
                padding: 20px;
                box-sizing: border-box;
            }
            :host(.active) { display: flex; animation: fadeIn .25s ease; }
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }

            /* ── BOX ── */
            .modal-box {
                position: relative;
                background: #0d111a;
                border: 1px solid rgba(212,175,55,.4);
                border-radius: 20px;
                width: 100%;
                max-width: 900px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                animation: slideUp .3s cubic-bezier(.34,1.56,.64,1);
            }
            @keyframes slideUp {
                from { opacity:0; transform:translateY(40px) scale(.96) }
                to   { opacity:1; transform:none }
            }

            /* ── CLOSE ── */
            .modal-close {
                position: absolute;
                top: 14px; right: 16px;
                background: rgba(255,255,255,.06);
                border: none;
                color: #94a3b8;
                font-size: 1.4rem;
                width: 34px; height: 34px;
                border-radius: 50%;
                cursor: pointer;
                transition: background .2s, color .2s;
                display: flex; align-items: center; justify-content: center;
                z-index: 10;
            }
            .modal-close:hover { background: rgba(212,175,55,.15); color: #D4AF37; }

            /* ── BANNER ── */
            .modal-banner {
                background: linear-gradient(135deg,#1a1f2b,#0e1119);
                border-bottom: 1px solid rgba(212,175,55,.2);
                padding: 26px 24px 18px;
                display: flex;
                align-items: center;
                gap: 14px;
                flex-shrink: 0;
            }
            .banner-icon {
                width: 46px; height: 46px;
                border-radius: 13px;
                background: linear-gradient(135deg,#D4AF37,#b8922e);
                display: flex; align-items: center; justify-content: center;
                font-size: 1.4rem;
                flex-shrink: 0;
            }
            .banner-title {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 1.3rem; font-weight: 700; font-style: italic;
                color: #f6f6f8; margin: 0 0 3px;
            }
            .banner-sub {
                font-family: 'Manrope', sans-serif;
                font-size: .8rem; color: #64748b; margin: 0;
            }

            /* ── TOOLBAR ── */
            .toolbar {
                background: rgba(255,255,255,.02);
                border-bottom: 1px solid rgba(255,255,255,.06);
                padding: 12px 20px;
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                flex-shrink: 0;
            }
            .filter-label {
                font-family: 'Manrope', sans-serif;
                font-size: .76rem;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: .06em;
                margin-right: 4px;
            }
            .filter-btn {
                font-family: 'Manrope', sans-serif;
                font-size: .78rem;
                font-weight: 700;
                padding: 5px 14px;
                border-radius: 20px;
                border: 1px solid rgba(255,255,255,.1);
                background: transparent;
                color: #94a3b8;
                cursor: pointer;
                transition: all .18s;
            }
            .filter-btn:hover { border-color: rgba(212,175,55,.35); color: #D4AF37; }
            .filter-btn.active {
                background: rgba(212,175,55,.15);
                border-color: rgba(212,175,55,.5);
                color: #D4AF37;
            }
            .total-badge {
                margin-left: auto;
                font-family: 'Manrope', sans-serif;
                font-size: .78rem;
                color: #475569;
            }

            /* ── SCROLL AREA ── */
            .scroll-area {
                flex: 1;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #D4AF37 transparent;
                padding: 16px 20px 20px;
            }

            /* ── STATES ── */
            .state-center {
                text-align: center;
                padding: 48px 20px;
                font-family: 'Manrope', sans-serif;
            }
            .loading-dots { display:flex; justify-content:center; gap:8px; margin-bottom:14px; }
            .loading-dots span {
                width:8px; height:8px; border-radius:50%;
                background:#D4AF37;
                animation: bounce 1.2s infinite ease-in-out;
            }
            .loading-dots span:nth-child(2){animation-delay:.2s}
            .loading-dots span:nth-child(3){animation-delay:.4s}
            @keyframes bounce {
                0%,80%,100%{transform:scale(.6);opacity:.4}
                40%{transform:scale(1);opacity:1}
            }
            .loading-text { color:#64748b; font-size:.9rem; }
            .empty-icon   { font-size:2.8rem; margin-bottom:12px; opacity:.5; }
            .empty-title  { font-family:'Playfair Display',serif; font-size:1.1rem; color:#f6f6f8; margin:0 0 6px; }
            .empty-sub    { color:#64748b; font-size:.85rem; margin:0; }
            .error-msg    {
                font-family:'Manrope',sans-serif; font-size:.9rem;
                color:#fca5a5;
                background:rgba(239,68,68,.08);
                border:1px solid rgba(239,68,68,.2);
                border-radius:10px;
                padding:14px; text-align:center;
            }
            .hidden { display:none !important; }

            /* ── TABLE ── */
            .citas-table {
                width: 100%;
                border-collapse: collapse;
                font-family: 'Manrope', sans-serif;
            }
            .citas-table th {
                font-size: .7rem;
                font-weight: 700;
                letter-spacing: .08em;
                text-transform: uppercase;
                color: #475569;
                border-bottom: 1px solid rgba(255,255,255,.08);
                padding: 8px 12px;
                text-align: left;
                position: sticky;
                top: 0;
                background: #0d111a;
                z-index: 1;
            }
            .citas-table td {
                padding: 10px 12px;
                border-bottom: 1px solid rgba(255,255,255,.04);
                vertical-align: middle;
                font-size: .82rem;
                color: #cbd5e1;
            }
            .citas-table tr:last-child td { border-bottom: none; }
            .citas-table tr:hover td { background: rgba(255,255,255,.02); }

            .td-id     { color:#475569; font-size:.72rem; width:40px; }
            .td-cliente { font-weight:700; color:#f1f5f9; }
            .td-servicio { color:#94a3b8; }
            .td-barbero  { color:#94a3b8; font-size:.78rem; }

            /* fecha + hora */
            .fecha-hora { display:flex; flex-direction:column; gap:2px; }
            .fecha-hora .fh-date { font-weight:600; font-size:.81rem; color:#e2e8f0; }
            .fecha-hora .fh-time { font-size:.74rem; color:#64748b; }

            /* status badge */
            .status-badge {
                font-size: .67rem;
                font-weight: 700;
                padding: 3px 9px;
                border-radius: 20px;
                letter-spacing: .06em;
                text-transform: uppercase;
                display: inline-block;
            }
            .status-pendiente  { background:rgba(251,191,36,.12); color:#fbbf24; border:1px solid rgba(251,191,36,.3); }
            .status-completada { background:rgba(52,211,153,.10);  color:#6ee7b7; border:1px solid rgba(52,211,153,.3); }
            .status-cancelada  { background:rgba(239,68,68,.10);   color:#fca5a5; border:1px solid rgba(239,68,68,.3); }

            /* select estado */
            .select-status {
                background: rgba(255,255,255,.05);
                border: 1px solid rgba(255,255,255,.12);
                color: #f1f5f9;
                font-family: 'Manrope', sans-serif;
                font-size: .8rem;
                padding: 5px 8px;
                border-radius: 8px;
                outline: none;
                cursor: pointer;
                transition: border-color .2s;
                min-width: 120px;
            }
            .select-status:focus { border-color: #D4AF37; }
            .select-status option { background: #1a1f2b; }

            /* guardar btn */
            .btn-guardar {
                padding: 5px 14px;
                background: linear-gradient(135deg,#D4AF37,#b8922e);
                color: #111621;
                border: none;
                border-radius: 8px;
                font-family: 'Manrope', sans-serif;
                font-size: .78rem;
                font-weight: 700;
                cursor: pointer;
                transition: transform .15s, box-shadow .2s, opacity .2s;
                white-space: nowrap;
            }
            .btn-guardar:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(212,175,55,.3);
            }
            .btn-guardar:disabled { opacity:.45; cursor:not-allowed; }
            .btn-guardar.saving   { opacity:.6; }

            /* inline feedback */
            .row-msg {
                font-size: .72rem;
                padding: 2px 8px;
                border-radius: 6px;
                display: none;
                white-space: nowrap;
            }
            .row-msg.ok    { display:inline-block; background:rgba(52,211,153,.12); color:#6ee7b7; border:1px solid rgba(52,211,153,.3); }
            .row-msg.error { display:inline-block; background:rgba(239,68,68,.1);   color:#fca5a5; border:1px solid rgba(239,68,68,.3); }

            /* acciones cell */
            .td-acciones { display:flex; align-items:center; gap:8px; min-width:210px; }

            @media(max-width:700px) {
                .citas-table th:nth-child(4),
                .citas-table td:nth-child(4) { display:none; }
                .modal-box { border-radius:14px; }
                .scroll-area { padding:12px 12px 16px; }
            }
        </style>

        <div class="modal-box" part="box">
            <button class="modal-close" id="btnCerrar">&times;</button>

            <!-- BANNER -->
            <div class="modal-banner">
                <div class="banner-icon">🗂️</div>
                <div>
                    <p class="banner-title">Panel de Citas — Admin</p>
                    <p class="banner-sub">Gestión completa de todas las reservas</p>
                </div>
            </div>

            <!-- TOOLBAR -->
            <div class="toolbar">
                <span class="filter-label">Filtrar:</span>
                <button class="filter-btn active" data-filtro="todas">Todas</button>
                <button class="filter-btn" data-filtro="pendiente">Pendientes</button>
                <button class="filter-btn" data-filtro="completada">Completadas</button>
                <button class="filter-btn" data-filtro="cancelada">Canceladas</button>
                <span class="total-badge" id="totalBadge"></span>
            </div>

            <!-- SCROLL -->
            <div class="scroll-area">
                <div class="state-center" id="stateLoading">
                    <div class="loading-dots"><span></span><span></span><span></span></div>
                    <p class="loading-text">Cargando citas...</p>
                </div>
                <div class="state-center hidden" id="stateVacio">
                    <div class="empty-icon">📅</div>
                    <p class="empty-title">Sin citas registradas</p>
                    <p class="empty-sub">No hay citas que coincidan con el filtro seleccionado.</p>
                </div>
                <div class="hidden" id="stateError">
                    <p class="error-msg">❌ Error al cargar las citas. Intenta de nuevo.</p>
                </div>

                <table class="citas-table hidden" id="citasTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Fecha / Hora</th>
                            <th>Barbero</th>
                            <th>Servicio</th>
                            <th>Estado actual</th>
                            <th>Cambiar estado</th>
                        </tr>
                    </thead>
                    <tbody id="citasTbody"></tbody>
                </table>
            </div>
        </div>`;

        this._bindEvents();
    }

    open() {
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

    // ── Carga ────────────────────────────────────────────────

    async _cargarCitas() {
        const sr       = this.shadowRoot;
        const loading  = sr.getElementById('stateLoading');
        const vacio    = sr.getElementById('stateVacio');
        const error    = sr.getElementById('stateError');
        const table    = sr.getElementById('citasTable');

        loading.classList.remove('hidden');
        vacio.classList.add('hidden');
        error.classList.add('hidden');
        table.classList.add('hidden');

        const token = localStorage.getItem('token');
        if (!token) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            error.querySelector('p').textContent = '⚠️ Debes iniciar sesión como administrador.';
            return;
        }

        try {
            const res  = await fetch('/api/citas/admin/todas', {
                headers: { Authorization: token }
            });
            const data = await res.json();

            loading.classList.add('hidden');

            if (res.status === 401 || res.status === 403) {
                error.classList.remove('hidden');
                error.querySelector('p').textContent = '🔒 Acceso denegado. Se requiere rol administrador.';
                return;
            }
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
        const sr     = this.shadowRoot;
        const vacio  = sr.getElementById('stateVacio');
        const table  = sr.getElementById('citasTable');
        const tbody  = sr.getElementById('citasTbody');
        const badge  = sr.getElementById('totalBadge');

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
                <td class="td-id">${c.id}</td>
                <td class="td-cliente">${this._esc(c.nombre_cliente || '—')}</td>
                <td>
                    <div class="fecha-hora">
                        <span class="fh-date">${this._formatFecha(c.date)}</span>
                        <span class="fh-time">${this._formatHora(c.time)}</span>
                    </div>
                </td>
                <td class="td-barbero">${this._esc(c.barbero || '—')}</td>
                <td class="td-servicio">${this._esc(c.service || '—')}</td>
                <td>
                    <span class="status-badge ${this._statusClass(c.status)}" id="badge-${c.id}">
                        ${c.status || 'pendiente'}
                    </span>
                </td>
                <td>
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

        // Event delegation
        tbody.onclick = (e) => {
            const btn = e.target.closest('.btn-guardar');
            if (btn) this._guardarEstado(parseInt(btn.dataset.id));
        };
    }

    _esc(str) {
        return String(str)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
    }

    async _guardarEstado(id_cita) {
        if (this._guardando.has(id_cita)) return;

        const sr     = this.shadowRoot;
        const sel    = sr.getElementById(`sel-${id_cita}`);
        const btn    = sr.getElementById(`btn-${id_cita}`);
        const msg    = sr.getElementById(`msg-${id_cita}`);
        const badge  = sr.getElementById(`badge-${id_cita}`);

        const nuevo_status = sel.value;
        const token = localStorage.getItem('token');
        if (!token) return;

        // UI: loading
        this._guardando.add(id_cita);
        btn.disabled  = true;
        btn.textContent = '...';
        btn.classList.add('saving');
        msg.className = 'row-msg';
        msg.textContent = '';

        try {
            const res  = await fetch(`/api/citas/admin/${id_cita}/estado`, {
                method:  'PUT',
                headers: { 'Content-Type':'application/json', Authorization: token },
                body:    JSON.stringify({ status: nuevo_status })
            });
            const data = await res.json();

            if (!data.ok) {
                msg.className   = 'row-msg error';
                msg.textContent = data.error || 'Error';
            } else {
                // Actualizar badge en la fila
                badge.textContent = nuevo_status;
                badge.className   = `status-badge ${this._statusClass(nuevo_status)}`;
                sel.dataset.original = nuevo_status;

                // Actualizar en el array local
                const cita = this._citas.find(c => c.id === id_cita);
                if (cita) cita.status = nuevo_status;

                msg.className   = 'row-msg ok';
                msg.textContent = '✓ Guardado';

                // Limpiar mensaje tras 2.5 s
                setTimeout(() => {
                    msg.className   = 'row-msg';
                    msg.textContent = '';
                }, 2500);
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

    // ── Events ───────────────────────────────────────────────

    _bindEvents() {
        const sr = this.shadowRoot;

        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());
        this.addEventListener('click', e => { if (e.composedPath()[0] === this) this.close(); });
        this._onKey = e => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKey);

        // Filtros
        sr.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sr.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._filtro = btn.dataset.filtro;
                this._renderTabla();
            });
        });
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._onKey);
    }
}

customElements.define('admin-citas-component', AdminCitasComponent);
