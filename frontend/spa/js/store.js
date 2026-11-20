/* Store - Estado global reactivo (patron Observador / Pub-Sub) */

const store = (() => {
  const hoy = new Date().toISOString().split("T")[0];

  let state = {
    user: null,
    isAuthenticated: false,
    fincas: [
      { id: 1, nombre: "Finca Norte", municipio: "Salento", departamento: "Quindio", estado: "ACTIVO" },
      { id: 2, nombre: "Finca Sur", municipio: "Filandia", departamento: "Quindio", estado: "ACTIVO" },
      { id: 3, nombre: "Finca Central", municipio: "Circasia", departamento: "Quindio", estado: "EN_DESCANSO" },
    ],
    fincaSeleccionada: null,
    lotes: [
      { id: 1, finca_id: 1, codigo_qr: "LOTE-CAF-001", nombre: "Lote Cafe Norte Alto", cultivo: { nombre: "Cafe" }, hectareas: 5.5, estado: "ACTIVO", fecha_siembra: "2024-03-15", estado_fenologico: "Produccion", arboles: 1100 },
      { id: 2, finca_id: 1, codigo_qr: "LOTE-CAF-002", nombre: "Lote Cafe Norte Bajo", cultivo: { nombre: "Cafe" }, hectareas: 4.2, estado: "ACTIVO", fecha_siembra: "2023-08-20", estado_fenologico: "Produccion", arboles: 840 },
      { id: 3, finca_id: 1, codigo_qr: "LOTE-PLT-001", nombre: "Lote Platanal Norte", cultivo: { nombre: "Platano" }, hectareas: 3.2, estado: "ACTIVO", fecha_siembra: "2025-01-10", estado_fenologico: "Produccion", arboles: 450 },
      { id: 4, finca_id: 2, codigo_qr: "LOTE-CAF-003", nombre: "Lote Cafe Sur Este", cultivo: { nombre: "Cafe" }, hectareas: 6.0, estado: "ACTIVO", fecha_siembra: "2024-05-05", estado_fenologico: "Levante", arboles: 1200 },
      { id: 5, finca_id: 2, codigo_qr: "LOTE-PLT-002", nombre: "Lote Platanal Sur", cultivo: { nombre: "Platano" }, hectareas: 2.8, estado: "ACTIVO", fecha_siembra: "2024-11-30", estado_fenologico: "Produccion", arboles: 390 },
      { id: 6, finca_id: 3, codigo_qr: "LOTE-CAF-004", nombre: "Lote Cafe Central", cultivo: { nombre: "Cafe" }, hectareas: 4.5, estado: "EN_DESCANSO", fecha_siembra: "2022-10-12", estado_fenologico: "Zoqueo", arboles: 900 },
      { id: 7, finca_id: 3, codigo_qr: "LOTE-PLT-003", nombre: "Lote Platanal Central", cultivo: { nombre: "Platano" }, hectareas: 3.0, estado: "ACTIVO", fecha_siembra: "2025-02-18", estado_fenologico: "Produccion", arboles: 420 },
    ],
    labores: [
      { id: 1, finca_id: 1, lote_codigo_qr: "LOTE-CAF-001", lote_nombre: "Lote Cafe Norte Alto", tipo: "fertilizacion", fecha: "2026-10-15", estado: "Completada", insumo: "NPK 10-30-10", dosis: "2.5 kg", observaciones: "Aplicacion en surco" },
      { id: 2, finca_id: 1, lote_codigo_qr: "LOTE-PLT-001", lote_nombre: "Lote Platanal Norte", tipo: "fumigacion", fecha: "2026-10-20", estado: "Completada", insumo: "Cobre Oxihidroxido", dosis: "2.0 L", observaciones: "Control de Sigatoka Negra" },
      { id: 3, finca_id: 1, lote_codigo_qr: "LOTE-CAF-001", lote_nombre: "Lote Cafe Norte Alto", tipo: "poda", fecha: "2026-10-25", estado: "Pendiente", insumo: "-", dosis: "-", observaciones: "Zoqueo de renovacion" },
      { id: 4, finca_id: 1, lote_codigo_qr: "LOTE-CAF-002", lote_nombre: "Lote Cafe Norte Bajo", tipo: "fertilizacion", fecha: "2026-11-05", estado: "Programada", insumo: "Urea 46%", dosis: "1.8 kg", observaciones: "Cobertura foliar" },
      { id: 5, finca_id: 2, lote_codigo_qr: "LOTE-CAF-003", lote_nombre: "Lote Cafe Sur Este", tipo: "cosecha", fecha: "2026-11-01", estado: "Completada", insumo: "-", dosis: "-", observaciones: "Recoleccion cereza madura" },
      { id: 6, finca_id: 2, lote_codigo_qr: "LOTE-PLT-002", lote_nombre: "Lote Platanal Sur", tipo: "fumigacion", fecha: "2026-11-08", estado: "Programada", insumo: "Aceite Neem", dosis: "1.5 L", observaciones: "Control de picudo" },
      { id: 7, finca_id: 2, lote_codigo_qr: "LOTE-CAF-003", lote_nombre: "Lote Cafe Sur Este", tipo: "poda", fecha: "2026-11-12", estado: "Pendiente", insumo: "-", dosis: "-", observaciones: "Deschupado de chupones" },
      { id: 8, finca_id: 3, lote_codigo_qr: "LOTE-PLT-003", lote_nombre: "Lote Platanal Central", tipo: "siembra", fecha: "2026-11-03", estado: "Completada", insumo: "-", dosis: "-", observaciones: "Siembra de hijuelos" },
      { id: 9, finca_id: 3, lote_codigo_qr: "LOTE-CAF-004", lote_nombre: "Lote Cafe Central", tipo: "riego", fecha: "2026-11-10", estado: "Pendiente", insumo: "-", dosis: "-", observaciones: "Riego de emergencia por sequia" },
      { id: 10, finca_id: 3, lote_codigo_qr: "LOTE-PLT-003", lote_nombre: "Lote Platanal Central", tipo: "fertilizacion", fecha: "2026-11-15", estado: "Programada", insumo: "Sulfato de Amonio", dosis: "3.0 kg", observaciones: "Aplicacion en banda" },
    ],
    cosechas: [
      { id: 1, finca_id: 1, lote_codigo_qr: "LOTE-CAF-001", lote_nombre: "Lote Cafe Norte Alto", fecha: "2026-10-25", cantidad: 180, unidad: "@", calidad: "Primera", estado: "Completada" },
      { id: 2, finca_id: 1, lote_codigo_qr: "LOTE-PLT-001", lote_nombre: "Lote Platanal Norte", fecha: "2026-10-28", cantidad: 45, unidad: "cargas", calidad: "Primera", estado: "Completada" },
      { id: 3, finca_id: 1, lote_codigo_qr: "LOTE-CAF-002", lote_nombre: "Lote Cafe Norte Bajo", fecha: "2026-11-02", cantidad: 95, unidad: "@", calidad: "Segunda", estado: "Programada" },
      { id: 4, finca_id: 2, lote_codigo_qr: "LOTE-CAF-003", lote_nombre: "Lote Cafe Sur Este", fecha: "2026-11-01", cantidad: 210, unidad: "@", calidad: "Primera", estado: "Completada" },
      { id: 5, finca_id: 2, lote_codigo_qr: "LOTE-PLT-002", lote_nombre: "Lote Platanal Sur", fecha: "2026-11-05", cantidad: 60, unidad: "cargas", calidad: "Primera", estado: "Programada" },
      { id: 6, finca_id: 3, lote_codigo_qr: "LOTE-PLT-003", lote_nombre: "Lote Platanal Central", fecha: "2026-11-03", cantidad: 30, unidad: "cargas", calidad: "Segunda", estado: "Completada" },
      { id: 7, finca_id: 3, lote_codigo_qr: "LOTE-CAF-004", lote_nombre: "Lote Cafe Central", fecha: "2026-11-10", cantidad: 120, unidad: "@", calidad: "Primera", estado: "Pendiente" },
    ],
    insumos: [
      { id: 1, finca_id: 1, nombre: "NPK 10-30-10", tipo: "Fertilizante", ingrediente: "Nitrogeno, Fosforo, Potasio", carencia: "15 dias", unidad: "kg" },
      { id: 2, finca_id: 1, nombre: "Cobre Oxihidroxido", tipo: "Fungicida", ingrediente: "Cobre", carencia: "7 dias", unidad: "L" },
      { id: 3, finca_id: 1, nombre: "Urea 46%", tipo: "Fertilizante", ingrediente: "Nitrogeno", carencia: "7 dias", unidad: "kg" },
      { id: 4, finca_id: 2, nombre: "Aceite Neem", tipo: "Insecticida", ingrediente: "Azadiractina", carencia: "3 dias", unidad: "L" },
      { id: 5, finca_id: 2, nombre: "Cal Agricola", tipo: "Enmienda", ingrediente: "Carbonato de calcio", carencia: "-", unidad: "kg" },
      { id: 6, finca_id: 2, nombre: "Fosfato Diamonico", tipo: "Fertilizante", ingrediente: "Fosforo", carencia: "10 dias", unidad: "kg" },
      { id: 7, finca_id: 3, nombre: "Sulfato de Amonio", tipo: "Fertilizante", ingrediente: "Nitrogeno", carencia: "5 dias", unidad: "kg" },
      { id: 8, finca_id: 3, nombre: "Caldo Bordales", tipo: "Fungicida", ingrediente: "Cobre, Cal", carencia: "10 dias", unidad: "L" },
      { id: 9, finca_id: 3, nombre: "Extracto de Ajo", tipo: "Insecticida", ingrediente: "Ajo", carencia: "2 dias", unidad: "L" },
    ],
    usuariosRegistrados: [
      { id: 1, username: "admin", nombre_completo: "Administrador", rol: "SUPERADMIN", estado: "Activo", finca_id: null, password: "Admin123!" },
      { id: 2, username: "ingeniero", nombre_completo: "Ingeniero Agronomo", rol: "ADMIN", estado: "Activo", finca_id: null, password: "Ing123!" },
      { id: 3, username: "mayordomo1", nombre_completo: "Mayordomo Finca Norte", rol: "MAYORDOMO", estado: "Activo", finca_id: 1, password: "May123!" },
      { id: 4, username: "mayordomo2", nombre_completo: "Mayordomo Finca Sur", rol: "MAYORDOMO", estado: "Activo", finca_id: 2, password: "May123!" },
      { id: 5, username: "mayordomo3", nombre_completo: "Mayordomo Finca Central", rol: "MAYORDOMO", estado: "Activo", finca_id: 3, password: "May123!" },
    ],
    eventos: [
      { id: 1, fecha: "2026-11-15", titulo: "Fertilizacion - LOTE-CAF-001", tipo: "fertilizacion", estado: "Programada", finca_id: 1 },
      { id: 2, fecha: "2026-11-16", titulo: "Fumigacion - LOTE-PLT-001", tipo: "fumigacion", estado: "Programada", finca_id: 1 },
      { id: 3, fecha: "2026-11-18", titulo: "Poda - LOTE-CAF-001", tipo: "poda", estado: "Pendiente", finca_id: 1 },
      { id: 4, fecha: "2026-11-20", titulo: "Cosecha - LOTE-PLT-002", tipo: "cosecha", estado: "Programada", finca_id: 2 },
      { id: 5, fecha: "2026-11-22", titulo: "Riego - LOTE-CAF-003", tipo: "riego", estado: "Vencida", finca_id: 2 },
      { id: 6, fecha: "2026-11-25", titulo: "Siembra - LOTE-PLT-003", tipo: "siembra", estado: "Programada", finca_id: 3 },
      { id: 7, fecha: "2026-11-28", titulo: "Fertilizacion - LOTE-PLT-003", tipo: "fertilizacion", estado: "Pendiente", finca_id: 3 },
      { id: 8, fecha: "2026-12-01", titulo: "Fumigacion - LOTE-CAF-004", tipo: "fumigacion", estado: "Programada", finca_id: 3 },
    ],
    loading: false,
    error: null,
    notifications: [],
  };

  const subscribers = new Set();

  const getState = () => state;

  const setState = (partial) => {
    state = { ...state, ...partial };
    subscribers.forEach((fn) => fn(state));
  };

  const subscribe = (fn) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  const notify = (message, type = "info") => {
    const id = Date.now().toString();
    setState({
      notifications: [...state.notifications, { id, message, type }],
    });
    setTimeout(() => {
      setState({
        notifications: state.notifications.filter((n) => n.id !== id),
      });
    }, 5000);
  };

  return {
    getState,
    setState,
    subscribe,
    notify,
  };
})();

export default store;
