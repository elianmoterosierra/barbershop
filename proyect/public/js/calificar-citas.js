class CalificarCitaComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
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
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

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

                .modal-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                    text-align: center;
                }

                .modal-header .star-icon { color: #D4AF37; }

                .modal-header h2 {
                    margin: 0;
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.7rem;
                    font-style: italic;
                    font-weight: 700;
                    color: #f6f6f8;
                    letter-spacing: -0.02em;
                }

                .modal-subtitle {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.9rem;
                    color: #94a3b8;
                    margin: 0 0 24px;
                    text-align: center;
                }

                .stars-container {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 12px;
                    cursor: pointer;
                }

                .star-btn {
                    background: none;
                    border: none;
                    padding: 0;
                    font-size: 36px;
                    line-height: 1;
                    transition: transform 0.15s, color 0.15s;
                    cursor: pointer;
                    color: rgba(255, 255, 255, 0.2);
                }

                .star-btn:hover,
                .star-btn.hovered {
                    transform: scale(1.15);
                    color: #D4AF37;
                }

                .star-btn.selected { color: #D4AF37; }

                .rating-text {
                    font-family: 'Manrope', sans-serif;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #D4AF37;
                    text-align: center;
                    margin-bottom: 24px;
                    min-height: 24px;
                    letter-spacing: 0.03em;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                label {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #D4AF37;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                textarea {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 8px;
                    color: #f6f6f8;
                    font-family: 'Manrope', sans-serif;
                    font-size: 1rem;
                    padding: 12px 14px;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                    resize: vertical;
                    min-height: 100px;
                }

                textarea::placeholder { color: rgba(255, 255, 255, 0.3); }
                textarea:focus {
                    border-color: #D4AF37;
                    background: rgba(212, 175, 55, 0.08);
                }

                .char-counter {
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.78rem;
                    color: #64748b;
                    text-align: right;
                    margin-top: 4px;
                }

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
                    transition: background 0.2s, transform 0.15s;
                }
                .btn-submit:hover:not(:disabled) { background: #c49b2a; transform: translateY(-1px); }
                .btn-submit:active:not(:disabled) { transform: translateY(0); }
                .btn-submit:disabled {
                    background: #5a5a2e;
                    color: #94a3b8;
                    cursor: not-allowed;
                }

                .msg-result {
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 0.95rem;
                    margin-bottom: 12px;
                    line-height: 1.5;
                    display: none;
                }
                .msg-result.exito {
                    display: block;
                    background: rgba(52, 211, 153, 0.12);
                    border: 1px solid rgba(52, 211, 153, 0.4);
                    color: #6ee7b7;
                }
                .msg-result.error {
                    display: block;
                    background: rgba(239, 68, 68, 0.12);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    color: #fca5a5;
                }

                @media (max-width: 500px) {
                    .modal-box { padding: 30px 20px 24px; }
                }
            </style>

            <div class="modal-box" part="box">
                <button class="modal-close" id="btnCerrar" aria-label="Cerrar">&times;</button>

                <div class="modal-header">
                    <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                        fill="#D4AF37" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <h2>Califica tu experiencia</h2>
                    <p class="modal-subtitle" id="infoCita"></p>
                </div>

                <div class="stars-container" id="starsContainer">
                    <button class="star-btn" data-value="1" aria-label="1 estrella">&#9733;</button>
                    <button class="star-btn" data-value="2" aria-label="2 estrellas">&#9733;</button>
                    <button class="star-btn" data-value="3" aria-label="3 estrellas">&#9733;</button>
                    <button class="star-btn" data-value="4" aria-label="4 estrellas">&#9733;</button>
                    <button class="star-btn" data-value="5" aria-label="5 estrellas">&#9733;</button>
                </div>

                <p class="rating-text" id="ratingText"></p>

                <div class="form-group">
                    <label for="resenaInput">Tu reseña (opcional)</label>
                    <textarea id="resenaInput" placeholder="Cuéntanos sobre tu experiencia..." maxlength="500"></textarea>
                    <span class="char-counter" id="charCounter">500/500</span>
                </div>

                <div class="msg-result" id="msgResult"></div>

                <button class="btn-submit" id="btnEnviar" disabled>Enviar calificación</button>
            </div>
        `;

        this._bindEvents();
    }

    open(citaId, servicio, fecha) {
        this._citaId = citaId;
        this._calificacion = 0;
        this._hoverValue = 0;

        const fechaFormateada = this._formatearFecha(fecha);
        this.shadowRoot.getElementById('infoCita').textContent = `${servicio} — ${fechaFormateada}`;
        this._resetStars();
        this.shadowRoot.getElementById('resenaInput').value = '';
        this.shadowRoot.getElementById('charCounter').textContent = '500/500';
        this.shadowRoot.getElementById('msgResult').className = 'msg-result';
        this.shadowRoot.getElementById('msgResult').textContent = '';
        const btn = this.shadowRoot.getElementById('btnEnviar');
        btn.disabled = true;
        btn.textContent = 'Enviar calificación';

        this.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }

    _formatearFecha(fechaStr) {
        if (!fechaStr) return '';
        const date = new Date(fechaStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    _resetStars() {
        this.shadowRoot.querySelectorAll('.star-btn').forEach(btn => {
            btn.classList.remove('selected', 'hovered');
        });
        this.shadowRoot.getElementById('ratingText').textContent = '';
    }

    _updateStars(value, isHover = false) {
        this.shadowRoot.querySelectorAll('.star-btn').forEach(btn => {
            const val = parseInt(btn.dataset.value);
            if (isHover) {
                btn.classList.toggle('hovered', val <= value);
            } else {
                btn.classList.toggle('hovered', false);
            }
            btn.classList.toggle('selected', !isHover && val <= value);
        });
    }

    _getTextoCalificacion(value) {
        const textos = {
            1: 'Muy malo',
            2: 'Malo',
            3: 'Regular',
            4: 'Bueno',
            5: 'Excelente'
        };
        return textos[value] || '';
    }

    _bindEvents() {
        const sr = this.shadowRoot;

        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());

        this.addEventListener('click', (e) => {
            if (e.composedPath()[0] === this) this.close();
        });

        this._onKeydown = (e) => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKeydown);

        const starBtns = sr.querySelectorAll('.star-btn');
        starBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.dataset.value);
                this._calificacion = value;
                this._hoverValue = 0;
                this._updateStars(value);
                sr.getElementById('ratingText').textContent = this._getTextoCalificacion(value);
                sr.getElementById('btnEnviar').disabled = false;
            });

            btn.addEventListener('mouseenter', () => {
                this._hoverValue = parseInt(btn.dataset.value);
                this._updateStars(this._hoverValue, true);
                sr.getElementById('ratingText').textContent = this._getTextoCalificacion(this._hoverValue);
            });

            btn.addEventListener('mouseleave', () => {
                this._updateStars(this._calificacion);
                sr.getElementById('ratingText').textContent = this._getTextoCalificacion(this._calificacion) || '';
            });
        });

        sr.getElementById('resenaInput').addEventListener('input', (e) => {
            const remaining = 500 - e.target.value.length;
            sr.getElementById('charCounter').textContent = `${remaining}/500`;
        });

        sr.getElementById('btnEnviar').addEventListener('click', async () => {
            if (this._calificacion < 1) return;

            const btn = sr.getElementById('btnEnviar');
            const msg = sr.getElementById('msgResult');
            const resena = sr.getElementById('resenaInput').value.trim();

            btn.disabled = true;
            btn.textContent = 'Enviando...';

            const token = localStorage.getItem('token');
            if (!token) {
                msg.className = 'msg-result error';
                msg.textContent = '❌ Debes iniciar sesión para calificar.';
                btn.disabled = false;
                btn.textContent = 'Enviar calificación';
                return;
            }

            try {
                const respuesta = await fetch(`/api/citas/${this._citaId}/calificar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        calificacion: this._calificacion,
                        resena: resena
                    })
                });

                const data = await respuesta.json();

                if (!data.ok) {
                    msg.className = 'msg-result error';
                    msg.textContent = `❌ ${data.error || 'Error al enviar la calificación.'}`;
                    btn.disabled = false;
                    btn.textContent = 'Enviar calificación';
                    return;
                }

                msg.className = 'msg-result exito';
                msg.textContent = '✅ ¡Calificación enviada con éxito!';

                this.dispatchEvent(new CustomEvent('cita-calificada', {
                    bubbles: true, composed: true,
                    detail: {
                        citaId: this._citaId,
                        calificacion: this._calificacion,
                        resena: resena
                    }
                }));

                setTimeout(() => this.close(), 2000);

            } catch (error) {
                msg.className = 'msg-result error';
                msg.textContent = '❌ Error al conectar con el servidor. Intenta de nuevo.';
                btn.disabled = false;
                btn.textContent = 'Enviar calificación';
            }
        });
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._onKeydown);
    }
}

customElements.define('calificar-cita', CalificarCitaComponent);