import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.send("Use ?q=palavra para buscar no TikTok");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(`https://www.tiktok.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForSelector("div[data-e2e='search-card']", { timeout: 10000 });

    const results = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div[data-e2e='search-card']"));
      return cards.slice(0, 10).map(card => {
        const link = card.querySelector("a[href*='/video/']")?.href || null;
        const caption = card.querySelector("div[data-e2e='video-desc']")?.innerText || "";
        const author = card.querySelector("a[data-e2e='search-user-name']")?.innerText || "";
        const likes = card.querySelector("strong[data-e2e='like-count']")?.innerText || "0";
        return { link, caption, author, likes };
      });
    });

    await browser.close();

    res.json({ total: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao buscar vídeos", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT}`));
