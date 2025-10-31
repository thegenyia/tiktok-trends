import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.send("Use ?q=palavra para buscar no TikTok");

  try {
    const url = `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(data);
    const links = [];
    $("a[href*='/video/']").each((_, el) => {
      const link = $(el).attr("href");
      if (link && !links.includes(link)) links.push(link);
    });
    res.json({ total: links.length, results: links.slice(0, 20) });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar vídeos");
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
