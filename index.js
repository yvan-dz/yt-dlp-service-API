const express = require("express")
const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json({ limit: "100mb" }))
app.use(cors())

app.post("/api/download", async (req, res) => {
  const { url, format } = req.body
  if (!url) return res.status(400).json({ error: "Missing URL" })

  const id = Date.now()
  const ext = format || "mp4"
  const filename = `video-${id}.${ext}`
  const outputFile = path.join(__dirname, filename)

  const command = `yt-dlp -f best -o "${outputFile}" "${url}"`

  exec(command, async (err, stdout, stderr) => {
    if (err || !fs.existsSync(outputFile)) {
      console.error("yt-dlp error:", stderr)
      return res.status(500).json({ error: "yt-dlp failed" })
    }

    try {
      const fileBuffer = fs.readFileSync(outputFile)
      const base64 = fileBuffer.toString("base64")

      // Nettoyage du fichier après lecture
      fs.unlinkSync(outputFile)

      return res.json({ base64, filename })
    } catch (readErr) {
      console.error("File read error:", readErr)
      return res.status(500).json({ error: "Failed to read video file" })
    }
  })
})

app.listen(PORT, () => console.log(`🎬 yt-dlp microservice running on port ${PORT}`))
