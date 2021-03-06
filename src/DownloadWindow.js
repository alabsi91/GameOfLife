import { createGIF } from 'gifshot';
import { saveAs } from 'file-saver';
import React, { Component } from 'react';
import FFmpeg from '@ffmpeg/ffmpeg';
import { requestNum } from 'request-animation-number';

let windowLeft, windowTop;

export default class DownloadWindow extends Component {
  componentDidMount() {
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', this.grabDownload);
    });
  }

  toggleDownloadWindow = () => {
    const winEl = document.getElementById('downloadWindow');
    const blured = document.getElementById('blured');
    const isOpen = window.getComputedStyle(winEl).display === 'none' ? false : true;
    if (isOpen) {
      requestNum({ from: 1, to: 0, easingFunction: 'easeInCirc', duration: 100 }, s => {
        winEl.style.transform = `scale(${s})`;
        blured.style.opacity = s;
        if (s === 0) {
          winEl.style.display = 'none';
          blured.style.display = 'none';
        }
      });
    } else {
      winEl.style.display = 'initial';
      blured.style.display = 'block';
      requestNum({ from: 0, to: 1, easingFunction: 'easeOutQuart', duration: 100 }, s => {
        winEl.style.transform = `scale(${s})`;
        blured.style.opacity = s;
      });
    }
  };

  grabDownload = (l, el) => {
    l.preventDefault();
    const grabEl = document.getElementById('downloadWindow');
    grabEl.style.top = `${l.pageY < 10 ? 10 : l.pageY + windowTop}px`;
    grabEl.style.left = `${l.pageX + windowLeft}px`;
  };

  captureImgs = async (frmaes, interval, delay, backwards) => {
    const buttons = document.querySelectorAll('#downloadCancleContainer button');
    const downloadAnimation = document.getElementById('downloadAnimation');
    const isMP4 = document.getElementById('downloadVideo').checked ? true : false;
    const imgs = [];
    for (let i = 1; i <= frmaes; i++) {
      await this.props.toCanvas().then(canvas => imgs.push(canvas.toDataURL('image/png')));
      this.props.renderLifeDeath();
    }
    if (delay) for (let i = 0; i < delay; i++) imgs.unshift(imgs[0]);

    if (backwards) {
      const revArray = [];
      for (let i = imgs.length - 1; i >= 0; i--) revArray.push(imgs[i]);
      imgs.push(...revArray);
    }

    downloadAnimation.style.display = 'block';

    createGIF(
      {
        images: imgs,
        gifWidth: this.props.gridWidth * (this.props.pixelSpace * 2 + this.props.pixelSize),
        gifHeight: this.props.gridHeight * (this.props.pixelSpace * 2 + this.props.pixelSize),
        interval: interval / 1000,
      },
      async obj => {
        if (!obj.error) {
          isMP4 ? await this.downloadVideo(obj.image) : saveAs(obj.image, 'Game-of-life');
          buttons.forEach(e => (e.disabled = false));
          downloadAnimation.style.display = 'none';
          this.toggleDownloadWindow();
        } else console.error(obj.error);
      }
    );
  };

  downloadImg = transparent => {
    this.props.pauseRender();
    this.props.toCanvas(transparent).then(canvas => {
      canvas.toBlob(e => {
        saveAs(e, 'Game of life ' + Date.now());
      }, 'image/png');
    });
  };

  downloadVideo = async gif => {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg();
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'Game-of-life.gif', await fetchFile(gif));
    await ffmpeg.run(
      '-f',
      'gif',
      '-i',
      'Game-of-life.gif',
      '-pix_fmt',
      'yuv420p',
      '-c:v',
      'libx264',
      '-movflags',
      '+faststart',
      '-filter:v',
      "crop='floor(in_w/2)*2:floor(in_h/2)*2'",
      'Game-of-life.mp4'
    );
    const data = ffmpeg.FS('readFile', 'Game-of-life.mp4');
    const res = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    saveAs(res, 'Game-of-life');
  };

  downloadButtonHandle = () => {
    const buttons = document.querySelectorAll('#downloadCancleContainer button');
    const isPNG = document.getElementById('downloadPNG').checked ? true : false;
    const isBounce = document.getElementById('gifBounce').checked ? true : false;
    const frames = Number(document.getElementById('gifFrames').value);
    const inval = Number(document.getElementById('gifInterval').value);
    const delay = Number(document.getElementById('gifDelay').value);
    const transparent = document.getElementById('transparentPNG').checked ? true : false;
    if (isPNG) {
      this.downloadImg(transparent);
      this.toggleDownloadWindow();
    } else {
      buttons.forEach(e => (e.disabled = true));
      this.captureImgs(frames, inval, delay, isBounce);
    }
  };

  render() {
    return (
      <div id='downloadWindow'>
        <div
          id='downloadWindowHeader'
          onMouseDown={e => {
            windowLeft = e.target.getBoundingClientRect().left - e.clientX;
            windowTop = e.target.getBoundingClientRect().top - e.clientY;
            window.addEventListener('mousemove', this.grabDownload);
          }}
        >
          <p>Download your drawing as .png/.gif/.mp4</p>
          <button id='closeDownloadWindow' onClick={this.toggleDownloadWindow} onMouseDown={e => e.stopPropagation()}>
            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
              <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
            </svg>
          </button>
        </div>
        <div id='downloadAnimation'>
          <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
            <path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />
          </svg>
        </div>
        <input
          type='radio'
          id='downloadPNG'
          name='download'
          value='png'
          defaultChecked
          onChange={e => {
            const el = document.querySelectorAll('#gifDownlaodSettings input');
            document.getElementById('transparentPNG').disabled = false;
            e.target.checked
              ? el.forEach(element => (element.disabled = true))
              : el.forEach(element => (element.disabled = false));
          }}
        ></input>
        <label htmlFor='downloadPNG'>Download as png file.</label>
        <input id='transparentPNG' type='checkbox' name='transparentPNG'></input>
        <label htmlFor='transparentPNG'>Transparent PNG</label>
        <br></br>
        <input
          type='radio'
          id='downloadGIF'
          name='download'
          value='gif'
          onChange={e => {
            const el = document.querySelectorAll('#gifDownlaodSettings input');
            e.target.checked
              ? el.forEach(element => (element.disabled = false))
              : el.forEach(element => (element.disabled = true));
            document.getElementById('transparentPNG').disabled = true;
          }}
        ></input>
        <label htmlFor='downloadGIF'>Download as animated gif file.</label>
        <br></br>
        <input
          type='radio'
          id='downloadVideo'
          name='download'
          value='video'
          onChange={e => {
            const el = document.querySelectorAll('#gifDownlaodSettings input');
            e.target.checked
              ? el.forEach(element => (element.disabled = false))
              : el.forEach(element => (element.disabled = true));
            document.getElementById('transparentPNG').disabled = true;
          }}
        ></input>
        <label htmlFor='downloadGIF'>Download as mp4 video file.</label>
        <div id='gifDownlaodSettings'>
          <div>
            <label htmlFor='frames'>Frames : </label>
            <input id='gifFrames' type='number' name='frames' defaultValue='10' disabled></input>
          </div>
          <div>
            <label htmlFor='interval'>Interval (ms) : </label>
            <input id='gifInterval' type='number' name='interval' defaultValue='100' disabled></input>
          </div>
          <div>
            <label htmlFor='gifDelay'>Delay (frames) : </label>
            <input id='gifDelay' type='number' name='gifDelay' defaultValue='4' disabled></input>
          </div>
          <div>
            <input id='gifBounce' type='checkbox' name='gifBounce' disabled></input>
            <label htmlFor='gifBounce'>Forward and Backward</label>
          </div>
        </div>
        <div id='downloadCancleContainer'>
          <button onClick={this.downloadButtonHandle}>Download</button>
          <button onClick={this.toggleDownloadWindow}>Cancle</button>
        </div>
      </div>
    );
  }
}
