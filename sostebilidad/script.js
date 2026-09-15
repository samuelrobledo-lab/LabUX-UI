// ==========================================
// 1. CONFIGURACIÓN DEL MAPA
// ==========================================

const map = L.map('map', { zoomControl: false }).setView([3.4372, -76.5225], 12);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Capa corregida: CartoDB Voyager evita el error 403 Access Blocked
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

// Paleta de Colores
const COLOR_AZUL_BOTON = '#3e63ae';
const COLOR_FONDO_TARJETA = '#f2e6db';

const COLOR_ROJO = '#f1584e';    // Alta urgencia / Barras 0%-33%
const COLOR_NARANJA = '#f7935a'; // Media urgencia / Barras 34%-66%
const COLOR_VERDE = '#a6d27d';   // Baja urgencia / Barras 67%-100%

// ==========================================
// 2. BASE DE DATOS (8 PUNTOS)
// ==========================================

const puntosDeApoyo = [
    // ---------------- URGENCIAS ALTAS (4) ----------------
    {
        id: 1,
        nombre: "Comedor Comunitario Siloé",
        barrio: "Siloé (Comuna 20)",
        coordenadas: [3.4210, -76.5510],
        urgencia: "Alta",
        contacto: "3001234567",
        necesidades: [
            { producto: "🍚 Alimentos No Perecederos", porcentaje: 20, categoria: "Alimentos" },
            { producto: "🧱 Bultos de Cemento", porcentaje: 50, categoria: "Construcción" },
            { producto: "👕 Ropa para niños/as", porcentaje: 85, categoria: "Ropa" }
        ]
    },
    {
        id: 2,
        nombre: "Centro de Apoyo Terrón Colorado",
        barrio: "Terrón Colorado (Comuna 1)",
        coordenadas: [3.4580, -76.5580],
        urgencia: "Alta",
        contacto: "3159876543",
        necesidades: [
            { producto: "🧱 Materiales de Construcción", porcentaje: 15, categoria: "Construcción" },
            { producto: "👟 Calzado formal y escolar", porcentaje: 45, categoria: "Ropa" },
            { producto: "🍼 Leche en polvo y pañales", porcentaje: 90, categoria: "Bebés" }
        ]
    },
    {
        id: 3,
        nombre: "Punto Solidario Sucre",
        barrio: "Sucre (Comuna 9)",
        coordenadas: [3.4430, -76.5280],
        urgencia: "Alta",
        contacto: "3119998877",
        necesidades: [
            { producto: "🩸 Suministros Médicos", porcentaje: 10, categoria: "Higiene" },
            { producto: "🍚 Alimentos No Perecederos", porcentaje: 60, categoria: "Alimentos" }
        ]
    },
    {
        id: 4,
        nombre: "Acopio Comunitario Lleras Camargo",
        barrio: "Lleras Camargo (Comuna 20)",
        coordenadas: [3.4160, -76.5560],
        urgencia: "Alta",
        contacto: "3178887766",
        necesidades: [
            { producto: "🍼 Leche en polvo y pañales", porcentaje: 30, categoria: "Bebés" },
            { producto: "🧥 Cobijas y Colchonetas", porcentaje: 75, categoria: "Ropa" }
        ]
    },

    // ---------------- URGENCIAS MEDIAS (2) ----------------
    {
        id: 5,
        nombre: "Hogar Comunitario Aguablanca",
        barrio: "El Poblado II (Comuna 13)",
        coordenadas: [3.4150, -76.4950],
        urgencia: "Media",
        contacto: "3115557890",
        necesidades: [
            { producto: "🍚 Granos (Arroz, Frijol, Lenteja)", porcentaje: 40, categoria: "Alimentos" },
            { producto: "🧥 Cobijas y Colchonetas", porcentaje: 70, categoria: "Ropa" }
        ]
    },
    {
        id: 6,
        nombre: "Centro de Acopio Meléndez",
        barrio: "Meléndez (Comuna 18)",
        coordenadas: [3.3790, -76.5480],
        urgencia: "Media",
        contacto: "3103339988",
        necesidades: [
            { producto: "🍚 Alimentos No Perecederos", porcentaje: 25, categoria: "Alimentos" },
            { producto: "🩺 Botiquín de Primeros Auxilios", porcentaje: 65, categoria: "Higiene" }
        ]
    },

    // ---------------- URGENCIAS BAJAS (2) ----------------
    {
        id: 7,
        nombre: "Red Solidaria Petecuy",
        barrio: "Petecuy III (Comuna 6)",
        coordenadas: [3.4790, -76.4910],
        urgencia: "Baja",
        contacto: "3184441122",
        necesidades: [
            { producto: "🍼 Pañales y fórmula láctea", porcentaje: 85, categoria: "Bebés" },
            { producto: "🧼 Kits de Higiene Personal", porcentaje: 95, categoria: "Higiene" }
        ]
    },
    {
        id: 8,
        nombre: "Fundación Alfonso López",
        barrio: "Alfonso López (Comuna 7)",
        coordenadas: [3.4650, -76.5120],
        urgencia: "Baja",
        contacto: "3127773344",
        necesidades: [
            { producto: "🧱 Tejas y zinc para techos", porcentaje: 33, categoria: "Construcción" },
            { producto: "👟 Ropa y Calzado", porcentaje: 80, categoria: "Ropa" }
        ]
    }
];

let marcadoresActivos = [];

// ==========================================
// 3. FUNCIONES DE COLORIMETRÍA
// ==========================================

function obtenerColorInsigniaUrgencia(urgencia) {
    if (urgencia === "Alta") return COLOR_ROJO;
    if (urgencia === "Media") return COLOR_NARANJA;
    return COLOR_VERDE;
}

function obtenerColorBarraPorcentaje(porcentaje) {
    if (porcentaje <= 33) return COLOR_ROJO;
    if (porcentaje <= 66) return COLOR_NARANJA;
    return COLOR_VERDE;
}

// ==========================================
// 4. RENDERIZADO Y FILTROS
// ==========================================

function dibujarMarcadores(listaPuntos) {
    marcadoresActivos.forEach(m => map.removeLayer(m));
    marcadoresActivos = [];

    if (listaPuntos.length === 0) return;

    const bounds = L.latLngBounds();

    listaPuntos.forEach(punto => {
        const marker = L.marker(punto.coordenadas).addTo(map);
        marker.bindTooltip(`<b>${punto.nombre}</b>`, { direction: 'top', offset: [0, -30] });

        marker.on('click', () => {
            mostrarDetalles(punto);
            map.flyTo(punto.coordenadas, 14, { duration: 1 });
        });

        marcadoresActivos.push(marker);
        bounds.extend(punto.coordenadas);
    });

    map.fitBounds(bounds, { padding: [50, 50] });
}

function filtrarPuntos() {
    const selUrgencia = document.getElementById('filter-urgencia');
    const selInsumo = document.getElementById('filter-insumo');

    const urgenciaVal = selUrgencia ? selUrgencia.value : 'todos';
    const insumoVal = selInsumo ? selInsumo.value : 'todos';

    const filtrados = puntosDeApoyo.filter(punto => {
        const coincideUrgencia = (urgenciaVal === 'todos') || (punto.urgencia === urgenciaVal);
        const coincideInsumo = (insumoVal === 'todos') || punto.necesidades.some(n => n.categoria === insumoVal);
        
        return coincideUrgencia && coincideInsumo;
    });

    dibujarMarcadores(filtrados);
    volverAlMenuPrincipal();
}

function mostrarDetalles(punto) {
    const infoPanel = document.getElementById('info-panel');
    if (!infoPanel) return;

    let barrasHTML = '';
    punto.necesidades.forEach(item => {
        const colorBarra = obtenerColorBarraPorcentaje(item.porcentaje);
        
        barrasHTML += `
            <div style="margin-bottom: 0.9rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; color: #1A1A1A;">
                    <span>${item.producto}</span>
                    <span style="font-weight: 700; color: #1A1A1A;">${item.porcentaje}%</span>
                </div>
                <div style="width: 100%; height: 12px; background: #FAF6ED; border-radius: 20px; overflow: hidden; padding: 2px;">
                    <div style="width: ${item.porcentaje}%; height: 100%; background: ${colorBarra}; border-radius: 20px; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
    });

    const colorBadge = obtenerColorInsigniaUrgencia(punto.urgencia);

    infoPanel.innerHTML = `
        <div>
            <!-- Botón Volver -->
            <button class="btn-pill-back" onclick="volverAlMenuPrincipal(true)" style="background-color: #3e63ae !important; color: #FFFFFF !important; width: 100%; border: none; padding: 12px; border-radius: 30px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
                ← Volver al menú principal
            </button>

            <!-- Tarjeta de Banner -->
            <div class="card-banner" style="background-color: #f2e6db !important; border-radius: 20px; padding: 1.2rem; margin-top: 0.8rem; margin-bottom: 1rem;">
                <span class="badge-urgencia" style="background-color: ${colorBadge} !important; color: #FFFFFF !important; padding: 5px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block;">
                    URGENCIA ${punto.urgencia.toUpperCase()}
                </span>
                <h2 style="font-size: 1.1rem; font-weight: 700; margin-top: 8px; color: #1A1A1A;">${punto.nombre}</h2>
                <p style="color: #2E2E2E; font-weight: 500; font-size: 0.85rem;">📍 ${punto.barrio}</p>
            </div>

            <!-- Insumos Requeridos -->
            <div class="card-insumos" style="background: #FFFFFF; border-radius: 20px; padding: 1.2rem; margin-bottom: 1rem; border: 1px solid rgba(0,0,0,0.08);">
                <h3 style="font-size: 0.9rem; font-weight: 700; color: #3e63ae; margin-bottom: 0.8rem;">
                    Insumos requeridos
                </h3>
                ${barrasHTML}
            </div>

            <!-- Botón Contacto WhatsApp -->
            <a href="https://wa.me/57${punto.contacto}?text=Hola,%20quisiera%20apoyar%20a%20${encodeURIComponent(punto.nombre)}" 
               target="_blank" 
               style="background-color: #3e63ae !important; color: #FFFFFF !important; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; text-decoration: none; padding: 12px; border-radius: 30px; font-weight: 600; font-size: 0.85rem; border: none;">
                💬 Contactar por WhatsApp
            </a>
        </div>
    `;
}

function volverAlMenuPrincipal(recentrar = false) {
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
        infoPanel.innerHTML = `
            <div class="placeholder-state">
                <div class="icon-circle">📍</div>
                <h3>Selecciona un punto en el mapa</h3>
                <p>Haz clic en cualquier pin para consultar la ubicación, los insumos requeridos y el porcentaje actual alcanzado.</p>
            </div>
        `;
    }

    if (recentrar) {
        dibujarMarcadores(puntosDeApoyo);
    }
}

// ==========================================
// 5. INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const selUrgencia = document.getElementById('filter-urgencia');
    const selInsumo = document.getElementById('filter-insumo');

    if (selUrgencia) selUrgencia.addEventListener('change', filtrarPuntos);
    if (selInsumo) selInsumo.addEventListener('change', filtrarPuntos);

    // Ajuste de tamaño y renderizado inicial
    setTimeout(() => {
        map.invalidateSize();
        dibujarMarcadores(puntosDeApoyo);
    }, 300);
});

// Reajustar dimensiones si la ventana cambia de tamaño
window.addEventListener('resize', () => {
    map.invalidateSize();
});