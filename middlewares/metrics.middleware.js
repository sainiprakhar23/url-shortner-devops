import { httpRequestsTotal, httpRequestDuration, activeConnections } from '../utils/metrics.js';

export function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') return next();

  activeConnections.inc();
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode,
    });

    httpRequestDuration.observe(
      { method: req.method, route: route, status_code: res.statusCode },
      duration
    );
    activeConnections.dec();
  });
  next();
}