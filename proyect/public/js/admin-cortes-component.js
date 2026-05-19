class AdminCortesComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._cortes = [];
        this._editandoId = null;
    }

    connectedCallback() { this._render(); }

    _getSession() {
        try { return JSON.parse(localStorage.getItem('zhola_user')) || null; }
        catch { return null; }
    }

    _isAdmin() {
        const s = this._getSession();
        return s && s.role === 'admin';
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>${this._getStyles()}</style>
            <div class="modal-box" part="box">
                <button class="modal-close" id="btnCerrar" aria-label="Cerrar">&times;</button>
                <div class="modal-header">
                    <div class="header-icon">⚙️</div>
                    <div>
                        <h2>Gestionar Cortes</h2>
                        <p class="modal-subtitle">Panel de administración de servicios</p>
                    </div>
                </div>

                <div class="modal-body">
                    <!-- Formulario -->
                    <div class="form-section">
                        <p class="section-label" id="formTitle">➕ Añadir nuevo servicio</p>

                        <!-- Selector de Tipo (primero para que controle el formulario) -->
                        <div class="tipo-tabs">
                            <button class="tipo-tab active" id="tabNormal" data-tipo="normal">✂️ Servicio Normal</button>
                            <button class="tipo-tab" id="tabVip" data-tipo="vip">👑 Paquete Especial</button>
                        </div>
                        <input type="hidden" id="tipo" value="normal">

                        <!-- Campo foto: solo visible en Normal -->
                        <div class="form-group" id="grupFoto">
                            <label>📷 Foto (URL de imagen)</label>
                            <input class="form-input" type="url" id="fotoUrl" placeholder="https://ejemplo.com/foto.jpg">
                        </div>

                        <div class="form-group">
                            <label id="labelNombre">✂️ Nombre del corte</label>
                            <input class="form-input" type="text" id="nombre" placeholder="Ej: Degradado Moderno">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>💰 Precio ($)</label>
                                <input class="form-input" type="number" id="precio" placeholder="35.00" min="0" step="0.01">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>📝 Descripción</label>
                            <textarea class="form-input form-textarea" id="descripcion" placeholder="Describe el servicio..." rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button class="btn-gold" id="btnGuardar">💾 Guardar</button>
                            <button class="btn-cancel" id="btnCancelar" style="display:none;">Cancelar Edición</button>
                        </div>
                        <div id="msgForm" class="mensaje"></div>
                    </div>

                    <hr class="divider">

                    <!-- Lista dividida en 2 secciones -->
                    <p class="section-label">✂️ Servicios Normales</p>
                    <div id="listaNormales" class="cortes-list"><div class="loading">Cargando...</div></div>

                    <hr class="divider" style="margin-top:20px;">

                    <p class="section-label" style="color:#f6c90e;">👑 Paquetes Especiales</p>
                    <div id="listaVip" class="cortes-list"><div class="loading">Cargando...</div></div>
                </div>
            </div>
        `;
        this._bindEvents();
    }

    _getStyles() {
        return `
            :host { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:1000; justify-content:center; align-items:center; padding:20px; box-sizing:border-box; --gold:#D4AF37; --dark:#111621; --charcoal:#1a1f2b; }
            :host(.active) { display:flex; animation:fadeIn 0.25s ease; }
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }

            .modal-box { position:relative; background:#12161f; border:1px solid rgba(212,175,55,0.35); border-radius:20px; width:100%; max-width:620px; max-height:90vh; overflow-y:auto; animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); scrollbar-width:thin; scrollbar-color:#D4AF37 transparent; }
            @keyframes slideUp { from{opacity:0;transform:translateY(40px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

            .modal-close { position:absolute; top:14px; right:16px; background:rgba(255,255,255,0.06); border:none; color:#94a3b8; font-size:1.4rem; line-height:1; width:34px; height:34px; border-radius:50%; cursor:pointer; transition:background 0.2s,color 0.2s; display:flex; align-items:center; justify-content:center; z-index:2; }
            .modal-close:hover { background:rgba(212,175,55,0.15); color:#D4AF37; }

            .modal-header { background:linear-gradient(135deg,#1a1f2b 0%,#0e1119 100%); border-bottom:1px solid rgba(212,175,55,0.2); padding:36px 28px 24px; display:flex; align-items:center; gap:16px; }
            .header-icon { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#D4AF37,#b8922e); display:flex; align-items:center; justify-content:center; font-size:1.5rem; box-shadow:0 0 0 3px rgba(212,175,55,0.25); flex-shrink:0; }
            .modal-header h2 { font-family:'Playfair Display',Georgia,serif; font-size:1.35rem; font-weight:700; color:#f6f6f8; margin:0 0 4px; }
            .modal-subtitle { font-family:'Manrope',sans-serif; font-size:0.85rem; color:#64748b; margin:0; }

            .modal-body { padding:24px 28px 28px; }

            .section-label { font-family:'Manrope',sans-serif; font-size:0.78rem; font-weight:700; color:#D4AF37; letter-spacing:0.08em; text-transform:uppercase; margin:0 0 16px; }

            .form-section { margin-bottom:8px; }
            .form-group { margin-bottom:14px; }
            .form-group label { display:block; font-family:'Manrope',sans-serif; font-size:0.78rem; font-weight:700; color:#94a3b8; letter-spacing:0.06em; margin-bottom:6px; }
            .form-input { width:100%; padding:10px 14px; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#f6f6f8; font-family:'Manrope',sans-serif; font-size:0.93rem; outline:none; transition:border-color 0.2s; }
            .form-input:focus { border-color:rgba(212,175,55,0.6); }
            .form-input::placeholder { color:rgba(255,255,255,0.3); }
            .form-input option { background:#1a1f2b; color:#f6f6f8; }
            .form-textarea { resize:vertical; min-height:60px; }
            .form-row { display:grid; grid-template-columns:1fr; gap:14px; }

            /* ===== TIPO TABS ===== */
            .tipo-tabs { display:flex; gap:8px; margin-bottom:18px; }
            .tipo-tab { flex:1; padding:10px 12px; border:2px solid rgba(255,255,255,0.1); border-radius:10px; background:rgba(255,255,255,0.04); color:#64748b; font-family:'Manrope',sans-serif; font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
            .tipo-tab:hover { border-color:rgba(212,175,55,0.35); color:#D4AF37; }
            .tipo-tab.active { border-color:#D4AF37; background:rgba(212,175,55,0.12); color:#D4AF37; }
            .tipo-tab[data-tipo="vip"].active { border-color:#f6c90e; background:rgba(246,201,14,0.1); color:#f6c90e; }

            .form-actions { display:flex; gap:10px; margin-top:4px; }
            .btn-gold { flex:1; padding:12px; background:var(--gold); color:var(--dark); border:none; border-radius:10px; font-family:'Manrope',sans-serif; font-size:0.92rem; font-weight:800; cursor:pointer; letter-spacing:0.03em; transition:background 0.2s,transform 0.15s; }
            .btn-gold:hover { background:#c49b2a; transform:translateY(-1px); }
            .btn-cancel { padding:12px 20px; background:rgba(255,255,255,0.06); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); border-radius:10px; font-family:'Manrope',sans-serif; font-size:0.92rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
            .btn-cancel:hover { background:rgba(255,255,255,0.1); color:#f6f6f8; }

            .mensaje { margin-top:12px; padding:10px 14px; border-radius:8px; display:none; text-align:center; font-family:'Manrope',sans-serif; font-size:0.88rem; }
            .mensaje.exito { display:block; background:rgba(52,211,153,0.12); border:1px solid rgba(52,211,153,0.4); color:#6ee7b7; }
            .mensaje.error { display:block; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; }

            .divider { border:none; border-top:1px solid rgba(255,255,255,0.07); margin:20px 0; }

            .cortes-list { display:flex; flex-direction:column; gap:12px; }
            .loading { text-align:center; color:#64748b; font-family:'Manrope',sans-serif; font-size:0.9rem; padding:20px; }
            .empty-state { text-align:center; color:#64748b; font-family:'Manrope',sans-serif; font-size:0.9rem; padding:30px 0; }

            .corte-card { display:flex; gap:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px; transition:border-color 0.2s; }
            .corte-card:hover { border-color:rgba(212,175,55,0.25); }
            .corte-img { width:80px; height:80px; border-radius:10px; object-fit:cover; flex-shrink:0; background:rgba(255,255,255,0.05); }
            .corte-img-placeholder { width:80px; height:80px; border-radius:10px; flex-shrink:0; background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.15); display:flex; align-items:center; justify-content:center; font-size:1.8rem; }
            .corte-info { flex:1; min-width:0; }
            .corte-nombre { font-family:'Playfair Display',Georgia,serif; font-size:1.05rem; font-weight:700; color:#f6f6f8; margin:0 0 4px; }
            .corte-precio { font-family:'Playfair Display',Georgia,serif; font-size:1.15rem; font-weight:700; color:#D4AF37; margin:0 0 4px; }
            .corte-desc { font-family:'Manrope',sans-serif; font-size:0.82rem; color:#94a3b8; margin:0; line-height:1.5; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
            .corte-actions { display:flex; flex-direction:column; gap:6px; flex-shrink:0; justify-content:center; }
            .btn-edit, .btn-delete { padding:7px 14px; border:none; border-radius:8px; font-family:'Manrope',sans-serif; font-size:0.78rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
            .btn-edit { background:rgba(212,175,55,0.12); color:#D4AF37; border:1px solid rgba(212,175,55,0.25); }
            .btn-edit:hover { background:rgba(212,175,55,0.25); }
            .btn-delete { background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.25); }
            .btn-delete:hover { background:rgba(239,68,68,0.25); }

            .confirm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:10; }
            .confirm-box { background:#1a1f2b; border:1px solid rgba(239,68,68,0.35); border-radius:16px; padding:28px; max-width:360px; text-align:center; }
            .confirm-box p { font-family:'Manrope',sans-serif; font-size:0.95rem; color:#f6f6f8; margin:0 0 20px; }
            .confirm-actions { display:flex; gap:10px; justify-content:center; }
            .confirm-actions button { padding:10px 24px; border-radius:8px; font-family:'Manrope',sans-serif; font-weight:700; cursor:pointer; border:none; font-size:0.88rem; }
            .btn-confirm-del { background:rgba(239,68,68,0.8); color:#fff; }
            .btn-confirm-del:hover { background:rgba(239,68,68,1); }
            .btn-confirm-cancel { background:rgba(255,255,255,0.06); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); }
            .btn-confirm-cancel:hover { background:rgba(255,255,255,0.1); color:#f6f6f8; }

            @media(max-width:500px) {
                .modal-body { padding:20px 18px 24px; }
                .corte-card { flex-direction:column; align-items:center; text-align:center; }
                .corte-actions { flex-direction:row; }
                .form-row { grid-template-columns:1fr; }
            }
        `;
    }

    open() {
        if (!this._isAdmin()) return;
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
        this._cargarCortes();
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
        this._resetForm();
    }

    _resetForm() {
        const sr = this.shadowRoot;
        sr.getElementById('fotoUrl').value = '';
        sr.getElementById('nombre').value = '';
        sr.getElementById('tipo').value = 'normal';
        sr.getElementById('precio').value = '';
        sr.getElementById('descripcion').value = '';
        sr.getElementById('tipo').value = 'normal';
        sr.getElementById('formTitle').textContent = '➕ Añadir nuevo servicio';
        sr.getElementById('btnGuardar').textContent = '💾 Guardar';
        sr.getElementById('btnCancelar').style.display = 'none';
        sr.getElementById('msgForm').className = 'mensaje';
        sr.getElementById('msgForm').textContent = '';
        sr.getElementById('grupFoto').style.display = '';
        sr.getElementById('labelNombre').textContent = '✂️ Nombre del corte';
        // Reset active tab
        sr.querySelectorAll('.tipo-tab').forEach(t => t.classList.toggle('active', t.dataset.tipo === 'normal'));
        this._editandoId = null;
        this._renderCortes();
    }

    async _cargarCortes() {
        const sr = this.shadowRoot;
        const listaNorm = sr.getElementById('listaNormales');
        const listaVip = sr.getElementById('listaVip');
        const loading = '<div class="loading">Cargando...</div>';
        listaNorm.innerHTML = loading;
        listaVip.innerHTML = loading;

        try {
            const res = await fetch('http://localhost:3000/api/cortes');
            const data = await res.json();
            if (data.ok) {
                this._cortes = data.cortes;
                this._renderCortes();
            } else {
                listaNorm.innerHTML = '<div class="empty-state">Error al cargar.</div>';
                listaVip.innerHTML = '';
            }
        } catch (e) {
            listaNorm.innerHTML = '<div class="empty-state">❌ No se pudo conectar al servidor.</div>';
            listaVip.innerHTML = '';
        }
    }

    _renderCortes() {
        const sr = this.shadowRoot;
        const listaNorm = sr.getElementById('listaNormales');
        const listaVip = sr.getElementById('listaVip');

        const normales = this._cortes.filter(c => (c.tipo || 'normal') === 'normal');
        const vips = this._cortes.filter(c => c.tipo === 'vip');

        // Helper para renderizar en un contenedor dado
        const renderList = (lista, items) => {
            if (!items.length) {
                lista.innerHTML = '<div class="empty-state">Sin registros aquí todavía.</div>';
                return;
            }
            lista.innerHTML = items.map(c => `
            <div class="corte-card" data-id="${c.id}">
                ${c.foto_url
                    ? `<img class="corte-img" src="${c.foto_url}" alt="${c.nombre}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="corte-img-placeholder" style="display:none">✂️</div>`
                    : `<div class="corte-img-placeholder">✂️</div>`}
                <div class="corte-info">
                    <p class="corte-nombre">${c.nombre}</p>
                    <p class="corte-precio">$${Number(c.precio).toFixed(2)}</p>
                    <p class="corte-desc">${c.descripcion || 'Sin descripción'}</p>
                </div>
                <div class="corte-actions">
                    <button class="btn-edit" data-id="${c.id}">✏️ Editar</button>
                    <button class="btn-delete" data-id="${c.id}">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
            lista.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => this._iniciarEdicion(Number(btn.dataset.id)));
            });
            lista.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => this._confirmarEliminar(Number(btn.dataset.id)));
            });
        };

        renderList(listaNorm, normales);
        renderList(listaVip, vips);
    }

    _iniciarEdicion(id) {
        const corte = this._cortes.find(c => c.id === id);
        if (!corte) return;
        const sr = this.shadowRoot;
        sr.getElementById('fotoUrl').value = corte.foto_url || '';
        sr.getElementById('nombre').value = corte.nombre;
        const tipoVal = corte.tipo || 'normal';
        sr.getElementById('tipo').value = tipoVal;
        // Sync tabs
        sr.querySelectorAll('.tipo-tab').forEach(t => t.classList.toggle('active', t.dataset.tipo === tipoVal));
        // Show/hide foto field
        sr.getElementById('grupFoto').style.display = tipoVal === 'vip' ? 'none' : '';
        sr.getElementById('labelNombre').textContent = tipoVal === 'vip' ? '👑 Nombre del paquete' : '✂️ Nombre del corte';
        sr.getElementById('precio').value = corte.precio;
        sr.getElementById('descripcion').value = corte.descripcion || '';
        sr.getElementById('formTitle').textContent = '✏️ Editando: ' + corte.nombre;
        sr.getElementById('btnGuardar').textContent = '💾 Guardar Cambios';
        sr.getElementById('btnCancelar').style.display = 'block';
        this._editandoId = id;
        sr.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    _confirmarEliminar(id) {
        const corte = this._cortes.find(c => c.id === id);
        if (!corte) return;
        const overlay = document.createElement('div');
        overlay.innerHTML = `
            <div class="confirm-overlay">
                <div class="confirm-box">
                    <p>¿Eliminar <strong>"${corte.nombre}"</strong>?<br>Esta acción no se puede deshacer.</p>
                    <div class="confirm-actions">
                        <button class="btn-confirm-del">Sí, eliminar</button>
                        <button class="btn-confirm-cancel">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        this.shadowRoot.appendChild(overlay);
        overlay.querySelector('.btn-confirm-del').addEventListener('click', async () => {
            overlay.remove();
            await this._eliminarCorte(id);
        });
        overlay.querySelector('.btn-confirm-cancel').addEventListener('click', () => overlay.remove());
    }

    async _eliminarCorte(id) {
        const token = localStorage.getItem('token');
        const msg = this.shadowRoot.getElementById('msgForm');
        try {
            const res = await fetch(`http://localhost:3000/api/cortes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });
            const data = await res.json();
            if (data.ok) {
                msg.className = 'mensaje exito';
                msg.textContent = '✅ Corte eliminado correctamente.';
                this._cargarCortes();
                setTimeout(() => { msg.className = 'mensaje'; msg.textContent = ''; }, 3000);
            } else {
                msg.className = 'mensaje error';
                msg.textContent = '❌ ' + (data.error || 'Error al eliminar.');
            }
        } catch (e) {
            msg.className = 'mensaje error';
            msg.textContent = '❌ Error de conexión.';
        }
    }

    async _guardarCorte() {
        const sr = this.shadowRoot;
        const msg = sr.getElementById('msgForm');
        const nombre     = sr.getElementById('nombre').value.trim();
        const tipo       = sr.getElementById('tipo').value;
        const precio     = sr.getElementById('precio').value;
        const descripcion = sr.getElementById('descripcion').value.trim();
        const foto_url   = sr.getElementById('fotoUrl').value.trim();
        const token      = localStorage.getItem('token');

        // ── Reset estilos previos ──
        ['nombre','precio','descripcion','fotoUrl'].forEach(id => {
            const el = sr.getElementById(id);
            if (el) { el.style.borderColor = ''; el.style.background = ''; }
        });
        msg.className = 'mensaje';
        msg.textContent = '';

        // ── Validar todos los campos ──
        let errores = [];

        if (!nombre) errores.push('✂️ El nombre del servicio es obligatorio.');
        else if (nombre.length < 2) errores.push('✂️ El nombre debe tener al menos 2 caracteres.');

        if (!precio || isNaN(precio) || Number(precio) <= 0)
            errores.push('💰 El precio es obligatorio y debe ser mayor a 0.');

        if (!descripcion) errores.push('📝 La descripción es obligatoria.');
        else if (descripcion.length < 5) errores.push('📝 La descripción debe tener al menos 5 caracteres.');

        // Foto solo obligatoria en servicios normales
        if (tipo !== 'vip' && !foto_url)
            errores.push('📷 La URL de la foto es obligatoria para servicios normales.');
        else if (tipo !== 'vip' && foto_url && !/^https?:\/\/.+/.test(foto_url))
            errores.push('📷 La URL de la foto no es válida (debe empezar con http:// o https://).');

        if (errores.length > 0) {
            msg.className = 'mensaje error';
            msg.innerHTML = errores.join('<br>');
            // Resaltar campos con error
            if (!nombre)                                { const el = sr.getElementById('nombre');     if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            if (!precio || Number(precio) <= 0)         { const el = sr.getElementById('precio');     if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            if (!descripcion)                           { const el = sr.getElementById('descripcion');if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            if (tipo !== 'vip' && !foto_url)            { const el = sr.getElementById('fotoUrl');   if(el) el.style.borderColor='rgba(239,68,68,0.7)'; }
            return;
        }

        const body = { nombre, precio: Number(precio), descripcion, foto_url, tipo };
        const isEdit = this._editandoId !== null;
        const url = isEdit ? `http://localhost:3000/api/cortes/${this._editandoId}` : 'http://localhost:3000/api/cortes';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.ok) {
                msg.className = 'mensaje exito';
                msg.textContent = isEdit ? '✅ Corte actualizado.' : '✅ Corte creado exitosamente.';
                this._resetForm();
                this._cargarCortes();
                setTimeout(() => { msg.className = 'mensaje'; msg.textContent = ''; }, 3000);
            } else {
                msg.className = 'mensaje error';
                msg.textContent = '❌ ' + (data.error || 'Error al guardar.');
            }
        } catch (e) {
            msg.className = 'mensaje error';
            msg.textContent = '❌ Error de conexión con el servidor.';
        }
    }

    _bindEvents() {
        const sr = this.shadowRoot;
        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());
        this.addEventListener('click', (e) => { if (e.composedPath()[0] === this) this.close(); });
        this._onKeydown = (e) => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKeydown);
        sr.getElementById('btnGuardar').addEventListener('click', () => this._guardarCorte());
        sr.getElementById('btnCancelar').addEventListener('click', () => this._resetForm());

        // Tabs de tipo
        sr.querySelectorAll('.tipo-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tipo = tab.dataset.tipo;
                sr.getElementById('tipo').value = tipo;
                sr.querySelectorAll('.tipo-tab').forEach(t => t.classList.toggle('active', t === tab));
                // Mostrar/ocultar foto
                sr.getElementById('grupFoto').style.display = tipo === 'vip' ? 'none' : '';
                sr.getElementById('labelNombre').textContent = tipo === 'vip' ? '👑 Nombre del paquete' : '✂️ Nombre del corte';
                sr.getElementById('formTitle').textContent = tipo === 'vip' ? '➕ Añadir Paquete Especial' : '➕ Añadir Servicio Normal';
            });
        });
    }

    disconnectedCallback() { document.removeEventListener('keydown', this._onKeydown); }
}

customElements.define('admin-cortes-component', AdminCortesComponent);
