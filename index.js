const express = require("express")
const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cors())

app.post("/api/download", async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: "Missing URL" })

  const id = Date.now()
  const outputFile = path.join(__dirname, `video-${id}.mp4`)
  const command = `yt-dlp -f best[ext=mp4] -o "${outputFile}" "${url}"`

  console.log("➡️ Commande exécutée :", command)

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ yt-dlp error:", err)
      console.error("🪵 stderr:", stderr)
      return res.status(500).json({ error: "yt-dlp failed", stderr })
    }

    try {
      const fileBuffer = fs.readFileSync(outputFile)
      const base64 = fileBuffer.toString("base64")
      const filename = path.basename(outputFile)

      fs.unlinkSync(outputFile) // Nettoyage

      res.json({ base64, filename })
    } catch (readErr) {
      console.error("❌ Read file failed:", readErr)
      res.status(500).json({ error: "Failed to read downloaded file" })
    }
  })
})

app.listen(PORT, () => console.log(`🎬 Microservice running on port ${PORT}`))
