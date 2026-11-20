/* Router - Enrutador SPA basado en window.history.pushState */

const routes = [];
let currentView = null;

const addRoute = (path, handler) => {
  routes.push({ path, handler });
};

const matchRoute = (pathname) => {
  for (const route of routes) {
    const routeRegex = routeToRegex(route.path);
    const match = pathname.match(routeRegex);
    if (match) {
      const params = {};
      const paramNames = route.path.match(/:(\w+)/g) || [];
      paramNames.forEach((name, i) => {
        params[name.slice(1)] = match[i + 1];
      });
      return { handler: route.handler, params };
    }
  }
  return null;
};

const routeToRegex = (path) => {
  const regexPattern = path.replace(/:(\w+)/g, "([^/]+)");
  return new RegExp(`^${regexPattern}$`);
};

const navigateTo = (path) => {
  window.history.pushState({}, path, path);
  return matchRoute(path);
};

const initRouter = (onRouteChange) => {
  window.addEventListener("popstate", () => {
    const match = matchRoute(window.location.pathname);
    if (match && onRouteChange) {
      onRouteChange(match.handler, match.params);
    }
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-router]");
    if (link) {
      e.preventDefault();
      const match = navigateTo(link.getAttribute("href"));
      if (match && onRouteChange) {
        onRouteChange(match.handler, match.params);
      }
    }
  });
};

export { addRoute, navigateTo, initRouter, matchRoute };
