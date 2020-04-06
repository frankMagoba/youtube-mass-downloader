# YouTube Mass Downloader
Download list of YouTube videos (by IDs) into rclone remote.

# Requirements
- `docker` and `docker-compose`
- `rclone` (for generating rclone.conf)

# Usage
1. Put a list of YouTube video IDs (YTIDs) into `master/app/youtube-ids.txt`
2. Setup rclone remote (https://rclone.org/remote_setup/), copy the rclone.conf to `worker/app/rclone.conf`
3. Edit `worker/app/config.js`: `rclone_base` to appropriate value. Also adjust `queue_concurrent` to appropriate value according to available RAM and network condition.
4. `$ cd master` then `$ docker-compose up`, you will see a list of YTIDs are queued. The queue status is printed every 10 seconds.
5. Open another terminal, `$ cd worker` then `$ docker-compose up`, you will messages like:
```
node_1  | [x2XWG7Pdt2w] Download success.
node_1  | [X36Sl_ji2x4] Starting...
node_1  | [X36Sl_ji2x4] Downloading thumbnail to WTAKO:/YTDownloads/X3/6Sl_ji2x4/thumbnail.jpg...
node_1  | [X36Sl_ji2x4] Downloading meta to WTAKO:/YTDownloads/X3/6Sl_ji2x4/info.json...
node_1  | [X36Sl_ji2x4] Downloading video to WTAKO:/YTDownloads/X3/6Sl_ji2x4/video.mkv...
node_1  | [x35EZfOyXb8] Thumbnail downloaded.
node_1  | [x36f6L8NBzw] Meta downloaded.
node_1  | [x2zW4i_qOUc] Thumbnail downloaded.
node_1  | [x2zW4i_qOUc] Video downloaded.
```
which means the YouTube videos are being saved in /YTDownloads of your rclone remote (like Google Drive).

# Multiple worker across computers or networks
- Adjust `worker/app/config.js` redis config, make it possible to connect to the redis server.
- You may also want to add authentication, see and edit `master/docker-configs/redis.conf`, `worker/app/config.js`, `master/app/config.js`
- The worker computers should only `$ cd worker` then `$ docker-compose up`, just ignore the master.
- Basically you are on your own.

# Reliability
This program relies on a reliable message/job queue implementation [bull](https://github.com/OptimalBits/bull/). Honestly, I don't see any reasons why video would not download except bad config, bad network and google's server problem or rate limit. 
