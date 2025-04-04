FROM node:18

WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y ffmpeg curl python3-pip && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    npm install

EXPOSE 4000
CMD ["node", "index.js"]
