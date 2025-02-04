require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Database (simples, sem persistência)
const urlDatabase = {};
let urlCount = 1;

// POST /api/shorturl → Cria URL encurtada
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Verifica se a URL é válida
  try {
    const parsedUrl = new URL(originalUrl);
    
    // Verifica se o domínio existe
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Salva no "banco de dados"
      const shortUrl = urlCount;
      urlDatabase[shortUrl] = originalUrl;
      urlCount++;

      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

// GET /api/shorturl/:short → Redireciona para a URL original
app.get('/api/shorturl/:short', function(req, res) {
  const shortUrl = req.params.short;

  if (urlDatabase[shortUrl]) {
    return res.redirect(urlDatabase[shortUrl]);
  }

  res.json({ error: 'No short URL found' });
});

// Start server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
