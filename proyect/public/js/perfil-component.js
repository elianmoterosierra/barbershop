

class PerfilComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._perfil = {
            nombre: '',
            email: '',
            miembro_desde: '',
            citas_totales: 0,
            proxima_cita: 'Sin citas próximas',
            historial: [],
            sinCalificar: 0
        };
    }

    /* ── Utilidad: devuelve el usuario guardado o null ── */
    _getSession() {
        try {
            const userStr = localStorage.getItem('zhola_user');
            const token = localStorage.getItem('token');
            
            if (userStr && token) {
                return JSON.parse(userStr);
            } else if (userStr && !token) {
                // Estado corrupto (usuario sin token). Limpiarlo automáticamente.
                localStorage.removeItem('zhola_user');
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    connectedCallback() {
        this._render();
    }

    async _render() {
        const session = this._getSession();
        if (session) {
            await this._renderPerfil(session);
        } else {
            this._renderNoSession();
        }
        this._bindEvents();
    }

    /* ══════════════════════════════════════════
       VISTA: SIN SESIÓN  (login / registro)
    ══════════════════════════════════════════ */
    _renderNoSession() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.78);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 1000;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    box-sizing: border-box;
                    --primary: #144bb8;
                    --gold: #D4AF37;
                    --dark: #111621;
                    --charcoal: #1a1f2b;
                    --light: #f6f6f8;
                    --text-gray: #94a3b8;
                }
                :host(.active) { display: flex; animation: fadeIn 0.25s ease; }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }

                .modal-box {
                    position: relative;
                    background: #12161f;
                    border: 1px solid rgba(212,175,55,0.35);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 420px;
                    animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
                    overflow: hidden;
                }
                @keyframes slideUp {
                    from{opacity:0;transform:translateY(40px) scale(0.96)}
                    to{opacity:1;transform:translateY(0) scale(1)}
                }

                .modal-close {
                    position: absolute; top:14px; right:16px;
                    background: rgba(255,255,255,0.06); border:none;
                    color:#94a3b8; font-size:1.4rem; line-height:1;
                    width:34px; height:34px; border-radius:50%;
                    cursor:pointer; transition:background 0.2s,color 0.2s;
                    display:flex; align-items:center; justify-content:center; z-index:2;
                }
                .modal-close:hover{background:rgba(212,175,55,0.15);color:#D4AF37}

                /* header */
                .ns-header {
                    background: linear-gradient(135deg,#1a1f2b 0%,#0e1119 100%);
                    border-bottom: 1px solid rgba(212,175,55,0.2);
                    padding: 44px 28px 28px;
                    text-align: center;
                }
                .ns-logo {
                    width:64px; height:64px; border-radius:50%;
                    background: linear-gradient(135deg,#D4AF37,#b8922e);
                    display:flex; align-items:center; justify-content:center;
                    margin:0 auto 16px;
                    box-shadow:0 0 0 3px rgba(212,175,55,0.25);
                    font-size:1.8rem;
                }
                .ns-title {
                    font-family:'Playfair Display',Georgia,serif;
                    font-size:1.4rem; font-weight:700; color:#f6f6f8; margin:0 0 6px;
                }
                .ns-sub {
                    font-family:'Manrope',sans-serif;
                    font-size:0.87rem; color:#64748b; margin:0;
                }

                /* ── Switcher ── */
                .switcher {
                    display:flex;
                    position:relative;
                    background:rgba(255,255,255,0.05);
                    border-radius:12px;
                    padding:4px;
                    margin:20px 28px 0;
                }
                .switcher-indicator {
                    position:absolute;
                    top:4px; left:4px;
                    width:calc(50% - 4px);
                    height:calc(100% - 8px);
                    background:linear-gradient(135deg,#D4AF37,#b8922e);
                    border-radius:9px;
                    transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
                    z-index:0;
                }
                .switcher-indicator.right {
                    transform:translateX(100%);
                }
                .tab-btn {
                    flex:1;
                    padding:11px 0; border:none; background:transparent;
                    font-family:'Manrope',sans-serif; font-size:0.88rem;
                    font-weight:700; color:#64748b; cursor:pointer;
                    transition:color 0.3s ease;
                    letter-spacing:0.03em;
                    position:relative; z-index:1;
                    border-radius:9px;
                    text-align:center;
                }
                .tab-btn.active{color:#111621;}

                /* form body */
                .ns-body {
                    overflow:hidden;
                }
                .panels-track {
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    width:200%;
                    transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);
                }
                .panels-track.show-registro {
                    transform:translateX(-50%);
                }
                .panel {
                    padding:28px;
                    box-sizing:border-box;
                }

                .form-group { margin-bottom:16px; }
                .form-label {
                    display:block;
                    font-family:'Manrope',sans-serif; font-size:0.78rem;
                    font-weight:700; color:#94a3b8; letter-spacing:0.06em;
                    text-transform:uppercase; margin-bottom:6px;
                }
                .form-input {
                    width:100%; padding:11px 14px; box-sizing:border-box;
                    background:rgba(255,255,255,0.05);
                    border:1px solid rgba(255,255,255,0.1);
                    border-radius:10px; color:#f6f6f8;
                    font-family:'Manrope',sans-serif; font-size:0.93rem;
                    outline:none; transition:border-color 0.2s;
                }
                .form-input:focus{border-color:rgba(var(--gold-rgb, 212,175,55),0.6);}

                .btn-gold {
                    width:100%; padding:13px; margin-top:4px;
                    background:var(--gold); color:var(--dark);
                    border:none; border-radius:10px;
                    font-family:'Manrope',sans-serif; font-size:0.95rem;
                    font-weight:800; cursor:pointer; letter-spacing:0.03em;
                    transition:background 0.2s,transform 0.15s;
                }
                .btn-gold:hover{background:#c49b2a;transform:translateY(-1px);}
                .btn-gold:active{transform:translateY(0);}

                .ns-footer {
                    font-family:'Manrope',sans-serif; font-size:0.8rem;
                    color:#475569; text-align:center; margin-top:18px;
                }
                .ns-footer a{color:var(--gold);cursor:pointer;text-decoration:none;}
                .ns-footer a:hover{text-decoration:underline;}

                .mensaje {
                    margin-top: 15px;
                    padding: 10px;
                    border-radius: 5px;
                    display: none;
                    text-align: center;
                    font-size: 14px;
                }
            </style>

            <div class="modal-box" part="box">
                <button class="modal-close" id="btnCerrar" aria-label="Cerrar">&times;</button>

                <div class="ns-header">
                    <div class="ns-logo">✂️</div>
                    <p class="ns-title">Bienvenido</p>
                    <p class="ns-sub">Inicia sesión para ver tu perfil y citas</p>
                </div>

                <!-- Switcher -->
                <div class="switcher">
                    <div class="switcher-indicator" id="switcherIndicator"></div>
                    <button class="tab-btn active" id="tabLogin">Iniciar Sesión</button>
                    <button class="tab-btn" id="tabRegistro">Registrarse</button>
                </div>

                <div class="ns-body">
                    <div class="panels-track" id="panelsTrack">

                        <!-- Panel Login -->
                        <div class="panel" id="panelLogin">
                            <div class="form-group">
                                <label class="form-label">Correo electrónico</label>
                                <input class="form-input" type="email" id="loginEmail" placeholder="tu@correo.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Contraseña</label>
                                <input class="form-input" type="password" id="loginPass" placeholder="••••••••">
                            </div>
                            <button class="btn-gold" id="btnLogin">Iniciar Sesión</button>
                            <div id="msg-log" class="mensaje"></div>
                            <p class="ns-footer">¿No tienes cuenta? <a id="irRegistro">Regístrate gratis</a></p>
                        </div>

                        <!-- Panel Registro -->
                        <div class="panel" id="panelRegistro">
                            <div class="form-group">
                                <label class="form-label">Nombre completo</label>
                                <input class="form-input" type="text" id="regNombre" placeholder="Carlos Mendoza">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Correo electrónico</label>
                                <input class="form-input" type="email" id="regEmail" placeholder="tu@correo.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Contraseña</label>
                                <input class="form-input" type="password" id="regPass" placeholder="••••••••">
                            </div>
                            <button class="btn-gold" id="btnRegistro">Registrarse</button>
                            <div id="msg-reg" class="mensaje"></div>
                            <p class="ns-footer">¿Ya tienes cuenta? <a id="irLogin">Inicia sesión</a></p>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    /* ══════════════════════════════════════════
       VISTA: CON SESIÓN  (perfil completo)
    ══════════════════════════════════════════ */
    async _renderPerfil(session) {
        let citas_totales = 0;
        let proxima_cita = 'Sin citas próximas';
        let historial = [];      // últimas 3 citas completadas
        let sinCalificar = 0;    // citas completadas sin calificar

        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Resumen rápido (total + proxima)
                const res = await fetch('/api/citas/miscitas', {
                    headers: { 'Authorization': token }
                });
                const data = await res.json();
                if (data.ok) {
                    citas_totales = data.total;
                    proxima_cita  = data.proxima;
                }

                // Historial detallado para sección "Recientes"
                const res2 = await fetch('/api/citas/mis-citas', {
                    headers: { 'Authorization': token }
                });
                const data2 = await res2.json();
                if (data2.ok && Array.isArray(data2.citas)) {
                    const completadas = data2.citas.filter(c => c.status === 'completada');
                    sinCalificar = completadas.filter(c => c.calificacion == null).length;
                    historial = completadas.slice(0, 3).map(c => ({
                        servicio: c.service,
                        fecha:    new Date(c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                        barbero:  c.barbero || null
                    }));
                }
            } catch (e) {
                console.error('Error al cargar citas:', e);
            }
        }

        // Formatear fecha de registro
        let fechaFormateada = 'Miembro reciente';
        if (session.miembro_desde) {
            const fecha = new Date(session.miembro_desde);
            fechaFormateada = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        const p = Object.assign({}, this._perfil, {
            nombre:       session.nombre || session.name || this._perfil.nombre,
            email:        session.email  || this._perfil.email,
            miembro_desde: fechaFormateada,
            citas_totales,
            proxima_cita,
            historial,
            sinCalificar
        });
        const iniciales = p.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        this.shadowRoot.innerHTML = `
            <style>
                /* ===== HOST / OVERLAY ===== */
                :host {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.78);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 1000;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    box-sizing: border-box;
                    --primary: #144bb8;
                    --gold: #D4AF37;
                    --dark: #111621;
                    --charcoal: #1a1f2b;
                    --light: #f6f6f8;
                    --text-gray: #94a3b8;
                }
                :host(.active) {
                    display: flex;
                    animation: fadeIn 0.25s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                /* ===== MODAL BOX ===== */
                .modal-box {
                    position: relative;
                    background: #12161f;
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 480px;
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

                /* ===== CLOSE ===== */
                .modal-close {
                    position: absolute;
                    top: 14px;
                    right: 16px;
                    background: rgba(255,255,255,0.06);
                    border: none;
                    color: #94a3b8;
                    font-size: 1.4rem;
                    line-height: 1;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                }
                .modal-close:hover { background: rgba(212,175,55,0.15); color: #D4AF37; }

                /* ===== HEADER BANNER ===== */
                .profile-banner {
                    background: linear-gradient(135deg, #1a1f2b 0%, #0e1119 100%);
                    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                    padding: 36px 28px 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .avatar {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #D4AF37, #b8922e);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #111621;
                    flex-shrink: 0;
                    box-shadow: 0 0 0 3px rgba(212,175,55,0.25);
                }
                .profile-info { flex: 1; min-width: 0; }
                .profile-name {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: #f6f6f8;
                    margin: 0 0 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(212, 175, 55, 0.12);
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    color: #D4AF37;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 3px 10px;
                    border-radius: 20px;
                }

                /* ===== BODY ===== */
                .profile-body { padding: 24px 28px 28px; }

                /* ===== CONTACT ===== */
                .section-label {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #D4AF37;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin: 0 0 12px;
                }
                .info-list {
                    list-style: none;
                    margin: 0 0 24px;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.92rem;
                    color: #cbd5e1;
                }
                .info-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #D4AF37;
                }
                .info-icon svg { display: block; }

                /* ===== STATS ===== */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 24px;
                }
                .stat-card {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 14px 10px;
                    text-align: center;
                }
                .stat-value {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #D4AF37;
                    line-height: 1;
                }
                .stat-label {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.68rem;
                    color: #64748b;
                    margin-top: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* ===== PROXIMA CITA ===== */
                .next-appointment {
                    background: rgba(212, 175, 55, 0.07);
                    border: 1px solid rgba(212, 175, 55, 0.25);
                    border-radius: 12px;
                    padding: 14px 16px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .next-appointment svg { color: #D4AF37; flex-shrink: 0; }
                .next-text { flex: 1; }
                .next-title {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.72rem;
                    color: #D4AF37;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .next-date {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.93rem;
                    color: #f6f6f8;
                    margin-top: 2px;
                }

                /* ===== HISTORIAL ===== */
                .historial-list {
                    list-style: none;
                    margin: 0 0 24px;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .historial-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px;
                    padding: 10px 14px;
                }
                .hist-left { display: flex; flex-direction: column; gap: 2px; }
                .hist-servicio {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.88rem;
                    color: #e2e8f0;
                    font-weight: 600;
                }
                .hist-fecha {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.75rem;
                    color: #475569;
                }
                .hist-precio {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.88rem;
                    color: #D4AF37;
                    font-weight: 700;
                }

                /* ===== BUTTONS ===== */
                .btn-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .btn {
                    padding: 12px;
                    border-radius: 10px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.15s;
                    border: none;
                    letter-spacing: 0.02em;
                }
                .btn:active { transform: translateY(0); }
                .btn-primary {
                    background: var(--gold);
                    color: var(--dark);
                }
                .btn-primary:hover { background: #c49b2a; transform: translateY(-1px); }
                .btn-secondary {
                    background: rgba(255,255,255,0.06);
                    color: var(--text-gray);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #f6f6f8; transform: translateY(-1px); }

                /* ===== DIVIDER ===== */
                .divider {
                    border: none;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    margin: 0 0 20px;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 500px) {
                    .profile-banner { padding: 28px 20px 20px; }
                    .profile-body { padding: 20px 20px 24px; }
                    .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
                }
            </style>

            <div class="modal-box" part="box">
                <button class="modal-close" id="btnCerrar" aria-label="Cerrar">&times;</button>

                <!-- Banner de perfil -->
                <div class="profile-banner">
                    <div class="avatar">${iniciales}</div>
                    <div class="profile-info">
                        <p class="profile-name">${p.nombre}</p>
                        ${(session.role === 'admin') ? '<span class="badge" style="background:rgba(212,175,55,0.25);border-color:rgba(212,175,55,0.6);">👑 Admin</span>' : ''}
                    </div>
                </div>

                <div class="profile-body">

                    <!-- Información de contacto -->
                    <p class="section-label">Información</p>
                    <ul class="info-list">
                        <li class="info-item">
                            <span class="info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"/>
                                    <path d="M3 7l9 6l9 -6"/>
                                </svg>
                            </span>
                            ${p.email}
                        </li>
                        <li class="info-item">
                            <span class="info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/>
                                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                                </svg>
                            </span>
                            Miembro desde ${p.miembro_desde}
                        </li>
                    </ul>

                    <!-- Stats -->
                    <hr class="divider">
                    <p class="section-label">Estadísticas</p>
                    <div class="stats-row" style="grid-template-columns:1fr 1fr;">
                        <div class="stat-card">
                            <div class="stat-value">${p.citas_totales}</div>
                            <div class="stat-label">Total Citas</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${p.sinCalificar || 0}</div>
                            <div class="stat-label">Sin Calificar</div>
                        </div>
                    </div>

                    <!-- Próxima cita -->
                    <div class="next-appointment">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"/>
                            <path d="M16 3v4"/>
                            <path d="M8 3v4"/>
                            <path d="M4 11h16"/>
                            <path d="M12 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                        </svg>
                        <div class="next-text">
                            <div class="next-title">Próxima Cita</div>
                            <div class="next-date">${p.proxima_cita}</div>
                        </div>
                    </div>

                    <!-- Historial -->
                    <hr class="divider">
                    <p class="section-label">Citas recientes</p>
                    <ul class="historial-list">
                        ${
                            p.historial.length > 0
                            ? p.historial.map(h => `
                                <li class="historial-item">
                                    <div class="hist-left">
                                        <span class="hist-servicio">${h.servicio}</span>
                                        <span class="hist-fecha">${h.fecha}${ h.barbero ? ' · ' + h.barbero : '' }</span>
                                    </div>
                                    <span class="hist-precio">✅</span>
                                </li>`).join('')
                            : `<li style="text-align:center;padding:18px 0;font-family:'Manrope',sans-serif;font-size:0.84rem;color:#475569;">Sin citas completadas aún</li>`
                        }
                    </ul>

                    <!-- Botones -->
                    <div class="btn-group" style="grid-template-columns:1fr;">
                        <button class="btn btn-secondary" id="btnVerCitas">📋 Ver Mis Citas</button>
                    </div>
                    <div style="margin-top:10px;">
                        <button class="btn btn-secondary" id="btnCerrarSesion" style="width:100%;">Cerrar Sesión</button>
                    </div>

                </div>
            </div>
        `;
    }

    /** Abre el modal */
    open() {
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /** Cierra el modal */
    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }

    _bindEvents() {
        const sr = this.shadowRoot;

        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());

        this.addEventListener('click', (e) => {
            if (e.composedPath()[0] === this) this.close();
        });

        this._onKeydown = (e) => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKeydown);

        const session = this._getSession();

        if (!session) {
            const tabLogin = sr.getElementById('tabLogin');
            const tabRegistro = sr.getElementById('tabRegistro');
            const panelLogin = sr.getElementById('panelLogin');
            const panelReg = sr.getElementById('panelRegistro');

            const track = sr.getElementById('panelsTrack');
            const indicator = sr.getElementById('switcherIndicator');

            const showLogin = () => {
                track.classList.remove('show-registro');
                indicator.classList.remove('right');
                tabLogin.classList.add('active');
                tabRegistro.classList.remove('active');
            };
            const showRegistro = () => {
                track.classList.add('show-registro');
                indicator.classList.add('right');
                tabRegistro.classList.add('active');
                tabLogin.classList.remove('active');
            };

            tabLogin.addEventListener('click', showLogin);
            tabRegistro.addEventListener('click', showRegistro);
            sr.getElementById('irRegistro').addEventListener('click', showRegistro);
            sr.getElementById('irLogin').addEventListener('click', showLogin);

            // ── helpers de validación ──────────────────────────
            function setInputError(input, hasError) {
                if (!input) return;
                input.style.borderColor = hasError
                    ? 'rgba(239,68,68,0.7)'
                    : 'rgba(255,255,255,0.1)';
            }

            function showMsg(divMensaje, text, isError = true) {
                divMensaje.textContent = text;
                divMensaje.style.display = 'block';
                divMensaje.style.background = isError
                    ? 'rgba(239,68,68,0.1)'
                    : 'rgba(52,211,153,0.1)';
                divMensaje.style.color = isError ? '#fca5a5' : '#6ee7b7';
                divMensaje.style.border = isError
                    ? '1px solid rgba(239,68,68,0.3)'
                    : '1px solid rgba(52,211,153,0.3)';
                divMensaje.style.borderRadius = '8px';
                divMensaje.style.padding = '10px 14px';
                divMensaje.style.fontFamily = "'Manrope', sans-serif";
                divMensaje.style.fontSize = '0.85rem';
            }

            function clearMsg(divMensaje) {
                divMensaje.style.display = 'none';
                divMensaje.textContent = '';
            }

            function validateFields(fields, sr, divMensaje) {
                let valid = true;

                // Resetear bordes
                fields.forEach(f => setInputError(sr.getElementById(f.id), false));
                clearMsg(divMensaje);

                // 1. Campos vacíos
                for (const f of fields) {
                    const input = sr.getElementById(f.id);
                    if (!input.value.trim()) {
                        setInputError(input, true);
                        showMsg(divMensaje, '⚠️ Por favor completa todos los campos.');
                        return false;
                    }
                }

                // 2. Validar email
                const emailField = fields.find(f => f.key === 'email');
                if (emailField) {
                    const emailInput = sr.getElementById(emailField.id);
                    const emailVal   = emailInput.value.trim();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(emailVal)) {
                        setInputError(emailInput, true);
                        showMsg(divMensaje, '⚠️ El correo no es válido. Debe contener @ y un dominio (ej: nombre@correo.com).');
                        return false;
                    }
                }

                // 3. Validar contraseña mínimo 8 caracteres
                const passField = fields.find(f => f.key === 'password');
                if (passField) {
                    const passInput = sr.getElementById(passField.id);
                    if (passInput.value.length < 8) {
                        setInputError(passInput, true);
                        showMsg(divMensaje, '⚠️ La contraseña debe tener al menos 8 caracteres.');
                        return false;
                    }
                }

                return true;
            }
            // ────────────────────────────────────────────────────

            async function handleAuth({ route, type, component, fields }) {
                const sr = component.shadowRoot;
                const divMensaje = sr.getElementById(`msg-${type}`);

                // Validaciones client-side
                if (!validateFields(fields, sr, divMensaje)) return;

                // Construir body
                const body = {};
                fields.forEach(f => body[f.key] = sr.getElementById(f.id).value.trim());

                try {
                    const response = await fetch(`http://localhost:3000${route}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    const data = await response.json();

                    if (data.ok) {
                        if (data.token) localStorage.setItem('token', data.token);
                        localStorage.setItem('zhola_user', JSON.stringify(data.user));
                        component.dispatchEvent(new CustomEvent('login-success', {
                            detail: data.user, bubbles: true, composed: true
                        }));
                        component._render();
                    } else {
                        showMsg(divMensaje, '❌ ' + (data.error || 'Error. Intenta de nuevo.'));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showMsg(divMensaje, '❌ Error de conexión. Verifica tu red.');
                }
            }

            sr.getElementById('btnLogin').addEventListener('click', () => {
                handleAuth({
                    route: '/api/login',
                    type: 'log',
                    component: this,
                    fields: [
                        { id: 'loginEmail', key: 'email' },
                        { id: 'loginPass', key: 'password' }
                    ]
                });
            });

            sr.getElementById('btnRegistro').addEventListener('click', () => {
                handleAuth({
                    route: '/api/registro',
                    type: 'reg',
                    component: this,
                    fields: [
                        { id: 'regNombre', key: 'name' },
                        { id: 'regEmail', key: 'email' },
                        { id: 'regPass', key: 'password' }
                    ]
                });
            });

        } else {
            sr.getElementById('btnVerCitas').addEventListener('click', () => {
                this.close();
                this.dispatchEvent(new CustomEvent('abrir-mis-citas', { bubbles: true, composed: true }));
            });

            sr.getElementById('btnCerrarSesion').addEventListener('click', () => {
                localStorage.removeItem('zhola_user');
                localStorage.removeItem('token');
                this.dispatchEvent(new CustomEvent('cerrar-sesion', { bubbles: true, composed: true }));
                this._render();
            });
        }
    }
}
customElements.define('perfil-component', PerfilComponent);




