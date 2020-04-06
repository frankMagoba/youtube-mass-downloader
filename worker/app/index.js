const Queue = require('bull');
const {exec} = require('mz/child_process');
const {writeFile} = require('mz/fs');
const {join} = require('path');
const config = require('./config');

const queue = new Queue(`${config.queue_name}`, {redis: config.redis});

queue.process(config.queue_name, config.queue_concurrent, async (job, done) => {
  const ytid = job.id;
  const rcloneVideoBase = join(config.rclone_base, ytid.substr(0, 2), ytid.substr(2));
  console.log(`[${ytid}] Starting...`);
  try {
    await exec(`mkdir -p /tmp/${ytid}`);
    const downloadThumbnail = async () => {
      const srcPath = `/tmp/${ytid}/thumbnail.jpg`;
      const destPath = join(rcloneVideoBase, 'thumbnail.jpg');
      console.log(`[${ytid}] Downloading thumbnail to ${destPath}...`);
      await exec(`youtube-dl 'https://www.youtube.com/watch?v=${ytid}' -q --write-thumbnail --skip-download -o ${srcPath}`);
      await exec(`rclone move ${srcPath} ${rcloneVideoBase}`);
      console.log(`[${ytid}] Thumbnail downloaded.`);
    };
    const downloadMeta = async () => {
      const srcPath = `/tmp/${ytid}/info.json`;
      const destPath = join(rcloneVideoBase, 'info.json');
      console.log(`[${ytid}] Downloading meta to ${destPath}...`);
      const [stdout] = await exec(`youtube-dl 'https://www.youtube.com/watch?v=${ytid}' -q --dump-json`, {maxBuffer: 5 * 1024 * 1024});
      const info = JSON.parse(stdout);
      delete info.requested_formats;
      delete info.formats;
      await job.update({
        title: info.title
      });
      await writeFile(srcPath, JSON.stringify(info));
      await exec(`rclone move ${srcPath} ${rcloneVideoBase}`);
      console.log(`[${ytid}] Meta downloaded.`);
    };
    const downloadVideo = async () => {
      const path = join(rcloneVideoBase, 'video.mkv');
      console.log(`[${ytid}] Downloading video to ${path}...`);
      await exec(`youtube-dl 'https://www.youtube.com/watch?v=${ytid}' -q -o - | rclone rcat ${path}`);
      console.log(`[${ytid}] Video downloaded.`);
    };
    await Promise.all([
      downloadThumbnail(),
      downloadMeta(),
      downloadVideo()
    ]);
    await exec(`rmdir /tmp/${ytid}`);
    console.log(`[${ytid}] Download success.`);
  } catch (e) {
    try {
      await exec(`rclone delete ${rcloneVideoBase}`);
    } catch (e1) {
      console.log('Rclone error', e1);
    }
    console.log('Job error', e);
    return done(e);
  }
  return done();
});
