class MisCitasComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._citaActiva = null;
        this._calificacion = 0;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <style>
            :host { display:none; position:fixed; inset:0; background:rgba(0,0,0,.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:1000; justify-content:center; align-items:center; padding:20px; box-sizing:border-box; }
            :host(.active) { display:flex; animation:fadeIn .25s ease; }
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }

            .modal-box { position:relative; background:#12161f; border:1px solid rgba(212,175,55,.35); border-radius:20px; width:100%; max-width:620px; max-height:88vh; overflow:hidden; display:flex; flex-direction:column; animation:slideUp .3s cubic-bezier(.34,1.56,.64,1); }
            @keyframes slideUp { from{opacity:0;transform:translateY(40px) scale(.96)} to{opacity:1;transform:none} }

            .modal-close { position:absolute; top:14px; right:16px; background:rgba(255,255,255,.06); border:none; color:#94a3b8; font-size:1.4rem; width:34px; height:34px; border-radius:50%; cursor:pointer; transition:background .2s,color .2s; display:flex; align-items:center; justify-content:center; z-index:10; }
            .modal-close:hover { background:rgba(212,175,55,.15); color:#D4AF37; }

            /* BANNER */
            .modal-banner { background:linear-gradient(135deg,#1a1f2b,#0e1119); border-bottom:1px solid rgba(212,175,55,.2); padding:28px 24px 20px; display:flex; align-items:center; gap:14px; flex-shrink:0; }
            .banner-icon { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#D4AF37,#b8922e); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
            .banner-title { font-family:'Playfair Display',Georgia,serif; font-size:1.3rem; font-weight:700; font-style:italic; color:#f6f6f8; margin:0 0 2px; }
            .banner-sub { font-family:'Manrope',sans-serif; font-size:.8rem; color:#64748b; margin:0; }

            /* UTILITY */
            .hidden { display:none !important; }

            /* VIEWS */
            .view { flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#D4AF37 transparent; }

            /* MAIN VIEW */
            .modal-body { padding:20px 20px 24px; }

            .state-center { text-align:center; padding:44px 20px; font-family:'Manrope',sans-serif; }
            .loading-dots { display:flex; justify-content:center; gap:8px; margin-bottom:14px; }
            .loading-dots span { width:8px; height:8px; border-radius:50%; background:#D4AF37; animation:bounce 1.2s infinite ease-in-out; }
            .loading-dots span:nth-child(2){animation-delay:.2s} .loading-dots span:nth-child(3){animation-delay:.4s}
            @keyframes bounce { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
            .loading-text { color:#64748b; font-size:.9rem; }
            .empty-icon { font-size:2.8rem; margin-bottom:12px; opacity:.5; }
            .empty-title { font-family:'Playfair Display',serif; font-size:1.15rem; color:#f6f6f8; margin:0 0 6px; }
            .empty-sub { color:#64748b; font-size:.86rem; margin:0 0 18px; }
            .error-msg { font-family:'Manrope',sans-serif; font-size:.9rem; color:#fca5a5; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:10px; padding:14px; text-align:center; }

            .btn-agendar { padding:10px 22px; background:linear-gradient(135deg,#D4AF37,#b8922e); color:#111621; border:none; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; transition:transform .15s,box-shadow .2s; }
            .btn-agendar:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(212,175,55,.3); }

            .citas-lista { display:flex; flex-direction:column; gap:12px; }

            /* CITA CARD */
            .cita-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:16px 18px; transition:border-color .2s; }
            .cita-card:hover { border-color:rgba(212,175,55,.2); }
            .cita-card.sin-calificar { border-color:rgba(212,175,55,.22); }

            .cita-card-header { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:6px; }
            .cita-servicio { font-family:'Playfair Display',Georgia,serif; font-size:1.02rem; font-weight:700; color:#f6f6f8; }
            .cita-fecha-hora { font-family:'Manrope',sans-serif; font-size:.78rem; color:#64748b; margin-top:3px; }

            .cita-status { font-family:'Manrope',sans-serif; font-size:.68rem; font-weight:700; padding:3px 9px; border-radius:20px; letter-spacing:.06em; text-transform:uppercase; flex-shrink:0; }
            .status-pendiente  { background:rgba(251,191,36,.12); color:#fbbf24; border:1px solid rgba(251,191,36,.3); }
            .status-completada { background:rgba(52,211,153,.10); color:#6ee7b7; border:1px solid rgba(52,211,153,.3); }
            .status-cancelada  { background:rgba(239,68,68,.10);  color:#fca5a5; border:1px solid rgba(239,68,68,.3); }

            .cita-detalles { font-family:'Manrope',sans-serif; font-size:.76rem; color:#475569; margin-top:4px; }

            /* RATING PREVIEW */
            .rating-preview { display:flex; align-items:center; gap:10px; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,.05); flex-wrap:wrap; }
            .preview-stars { font-size:1rem; color:#D4AF37; letter-spacing:2px; }
            .btn-toggle-review { background:none; border:1px solid rgba(212,175,55,.25); color:#D4AF37; border-radius:8px; padding:4px 10px; font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:600; cursor:pointer; transition:background .2s; display:flex; align-items:center; gap:5px; }
            .btn-toggle-review:hover { background:rgba(212,175,55,.1); }

            /* REVIEW EXPANDED */
            .review-body { display:none; margin-top:10px; background:rgba(212,175,55,.05); border:1px solid rgba(212,175,55,.15); border-radius:10px; padding:12px 14px; font-family:'Manrope',sans-serif; font-size:.85rem; color:#94a3b8; font-style:italic; line-height:1.55; animation:fadeIn .2s ease; }
            .review-body.open { display:block; }

            /* BTN CALIFICAR */
            .btn-calificar { margin-top:10px; padding:7px 16px; background:linear-gradient(135deg,#D4AF37,#b8922e); color:#111621; border:none; border-radius:8px; font-family:'Manrope',sans-serif; font-size:.8rem; font-weight:700; cursor:pointer; transition:transform .15s,box-shadow .2s; }
            .btn-calificar:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(212,175,55,.3); }

            /* RATING VIEW */
            .rating-view { flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#D4AF37 transparent; }
            .rating-view.hidden { display:none; }
            .rating-header { background:linear-gradient(135deg,#1a1f2b,#0e1119); border-bottom:1px solid rgba(212,175,55,.15); padding:18px 24px; display:flex; align-items:center; gap:14px; }
            .btn-back { background:none; border:none; color:#64748b; font-family:'Manrope',sans-serif; font-size:.85rem; cursor:pointer; display:flex; align-items:center; gap:5px; transition:color .2s; padding:0; }
            .btn-back:hover { color:#D4AF37; }
            .rating-service { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:#f6f6f8; margin:0; }

            .rating-body { padding:28px 24px 24px; }
            .rating-intro { font-family:'Manrope',sans-serif; font-size:.88rem; color:#94a3b8; margin:0 0 24px; text-align:center; }

            .stars-row { display:flex; justify-content:center; gap:10px; margin-bottom:10px; }
            .star-btn { background:none; border:none; font-size:2.6rem; color:rgba(255,255,255,.15); cursor:pointer; padding:0; line-height:1; transition:transform .15s,color .15s; }
            .star-btn:hover, .star-btn.hovered { transform:scale(1.2); color:#D4AF37; }
            .star-btn.selected { color:#D4AF37; }

            .rating-label { font-family:'Manrope',sans-serif; font-size:.95rem; font-weight:700; color:#D4AF37; text-align:center; min-height:22px; margin:0 0 22px; }

            .form-group { display:flex; flex-direction:column; gap:6px; margin-bottom:18px; }
            .form-label { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#D4AF37; letter-spacing:.06em; text-transform:uppercase; }
            textarea { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:8px; color:#f6f6f8; font-family:'Manrope',sans-serif; font-size:.95rem; padding:12px 14px; outline:none; resize:vertical; min-height:90px; width:100%; box-sizing:border-box; transition:border-color .2s; }
            textarea::placeholder { color:rgba(255,255,255,.25); }
            textarea:focus { border-color:#D4AF37; background:rgba(212,175,55,.06); }
            .char-count { font-family:'Manrope',sans-serif; font-size:.75rem; color:#475569; text-align:right; }

            .msg-rating { border-radius:8px; padding:10px 14px; font-family:'Manrope',sans-serif; font-size:.9rem; margin-bottom:12px; display:none; }
            .msg-rating.exito { display:block; background:rgba(52,211,153,.1); border:1px solid rgba(52,211,153,.35); color:#6ee7b7; }
            .msg-rating.error { display:block; background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.35); color:#fca5a5; }

            .btn-submit { width:100%; padding:13px; background:#D4AF37; color:#111621; border:none; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer; transition:background .2s,transform .15s; }
            .btn-submit:hover:not(:disabled) { background:#c49b2a; transform:translateY(-1px); }
            .btn-submit:disabled { background:#5a5a2e; color:#94a3b8; cursor:not-allowed; }

            @media(max-width:500px){ .modal-box{border-radius:16px;} .rating-body,.modal-body{padding:18px 16px 20px;} }
        </style>

        <div class="modal-box" part="box">
            <button class="modal-close" id="btnCerrar">&times;</button>

            <!-- ===== MAIN VIEW ===== -->
            <div class="view" id="mainView">
                <div class="modal-banner">
                    <div class="banner-icon">📋</div>
                    <div>
                        <p class="banner-title">Mis Citas</p>
                        <p class="banner-sub">Tu historial y próximas visitas</p>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="state-center" id="stateLoading">
                        <div class="loading-dots"><span></span><span></span><span></span></div>
                        <p class="loading-text">Cargando tus citas...</p>
                    </div>
                    <div class="state-center hidden" id="stateVacio">
                        <div class="empty-icon">📅</div>
                        <p class="empty-title">Sin citas registradas</p>
                        <p class="empty-sub">Todavía no has reservado ninguna cita.</p>
                        <button class="btn-agendar" id="btnAgendar">✂️ Agendar mi primera cita</button>
                    </div>
                    <div id="stateError" class="hidden">
                        <p class="error-msg">❌ Error al cargar las citas. Intenta de nuevo.</p>
                    </div>
                    <div class="citas-lista hidden" id="citasLista"></div>
                </div>
            </div>

            <!-- ===== RATING VIEW ===== -->
            <div class="rating-view hidden" id="ratingView">
                <div class="rating-header">
                    <button class="btn-back" id="btnBack">&#8592; Volver</button>
                    <p class="rating-service" id="ratingService"></p>
                </div>
                <div class="rating-body">
                    <p class="rating-intro">¿Cómo fue tu experiencia?</p>
                    <div class="stars-row" id="starsRow">
                        <button class="star-btn" data-v="1">&#9733;</button>
                        <button class="star-btn" data-v="2">&#9733;</button>
                        <button class="star-btn" data-v="3">&#9733;</button>
                        <button class="star-btn" data-v="4">&#9733;</button>
                        <button class="star-btn" data-v="5">&#9733;</button>
                    </div>
                    <p class="rating-label" id="ratingLabel"></p>
                    <div class="form-group">
                        <label class="form-label">Reseña (opcional)</label>
                        <textarea id="ratingTextarea" placeholder="Cuéntanos sobre tu experiencia..." maxlength="500"></textarea>
                        <span class="char-count" id="charCount">500/500</span>
                    </div>
                    <div class="msg-rating" id="msgRating"></div>
                    <button class="btn-submit" id="btnSubmit" disabled>⭐ Enviar calificación</button>
                </div>
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
        this._volverALista(false);
    }

    _mostrarVista(vista) {
        const sr = this.shadowRoot;
        sr.getElementById('mainView').classList.toggle('hidden', vista !== 'main');
        sr.getElementById('ratingView').classList.toggle('hidden', vista !== 'rating');
    }

    _abrirRating(cita) {
        this._citaActiva = cita;
        this._calificacion = 0;
        const sr = this.shadowRoot;
        sr.getElementById('ratingService').textContent = cita.service;
        sr.getElementById('ratingLabel').textContent = '';
        sr.getElementById('ratingTextarea').value = '';
        sr.getElementById('charCount').textContent = '500/500';
        sr.getElementById('msgRating').className = 'msg-rating';
        sr.getElementById('msgRating').textContent = '';
        sr.getElementById('btnSubmit').disabled = true;
        sr.getElementById('btnSubmit').textContent = '⭐ Enviar calificación';
        sr.querySelectorAll('.star-btn').forEach(b => b.classList.remove('selected','hovered'));
        this._mostrarVista('rating');
    }

    _volverALista(reload = true) {
        this._mostrarVista('main');
        if (reload) this._cargarCitas();
    }

    _formatearFecha(v) {
        if (!v) return '';
        const d = new Date(v);
        if (isNaN(d.getTime())) return '';
        const local = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        return local.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    }

    _formatearHora(v) {
        if (!v) return '';
        const d = new Date(v);
        let h, m;
        if (!isNaN(d.getTime())) { h = d.getHours(); m = d.getMinutes(); }
        else { const p = String(v).split(':'); h = parseInt(p[0])||0; m = parseInt(p[1])||0; }
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
    }

    _formatearMetodo(m) {
        return { efectivo:'💵 Efectivo', tarjeta:'💳 Tarjeta', transferencia:'🏦 Transferencia' }[m] || m || '';
    }

    _estrellas(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

    async _cargarCitas() {
        const sr = this.shadowRoot;
        const loading = sr.getElementById('stateLoading');
        const vacio   = sr.getElementById('stateVacio');
        const error   = sr.getElementById('stateError');
        const lista   = sr.getElementById('citasLista');

        // Reset: show only loading
        loading.classList.remove('hidden');
        vacio.classList.add('hidden');
        error.classList.add('hidden');
        lista.classList.add('hidden');
        lista.innerHTML = '';

        const token = localStorage.getItem('token');
        if (!token) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            error.querySelector('p').textContent = '⚠️ Debes iniciar sesión para ver tus citas.';
            return;
        }

        try {
            const res  = await fetch('/api/citas/mis-citas', { headers: { Authorization: token } });
            const data = await res.json();
            loading.classList.add('hidden');

            // Server returned an error response
            if (!data.ok) {
                error.classList.remove('hidden');
                error.querySelector('p').textContent = `❌ ${data.error || 'Error al cargar las citas. Intenta de nuevo.'}`;
                return;
            }

            // No appointments yet
            if (!data.citas || !data.citas.length) { vacio.classList.remove('hidden'); return; }

            lista.classList.remove('hidden');
            lista.innerHTML = data.citas.map(c => {
                const esComp = c.status === 'completada';
                const sinCal = esComp && (c.calificacion === null || c.calificacion === undefined);
                let stCls = 'status-pendiente';
                if (c.status === 'completada') stCls = 'status-completada';
                if (c.status === 'cancelada')  stCls = 'status-cancelada';
                const stTxt = c.status.charAt(0).toUpperCase() + c.status.slice(1);

                const detalle = c.metodo_pago
                    ? `<div class="cita-detalles">${this._formatearMetodo(c.metodo_pago)}</div>` : '';

                let reviewSection = '';
                if (esComp && !sinCal) {
                    const tieneResena = c.resena && c.resena.trim();
                    reviewSection = `
                        <div class="rating-preview">
                            <span class="preview-stars">${this._estrellas(c.calificacion)}</span>
                            ${tieneResena ? `<button class="btn-toggle-review" data-id="${c.id}">💬 Ver reseña</button>` : ''}
                        </div>
                        ${tieneResena ? `<div class="review-body" id="review-${c.id}">"${c.resena}"</div>` : ''}
                    `;
                }

                const btnCal = sinCal
                    ? `<button class="btn-calificar" data-id="${c.id}" data-service="${encodeURIComponent(c.service)}" data-date="${c.date}">⭐ Calificar servicio</button>`
                    : '';

                return `
                    <div class="cita-card ${sinCal ? 'sin-calificar' : ''}">
                        <div class="cita-card-header">
                            <div>
                                <div class="cita-servicio">${c.service}</div>
                                <div class="cita-fecha-hora">📅 ${this._formatearFecha(c.date)} &nbsp;🕐 ${this._formatearHora(c.time)}</div>
                            </div>
                            <span class="cita-status ${stCls}">${stTxt}</span>
                        </div>
                        ${detalle}
                        ${reviewSection}
                        ${btnCal}
                    </div>`;
            }).join('');

            // Event delegation para botones dentro de la lista
            lista.onclick = (e) => {
                const calBtn = e.target.closest('.btn-calificar');
                if (calBtn) {
                    this._abrirRating({
                        id:      parseInt(calBtn.dataset.id),
                        service: decodeURIComponent(calBtn.dataset.service),
                        date:    calBtn.dataset.date
                    });
                    return;
                }
                const togBtn = e.target.closest('.btn-toggle-review');
                if (togBtn) {
                    const id = togBtn.dataset.id;
                    const div = lista.querySelector(`#review-${id}`);
                    if (div) {
                        div.classList.toggle('open');
                        togBtn.textContent = div.classList.contains('open') ? '💬 Ocultar reseña' : '💬 Ver reseña';
                    }
                }
            };

        } catch (err) {
            loading.classList.add('hidden');
            vacio.classList.add('hidden');
            lista.classList.add('hidden');
            error.classList.remove('hidden');
            error.querySelector('p').textContent = '❌ Error de conexión. Intenta de nuevo.';
        }
    }

    _bindEvents() {
        const sr = this.shadowRoot;

        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());
        this.addEventListener('click', e => { if (e.composedPath()[0] === this) this.close(); });
        this._onKey = e => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKey);

        sr.getElementById('btnBack').addEventListener('click', () => this._volverALista(false));
        sr.getElementById('btnAgendar').addEventListener('click', () => {
            this.close();
            this.dispatchEvent(new CustomEvent('abrir-reserva', { bubbles:true, composed:true }));
        });

        // Stars
        const textos = { 1:'Muy malo', 2:'Malo', 3:'Regular', 4:'Bueno', 5:'Excelente ✨' };
        sr.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const v = parseInt(btn.dataset.v);
                sr.querySelectorAll('.star-btn').forEach(b => b.classList.toggle('hovered', parseInt(b.dataset.v) <= v));
                sr.getElementById('ratingLabel').textContent = textos[v] || '';
            });
            btn.addEventListener('mouseleave', () => {
                sr.querySelectorAll('.star-btn').forEach(b => b.classList.remove('hovered'));
                sr.getElementById('ratingLabel').textContent = textos[this._calificacion] || '';
            });
            btn.addEventListener('click', () => {
                const v = parseInt(btn.dataset.v);
                this._calificacion = v;
                sr.querySelectorAll('.star-btn').forEach(b => b.classList.toggle('selected', parseInt(b.dataset.v) <= v));
                sr.getElementById('ratingLabel').textContent = textos[v] || '';
                sr.getElementById('btnSubmit').disabled = false;
            });
        });

        // Char counter
        sr.getElementById('ratingTextarea').addEventListener('input', e => {
            sr.getElementById('charCount').textContent = `${500 - e.target.value.length}/500`;
        });

        // Submit
        sr.getElementById('btnSubmit').addEventListener('click', async () => {
            if (!this._calificacion) return;
            const btn = sr.getElementById('btnSubmit');
            const msg = sr.getElementById('msgRating');
            const resena = sr.getElementById('ratingTextarea').value.trim();
            const token = localStorage.getItem('token');
            if (!token) { msg.className='msg-rating error'; msg.textContent='❌ Debes iniciar sesión.'; return; }

            btn.disabled = true;
            btn.textContent = 'Enviando...';

            try {
                const r = await fetch(`/api/citas/${this._citaActiva.id}/calificar`, {
                    method: 'POST',
                    headers: { 'Content-Type':'application/json', Authorization: token },
                    body: JSON.stringify({ calificacion: this._calificacion, resena })
                });
                const data = await r.json();
                if (!data.ok) {
                    msg.className = 'msg-rating error';
                    msg.textContent = `❌ ${data.error || 'Error al enviar.'}`;
                    btn.disabled = false;
                    btn.textContent = '⭐ Enviar calificación';
                    return;
                }
                msg.className = 'msg-rating exito';
                msg.textContent = '✅ ¡Calificación enviada!';
                setTimeout(() => this._volverALista(true), 1500);
            } catch {
                msg.className = 'msg-rating error';
                msg.textContent = '❌ Error de conexión.';
                btn.disabled = false;
                btn.textContent = '⭐ Enviar calificación';
            }
        });
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._onKey);
    }
}

customElements.define('mis-citas-component', MisCitasComponent);
