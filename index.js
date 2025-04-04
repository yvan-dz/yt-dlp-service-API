const express = require("express")
const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cors())

app.post("/download", async (req, res) => {
  const { url, format } = req.body
  if (!url) return res.status(400).json({ error: "Missing URL" })

  const id = Date.now()
  const outputFile = path.join(__dirname, `video-${id}.${format || "mp3"}`)

  const command = `yt-dlp -x --audio-format ${format || "mp3"} -o "${outputFile}" "${url}"`

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr)
      return res.status(500).json({ error: "yt-dlp failed" })
    }

    res.download(outputFile, () => {
      fs.unlinkSync(outputFile)
    })
  })
})

app.listen(PORT, () => console.log(`🎬 Microservice running on port ${PORT}`))
