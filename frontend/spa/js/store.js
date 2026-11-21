/* Store - Estado global reactivo (patron Observador / Pub-Sub) */

const store = (() => {
  const hoy = new Date().toISOString().split("T")[0];

  let state = {
    user: null,
    isAuthenticated: false,
    fincas: [],
    fincaSeleccionada: null,
    lotes: [],
    labores: [],
    cosechas: [],
    insumos: [],
    usuariosRegistrados: [],
    eventos: [],
    loading: false,
    error: null,
    notifications: [],
  };

  const subscribers = new Set();

  const getState = () => state;

  const getDefaultFincaId = () => {
    const fincas = Array.isArray(state.fincas) ? state.fincas : [];
    return fincas.find((finca) => finca.estado === "ACTIVO")?.id ?? fincas[0]?.id ?? null;
  };

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
    getDefaultFincaId,
    setState,
    subscribe,
    notify,
  };
})();

export default store;
