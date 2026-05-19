class AdminUsersComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._users = [];
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
                    <div class="header-icon">👥</div>
                    <div>
                        <h2>Gestionar Usuarios</h2>
                        <p class="modal-subtitle">Asignar roles de administrador</p>
                    </div>
                </div>

                <div class="modal-body">
                    <div id="msgGlobal" class="mensaje"></div>
                    <p class="section-label">📋 Usuarios registrados</p>
                    <div id="listaUsuarios" class="users-list">
                        <div class="loading">Cargando usuarios...</div>
                    </div>
                </div>
            </div>
        `;
        this._bindEvents();
    }

    _getStyles() {
        return `
            :host { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:1000; justify-content:center; align-items:center; padding:20px; box-sizing:border-box; --gold:#D4AF37; --dark:#111621; }
            :host(.active) { display:flex; animation:fadeIn 0.25s ease; }
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }

            .modal-box { position:relative; background:#12161f; border:1px solid rgba(212,175,55,0.35); border-radius:20px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); scrollbar-width:thin; scrollbar-color:#D4AF37 transparent; }
            @keyframes slideUp { from{opacity:0;transform:translateY(40px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

            .modal-close { position:absolute; top:14px; right:16px; background:rgba(255,255,255,0.06); border:none; color:#94a3b8; font-size:1.4rem; line-height:1; width:34px; height:34px; border-radius:50%; cursor:pointer; transition:background 0.2s,color 0.2s; display:flex; align-items:center; justify-content:center; z-index:2; }
            .modal-close:hover { background:rgba(212,175,55,0.15); color:#D4AF37; }

            .modal-header { background:linear-gradient(135deg,#1a1f2b 0%,#0e1119 100%); border-bottom:1px solid rgba(212,175,55,0.2); padding:36px 28px 24px; display:flex; align-items:center; gap:16px; }
            .header-icon { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#D4AF37,#b8922e); display:flex; align-items:center; justify-content:center; font-size:1.5rem; box-shadow:0 0 0 3px rgba(212,175,55,0.25); flex-shrink:0; }
            .modal-header h2 { font-family:'Playfair Display',Georgia,serif; font-size:1.35rem; font-weight:700; color:#f6f6f8; margin:0 0 4px; }
            .modal-subtitle { font-family:'Manrope',sans-serif; font-size:0.85rem; color:#64748b; margin:0; }

            .modal-body { padding:24px 28px 28px; }

            .section-label { font-family:'Manrope',sans-serif; font-size:0.78rem; font-weight:700; color:#D4AF37; letter-spacing:0.08em; text-transform:uppercase; margin:0 0 16px; }

            .mensaje { margin-bottom:16px; padding:10px 14px; border-radius:8px; display:none; text-align:center; font-family:'Manrope',sans-serif; font-size:0.88rem; }
            .mensaje.exito { display:block; background:rgba(52,211,153,0.12); border:1px solid rgba(52,211,153,0.4); color:#6ee7b7; }
            .mensaje.error { display:block; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; }

            .users-list { display:flex; flex-direction:column; gap:10px; }
            .loading { text-align:center; color:#64748b; font-family:'Manrope',sans-serif; font-size:0.9rem; padding:20px; }

            .user-card { display:flex; align-items:center; gap:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 16px; transition:border-color 0.2s; }
            .user-card:hover { border-color:rgba(212,175,55,0.25); }

            .user-avatar { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#D4AF37,#b8922e); display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',Georgia,serif; font-size:1rem; font-weight:700; color:#111621; flex-shrink:0; }

            .user-info { flex:1; min-width:0; }
            .user-name { font-family:'Manrope',sans-serif; font-size:0.95rem; font-weight:700; color:#f6f6f8; margin:0 0 2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .user-email { font-family:'Manrope',sans-serif; font-size:0.8rem; color:#64748b; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

            .role-badge { padding:5px 12px; border-radius:20px; font-family:'Manrope',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; flex-shrink:0; }
            .role-admin { background:rgba(212,175,55,0.2); border:1px solid rgba(212,175,55,0.5); color:#D4AF37; }
            .role-usuario { background:rgba(148,163,184,0.1); border:1px solid rgba(148,163,184,0.25); color:#94a3b8; }

            .role-toggle { padding:7px 14px; border:none; border-radius:8px; font-family:'Manrope',sans-serif; font-size:0.78rem; font-weight:700; cursor:pointer; transition:all 0.2s; flex-shrink:0; white-space:nowrap; }

            .btn-make-admin { background:rgba(212,175,55,0.12); color:#D4AF37; border:1px solid rgba(212,175,55,0.25); }
            .btn-make-admin:hover { background:rgba(212,175,55,0.25); }

            .btn-remove-admin { background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.25); }
            .btn-remove-admin:hover { background:rgba(239,68,68,0.25); }

            .btn-make-barbero { background:rgba(99,179,237,0.12); color:#90cdf4; border:1px solid rgba(99,179,237,0.25); }
            .btn-make-barbero:hover { background:rgba(99,179,237,0.25); }

            .btn-remove-barbero { background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.25); }
            .btn-remove-barbero:hover { background:rgba(239,68,68,0.25); }

            .role-barbero { background:rgba(99,179,237,0.15); border:1px solid rgba(99,179,237,0.4); color:#90cdf4; }

            .btn-self { opacity:0.4; cursor:not-allowed; }

            .actions { display:flex; gap:6px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end; }

            @media(max-width:500px) {
                .modal-body { padding:20px 18px 24px; }
                .user-card { flex-wrap:wrap; gap:10px; }
                .user-info { min-width:calc(100% - 58px); }
                .role-badge, .role-toggle { font-size:0.7rem; }
            }
        `;
    }

    open() {
        if (!this._isAdmin()) return;
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
        this._cargarUsuarios();
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }

    async _cargarUsuarios() {
        const lista = this.shadowRoot.getElementById('listaUsuarios');
        lista.innerHTML = '<div class="loading">Cargando usuarios...</div>';
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:3000/api/usuarios', {
                headers: { 'Authorization': token }
            });
            const data = await res.json();
            if (data.ok) {
                this._users = data.usuarios;
                this._renderUsers();
            } else {
                lista.innerHTML = '<div class="loading">❌ Error al cargar usuarios.</div>';
            }
        } catch (e) {
            lista.innerHTML = '<div class="loading">❌ No se pudo conectar al servidor.</div>';
        }
    }

    _renderUsers() {
        const lista = this.shadowRoot.getElementById('listaUsuarios');
        const session = this._getSession();
        const myEmail = session?.email;

        if (!this._users.length) {
            lista.innerHTML = '<div class="loading">No hay usuarios registrados.</div>';
            return;
        }

        lista.innerHTML = this._users.map(u => {
            const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const isAdmin   = u.role === 'admin';
            const isBarbero = u.role === 'barbero';
            const isSelf    = u.email === myEmail;

            const badgeClass = isAdmin ? 'role-admin' : isBarbero ? 'role-barbero' : 'role-usuario';
            const badgeText  = isAdmin ? '👑 Admin' : isBarbero ? '✂️ Barbero' : 'Usuario';

            let actionsHtml = '';
            if (isSelf) {
                actionsHtml = `<button class="role-toggle btn-self" disabled title="No puedes cambiar tu propio rol">Tú</button>`;
            } else {
                // Botón Admin
                const adminBtn = isAdmin
                    ? `<button class="role-toggle btn-remove-admin" data-id="${u.id}" data-role="usuario">Quitar Admin</button>`
                    : `<button class="role-toggle btn-make-admin" data-id="${u.id}" data-role="admin">Hacer Admin</button>`;
                // Botón Barbero
                const barberoBtn = isBarbero
                    ? `<button class="role-toggle btn-remove-barbero" data-id="${u.id}" data-role="usuario">Quitar Barbero</button>`
                    : `<button class="role-toggle btn-make-barbero" data-id="${u.id}" data-role="barbero">✂️ Barbero</button>`;
                actionsHtml = `<div class="actions">${adminBtn}${barberoBtn}</div>`;
            }

            return `
                <div class="user-card">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <p class="user-name">${u.name}${isSelf ? ' (tú)' : ''}</p>
                        <p class="user-email">${u.email}</p>
                    </div>
                    <span class="role-badge ${badgeClass}">${badgeText}</span>
                    ${actionsHtml}
                </div>
            `;
        }).join('');

        // Bind toggle buttons
        lista.querySelectorAll('.role-toggle:not(.btn-self)').forEach(btn => {
            btn.addEventListener('click', () => this._cambiarRol(Number(btn.dataset.id), btn.dataset.role));
        });
    }

    async _cambiarRol(id, nuevoRol) {
        const token = localStorage.getItem('token');
        const msg = this.shadowRoot.getElementById('msgGlobal');

        try {
            const res = await fetch(`http://localhost:3000/api/usuarios/${id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ role: nuevoRol })
            });
            const data = await res.json();
            if (data.ok) {
                msg.className = 'mensaje exito';
                msg.textContent = nuevoRol === 'admin'
                    ? `✅ ${data.usuario.name} ahora es administrador.`
                    : `✅ Se removió el rol admin de ${data.usuario.name}.`;
                this._cargarUsuarios();
                setTimeout(() => { msg.className = 'mensaje'; msg.textContent = ''; }, 3000);
            } else {
                msg.className = 'mensaje error';
                msg.textContent = '❌ ' + (data.error || 'Error al cambiar rol.');
                setTimeout(() => { msg.className = 'mensaje'; msg.textContent = ''; }, 3000);
            }
        } catch (e) {
            msg.className = 'mensaje error';
            msg.textContent = '❌ Error de conexión.';
            setTimeout(() => { msg.className = 'mensaje'; msg.textContent = ''; }, 3000);
        }
    }

    _bindEvents() {
        const sr = this.shadowRoot;
        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());
        this.addEventListener('click', (e) => { if (e.composedPath()[0] === this) this.close(); });
        this._onKeydown = (e) => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKeydown);
    }

    disconnectedCallback() { document.removeEventListener('keydown', this._onKeydown); }
}

customElements.define('admin-users-component', AdminUsersComponent);
