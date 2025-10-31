import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// Função para buscar vídeos do TikTok por palavra-chave
async function buscarVideos(keyword) {
  try {
    const url = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const videos = [];

    $("a[href*='/video/']").each((_, el) => {
      const link = "https://www.tiktok.com" + $(el).attr("href");
      const titulo = $(el).text().trim();
      if (link.includes("video")) {
        videos.push({ titulo, link });
      }
    });

    return videos.slice(0, 20); // limita pra evitar travamentos
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error.message);
    return [];
  }
}

// Endpoint principal
app.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({
      message: "Use o parâmetro ?q=palavra para buscar vídeos do TikTok.",
      exemplo: "/?q=dentista",
    });
  }

  const resultados = await buscarVideos(q);
  res.json({
    termo: q,
    quantidade: resultados.length,
    videos: resultados,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
