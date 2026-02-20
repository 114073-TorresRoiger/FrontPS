const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_PATH = path.join(__dirname, 'dist/app-oficios/browser');

// Log startup
console.log('Starting server...');
console.log('DIST_PATH:', DIST_PATH);

// Servir archivos estáticos desde el directorio dist
// maxAge para cache de assets inmutables (JS/CSS con hash)
app.use(express.static(DIST_PATH, {
  maxAge: '1y',
  etag: true,
  index: false, // No servir index.html automáticamente para rutas
  setHeaders: (res, filePath) => {
    // Cache agresivo para chunks con hash
    if (filePath.includes('chunk-') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // No cache para index.html
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Solo redirigir al index.html para rutas de navegación (no para assets)
app.get('*', (req, res, next) => {
  // Si la solicitud es para un archivo estático (js, css, map, etc), retornar 404
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    console.log('Static file not found:', req.path);
    return res.status(404).send('Not found');
  }
  
  // Para rutas de navegación, servir index.html
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
