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
  const command = `yt-dlp -f best -o "${outputFile}" "${url}"`

  exec(command, (err) => {
    if (err) {
      console.error("yt-dlp failed:", err)
      return res.status(500).json({ error: "yt-dlp failed" })
    }

    res.setHeader("Content-Disposition", `attachment; filename=video-${id}.mp4`)
    res.setHeader("Content-Type", "video/mp4")

    const readStream = fs.createReadStream(outputFile)
    readStream.pipe(res)

    // Supprimer le fichier après envoi
    readStream.on("close", () => {
      fs.unlink(outputFile, () => {
        console.log("🧹 Vidéo supprimée :", outputFile)
      })
    })
  })
})

app.listen(PORT, () => console.log(`🎬 Microservice running on port ${PORT}`))
