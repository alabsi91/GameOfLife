import { createGIF } from 'gifshot';
import { saveAs } from 'file-saver';
import React, { Component } from 'react';
import FFmpeg from '@ffmpeg/ffmpeg';
import { requestNum } from 'request-animation-number';
import JSZip from 'jszip';

let windowLeft, windowTop, stopLoop;

export default class DownloadWindow extends Component {
  state = { runnig: false };

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
      stopLoop = false;
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

  grabDownload = l => {
    l.preventDefault();
    const grabEl = document.getElementById('downloadWindow');
    grabEl.style.top = `${l.pageY < 10 ? 10 : l.pageY + windowTop}px`;
    grabEl.style.left = `${l.pageX + windowLeft}px`;
  };

  delay = ms => new Promise(res => setTimeout(res, ms));

  captureImgs = async (frmaes, interval, delay, backwards, zip, transparent) => {
    console.clear();
    const start = Date.now();
    const canvas = document.getElementById('canvas');
    const can = document.getElementById('can');

    const gifAnimation = document.getElementById('gifAnimation');
    const imageAnimation = document.getElementById('imageAnimation');
    const videoAnimation = document.getElementById('videoAnimation');
    const recordAnimation = document.getElementById('recordAnimation');

    const isMP4 = document.getElementById('downloadVideo').checked ? true : false;
    const renderStatus = document.getElementById('renderStatus');
    const progresContainerProcessing = document.getElementById('progresContainerProcessing');
    const progress = document.getElementById('progresContainer');
    const progressText = document.querySelector('#progresContainer p');
    const imgs = [];

    recordAnimation.style.display = 'block';
    renderStatus.style.display = 'block';
    progress.style.display = 'flex';

    for (let i = 1; i <= frmaes && !stopLoop; i++) {
      renderStatus.innerHTML = 'Recording frame: ' + i;

      if (zip && transparent) {
        await this.props.getTransparentCanvas();
        can.toBlob(b => imgs.push(b), 'image/png');
      } else if (zip) {
        canvas.toBlob(b => imgs.push(b), 'image/png');
      } else imgs.push(canvas.toDataURL('image/png'));

      this.props.renderLifeDeath(true);
      await this.delay(1);

      progress.style.background = `linear-gradient(90deg, rgba(45,45,45,1) ${~~((i / frmaes) * 100)}%, 
        rgba(83,83,83,1) ${~~((i / frmaes) * 100)}%)`;
      progressText.innerHTML = ~~((i / frmaes) * 100);
    }

    console.log((Date.now() - start) / 1000 + ' sec to record frames');

    if (delay) for (let i = 0; i < delay; i++) imgs.unshift(imgs[0]);

    if (backwards) {
      const revArray = [];
      for (let i = imgs.length - 1; i >= 0; i--) revArray.push(imgs[i]);
      imgs.push(...revArray);
    }

    progress.style.removeProperty('background');
    recordAnimation.style.display = 'none';
    progress.style.removeProperty('background');
    renderStatus.innerHTML = 'Processing Zip ...';

    if (zip) {
      const zip = new JSZip();
      for (let i = 0; i < imgs.length; i++) {
        const NumLength = i.toString().length;
        zip.file('0000'.slice(NumLength) + i + '.png', imgs[i]);
        await this.delay(1);
      }

      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'Game-of-life.zip');
        console.log((Date.now() - start) / 1000 + ' sec over all');
        progresContainerProcessing.style.display = 'none';
        progress.style.display = 'none';
        progress.style.removeProperty('background');
        renderStatus.innerHTML = '...';
        progressText.innerHTML = 0;
        renderStatus.style.display = 'none';
        this.setState({ runnig: false });
        this.toggleDownloadWindow();
      });
    } else if (isMP4) {
      imageAnimation.style.display = 'block';
      progressText.innerHTML = 0;
      progress.style.display = 'none';
      progresContainerProcessing.style.display = 'block';
      renderStatus.innerHTML = `Processing Images ... (${imgs.length}) pngs`;
      const videoStart = Date.now();
      await this.downloadVideo(imgs, interval.toString());
      console.log((Date.now() - videoStart) / 1000 + ' sec to convert to mp4');
      console.log((Date.now() - start) / 1000 + ' sec over all');

      videoAnimation.style.display = 'none';
      imageAnimation.style.display = 'none';
      renderStatus.style.display = 'none';
      progresContainerProcessing.style.display = 'none';
      progress.style.display = 'none';
      progress.style.removeProperty('background');
      renderStatus.innerHTML = '...';
      progressText.innerHTML = 0;
      this.setState({ runnig: false });
      this.toggleDownloadWindow();
    } else {
      gifAnimation.style.display = 'block';
      renderStatus.innerHTML = 'Converting to gif ...';
      const gifStart = Date.now();
      createGIF(
        {
          images: imgs,
          gifWidth: this.props.gridWidth * (this.props.pixelSpace * 2 + this.props.pixelSize),
          gifHeight: this.props.gridHeight * (this.props.pixelSpace * 2 + this.props.pixelSize),
          interval: interval / 1000,
          progressCallback: p => {
            progress.style.background = `linear-gradient(90deg, rgba(45,45,45,1) ${p * 100}%, rgba(83,83,83,1) ${p * 100}%)`;
            progressText.innerHTML = ~~(p * 100);
          },
        },
        async obj => {
          if (!obj.error) {
            saveAs(obj.image, 'Game-of-life');

            gifAnimation.style.display = 'none';
            renderStatus.style.display = 'none';
            progresContainerProcessing.style.display = 'none';
            progress.style.display = 'none';
            progress.style.removeProperty('background');
            renderStatus.innerHTML = '...';
            progressText.innerHTML = 0;
            this.setState({ runnig: false });
            this.toggleDownloadWindow();

            console.log((Date.now() - gifStart) / 1000 + ' sec to convert to gif');
            console.log((Date.now() - start) / 1000 + ' sec over all');
          } else console.error(obj.error);
        }
      );
    }
  };

  downloadImg = async transparent => {
    this.props.pauseRender();
    const canvas = document.getElementById('canvas');
    const can = document.getElementById('can');
    if (transparent) {
      await this.props.getTransparentCanvas();
      can.toBlob(e => {
        saveAs(e, 'Game of life ' + Date.now());
      }, 'image/png');
    } else {
      canvas.toBlob(e => {
        saveAs(e, 'Game of life ' + Date.now());
      }, 'image/png');
    }
  };

  downloadVideo = async (imgs, fps) => {
    const { createFFmpeg, fetchFile } = FFmpeg;

    const progress = document.getElementById('progresContainer');
    const progressText = document.querySelector('#progresContainer p');
    const renderStatus = document.getElementById('renderStatus');
    const videoAnimation = document.getElementById('videoAnimation');
    const imageAnimation = document.getElementById('imageAnimation');
    const progresContainerProcessing = document.getElementById('progresContainerProcessing');

    const ffmpeg = createFFmpeg({
      progress: p => {
        videoAnimation.style.display = 'block';
        imageAnimation.style.display = 'none';
        progress.style.display = 'flex';
        progresContainerProcessing.style.display = 'none';
        renderStatus.innerHTML = 'Converting to mp4 ...';
        progress.style.background = `linear-gradient(90deg, rgba(45,45,45,1) ${p.ratio * 100}%, rgba(83,83,83,1) ${
          p.ratio * 100
        }%)`;
        progressText.innerHTML = ~~(p.ratio * 100);
      },
    });

    await ffmpeg.load();

    for (let i = 0; i < imgs.length; i++) {
      const NumLength = i.toString().length;
      const name = '0000'.slice(NumLength) + i + '.png';
      ffmpeg.FS('writeFile', name, await fetchFile(imgs[i]));
      await this.delay(100);
    }

    await ffmpeg.run(
      '-framerate',
      fps,
      '-pattern_type',
      'glob',
      '-i',
      '*.png',
      '-shortest',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      'life.mp4'
    );

    for (let i = 0; i < imgs.length; i++) {
      const NumLength = i.toString().length;
      const name = '0000'.slice(NumLength) + i + '.png';
      ffmpeg.FS('unlink', name);
    }

    const data = ffmpeg.FS('readFile', 'life.mp4');
    const res = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

    saveAs(res, 'life.mp4');
  };

  downloadButtonHandle = async () => {
    const isPNG = document.getElementById('downloadPNG').checked ? true : false;
    const isZip = document.getElementById('downloadZip').checked ? true : false;
    const isBounce = document.getElementById('gifBounce').checked ? true : false;
    const frames = Number(document.getElementById('gifFrames').value);
    const inval = Number(document.getElementById('gifInterval').value);
    const delay = Number(document.getElementById('gifDelay').value);
    const transparent = document.getElementById('transparentPNG').checked ? true : false;
    const transparentZip = document.getElementById('transparentZip').checked ? true : false;
    this.props.resetRenderData();
    if (isPNG) {
      await this.downloadImg(transparent);
      this.toggleDownloadWindow();
    } else if (this.props.checkColor()) {
      if (isZip && frames > 0 && delay >= 0) {
        this.setState({ runnig: true }, () => this.captureImgs(frames, inval, delay, isBounce, true, transparentZip));
      } else if (frames > 0 && inval > 0 && delay >= 0) {
        this.setState({ runnig: true }, () => this.captureImgs(frames, inval, delay, isBounce));
      } else this.props.popUp('Please enter a valid values');
    } else this.toggleDownloadWindow();
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
          <p>Download your drawing as .png/.gif/.mp4/.zip</p>
          <button
            disabled={this.state.runnig}
            id='closeDownloadWindow'
            onClick={this.toggleDownloadWindow}
            onMouseDown={e => e.stopPropagation()}
          >
            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
              <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
            </svg>
          </button>
        </div>

        <div id='recordAnimation'></div>
        <div className='downloadAnimation' id='gifAnimation'>
          <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
            <rect height='6' width='1.5' x='11.5' y='9' />
            <path d='M9,9H6c-0.6,0-1,0.5-1,1v4c0,0.5,0.4,1,1,1h3c0.6,0,1-0.5,1-1v-2H8.5v1.5h-2v-3H10V10C10,9.5,9.6,9,9,9z' />
            <polygon points='19,10.5 19,9 14.5,9 14.5,15 16,15 16,13 18,13 18,11.5 16,11.5 16,10.5' />
          </svg>
        </div>
        <div className='downloadAnimation' id='imageAnimation'>
          <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
            <path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' />
          </svg>
        </div>
        <div className='downloadAnimation' id='videoAnimation'>
          <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
            <path d='M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z' />
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
            e.target.checked
              ? el.forEach(element => (element.disabled = true))
              : el.forEach(element => (element.disabled = false));
            document.getElementById('transparentPNG').disabled = false;
            document.getElementById('transparentZip').disabled = true;
          }}
        ></input>
        <label htmlFor='downloadPNG'>Download as png file.</label>
        <input id='transparentPNG' type='checkbox' name='transparentPNG'></input>
        <label htmlFor='transparentPNG'>Transparent png.</label>
        <br></br>
        <input
          type='radio'
          id='downloadGIF'
          name='download'
          value='gif'
          onChange={e => {
            const el = document.querySelectorAll('#gifDownlaodSettings input');
            document.getElementById('fpsInterval').innerHTML = 'Interval (ms) : ';
            document.getElementById('gifInterval').value = 100;
            e.target.checked
              ? el.forEach(element => (element.disabled = false))
              : el.forEach(element => (element.disabled = true));
            document.getElementById('transparentPNG').disabled = true;
            document.getElementById('transparentZip').disabled = true;
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
            document.getElementById('fpsInterval').innerHTML = 'FrameRate fps : ';
            document.getElementById('gifInterval').value = 30;
            e.target.checked
              ? el.forEach(element => (element.disabled = false))
              : el.forEach(element => (element.disabled = true));
            document.getElementById('transparentPNG').disabled = true;
            document.getElementById('transparentZip').disabled = true;
          }}
        ></input>
        <label htmlFor='downloadVideo'>Download as mp4 video file.</label>
        <br></br>
        <input
          type='radio'
          id='downloadZip'
          name='download'
          value='zip'
          onChange={e => {
            const el = document.querySelectorAll('#gifDownlaodSettings input');
            e.target.checked
              ? el.forEach(element => (element.disabled = false))
              : el.forEach(element => (element.disabled = true));
            document.getElementById('gifInterval').disabled = true;
            document.getElementById('transparentPNG').disabled = true;
            document.getElementById('transparentZip').disabled = false;
          }}
        ></input>
        <label htmlFor='downloadGIF'>Download as zip file of pngs.</label>
        <input id='transparentZip' type='checkbox' name='transparentZip' disabled></input>
        <label htmlFor='transparentZip'>Transparent png.</label>
        <div id='gifDownlaodSettings'>
          <div>
            <input id='gifFrames' type='number' name='frames' defaultValue='10' disabled></input>
            <label htmlFor='frames'>Frames : </label>
          </div>
          <div>
            <input id='gifInterval' type='number' name='interval' defaultValue='100' disabled></input>
            <label id='fpsInterval' htmlFor='interval'>
              Interval (ms) :{' '}
            </label>
          </div>
          <div>
            <input id='gifDelay' type='number' name='gifDelay' defaultValue='4' disabled></input>
            <label htmlFor='gifDelay'>Delay (frames) : </label>
          </div>
          <div>
            <input id='gifBounce' type='checkbox' name='gifBounce' disabled></input>
            <label htmlFor='gifBounce'>Forward and Backward</label>
          </div>
        </div>
        <p id='renderStatus'></p>
        <div id='progresContainerProcessing'></div>
        <div id='progresContainer'>
          <p>0</p>
          <span>%</span>
        </div>
        <div id='downloadCancleContainer'>
          <button disabled={this.state.runnig} id='downloadButton' onClick={this.downloadButtonHandle}>
            Download
          </button>
          <button
            id='cancleButton'
            onClick={() => {
              if (this.state.runnig) {
                stopLoop = true;
              } else this.toggleDownloadWindow();
            }}
          >
            {this.state.runnig ? 'Stop' : 'Cancle'}
          </button>
        </div>
      </div>
    );
  }
}

// downloadVideo = async gif => {
//   const { createFFmpeg, fetchFile } = FFmpeg;
//   const ffmpeg = createFFmpeg();
//   await ffmpeg.load();
//   ffmpeg.FS('writeFile', 'Game-of-life.gif', await fetchFile(gif));
//   await ffmpeg.run(
//     '-f',
//     'gif',
//     '-i',
//     'Game-of-life.gif',
//     '-pix_fmt',
//     'yuv420p',
//     '-c:v',
//     'libx264',
//     '-movflags',
//     '+faststart',
//     '-filter:v',
//     "crop='floor(in_w/2)*2:floor(in_h/2)*2'",
//     'Game-of-life.mp4'
//   );
//   const data = ffmpeg.FS('readFile', 'Game-of-life.mp4');
//   const res = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
//   saveAs(res, 'Game-of-life');
// };
