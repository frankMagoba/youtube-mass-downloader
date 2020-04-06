module.exports = {
  redis: {
    port: 6379,
    host: '172.17.0.1',
    family: 4,
    db: 0
  },
  queue_name: 'download_queue',
  rclone_base: 'WTAKO:/YTDownloads',
  queue_concurrent: 8
};
