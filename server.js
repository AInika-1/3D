const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const root = __dirname;
const n8nWebhookUrl =
  process.env.N8N_WEBHOOK_URL ||
  "https://ainika-n8.app.n8n.cloud/webhook/f2421310-0ed0-46fc-bbd2-819139c7837a";

app.use(express.json({ limit: "1mb" }));

// Serve the project folder as static files for Railway web service deploys.
app.use(express.static(root));

app.post("/api/contact", async (req, res) => {
  const { name, Email, Phone, Message } = req.body || {};

  if (!name || !Email || !Phone) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  try {
    const forwardResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, Email, Phone, Message: Message || "" }),
    });

    if (!forwardResponse.ok) {
      const errorBody = await forwardResponse.text();
      throw new Error(`n8n forward failed: ${forwardResponse.status} ${errorBody}`);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact submission failed:", error.message);
    return res.status(502).json({ ok: false, error: "Failed to send message" });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
