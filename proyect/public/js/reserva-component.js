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
                            <div class="barbero-opcion">
                                <input type="radio" name="barbero" id="bJulian" value="Julián Vega">
                                <label for="bJulian">
                                    <img class="barbero-avatar" src="https://img.freepik.com/foto-gratis/retrato-estilista-barbudo-que-mira-camara_23-2147839834.jpg?semt=ais_hybrid&w=740&q=80" alt="Julián Vega">
                                    <span>Julián Vega</span>
                                </label>
                            </div>
                            <div class="barbero-opcion">
                                <input type="radio" name="barbero" id="bAntony" value="Antony Martinez">
                                <label for="bAntony">
                                    <img class="barbero-avatar" src="https://img.freepik.com/foto-gratis/retrato-estilista-masculino-mirando-camara_23-2147839829.jpg?semt=ais_user_personalization&w=740&q=80" alt="Antony Martinez">
                                    <span>Antony Martinez</span>
                                </label>
                            </div>
                            <div class="barbero-opcion">
                                <input type="radio" name="barbero" id="bMarcos" value="Marcos Thorne">
                                <label for="bMarcos">
                                    <img class="barbero-avatar" src="https://img.freepik.com/foto-gratis/retrato-peluquero-masculino-maquinilla-afeitar_23-2147839800.jpg?semt=ais_hybrid&w=740&q=80" alt="Marcos Thorne">
                                    <span>Marcos Thorne</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="hora">Hora</label>
                            <select id="hora" name="hora" required>
                                <option value="" disabled selected>Selecciona hora</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="09:30">9:30 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="10:30">10:30 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="11:30">11:30 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="12:30">12:30 PM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="13:30">1:30 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="14:30">2:30 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="15:30">3:30 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="16:30">4:30 PM</option>
                                <option value="17:00">5:00 PM</option>
                                <option value="17:30">5:30 PM</option>
                                <option value="18:00">6:00 PM</option>
                                <option value="18:30">6:30 PM</option>
                                <option value="19:00">7:00 PM</option>
                                <option value="19:30">7:30 PM</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="fechaCita">Día</label>
                            <input type="date" id="fechaCita" name="fecha" required />
                        </div>
                    </div>

                    <div class="mensaje-cita" id="mensajeCita"></div>

                    <button type="submit" class="btn-submit">Siguiente &rarr;</button>
                </form>

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
        const hoy = new Date().toISOString().split('T')[0];
        this.shadowRoot.getElementById('fechaCita').min = hoy;
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
        this._loadCortes();
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

    _bindEvents() {
        const sr = this.shadowRoot;

        // Botón X
        sr.getElementById('btnCerrar').addEventListener('click', () => this.close());

        // Clic fuera del modal-box
        this.addEventListener('click', (e) => {
            if (e.composedPath()[0] === this) this.close();
        });

        // Tecla Escape
        this._onKeydown = (e) => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._onKeydown);

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

        // PASO 1 → PASO 2: validar formulario y mostrar cobro
        sr.getElementById('formCita').addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = sr.getElementById('mensajeCita');
            const nombre = sr.getElementById('nombreCliente').value.trim();
            const servSel = sr.getElementById('servicio');
            const servicioVal = servSel.value;
            const servicio = servicioVal ? servSel.options[servSel.selectedIndex].text : '';
            const hora = sr.getElementById('hora').value;
            const fecha = sr.getElementById('fechaCita').value;
            const barbero = sr.querySelector('input[name="barbero"]:checked')?.value || '';

            if (!nombre || !servicioVal || !hora || !fecha) {
                msg.className = 'mensaje-cita error';
                msg.textContent = '⚠️ Todos los campos son obligatorios.';
                return;
            }
            if (!barbero) {
                msg.className = 'mensaje-cita error';
                msg.textContent = '⚠️ Por favor selecciona un barbero.';
                return;
            }

            this._datosCita = { nombre, servicio, servicioVal, hora, fecha, barbero };
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