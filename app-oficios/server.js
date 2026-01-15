const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Servir archivos estáticos desde el directorio dist
app.use(express.static(path.join(__dirname, 'dist/app-oficios/browser')));

// Todas las rutas redirigen al index.html (para Angular routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app-oficios/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
