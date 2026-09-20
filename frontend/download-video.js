const https = require('https');
const fs = require('fs');
const path = require('path');

const file = fs.createWriteStream(path.join(__dirname, 'public', 'hero-video.mp4'));
const options = {
  hostname: 'cdn.pixabay.com',
  path: '/video/2020/06/18/42435-432243444_tiny.mp4',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://pixabay.com/'
  }
};

https.get(options, function(response) {
  if (response.statusCode !== 200) {
    console.error(`Failed: ${response.statusCode}`);
    return;
  }
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log("Download complete!");
  });
}).on('error', function(err) {
  fs.unlink(path.join(__dirname, 'public', 'hero-video.mp4'), () => {});
  console.error("Error downloading: ", err.message);
});
