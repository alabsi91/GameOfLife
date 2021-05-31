import html2canvas from 'html2canvas';
import React, { Component } from 'react';
import { pattrens } from './pattrens';

let interval;
let lastPaint;
let lastPaintGrid;
let undo = [];
let redo = [];

let windowTop;
let windowLeft;
let lineTop;
let lineLeft;
let forResize;

export default class GameOfLife extends Component {
  state = {
    isPlaying: false,
    isPaused: false,
    drwaMode: false,
    isRandomColor: false,
    symmetricalX: false,
    symmetricalY: false,
    eraser: false,
    speed: localStorage.getItem('speed') ? Number(localStorage.getItem('speed')) : 100,
    pixelSize: localStorage.getItem('pixelSize') ? Number(localStorage.getItem('pixelSize')) : 15,
    gridWidth: localStorage.getItem('gridWidth') ? Number(localStorage.getItem('gridWidth')) : 90,
    gridHeight: localStorage.getItem('gridHeight') ? Number(localStorage.getItem('gridHeight')) : 50,
    pixelSpace: localStorage.getItem('pixelSpace') ? Number(localStorage.getItem('pixelSpace')) : 0.5,
    pixleColor: localStorage.getItem('pixleColor') ? localStorage.getItem('pixleColor') : '#ffffff',
    betweenPixleColor: localStorage.getItem('betweenPixleColor') ? localStorage.getItem('betweenPixleColor') : '#282828',
    SymmetryLinesColor: localStorage.getItem('SymmetryLinesColor') ? localStorage.getItem('SymmetryLinesColor') : '#868686',
    backgroundPixleColor: localStorage.getItem('backgroundPixleColor') ? localStorage.getItem('backgroundPixleColor') : '#000000',
  };

  componentDidMount() {
    this.appendDivs(this.state.gridWidth, this.state.gridHeight);
    if (localStorage.getItem('lastPaint')) {
      const getLastPaint = JSON.parse(localStorage.getItem('lastPaint'));
      const getLastPaintGrid = JSON.parse(localStorage.getItem('lastPaintGrid'));
      if (getLastPaintGrid[0] > this.state.gridWidth || getLastPaintGrid[1] > this.state.gridHeight) {
        alert(`can't retrive last paint, current grid size is smaller than ${getLastPaintGrid[0]}x${getLastPaintGrid[1]}`);
      } else this.applyPattren(getLastPaint, getLastPaintGrid[0]);
    }
    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', this.imgResize));
    this.keyboardShourtcuts();
  }

  keyboardShourtcuts = () => {
    window.addEventListener('keyup', e => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z' && undo.length > 0 && !this.state.drwaMode) {
        document.querySelectorAll('input[type="number"').forEach(e => e.blur());
        this.undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y' && redo.length > 0 && !this.state.drwaMode) {
        document.querySelectorAll('input[type="number"').forEach(e => e.blur());
        this.redo();
      } else if (e.key.toLowerCase() === 'e' && !this.state.drwaMode) {
        document.querySelectorAll('input[type="number"').forEach(e => e.blur());
        this.state.eraser ? this.setState({ eraser: false }) : this.setState({ eraser: true });
      }
    });
  };

  undo = () => {
    if (undo.length > 0) {
      undo[undo.length - 1][0] === 'Death'
        ? undo[undo.length - 1].forEach(e => (e !== 'Death' ? this.toDeath(e) : ''))
        : undo[undo.length - 1].forEach(e => (e !== 'Live' ? this.toLive(e) : ''));
      redo.push(undo[undo.length - 1]);
      undo.splice(undo.length - 1);
    }
  };

  redo = () => {
    if (redo.length > 0) {
      redo[redo.length - 1][0] === 'Death'
        ? redo[redo.length - 1].forEach(e => {
            if (e !== 'Death') {
              this.state.isRandomColor
                ? (e.style.backgroundColor = `hsla(${Math.random() * 360}, 100%, 40%, 1)`)
                : (e.style.backgroundColor = this.state.pixleColor);
              e.dataset.live = 'true';
            }
          })
        : redo[redo.length - 1].forEach(e => {
            if (e !== 'Live') {
              e.style.backgroundColor = this.state.backgroundPixleColor;
              e.removeAttribute('data-live');
            }
          });
      undo.push(redo[redo.length - 1]);
      redo.splice(redo.length - 1);
    }
  };

  applyPattren = (patren, pWidth, x, y) => {
    const pixels = document.querySelectorAll('.lifeDeathPixels');
    pixels.forEach(e => {
      e.style.backgroundColor = this.state.backgroundPixleColor;
      e.removeAttribute('data-live');
    });
    const dif = this.state.gridWidth - pWidth;
    const moveX = x ? ~~(this.state.gridWidth / 2) - x : 0;
    const moveY = y ? ~~this.state.gridWidth * (~~(this.state.gridHeight / 2) - y) : 0;
    const centre = moveX + moveY;
    patren.forEach(e => {
      let div = Math.floor(e / pWidth) * dif;
      this.state.isRandomColor
        ? (pixels[e + div + centre].style.backgroundColor = `hsla(${Math.random() * 360}, 100%, 40%, 1)`)
        : (pixels[e + div + centre].style.backgroundColor = this.state.pixleColor);
      pixels[e + div + centre].dataset.live = 'true';
    });
  };

  symmetricalX = (i, eraser) => {
    if (this.state.symmetricalX) {
      const findRow = ~~(i / this.state.gridWidth) * this.state.gridWidth;
      const middleRow = findRow + Math.floor(this.state.gridWidth / 2);
      const findOp = Number.isInteger(this.state.gridWidth / 2) ? middleRow - (i - middleRow + 1) : middleRow - (i - middleRow);
      const pixel = document.querySelectorAll(`.lifeDeathPixels[data-pos="${findOp}"]`)[0];
      if (eraser) {
        this.toDeath(pixel);
      } else {
        this.toLive(pixel);
      }
    }
  };

  symmetricalY = (i, eraser) => {
    if (this.state.symmetricalY) {
      const findRow = ~~(i / this.state.gridWidth);
      const findMiddle = Math.floor(this.state.gridHeight / 2);
      const findDef = findMiddle - findRow;
      const findOp = Number.isInteger(this.state.gridHeight / 2)
        ? i + findDef * this.state.gridWidth * 2 - this.state.gridWidth
        : i + findDef * this.state.gridWidth * 2;
      const pixel = document.querySelectorAll(`.lifeDeathPixels[data-pos="${findOp}"]`)[0];
      if (eraser) {
        this.toDeath(pixel);
      } else {
        this.toLive(pixel);
      }
      return findOp;
    }
  };

  appendDivs = (grid, height) => {
    const container = document.getElementById('lifeDeathContainer');
    for (let i = 0; i < grid * height; i++) {
      const element = document.createElement('div');
      element.className = 'lifeDeathPixels';
      element.dataset.pos = i;
      element.style.margin = this.state.pixelSpace + 'px';
      element.style.backgroundColor = this.state.backgroundPixleColor;
      element.style.width = this.state.pixelSize + 'px';
      element.style.height = this.state.pixelSize + 'px';

      element.addEventListener('mouseenter', e => {
        if (this.state.drwaMode && !this.state.eraser) {
          this.symmetricalX(i);
          this.symmetricalY(i);
          if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(i));
          this.toLive(e.target);
        } else if (this.state.drwaMode && this.state.eraser) {
          this.symmetricalX(i, true);
          this.symmetricalY(i, true);
          if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(i, true), true);
          this.toDeath(e.target);
        }
      });
      // eslint-disable-next-line no-loop-func
      element.addEventListener('mousedown', e => {
        this.setState({ isPaused: false });
        undo.push([]);
        redo = [];
        if (!this.state.isPlaying && !this.state.eraser) {
          undo[undo.length - 1].push('Death');
          this.symmetricalX(i);
          this.symmetricalY(i);
          if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(i));
          this.toLive(e.target);
        } else if (!this.state.isPlaying && this.state.eraser) {
          undo[undo.length - 1].push('Live');
          this.symmetricalX(i, true);
          this.symmetricalY(i, true);
          if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(i, true), true);
          this.toDeath(e.target);
        }
      });
      container.appendChild(element);
    }
  };

  checkliveOrDead = i => {
    const pixels = document.getElementsByClassName('lifeDeathPixels');
    let livePixels = 0;
    const width = this.state.gridWidth;
    const isLive = pixels[i].dataset.live === 'true';
    const firstPixle = Number.isInteger(i / width);
    const lastPixle = Number.isInteger((i + 1) / width);
    const checkNeighbours = n => {
      if (pixels[n]?.dataset.live === 'true') livePixels++;
    };

    if (!lastPixle) checkNeighbours(i + 1);
    if (!firstPixle) checkNeighbours(i - 1);
    checkNeighbours(i + width);
    if (!lastPixle) checkNeighbours(i + width + 1);
    if (!firstPixle) checkNeighbours(i + width - 1);
    checkNeighbours(i - width);
    if (!lastPixle) checkNeighbours(i - width + 1);
    if (!firstPixle) checkNeighbours(i - width - 1);

    // Any live cell with fewer than two live neighbours dies, as if by underpopulation
    if (isLive && livePixels < 2) {
      return false;
      // Any live cell with two or three live neighbours lives on to the next generation.
    } else if (isLive && (livePixels === 2 || livePixels === 3)) {
      return true;
      // Any live cell with more than three live neighbours dies, as if by overpopulation.
    } else if (isLive && livePixels > 3) {
      return false;
      // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    } else if (!isLive && livePixels === 3) {
      return true;
    }
  };

  toLive = e => {
    if (e.dataset.live !== 'true') {
      undo[undo.length - 1].push(e);
      this.state.isRandomColor
        ? (e.style.backgroundColor = `hsla(${Math.random() * 360}, 100%, 40%, 1)`)
        : (e.style.backgroundColor = this.state.pixleColor);
      e.dataset.live = 'true';
    }
  };

  toDeath = e => {
    if (e.dataset.live === 'true') {
      undo[undo.length - 1].push(e);
      e.style.backgroundColor = this.state.backgroundPixleColor;
      e.removeAttribute('data-live');
    }
  };

  play = () => {
    if (!this.state.isPlaying) {
      this.setState({ isPlaying: true });
      const pixels = document.querySelectorAll('.lifeDeathPixels[data-live="true"]');
      if (!this.state.isPaused) {
        const getDraw = [];
        pixels.forEach(e => getDraw.push(Number(e.dataset.pos)));
        lastPaint = getDraw;
        lastPaintGrid = [this.state.gridWidth, this.state.gridHeight];
        localStorage.setItem('lastPaint', JSON.stringify(getDraw));
        localStorage.setItem('lastPaintGrid', JSON.stringify(lastPaintGrid));
      }
      interval = setInterval(() => {
        this.renderLifeDeath();
      }, this.state.speed);
    } else this.pauseRender();
  };

  renderLifeDeath = () => {
    const pixels = document.getElementsByClassName('lifeDeathPixels');
    const toLive = [];
    const toDeath = [];
    for (let i = 0; i < pixels.length; i++) {
      this.checkliveOrDead(i) ? toLive.push(i) : toDeath.push(i);
      if (i === pixels.length - 1) {
        toLive.forEach(e => {
          this.state.isRandomColor
            ? (pixels[e].style.backgroundColor = `hsla(${Math.random() * 360}, 100%, 40%, 1)`)
            : (pixels[e].style.backgroundColor = this.state.pixleColor);
          pixels[e].dataset.live = 'true';
        });
        toDeath.forEach(e => {
          pixels[e].style.backgroundColor = this.state.backgroundPixleColor;
          pixels[e].removeAttribute('data-live');
        });
      }
    }
  };

  resetRender = () => {
    clearInterval(interval);
    undo.push([]);
    const pixels = document.querySelectorAll('.lifeDeathPixels[data-live=true]');
    pixels.forEach(e => this.toDeath(e));
    this.setState({ isPlaying: false, isPaused: false });
  };

  pauseRender = () => {
    if (this.state.isPlaying) {
      clearInterval(interval);
      this.setState({ isPlaying: false, isPaused: true });
    }
  };

  renderLast = () => {
    clearInterval(interval);
    this.setState({ isPlaying: false, isPaused: false });
    if (lastPaint) {
      if (lastPaintGrid[0] > this.state.gridWidth || lastPaintGrid[1] > this.state.gridHeight) {
        alert(`can't retrive last paint, current grid size is smaller than ${lastPaintGrid[0]}x${lastPaintGrid[1]}`);
      } else if (lastPaintGrid[0] !== this.state.gridWidth || lastPaintGrid[1] !== this.state.gridHeight) {
        alert(`this paint was painted orginaly on ${lastPaintGrid[0]}x${lastPaintGrid[1]} grid`);
        this.applyPattren(lastPaint, lastPaintGrid[0]);
      } else this.applyPattren(lastPaint, lastPaintGrid[0]);
    } else if (localStorage.getItem('lastPaint')) {
      const getLastPaint = JSON.parse(localStorage.getItem('lastPaint'));
      const getLastPaintGrid = JSON.parse(localStorage.getItem('lastPaintGrid'));
      if (getLastPaintGrid[0] > this.state.gridWidth || getLastPaintGrid[1] > this.state.gridHeight) {
        alert(`can't retrive last paint, current grid size is smaller than ${getLastPaintGrid[0]}x${getLastPaintGrid[1]}`);
      } else this.applyPattren(getLastPaint, getLastPaintGrid[0]);
    } else alert('Last Paint Not found');
  };

  trackMouse = l => {
    document.getElementById('MouseHorizenLine').style.top = `${l.clientY - lineTop}px`;
    document.getElementById('MouseVerticalLine').style.left = `${l.clientX - lineLeft}px`;
  };

  grabPanel = l => {
    const grabEl = document.getElementById('controlPanel');
    grabEl.style.transform = `translate(${windowLeft}px,${windowTop}px)`;
    grabEl.style.top = `${l.clientY}px`;
    grabEl.style.left = `${l.clientX}px`;
  };

  grabGrid = l => {
    l.preventDefault();
    const grabEl = document.getElementById('windowContainer');
    grabEl.style.transform = `translate(${windowLeft}px,${windowTop}px)`;
    grabEl.style.top = `${l.clientY}px`;
    grabEl.style.left = `${l.clientX}px`;
  };

  grabLayer = l => {
    l.preventDefault();
    const grabEl = document.getElementById('imageLayer');
    grabEl.style.transform = `translate(${windowLeft}px,${windowTop}px)`;
    grabEl.style.top = `${l.clientY}px`;
    grabEl.style.left = `${l.clientX}px`;
  };

  copyToClipBoard = () => {
    this.pauseRender();
    html2canvas(document.querySelector('#lifeDeathContainer')).then(canvas => {
      canvas.toBlob(e => {
        navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
          if (result.state === 'granted' || result.state === 'prompt') {
            // eslint-disable-next-line no-undef
            navigator.clipboard.write([new ClipboardItem({ 'image/png': e })]);
          }
        });
      }, 'image/png');
    });
  };

  imgResize = e => {
    e.preventDefault();
    document.getElementById('img').style.width =
      parseInt(forResize[0], 10) + (e.clientX - forResize[2] + e.clientY - forResize[3]) / 2 + 'px';
    document.getElementById('img').style.height = 'auto';
  };

  render() {
    return (
      <>
        <div id='controlPanel'>
          <div
            id='grabPad'
            onMouseDown={e => {
              const el = document.getElementById('controlPanel');
              windowLeft = el.getBoundingClientRect().left - e.pageX;
              windowTop = el.getBoundingClientRect().top - e.pageY;
              window.addEventListener('mousemove', this.grabPanel);
            }}
            onMouseUp={() => window.removeEventListener('mousemove', this.grabPanel)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              enableBackground='new 0 0 24 24'
              height='24px'
              viewBox='0 0 24 24'
              width='24px'
              fill='#D7D7D7'
            >
              <path d='M20,9H4v2h16V9z M4,15h16v-2H4V15z' />
            </svg>
          </div>
          <div className='devider'></div>
          <div id='undoredoContainer'>
            <button onClick={this.undo} title='undo (Ctrl + z)'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                enableBackground='new 0 0 24 24'
                height='20px'
                viewBox='0 0 24 24'
                width='20px'
                fill='#D7D7D7'
              >
                <path d='M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z' />
              </svg>
            </button>
            <button onClick={this.redo} title='redo (Ctrl + y)'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                enableBackground='new 0 0 24 24'
                height='20px'
                viewBox='0 0 24 24'
                width='20px'
                fill='#D7D7D7'
              >
                <path d='M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z' />
              </svg>
            </button>
          </div>
          <button className='buttons' title='Copy drawing to Clipboard' onClick={this.copyToClipBoard}>
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' />
            </svg>
          </button>
          <input
            id='getImage'
            type='file'
            name='getImage'
            accept='.png,.jpg'
            onChange={() => {
              const selectedFile = document.getElementById('getImage').files[0];
              const reader = new FileReader();
              const imgTag = document.getElementById('img');
              imgTag.removeAttribute('style');
              reader.onload = e => {
                imgTag.src = e.target.result;
                setTimeout(() => {
                  if (imgTag.getBoundingClientRect().width + 100 >= window.innerWidth) {
                    imgTag.style.width = window.innerWidth - 100 + 'px';
                  } else if (imgTag.getBoundingClientRect().height + 100 >= window.innerHeight) {
                    imgTag.style.height = window.innerHeight - 100 + 'px';
                  }
                }, 100);

                document.getElementById('imageLayer').style.display = 'block';
              };
              reader.readAsDataURL(selectedFile);
            }}
          ></input>
          <label id='getImageLabel' htmlFor='getImage' title='Add Image Layer'>
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z' />
            </svg>
          </label>
          <div className='devider'></div>

          <button
            className='buttons'
            title={this.state.isPlaying ? 'Pause' : 'play'}
            onClick={this.play}
            style={{
              backgroundColor: this.state.isPlaying ? '#383838' : 'initial',
              border: this.state.isPlaying ? 'solid 1px #636363' : 'none',
            }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24px'
              viewBox='0 0 24 24'
              width='24px'
              fill='#D7D7D7'
              style={{ display: this.state.isPlaying ? 'none' : 'initial' }}
            >
              <path d='M8 5v14l11-7z' />
            </svg>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24px'
              viewBox='0 0 24 24'
              width='24px'
              fill='#D7D7D7'
              style={{ display: this.state.isPlaying ? 'initial' : 'none' }}
            >
              <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
            </svg>
          </button>
          <button className='buttons' onClick={this.renderLast} title='Last Drawing'>
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z' />
            </svg>
          </button>

          <button className='buttons' onClick={this.resetRender} title='Reset'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              enableBackground='new 0 0 24 24'
              height='24px'
              viewBox='0 0 24 24'
              width='24px'
              fill='#D7D7D7'
            >
              <path d='M12,5V2L8,6l4,4V7c3.31,0,6,2.69,6,6c0,2.97-2.17,5.43-5,5.91v2.02c3.95-0.49,7-3.85,7-7.93C20,8.58,16.42,5,12,5z' />
              <path d='M6,13c0-1.65,0.67-3.15,1.76-4.24L6.34,7.34C4.9,8.79,4,10.79,4,13c0,4.08,3.05,7.44,7,7.93v-2.02 C8.17,18.43,6,15.97,6,13z' />
            </svg>
          </button>

          <button
            className='buttons'
            style={{
              backgroundColor: this.state.eraser ? '#383838' : 'initial',
              border: this.state.eraser ? 'solid 1px #636363' : 'none',
            }}
            title='Eraser (e)'
            onClick={() => (this.state.eraser ? this.setState({ eraser: false }) : this.setState({ eraser: true }))}
          >
            <svg width='24' height='24' xmlns='http://www.w3.org/2000/svg' fillRule='evenodd' clipRule='evenodd' fill='#D7D7D7'>
              <path d='M5.662 23l-5.369-5.365c-.195-.195-.293-.45-.293-.707 0-.256.098-.512.293-.707l14.929-14.928c.195-.194.451-.293.707-.293.255 0 .512.099.707.293l7.071 7.073c.196.195.293.451.293.708 0 .256-.097.511-.293.707l-11.216 11.219h5.514v2h-12.343zm3.657-2l-5.486-5.486-1.419 1.414 4.076 4.072h2.829zm.456-11.429l-4.528 4.528 5.658 5.659 4.527-4.53-5.657-5.657z' />
            </svg>
          </button>

          <button
            className='buttons'
            style={{
              backgroundColor: this.state.symmetricalX ? '#383838' : 'initial',
              border: this.state.symmetricalX ? 'solid 1px #636363' : 'none',
            }}
            title='Vertical Lines of Symmetry'
            onClick={() => {
              this.state.symmetricalX ? this.setState({ symmetricalX: false }) : this.setState({ symmetricalX: true });
            }}
          >
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M3 9h2V7H3v2zm0-4h2V3H3v2zm4 16h2v-2H7v2zm0-8h2v-2H7v2zm-4 0h2v-2H3v2zm0 8h2v-2H3v2zm0-4h2v-2H3v2zM7 5h2V3H7v2zm12 12h2v-2h-2v2zm-8 4h2V3h-2v18zm8 0h2v-2h-2v2zm0-8h2v-2h-2v2zm0-10v2h2V3h-2zm0 6h2V7h-2v2zm-4-4h2V3h-2v2zm0 16h2v-2h-2v2zm0-8h2v-2h-2v2z' />
            </svg>
          </button>

          <button
            className='buttons'
            style={{
              backgroundColor: this.state.symmetricalY ? '#383838' : 'initial',
              border: this.state.symmetricalY ? 'solid 1px #636363' : 'none',
            }}
            title='Horizontal Lines of Symmetry'
            onClick={() => {
              this.state.symmetricalY ? this.setState({ symmetricalY: false }) : this.setState({ symmetricalY: true });
            }}
          >
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M3 21h2v-2H3v2zM5 7H3v2h2V7zM3 17h2v-2H3v2zm4 4h2v-2H7v2zM5 3H3v2h2V3zm4 0H7v2h2V3zm8 0h-2v2h2V3zm-4 4h-2v2h2V7zm0-4h-2v2h2V3zm6 14h2v-2h-2v2zm-8 4h2v-2h-2v2zm-8-8h18v-2H3v2zM19 3v2h2V3h-2zm0 6h2V7h-2v2zm-8 8h2v-2h-2v2zm4 4h2v-2h-2v2zm4 0h2v-2h-2v2z' />
            </svg>
          </button>

          <div className='devider'></div>

          <input
            id='rangeInput'
            type='range'
            title='Refresh every "ms"'
            value={this.state.speed}
            min='1'
            max='300'
            disabled={this.state.isPlaying}
            onChange={e => {
              e.preventDefault();
              this.setState({ speed: e.target.value });
              localStorage.setItem('speed', e.target.value);
            }}
          ></input>

          <p className='controlLabel'>Speed</p>
          <div className='devider'></div>

          <input
            className='inputNumber'
            type='number'
            title='How many squares per row'
            min='20'
            max='150'
            value={this.state.gridWidth}
            disabled={this.state.isPlaying}
            onChange={e => {
              this.setState({ gridWidth: Number(e.target.value) });
              const pixels = document.querySelectorAll('.lifeDeathPixels');
              pixels.forEach(el => el.remove());
              this.appendDivs(Number(e.target.value), this.state.gridHeight);
              localStorage.setItem('gridWidth', Number(e.target.value));
              undo = [];
            }}
          ></input>
          <p className='controlLabel'>Per Row</p>
          <input
            className='inputNumber'
            type='number'
            title='How many squares per column'
            min='20'
            max='150'
            value={this.state.gridHeight}
            disabled={this.state.isPlaying}
            onChange={e => {
              this.setState({ gridHeight: Number(e.target.value) });
              const pixels = document.querySelectorAll('.lifeDeathPixels');
              pixels.forEach(el => el.remove());
              this.appendDivs(this.state.gridWidth, Number(e.target.value));
              localStorage.setItem('gridHeight', Number(e.target.value));
              undo = [];
            }}
          ></input>
          <p className='controlLabel'>Per Column</p>

          <input
            className='inputNumber'
            type='number'
            title='Square size in px'
            min='1'
            max='50'
            value={this.state.pixelSize}
            onChange={e => {
              this.setState({ pixelSize: Number(e.target.value) });
              const pixels = document.querySelectorAll('.lifeDeathPixels');
              pixels.forEach(el => {
                el.style.width = e.target.value + 'px';
                el.style.height = e.target.value + 'px';
              });
              localStorage.setItem('pixelSize', Number(e.target.value));
            }}
          ></input>
          <p className='controlLabel'>Square Size</p>

          <input
            className='inputNumber'
            type='number'
            title='Between squares space in px'
            min='0'
            max='5'
            step='0.5'
            value={this.state.pixelSpace * 2}
            onChange={e => {
              this.setState({ pixelSpace: Number(e.target.value / 2) });
              const pixels = document.querySelectorAll('.lifeDeathPixels');
              pixels.forEach(el => {
                el.style.margin = Number(e.target.value / 2) + 'px';
              });
              localStorage.setItem('pixelSpace', Number(e.target.value / 2));
            }}
          ></input>
          <p className='controlLabel'>Grid Lines</p>
          <div className='devider'></div>

          <button
            className='randomColors'
            style={{
              backgroundColor: this.state.isRandomColor ? '#383838' : 'initial',
              border: this.state.isRandomColor ? 'solid 1px #636363' : 'none',
            }}
            title='Random Colors'
            onClick={() =>
              this.state.isRandomColor ? this.setState({ isRandomColor: false }) : this.setState({ isRandomColor: true })
            }
          >
            <svg width='20' height='20' xmlns='http://www.w3.org/2000/svg' fillRule='evenodd' clipRule='evenodd' fill='#D7D7D7'>
              <path d='M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z' />
            </svg>
          </button>
          <p className='controlLabel'>Random</p>
          <input
            className='inputColor'
            type='color'
            title='Pixel Color'
            value={this.state.pixleColor}
            onChange={e => {
              this.setState({ pixleColor: e.target.value, isRandomColor: false });
              // const pixels = document.querySelectorAll('[data-live=true]');
              // pixels.forEach(el => {
              //   el.style.backgroundColor = e.target.value;
              // });
              localStorage.setItem('pixleColor', e.target.value);
            }}
          ></input>
          <p className='controlLabel'>Drawing</p>
          <input
            className='inputColor'
            type='color'
            title='Backgorund Pixel Color'
            value={this.state.backgroundPixleColor}
            onChange={e => {
              this.setState({ backgroundPixleColor: e.target.value });
              const pixels = document.querySelectorAll('#lifeDeathContainer > div:not([data-live=true])');
              pixels.forEach(el => (el.style.backgroundColor = e.target.value));
              localStorage.setItem('backgroundPixleColor', e.target.value);
            }}
          ></input>
          <p className='controlLabel'>Background</p>
          <input
            className='inputColor'
            type='color'
            title='Between Pixels Color'
            value={this.state.betweenPixleColor}
            onChange={e => {
              this.setState({ betweenPixleColor: e.target.value });
              localStorage.setItem('betweenPixleColor', e.target.value);
            }}
          ></input>
          <p className='controlLabel'>Grid Lines</p>
          <input
            className='inputColor'
            type='color'
            title='Symmetry Lines Color'
            value={this.state.SymmetryLinesColor}
            onChange={e => {
              this.setState({ SymmetryLinesColor: e.target.value });
              localStorage.setItem('SymmetryLinesColor', e.target.value);
            }}
          ></input>
          <p className='controlLabel'>Sym- Lines</p>
          <div className='devider'></div>
          <select
            title='Insert Patrens'
            disabled={this.state.isPlaying}
            onChange={e => {
              const value = e.target.value;
              if (this.state.gridWidth < 45 || this.state.gridHeight < 45) {
                alert('this patren requiers a 45x45 grid and greater');
              } else if (value === 'simkinGliderGun') {
                this.applyPattren(pattrens[value], 60, 0, 1);
              } else if (value === 'PentaDecathlon') {
                this.applyPattren(pattrens[value], 60, 4, 8);
              } else if (value === 'pulsar') {
                this.applyPattren(pattrens[value], 60, 7, 7);
              } else if (value === 'LightWeightSpaceship') {
                this.applyPattren(pattrens[value], 60, 0, 2);
              } else if (value === 'MiddleWeightSpaceship') {
                this.applyPattren(pattrens[value], 60, 0, 3);
              } else if (value === 'HeavyWeightSpaceship') {
                this.applyPattren(pattrens[value], 60, 0, 3);
              } else if (value === 'omarDrawing') {
                this.applyPattren(pattrens[value], 60, 4, 2);
              } else if (value !== '---') this.applyPattren(pattrens[value], 60);
            }}
          >
            <option value='---'>---</option>
            <option value='gliderGun'>Glider Gun</option>
            <option value='simkinGliderGun'>Simkin Glider Gun</option>
            <option value='LightWeightSpaceship'>Light Weight Spaceship</option>
            <option value='MiddleWeightSpaceship'>Middle Weight Spaceship</option>
            <option value='HeavyWeightSpaceship'>Heavy Weight Spaceship</option>
            <option value='PentaDecathlon'>Penta Decathlon</option>
            <option value='pulsar'>Pulsar</option>
            <option value='omarDrawing'>Omar's Drawing</option>
          </select>
          <p className='controlLabel'>Pattrens</p>
        </div>

        <div id='imageLayer'>
          <div
            id='layerHeader'
            onMouseDown={e => {
              windowLeft = e.target.getBoundingClientRect().left - e.pageX;
              windowTop = e.target.getBoundingClientRect().top - e.pageY;
              window.addEventListener('mousemove', this.grabLayer);
            }}
            onMouseUp={() => window.removeEventListener('mousemove', this.grabLayer)}
          >
            <input
              type='range'
              id='imgOpacity'
              step='0.1'
              min='0.1'
              max='1'
              defaultValue='0.5'
              onMouseDown={e => {
                e.stopPropagation();
                return false;
              }}
              onChange={e => {
                document.getElementById('img').style.opacity = e.target.value;
              }}
            ></input>
            <button
              id='closeImg'
              onClick={() => {
                document.getElementById('imageLayer').style.display = 'none';
                document.getElementById('getImage').value = '';
              }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </button>
          </div>
          <img id='img' alt='imageLayer'></img>
          <div id='imgResize'>
            <svg
              onMouseDown={e => {
                forResize = [
                  document.getElementById('img').getBoundingClientRect().width,
                  document.getElementById('img').getBoundingClientRect().width,
                  e.clientX,
                  e.clientY,
                ];
                window.addEventListener('mousemove', this.imgResize);
              }}
              title='Resize'
              version='1.1'
              id='Capa_1'
              xmlns='http://www.w3.org/2000/svg'
              x='0px'
              y='0px'
              viewBox='0 0 301.604 301.604'
              style={{ enableBackground: 'new 0 0 301.604 301.604' }}
              xmlSpace='preserve'
            >
              <circle cx='40.802' cy='40.802' r='40.802' />
              <circle cx='150.802' cy='40.802' r='40.802' />
              <circle cx='260.802' cy='40.802' r='40.802' />
              <circle cx='150.802' cy='150.802' r='40.802' />
              <circle cx='260.802' cy='150.802' r='40.802' />
              <circle cx='260.802' cy='260.802' r='40.802' />
            </svg>
          </div>
        </div>

        <div id='windowContainer'>
          <div
            id='windowHeader'
            onMouseDown={e => {
              windowLeft = e.target.getBoundingClientRect().left - e.pageX;
              windowTop = e.target.getBoundingClientRect().top - e.pageY;
              window.addEventListener('mousemove', this.grabGrid);
            }}
            onMouseUp={() => window.removeEventListener('mousemove', this.grabGrid)}
          >
            <p>
              {this.state.gridWidth * (this.state.pixelSpace * 2 + this.state.pixelSize)} x{' '}
              {this.state.gridHeight * (this.state.pixelSpace * 2 + this.state.pixelSize)} px /{' '}
              {this.state.gridWidth * this.state.gridHeight} squares
            </p>
          </div>
          <div
            id='lifeDeathContainer'
            style={{
              width: this.state.gridWidth * (this.state.pixelSpace * 2 + this.state.pixelSize) + 'px',
              height: this.state.gridHeight * (this.state.pixelSpace * 2 + this.state.pixelSize) + 'px',
              backgroundColor: this.state.betweenPixleColor,
            }}
            onMouseDown={e => {
              if (!this.state.isPlaying) this.setState({ drwaMode: true });
              document.querySelectorAll('#controlPanel > *').forEach(e => e.blur());
              e.preventDefault();
            }}
            onMouseUp={() => {
              this.setState({ drwaMode: false });
            }}
            onMouseLeave={() => {
              this.setState({ drwaMode: false });
              document.getElementById('MouseHorizenLine').style.display = 'none';
              document.getElementById('MouseVerticalLine').style.display = 'none';
              window.removeEventListener('mousemove', this.trackMouse);
            }}
            onMouseEnter={e => {
              if (!this.state.isPlaying) {
                lineTop = e.target.getBoundingClientRect().top;
                lineLeft = e.target.getBoundingClientRect().left;
                document.getElementById('MouseHorizenLine').style.display = 'block';
                document.getElementById('MouseVerticalLine').style.display = 'block';
                window.addEventListener('mousemove', this.trackMouse);
              }
            }}
          >
            <nav
              id='horizenLine'
              style={{
                height:
                  this.state.gridHeight % 2 !== 0
                    ? this.state.pixelSpace * 4 + this.state.pixelSize + 'px'
                    : this.state.pixelSpace * 2,
                backgroundColor: this.state.SymmetryLinesColor,
              }}
            ></nav>
            <nav
              id='verticalLine'
              style={{
                width:
                  this.state.gridWidth % 2 !== 0
                    ? this.state.pixelSpace * 4 + this.state.pixelSize + 'px'
                    : this.state.pixelSpace * 2,
                backgroundColor: this.state.SymmetryLinesColor,
              }}
            ></nav>
            <nav id='MouseHorizenLine'></nav>
            <nav id='MouseVerticalLine'></nav>
          </div>
        </div>
      </>
    );
  }
}
