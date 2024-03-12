import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = () => (
  <div>
    <ReactPlayer
      url="http://gardenpi.local:8000/stream.m3u8"
      controls={true}
      playing={true}
      width="100%"
      height="100%"
    />
  </div>
);

export default VideoPlayer;
