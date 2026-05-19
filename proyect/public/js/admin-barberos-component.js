class AdminBarberosComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._barberos = [];
        this._editId = null;
        this._fotoBase64 = null;
    }

    connectedCallback() { this._render(); }

    _getSession() {
        try { return JSON.parse(localStorage.getItem('zhola_user')) || null; } catch { return null; }
    }
    _isAdmin() { const s = this._getSession(); return s && s.role === 'admin'; }

    _render() {
        this.shadowRoot.innerHTML = `<style>${this._css()}</style>${this._html()}`;
        this._bindEvents();
    }

    _css() {
        return `
        :host{display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(8px);z-index:1100;justify-content:center;align-items:center;padding:12px;box-sizing:border-box;overflow-y:auto;}
        :host(.active){display:flex;animation:fadeIn .2s ease;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .box{position:relative;background:#0d111a;border:1px solid rgba(212,175,55,.4);border-radius:16px;width:100%;max-width:580px;max-height:92vh;overflow-y:auto;display:flex;flex-direction:column;animation:slideUp .25s cubic-bezier(.34,1.56,.64,1);scrollbar-width:thin;scrollbar-color:#D4AF37 transparent;}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px) scale(.97)}to{opacity:1;transform:none}}
        .modal-close{position:absolute;top:10px;right:12px;background:rgba(255,255,255,.06);border:none;color:#94a3b8;font-size:1.2rem;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;z-index:10;flex-shrink:0;}
        .modal-close:hover{background:rgba(212,175,55,.15);color:#D4AF37;}
        .banner{background:linear-gradient(135deg,#1a1f2b,#0e1119);border-bottom:1px solid rgba(212,175,55,.2);padding:14px 16px 12px;display:flex;align-items:center;gap:10px;flex-shrink:0;border-radius:16px 16px 0 0;}
        .banner-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#D4AF37,#b8922e);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .banner-title{font-family:'Playfair Display',Georgia,serif;font-size:1.05rem;font-weight:700;font-style:italic;color:#f6f6f8;margin:0 0 1px;}
        .banner-sub{font-family:'Manrope',sans-serif;font-size:.72rem;color:#64748b;margin:0;}
        .content{padding:14px 16px 18px;display:flex;flex-direction:column;gap:14px;}
        /* FORM */
        .form-section{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 16px;}
        .form-title{font-family:'Playfair Display',serif;font-size:.9rem;color:#D4AF37;margin:0 0 12px;font-style:italic;}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .form-full{grid-column:1/-1;}
        .field label{display:block;font-family:'Manrope',sans-serif;font-size:.68rem;font-weight:700;color:#64748b;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px;}
        .field input,.field select,.field textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;color:#f1f5f9;font-family:'Manrope',sans-serif;font-size:.82rem;padding:7px 10px;outline:none;transition:border-color .2s;box-sizing:border-box;}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:#D4AF37;}
        .field select option{background:#1a1f2b;}
        .field textarea{resize:vertical;min-height:60px;line-height:1.5;}
        .field input[type="file"]{padding:6px 8px;cursor:pointer;font-size:.78rem;}
        /* Foto tabs */
        .foto-tabs{display:flex;gap:0;border:1px solid rgba(255,255,255,.1);border-radius:7px;overflow:hidden;margin-bottom:7px;}
        .foto-tab{flex:1;padding:6px 0;font-family:'Manrope',sans-serif;font-size:.72rem;font-weight:700;text-align:center;cursor:pointer;background:transparent;border:none;color:#64748b;transition:background .2s,color .2s;}
        .foto-tab.active{background:rgba(212,175,55,.15);color:#D4AF37;}
        .foto-panel{display:none;}
        .foto-panel.visible{display:block;}
        .foto-preview{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid rgba(212,175,55,.4);margin-top:6px;display:none;float:right;}
        .foto-preview.visible{display:block;}
        .form-divider{grid-column:1/-1;height:1px;background:rgba(255,255,255,.07);margin:2px 0;}
        .form-divider-label{grid-column:1/-1;font-family:'Manrope',sans-serif;font-size:.67rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;}
        .btn-row{display:flex;gap:8px;margin-top:2px;grid-column:1/-1;}
        .btn-save{padding:8px 18px;background:linear-gradient(135deg,#D4AF37,#b8922e);color:#111621;border:none;border-radius:8px;font-family:'Manrope',sans-serif;font-size:.82rem;font-weight:800;cursor:pointer;transition:transform .15s,box-shadow .2s;}
        .btn-save:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(212,175,55,.35);}
        .btn-save:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .btn-cancel{padding:8px 14px;background:rgba(255,255,255,.06);color:#94a3b8;border:1px solid rgba(255,255,255,.1);border-radius:8px;font-family:'Manrope',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .2s;}
        .btn-cancel:hover{background:rgba(255,255,255,.1);}
        .msg{padding:8px 12px;border-radius:7px;font-family:'Manrope',sans-serif;font-size:.8rem;text-align:center;display:none;}
        .msg.ok{display:block;background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.4);color:#6ee7b7;}
        .msg.err{display:block;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);color:#fca5a5;}
        /* LIST */
        .list-section{display:flex;flex-direction:column;gap:8px;}
        .list-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;}
        .list-label{font-family:'Manrope',sans-serif;font-size:.68rem;font-weight:700;color:#D4AF37;letter-spacing:.08em;text-transform:uppercase;}
        .loading-row{text-align:center;color:#64748b;font-family:'Manrope',sans-serif;font-size:.85rem;padding:16px;}
        .empty-state{text-align:center;padding:22px;font-family:'Manrope',sans-serif;color:#475569;font-size:.85rem;}
        .barbero-card{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 12px;transition:border-color .2s;}
        .barbero-card:hover{border-color:rgba(212,175,55,.25);}
        .barbero-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(212,175,55,.3);flex-shrink:0;background:#1a1f2b;}
        .barbero-avatar.initials{display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:.95rem;font-weight:700;color:#D4AF37;background:linear-gradient(135deg,rgba(212,175,55,.15),rgba(212,175,55,.05));}
        .barbero-info{flex:1;min-width:0;}
        .barbero-nombre{font-family:'Manrope',sans-serif;font-size:.88rem;font-weight:700;color:#f6f6f8;margin:0 0 1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .barbero-grado{font-family:'Manrope',sans-serif;font-size:.68rem;font-weight:700;color:#D4AF37;letter-spacing:.05em;text-transform:uppercase;margin:0;}
        .badge-activo{padding:2px 7px;border-radius:20px;font-family:'Manrope',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;flex-shrink:0;}
        .badge-si{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.3);color:#6ee7b7;}
        .badge-no{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#fca5a5;}
        .card-actions{display:flex;gap:5px;flex-shrink:0;}
        .btn-edit{padding:5px 10px;background:rgba(212,175,55,.1);color:#D4AF37;border:1px solid rgba(212,175,55,.25);border-radius:6px;font-family:'Manrope',sans-serif;font-size:.72rem;font-weight:700;cursor:pointer;transition:background .2s;}
        .btn-edit:hover{background:rgba(212,175,55,.25);}
        .btn-del{padding:5px 10px;background:rgba(239,68,68,.08);color:#fca5a5;border:1px solid rgba(239,68,68,.2);border-radius:6px;font-family:'Manrope',sans-serif;font-size:.72rem;font-weight:700;cursor:pointer;transition:background .2s;}
        .btn-del:hover{background:rgba(239,68,68,.2);}
        .btn-toggle{padding:5px 10px;border-radius:6px;font-family:'Manrope',sans-serif;font-size:.72rem;font-weight:700;cursor:pointer;transition:background .2s,color .2s;border:1px solid;}
        .btn-toggle.activo{background:rgba(52,211,153,.1);color:#6ee7b7;border-color:rgba(52,211,153,.3);}
        .btn-toggle.activo:hover{background:rgba(239,68,68,.1);color:#fca5a5;border-color:rgba(239,68,68,.3);}
        .btn-toggle.inactivo{background:rgba(239,68,68,.08);color:#fca5a5;border-color:rgba(239,68,68,.2);}
        .btn-toggle.inactivo:hover{background:rgba(52,211,153,.1);color:#6ee7b7;border-color:rgba(52,211,153,.3);}
        @media(max-width:520px){
            .form-grid{grid-template-columns:1fr;}
            .content{padding:12px 12px 16px;}
            .btn-row{flex-direction:column;}
            .card-actions{gap:4px;}
            .btn-edit,.btn-del{padding:4px 8px;}
        }
        /* Validación en línea */
        .field-err{display:none;font-family:'Manrope',sans-serif;font-size:.68rem;color:#f87171;margin-top:3px;font-weight:600;}
        .field-err.show{display:block;}
        .field.has-error input,.field.has-error select,.field.has-error textarea{border-color:#f87171 !important;background:rgba(239,68,68,.06) !important;}
        .field.has-ok input,.field.has-ok select,.field.has-ok textarea{border-color:rgba(52,211,153,.5) !important;}
        `;
    }

    _html() {
        return `
        <div class="box" part="box">
            <button class="modal-close" id="btnCerrar">&#x2715;</button>
            <div class="banner">
                <div class="banner-icon">✂️</div>
                <div>
                    <p class="banner-title">Gestión de Barberos</p>
                    <p class="banner-sub">Registra, edita y elimina barberos del equipo</p>
                </div>
            </div>
            <div class="content">
                <div id="formMsg" class="msg"></div>
                <!-- FORM -->
                <div class="form-section">
                    <p class="form-title" id="formTitle">✦ Registrar Nuevo Barbero</p>
                    <div class="form-grid">
                        <div class="field form-full">
                            <label>📷 Foto de perfil *</label>
                            <div class="foto-tabs">
                                <button type="button" class="foto-tab active" id="tabArchivo">⬆ Subir archivo</button>
                                <button type="button" class="foto-tab" id="tabUrl">🔗 Usar URL</button>
                            </div>
                            <div class="foto-panel visible" id="panelArchivo">
                                <input type="file" id="inputFoto" accept="image/*">
                            </div>
                            <div class="foto-panel" id="panelUrl">
                                <input type="url" id="inputFotoUrl" placeholder="https://ejemplo.com/foto.jpg">
                            </div>
                            <img id="fotoPreview" class="foto-preview" src="" alt="Preview">
                            <span class="field-err" id="errFoto"></span>
                        </div>
                        <div class="field"><label>👤 Nombre completo *</label>
                            <input type="text" id="inputNombre" placeholder="Ej: Julián Vega" maxlength="100">
                            <span class="field-err" id="errNombre"></span>
                        </div>
                        <div class="field"><label>🏅 Grado / Rango *</label>
                            <select id="inputGrado">
                                <option value="">Seleccionar...</option>
                                <option>Junior Barbero</option>
                                <option>Senior Barber</option>
                                <option>Master Barber</option>
                                <option>Master Barber / Fundador</option>
                            </select>
                            <span class="field-err" id="errGrado"></span>
                        </div>
                        <div class="field form-full"><label>📝 Descripción *</label>
                            <textarea id="inputDesc" placeholder="Breve bio del barbero (obligatoria)..." maxlength="500"></textarea>
                            <span class="field-err" id="errDesc"></span>
                        </div>
                        <div class="form-divider-label">🔒 Credenciales de acceso *</div>
                        <div class="form-divider"></div>
                        <div class="field"><label>📧 Email *</label>
                            <input type="text" id="inputEmail" placeholder="barbero@example.com" maxlength="100" autocomplete="off">
                            <span class="field-err" id="errEmail"></span>
                        </div>
                        <div class="field"><label>🔑 Contraseña *</label>
                            <input type="password" id="inputPassword" placeholder="Mínimo 8 caracteres" maxlength="60" autocomplete="new-password">
                            <span class="field-err" id="errPassword"></span>
                        </div>
                        <div class="btn-row">
                            <button class="btn-save" id="btnGuardar">💾 Guardar Barbero</button>
                            <button class="btn-cancel" id="btnCancelarEdit" style="display:none;">Cancelar edición</button>
                        </div>
                    </div>
                </div>
                <!-- LIST -->
                <div class="list-section">
                    <div class="list-header">
                        <span class="list-label">📋 Barberos registrados</span>
                        <span id="totalBadge" style="font-family:'Manrope',sans-serif;font-size:.78rem;color:#475569;"></span>
                    </div>
                    <div id="listaBarberos"><div class="loading-row">Cargando...</div></div>
                </div>
            </div>
        </div>`;
    }

    open() {
        if (!this._isAdmin()) return;
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
        this._resetForm();
        this._cargar();
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }

    _bindEvents() {
        const sr = this.shadowRoot;
        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());
        this.addEventListener('click', e => { if (e.composedPath()[0] === this) this.close(); });
        this._onKey = e => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKey);

        sr.getElementById('inputFoto').addEventListener('change', e => this._onFotoChange(e));
        sr.getElementById('inputFotoUrl').addEventListener('input', e => this._onUrlChange(e));
        sr.getElementById('btnGuardar').addEventListener('click', () => this._guardar());
        sr.getElementById('btnCancelarEdit').addEventListener('click', () => this._resetForm());
        // Tabs foto
        sr.getElementById('tabArchivo').addEventListener('click', () => this._switchFotoTab('archivo'));
        sr.getElementById('tabUrl').addEventListener('click', () => this._switchFotoTab('url'));
    }

    disconnectedCallback() { document.removeEventListener('keydown', this._onKey); }

    _switchFotoTab(tab) {
        const sr = this.shadowRoot;
        const isArchivo = tab === 'archivo';
        sr.getElementById('tabArchivo').classList.toggle('active', isArchivo);
        sr.getElementById('tabUrl').classList.toggle('active', !isArchivo);
        sr.getElementById('panelArchivo').classList.toggle('visible', isArchivo);
        sr.getElementById('panelUrl').classList.toggle('visible', !isArchivo);
        // Limpiar el panel que no se usa
        if (isArchivo) { sr.getElementById('inputFotoUrl').value = ''; }
        else { sr.getElementById('inputFoto').value = ''; }
        this._fotoBase64 = null;
        sr.getElementById('fotoPreview').classList.remove('visible');
    }

    _onFotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            this._fotoBase64 = ev.target.result;
            const preview = this.shadowRoot.getElementById('fotoPreview');
            preview.src = ev.target.result;
            preview.classList.add('visible');
        };
        reader.readAsDataURL(file);
    }

    _onUrlChange(e) {
        const url = e.target.value.trim();
        this._fotoBase64 = url || null;
        const preview = this.shadowRoot.getElementById('fotoPreview');
        if (url) {
            preview.src = url;
            preview.classList.add('visible');
            preview.onerror = () => preview.classList.remove('visible');
        } else {
            preview.classList.remove('visible');
        }
    }

    async _cargar() {
        const lista = this.shadowRoot.getElementById('listaBarberos');
        lista.innerHTML = '<div class="loading-row">Cargando barberos...</div>';
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/barberos', { headers: { Authorization: token } });
            const data = await res.json();
            if (data.ok) {
                this._barberos = data.barberos;
                this._renderLista();
            } else {
                lista.innerHTML = '<div class="loading-row">❌ Error al cargar.</div>';
            }
        } catch {
            lista.innerHTML = '<div class="loading-row">❌ Sin conexión.</div>';
        }
    }

    _renderLista() {
        const lista = this.shadowRoot.getElementById('listaBarberos');
        const badge = this.shadowRoot.getElementById('totalBadge');
        badge.textContent = `${this._barberos.length} barbero${this._barberos.length !== 1 ? 's' : ''}`;

        if (!this._barberos.length) {
            lista.innerHTML = '<div class="empty-state">No hay barberos registrados aún.</div>';
            return;
        }

        lista.innerHTML = this._barberos.map(b => {
            const initials = b.nombre.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
            const avatarHtml = b.foto_url
                ? `<img class="barbero-avatar" src="${this._esc(b.foto_url)}" alt="${this._esc(b.nombre)}">`
                : `<div class="barbero-avatar initials">${initials}</div>`;
            const activoBadge = b.activo
                ? '<span class="badge-activo badge-si">Activo</span>'
                : '<span class="badge-activo badge-no">Inactivo</span>';
            return `
            <div class="barbero-card">
                ${avatarHtml}
                <div class="barbero-info">
                    <p class="barbero-nombre">${this._esc(b.nombre)}</p>
                    <p class="barbero-grado">${this._esc(b.grado)}</p>
                    ${b.email ? `<p class="barbero-email">📧 ${this._esc(b.email)}</p>` : ''}
                </div>
                ${activoBadge}
                <div class="card-actions">
                    <button class="btn-toggle ${b.activo ? 'activo' : 'inactivo'}" data-id="${b.id}" title="${b.activo ? 'Click para marcar Fuera de servicio' : 'Click para marcar Activo'}">
                        ${b.activo ? '✔ Activo' : '⚠ Fuera de servicio'}
                    </button>
                    <button class="btn-edit" data-id="${b.id}">✏️ Editar</button>
                    <button class="btn-del" data-id="${b.id}">🗑 Eliminar</button>
                </div>
            </div>`;
        }).join('');

        lista.querySelectorAll('.btn-toggle').forEach(btn =>
            btn.addEventListener('click', () => this._toggleEstado(Number(btn.dataset.id))));
        lista.querySelectorAll('.btn-edit').forEach(btn =>
            btn.addEventListener('click', () => this._cargarEdicion(Number(btn.dataset.id))));
        lista.querySelectorAll('.btn-del').forEach(btn =>
            btn.addEventListener('click', () => this._eliminar(Number(btn.dataset.id))));
    }

    async _toggleEstado(id) {
        const token = localStorage.getItem('token');
        const msg = this.shadowRoot.getElementById('formMsg');
        try {
            const res = await fetch(`/api/barberos/${id}/estado`, { method: 'PATCH', headers: { Authorization: token } });
            const data = await res.json();
            if (data.ok) {
                const estado = data.barbero.activo ? 'Activo' : 'Fuera de servicio';
                msg.className = 'msg ok';
                msg.textContent = `✅ ${data.barbero.nombre} ahora está: ${estado}`;
                await this._cargar();
                setTimeout(() => { msg.className = 'msg'; }, 3000);
            } else {
                msg.className = 'msg err';
                msg.textContent = '❌ ' + (data.error || 'No se pudo cambiar el estado.');
            }
        } catch {
            msg.className = 'msg err';
            msg.textContent = '❌ Error de conexión.';
        }
    }

    async _cargarEdicion(id) {
        const b = this._barberos.find(x => x.id === id);
        if (!b) return;
        this._editId = id;
        const sr = this.shadowRoot;
        sr.getElementById('inputNombre').value = b.nombre;
        sr.getElementById('inputGrado').value = b.grado;
        sr.getElementById('inputDesc').value = b.descripcion || '';
        sr.getElementById('inputEmail').value = '';
        sr.getElementById('inputPassword').value = '';
        const preview = sr.getElementById('fotoPreview');
        if (b.foto_url) {
            // Si parece URL externa (no base64), mostrar en panel URL
            if (b.foto_url.startsWith('http')) {
                this._switchFotoTab('url');
                sr.getElementById('inputFotoUrl').value = b.foto_url;
            }
            preview.src = b.foto_url;
            preview.classList.add('visible');
            this._fotoBase64 = b.foto_url;
        } else {
            preview.classList.remove('visible');
            this._fotoBase64 = null;
        }
        sr.getElementById('formTitle').textContent = '✏️ Editando barbero';
        sr.getElementById('btnGuardar').textContent = '💾 Actualizar Barbero';
        sr.getElementById('btnCancelarEdit').style.display = '';
        sr.getElementById('formMsg').className = 'msg';
        sr.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    _resetForm() {
        this._editId = null;
        this._fotoBase64 = null;
        const sr = this.shadowRoot;
        ['inputNombre','inputEmail','inputPassword','inputDesc','inputFotoUrl'].forEach(id => { sr.getElementById(id).value = ''; });
        sr.getElementById('inputGrado').value = '';
        sr.getElementById('inputFoto').value = '';
        sr.getElementById('fotoPreview').classList.remove('visible');
        sr.getElementById('formTitle').textContent = '✦ Registrar Nuevo Barbero';
        sr.getElementById('btnGuardar').textContent = '💾 Guardar Barbero';
        sr.getElementById('btnCancelarEdit').style.display = 'none';
        sr.getElementById('formMsg').className = 'msg';
        this._clearFieldErrors();
        this._switchFotoTab('archivo');
    }

    // ── Helpers de validación visual ──
    _clearFieldErrors() {
        const sr = this.shadowRoot;
        ['inputNombre','inputGrado','inputDesc','inputEmail','inputPassword'].forEach(id => {
            const el = sr.getElementById(id);
            if (el) el.closest('.field')?.classList.remove('has-error','has-ok');
        });
        // Foto
        const panelA = sr.getElementById('panelArchivo');
        if (panelA) panelA.closest('.field')?.classList.remove('has-error');
        const errFoto = sr.getElementById('errFoto');
        if (errFoto) { errFoto.textContent = ''; errFoto.classList.remove('show'); }
        // Otros campos
        ['errNombre','errGrado','errDesc','errEmail','errPassword'].forEach(id => {
            const el = sr.getElementById(id);
            if (el) { el.textContent = ''; el.classList.remove('show'); }
        });
    }

    _fieldError(inputId, errId, msg) {
        const sr = this.shadowRoot;
        const input = sr.getElementById(inputId);
        const err   = sr.getElementById(errId);
        if (input) { input.closest('.field')?.classList.add('has-error'); input.closest('.field')?.classList.remove('has-ok'); }
        if (err)   { err.textContent = msg; err.classList.add('show'); }
    }

    _fieldOk(inputId) {
        const sr = this.shadowRoot;
        const input = sr.getElementById(inputId);
        if (input) { input.closest('.field')?.classList.add('has-ok'); input.closest('.field')?.classList.remove('has-error'); }
    }

    async _guardar() {
        const sr = this.shadowRoot;
        const nombre    = sr.getElementById('inputNombre').value.trim();
        const grado     = sr.getElementById('inputGrado').value.trim();
        const descripcion = sr.getElementById('inputDesc').value.trim();
        const email     = sr.getElementById('inputEmail').value.trim();
        const password  = sr.getElementById('inputPassword').value;
        const msg       = sr.getElementById('formMsg');

        // ── Limpiar errores previos ──
        this._clearFieldErrors();
        msg.className = 'msg';

        // ── Validaciones — todos los campos son obligatorios ──
        let valid = true;

        // Foto: obligatoria (archivo o URL)
        const fotoUrl = sr.getElementById('inputFotoUrl').value.trim();
        const tieneFoto = !!(this._fotoBase64 || fotoUrl);
        if (!tieneFoto) {
            const errFoto = sr.getElementById('errFoto');
            if (errFoto) { errFoto.textContent = '⚠️ La foto de perfil es obligatoria (sube un archivo o ingresa una URL).'; errFoto.classList.add('show'); }
            sr.getElementById('panelArchivo').closest('.field')?.classList.add('has-error');
            valid = false;
        } else {
            const errFoto = sr.getElementById('errFoto');
            if (errFoto) { errFoto.textContent = ''; errFoto.classList.remove('show'); }
            sr.getElementById('panelArchivo').closest('.field')?.classList.remove('has-error');
        }

        // Nombre: obligatorio, mín 2 chars
        if (!nombre) {
            this._fieldError('inputNombre', 'errNombre', '⚠️ El nombre es obligatorio.');
            valid = false;
        } else if (nombre.length < 2) {
            this._fieldError('inputNombre', 'errNombre', '⚠️ Mínimo 2 caracteres.');
            valid = false;
        } else {
            this._fieldOk('inputNombre');
        }

        // Grado: obligatorio
        if (!grado) {
            this._fieldError('inputGrado', 'errGrado', '⚠️ Selecciona un grado.');
            valid = false;
        } else {
            this._fieldOk('inputGrado');
        }

        // Descripción: OBLIGATORIA, mín 10 chars, máx 500
        if (!descripcion) {
            this._fieldError('inputDesc', 'errDesc', '⚠️ La descripción es obligatoria.');
            valid = false;
        } else if (descripcion.length < 10) {
            this._fieldError('inputDesc', 'errDesc', '⚠️ Mínimo 10 caracteres en la descripción.');
            valid = false;
        } else if (descripcion.length > 500) {
            this._fieldError('inputDesc', 'errDesc', `⚠️ Máximo 500 caracteres (${descripcion.length}/500).`);
            valid = false;
        } else {
            this._fieldOk('inputDesc');
        }

        // Email: OBLIGATORIO, con formato válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            this._fieldError('inputEmail', 'errEmail', '⚠️ El email es obligatorio.');
            valid = false;
        } else if (!emailRegex.test(email)) {
            this._fieldError('inputEmail', 'errEmail', '⚠️ Email inválido. Debe contener @ y un dominio (ej: nombre@correo.com).');
            valid = false;
        } else {
            this._fieldOk('inputEmail');
        }

        // Contraseña: OBLIGATORIA al crear, opcional al editar
        if (!this._editId) {
            // Creación: siempre requerida
            if (!password) {
                this._fieldError('inputPassword', 'errPassword', '⚠️ La contraseña es obligatoria.');
                valid = false;
            } else if (password.length < 8) {
                this._fieldError('inputPassword', 'errPassword', '⚠️ Mínimo 8 caracteres.');
                valid = false;
            } else if (password.length > 60) {
                this._fieldError('inputPassword', 'errPassword', '⚠️ Máximo 60 caracteres.');
                valid = false;
            } else {
                this._fieldOk('inputPassword');
            }
        } else if (password.length > 0) {
            // Edición: si escribe contraseña, validar
            if (password.length < 8) {
                this._fieldError('inputPassword', 'errPassword', '⚠️ Mínimo 8 caracteres.');
                valid = false;
            } else if (password.length > 60) {
                this._fieldError('inputPassword', 'errPassword', '⚠️ Máximo 60 caracteres.');
                valid = false;
            } else {
                this._fieldOk('inputPassword');
            }
        }

        if (!valid) {
            msg.className = 'msg err';
            msg.textContent = '⚠️ Completa todos los campos obligatorios antes de continuar.';
            const firstErr = sr.querySelector('.field.has-error');
            if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const btn = sr.getElementById('btnGuardar');
        btn.disabled = true;
        btn.textContent = 'Guardando...';
        msg.className = 'msg';

        const token = localStorage.getItem('token');
        // Usar base64 si se subió archivo, o URL si se ingresó en el panel URL
        const fotoFinal = this._fotoBase64 || sr.getElementById('inputFotoUrl').value.trim() || null;
        const body = { nombre, grado, descripcion: descripcion || null, foto_url: fotoFinal, email };
        if (password) body.password = password;


        try {
            const url = this._editId ? `/api/barberos/${this._editId}` : '/api/barberos';
            const method = this._editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: token },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.ok) {
                msg.className = 'msg ok';
                msg.textContent = this._editId ? '✅ Barbero actualizado.' : '✅ Barbero registrado correctamente.';
                this._resetForm();
                await this._cargar();
                setTimeout(() => { msg.className = 'msg'; }, 3000);
            } else {
                msg.className = 'msg err';
                msg.textContent = '❌ ' + (data.error || 'Error al guardar.');
            }
        } catch {
            msg.className = 'msg err';
            msg.textContent = '❌ Error de conexión.';
        } finally {
            btn.disabled = false;
            btn.textContent = this._editId ? '💾 Actualizar Barbero' : '💾 Guardar Barbero';
        }
    }

    async _eliminar(id) {
        const b = this._barberos.find(x => x.id === id);
        if (!b) return;
        if (!confirm(`¿Eliminar a ${b.nombre}? Esta acción no se puede deshacer.`)) return;
        const token = localStorage.getItem('token');
        const msg = this.shadowRoot.getElementById('formMsg');
        try {
            const res = await fetch(`/api/barberos/${id}`, { method: 'DELETE', headers: { Authorization: token } });
            const data = await res.json();
            if (data.ok) {
                msg.className = 'msg ok';
                msg.textContent = `✅ ${b.nombre} eliminado.`;
                await this._cargar();
                setTimeout(() => { msg.className = 'msg'; }, 3000);
            } else {
                msg.className = 'msg err';
                msg.textContent = '❌ ' + (data.error || 'No se pudo eliminar.');
            }
        } catch {
            msg.className = 'msg err';
            msg.textContent = '❌ Error de conexión.';
        }
    }

    _esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
}

customElements.define('admin-barberos-component', AdminBarberosComponent);
