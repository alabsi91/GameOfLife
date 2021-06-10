import html2canvas from 'html2canvas';
import React, { Component } from 'react';
import { pattrens } from './pattrens';
import { saveAs } from 'file-saver';
import { colorToArr, requestFrame } from 'selector_dom';
import { createGIF } from 'gifshot';
import FFmpeg from '@ffmpeg/ffmpeg';

let interval,
  lastPaint,
  lastPaintColors,
  lastPaintGrid,
  windowTop,
  windowLeft,
  lineTop,
  lineLeft,
  forResize,
  isWindowOpened,
  panelsPos,
  extractedData;
let undo = [];
let redo = [];
let xPos, yPos, xDif, yDif, drawDir, dirElem;

export default class GameOfLife extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      isPaused: false,
      drwaMode: false,
      isRandomColor: false,
      symmetricalX: false,
      symmetricalY: false,
      eraser: false,
      paintBuc: false,
      shiftPressed: false,
      loadCards: this.renderLoadCards(),
      speed: localStorage.getItem('speed') ? Number(localStorage.getItem('speed')) : 100,
      pixelSize: localStorage.getItem('pixelSize') ? Number(localStorage.getItem('pixelSize')) : 15,
      gridWidth: localStorage.getItem('gridWidth') ? Number(localStorage.getItem('gridWidth')) : 90,
      gridHeight: localStorage.getItem('gridHeight') ? Number(localStorage.getItem('gridHeight')) : 50,
      pixelSpace: localStorage.getItem('pixelSpace') ? Number(localStorage.getItem('pixelSpace')) : 0.5,
      pixleColor: localStorage.getItem('pixleColor') ? localStorage.getItem('pixleColor') : '#ffffff',
      betweenPixleColor: localStorage.getItem('betweenPixleColor') ? localStorage.getItem('betweenPixleColor') : '#282828',
      SymmetryLinesColor: localStorage.getItem('SymmetryLinesColor') ? localStorage.getItem('SymmetryLinesColor') : '#868686',
      backgroundPixleColor: localStorage.getItem('backgroundPixleColor')
        ? localStorage.getItem('backgroundPixleColor')
        : '#000000',
    };
  }

  componentDidMount() {
    this.appendDivs(this.state.gridWidth, this.state.gridHeight);
    if (localStorage.getItem('lastPaint')) {
      const getLastPaint = JSON.parse(localStorage.getItem('lastPaint'));
      const getLastPaintColros = JSON.parse(localStorage.getItem('lastPaintColors'));
      const getLastPaintGrid = JSON.parse(localStorage.getItem('lastPaintGrid'));
      if (getLastPaintGrid[0] > this.state.gridWidth || getLastPaintGrid[1] > this.state.gridHeight) {
        this.openPopUp(
          `Can't retrive last paint, current grid size is smaller than ${getLastPaintGrid[0]}x${getLastPaintGrid[1]}`
        );
      } else this.applyPattren(getLastPaint, getLastPaintColros, getLastPaintGrid[0]);
    }
    const grabHandles = [
      this.imgResize,
      this.grabLayer,
      this.grabGrid,
      this.grabSave,
      this.grabLoad,
      this.grabPopUp,
      this.grabDownload,
      this.grabPanel,
      this.grabGridPanel,
      this.grabColorPanel,
      this.grabSavePanel,
      this.grabConfirm,
      this.grabMovePanel,
    ];
    window.addEventListener('mouseup', () => grabHandles.forEach(e => window.removeEventListener('mousemove', e)));
    this.keyboardShourtcuts();
    this.readDrawing();
  }

  keyboardShourtcuts = () => {
    window.addEventListener('keydown', e => {
      if (e.key === 'Shift') this.setState({ shiftPressed: true });
      if ((e.ctrlKey && e.key.toLowerCase() === 'z') || (e.ctrlKey && e.key.toLowerCase() === 'y') || e.key === 'Shift')
        e.preventDefault();
    });

    window.addEventListener('keyup', e => {
      if (!isWindowOpened) {
        if (e.ctrlKey && e.key.toLowerCase() === 'z' && undo.length > 0 && !this.state.drwaMode) {
          document.querySelectorAll('input[type="number"').forEach(e => e.blur());
          this.undo();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'y' && redo.length > 0 && !this.state.drwaMode) {
          document.querySelectorAll('input[type="number"').forEach(e => e.blur());
          this.redo();
        } else if (e.key.toLowerCase() === 'e' && !this.state.drwaMode) {
          document.querySelectorAll('input[type="number"').forEach(e => e.blur());
          this.state.eraser ? this.setState({ eraser: false }) : this.setState({ eraser: true });
        } else if (e.key.toLowerCase() === 'b' && !this.state.drwaMode) {
          document.querySelectorAll('input[type="number"').forEach(e => e.blur());
          this.state.paintBuc ? this.setState({ paintBuc: false }) : this.setState({ paintBuc: true });
        } else if (e.key === 'Shift') this.setState({ shiftPressed: false });
      }
    });
  };

  undo = () => {
    if (undo.length > 0) {
      const last = undo.length - 1;
      const pixels = document.querySelectorAll('.lifeDeathPixels');
      pixels.forEach(e => {
        e.style.backgroundColor = this.state.backgroundPixleColor;
        e.removeAttribute('data-live');
      });
      undo[last - 1]?.[0].forEach((e, i) => {
        pixels[e].style.backgroundColor = undo[last - 1]?.[1][i];
        pixels[e].dataset.live = 'true';
      });
      redo.push(undo[last]);
      undo.splice(last, 1);
    }
  };

  redo = () => {
    if (redo.length > 0) {
      const last = redo.length - 1;
      const pixels = document.querySelectorAll('.lifeDeathPixels');
      pixels.forEach(e => {
        e.style.backgroundColor = this.state.backgroundPixleColor;
        e.removeAttribute('data-live');
      });
      redo[last][0].forEach((e, i) => {
        pixels[e].style.backgroundColor = redo[last][1][i];
        pixels[e].dataset.live = 'true';
      });
      undo.push(redo[last]);
      redo.splice(last, 1);
    }
  };

  readDrawing = () => {
    const pixels = document.querySelectorAll('.lifeDeathPixels[data-live="true"]');
    let reg = [[], []];
    pixels.forEach(e => {
      reg[0].push(Number(e.dataset.pos));
      reg[1].push(window.getComputedStyle(e).backgroundColor);
    });
    undo.push(reg);
  };

  applyPattren = (patren, colors, pWidth, x, y) => {
    const pixels = document.querySelectorAll('.lifeDeathPixels');
    pixels.forEach(e => {
      e.style.backgroundColor = this.state.backgroundPixleColor;
      e.removeAttribute('data-live');
    });
    const dif = this.state.gridWidth - pWidth;
    const moveX = x ? ~~(this.state.gridWidth / 2) - x : 0;
    const moveY = y ? ~~this.state.gridWidth * (~~(this.state.gridHeight / 2) - y) : 0;
    const centre = moveX + moveY;
    patren.forEach((e, i) => {
      let div = Math.floor(e / pWidth) * dif;
      this.state.isRandomColor
        ? (pixels[e + div + centre].style.backgroundColor = `hsla(${Math.random() * 360}, 100%, 40%, 1)`)
        : (pixels[e + div + centre].style.backgroundColor = colors ? colors[i] : this.state.pixleColor);
      pixels[e + div + centre].dataset.live = 'true';
    });
  };

  symmetricalX = i => {
    if (this.state.symmetricalX) {
      const findRow = ~~(i / this.state.gridWidth) * this.state.gridWidth;
      const middleRow = findRow + Math.floor(this.state.gridWidth / 2);
      const findOp = Number.isInteger(this.state.gridWidth / 2) ? middleRow - (i - middleRow + 1) : middleRow - (i - middleRow);
      const pixel = document.querySelectorAll(`.lifeDeathPixels[data-pos="${findOp}"]`)[0];
      if (this.state.eraser) {
        this.toDeath(pixel);
      } else {
        this.toLive(pixel);
      }
    }
  };

  symmetricalY = i => {
    if (this.state.symmetricalY) {
      const findRow = ~~(i / this.state.gridWidth);
      const findMiddle = Math.floor(this.state.gridHeight / 2);
      const findDef = findMiddle - findRow;
      const findOp = Number.isInteger(this.state.gridHeight / 2)
        ? i + findDef * this.state.gridWidth * 2 - this.state.gridWidth
        : i + findDef * this.state.gridWidth * 2;
      const pixel = document.querySelectorAll(`.lifeDeathPixels[data-pos="${findOp}"]`)[0];
      if (this.state.eraser) {
        this.toDeath(pixel);
      } else {
        this.toLive(pixel);
      }
      return findOp;
    }
  };

  appendDivs = (grid, height, indx) => {
    indx = indx || 0;
    const container = document.getElementById('lifeDeathContainer');
    for (let i = indx; i < grid * height; i++) {
      const element = document.createElement('div');
      element.className = 'lifeDeathPixels';
      element.dataset.pos = i;
      element.style.margin = this.state.pixelSpace + 'px';
      element.style.backgroundColor = this.state.backgroundPixleColor;
      element.style.width = this.state.pixelSize + 'px';
      element.style.height = this.state.pixelSize + 'px';
      if (process.env.NODE_ENV === 'development') element.setAttribute('title', i);

      // eslint-disable-next-line no-loop-func
      element.addEventListener('mouseenter', e => {
        if (this.state.drwaMode && !this.state.eraser && !this.state.paintBuc && !this.state.shiftPressed) {
          this.symmetricalX(i);
          this.symmetricalY(i);
          if (this.state.symmetricalY && this.state.symmetricalX && !this.state.shiftPressed)
            this.symmetricalX(this.symmetricalY(i));
          this.toLive(e.target);
        } else if (this.state.drwaMode && this.state.eraser && !this.state.shiftPressed) {
          this.symmetricalX(i);
          this.symmetricalY(i);
          if (this.state.symmetricalY && this.state.symmetricalX && !this.state.shiftPressed)
            this.symmetricalX(this.symmetricalY(i));
          this.toDeath(e.target);
        }
      });
      // eslint-disable-next-line no-loop-func
      element.addEventListener('mousedown', e => {
        this.setState({ isPaused: false });
        redo = [];
        if (!this.state.isPlaying && !this.state.eraser && !this.state.paintBuc && !this.state.shiftPressed) {
          this.symmetricalX(i);
          this.symmetricalY(i);
          if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(i));
          this.toLive(e.target);
        } else if (!this.state.isPlaying && this.state.eraser && !this.state.paintBuc && !this.state.shiftPressed) {
          this.symmetricalX(i);
          this.symmetricalY(i);
          if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(i));
          this.toDeath(e.target);
        } else if (this.state.paintBuc && !this.state.shiftPressed) {
          this.paintBuc(i);
        } else if (this.state.shiftPressed && !this.state.paintBuc) {
          if (!dirElem) dirElem = i;
          xPos = e.x;
          yPos = e.y;
          window.addEventListener('mousemove', this.shiftDraw);
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
    if (e) {
      this.state.isRandomColor
        ? (e.style.backgroundColor = `hsla(${Math.random() * 360}, 100%, 40%, 1)`)
        : (e.style.backgroundColor = this.state.pixleColor);
      e.dataset.live = 'true';
    }
  };

  toDeath = e => {
    if (e) {
      if (e.dataset.live === 'true') {
        e.style.backgroundColor = this.state.backgroundPixleColor;
        e.removeAttribute('data-live');
      }
    }
  };

  play = () => {
    if (!this.state.isPlaying) {
      this.setState({ isPlaying: true });
      const pixels = document.querySelectorAll('.lifeDeathPixels[data-live="true"]');
      if (!this.state.isPaused) {
        const getDraw = [];
        const getColors = [];
        pixels.forEach(e => getDraw.push(Number(e.dataset.pos)));
        pixels.forEach(e => getColors.push(window.getComputedStyle(e).backgroundColor));
        lastPaint = getDraw;
        lastPaintColors = getColors;
        lastPaintGrid = [this.state.gridWidth, this.state.gridHeight];
        localStorage.setItem('lastPaint', JSON.stringify(getDraw));
        localStorage.setItem('lastPaintColors', JSON.stringify(getColors));
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
    if (!this.state.isPlaying) this.readDrawing();
    clearInterval(interval);
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
        this.openPopUp(`Can't retrive last paint, current grid size is smaller than ${lastPaintGrid[0]}x${lastPaintGrid[1]}`);
      } else if (lastPaintGrid[0] !== this.state.gridWidth || lastPaintGrid[1] !== this.state.gridHeight) {
        this.readDrawing();
        this.openPopUp(`This paint was painted orginaly on ${lastPaintGrid[0]}x${lastPaintGrid[1]} grid`);
        this.applyPattren(lastPaint, lastPaintColors, lastPaintGrid[0]);
      } else {
        this.readDrawing();
        this.applyPattren(lastPaint, lastPaintColors, lastPaintGrid[0]);
      }
    } else if (localStorage.getItem('lastPaint')) {
      const getLastPaint = JSON.parse(localStorage.getItem('lastPaint'));
      const getLastPaintColros = JSON.parse(localStorage.getItem('lastPaintColors'));
      const getLastPaintGrid = JSON.parse(localStorage.getItem('lastPaintGrid'));
      if (getLastPaintGrid[0] > this.state.gridWidth || getLastPaintGrid[1] > this.state.gridHeight) {
        this.openPopUp(
          `Can't retrive last paint, current grid size is smaller than ${getLastPaintGrid[0]}x${getLastPaintGrid[1]}`
        );
      } else {
        this.readDrawing();
        this.applyPattren(getLastPaint, getLastPaintColros, getLastPaintGrid[0]);
      }
    } else this.openPopUp('Last Paint Not found');
  };

  trackMouse = l => {
    document.getElementById('MouseHorizenLine').style.top = `${l.clientY - lineTop}px`;
    document.getElementById('MouseVerticalLine').style.left = `${l.clientX - lineLeft}px`;
  };

  stickyGrapHandle = (l, el) => {
    const grabEl = document.getElementById(el);
    const height = parseInt(window.getComputedStyle(grabEl).height);
    const width = parseInt(window.getComputedStyle(grabEl).width);
    grabEl.style.top = `${l.pageY < 10 ? 10 : l.pageY + windowTop}px`;
    grabEl.style.left = `${l.pageX + windowLeft}px`;
    panelsPos.forEach(e => {
      const recLeft = grabEl.getBoundingClientRect().left + window.scrollX;
      const recRight = grabEl.getBoundingClientRect().right + window.scrollX;
      if (l.pageX >= e[0] && l.pageX <= e[2] && l.pageY >= e[1] && l.pageY <= e[1] + 20) {
        grabEl.style.top = `${e[1]}px`;
        grabEl.style.left = `${e[0]}px`;
      } else if (l.pageX >= e[0] && l.pageX <= e[2] && l.pageY + height <= e[3] + 20 && l.pageY + height >= e[3]) {
        grabEl.style.top = `${e[3] - height}px`;
        grabEl.style.left = `${e[0]}px`;
      } else if (recLeft >= e[2] - 10 && recLeft <= e[2] + 10) {
        if (l.pageY >= e[3] && l.pageY <= e[3] + 20) grabEl.style.top = `${e[3]}px`;
        grabEl.style.left = `${e[2]}px`;
      } else if (recRight >= e[0] - 10 && recRight <= e[0]) {
        if (l.pageY >= e[3] && l.pageY <= e[3] + 20) grabEl.style.top = `${e[3]}px`;
        grabEl.style.left = `${e[0] - width}px`;
      }
    });
  };
  grabPanel = l => this.stickyGrapHandle(l, 'controlPanel');
  grabGridPanel = l => this.stickyGrapHandle(l, 'gridControlPanel');
  grabColorPanel = l => this.stickyGrapHandle(l, 'colorControlPanel');
  grabSavePanel = l => this.stickyGrapHandle(l, 'saveControlPanel');
  grabMovePanel = l => this.stickyGrapHandle(l, 'moveControlPanel');

  grabWindowHandel = (l, el) => {
    l.preventDefault();
    const grabEl = document.getElementById(el);
    grabEl.style.top = `${l.pageY < 10 ? 10 : l.pageY + windowTop}px`;
    grabEl.style.left = `${l.pageX + windowLeft}px`;
  };
  grabGrid = l => this.grabWindowHandel(l, 'windowContainer');
  grabLayer = l => this.grabWindowHandel(l, 'imageLayer');
  grabSave = l => this.grabWindowHandel(l, 'saveWindow');
  grabLoad = l => this.grabWindowHandel(l, 'loadWindow');
  grabDownload = l => this.grabWindowHandel(l, 'downloadWindow');
  grabPopUp = l => this.grabWindowHandel(l, 'popUp');
  grabConfirm = l => this.grabWindowHandel(l, 'confirmWindow');
  copyToClipBoard = () => {
    this.pauseRender();
    html2canvas(document.querySelector('#lifeDeathContainer'), { scale: 2 }).then(canvas => {
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

  downloadImg = () => {
    this.pauseRender();
    html2canvas(document.querySelector('#lifeDeathContainer'), { scale: 1 }).then(canvas => {
      canvas.toBlob(e => {
        saveAs(e, 'Game of life ' + Date.now());
      }, 'image/png');
    });
  };

  imgResize = e => {
    e.preventDefault();
    document.getElementById('img').style.width =
      parseInt(forResize[0], 10) + (e.clientX - forResize[2] + e.clientY - forResize[3]) / 2 + 'px';
    document.getElementById('img').style.height = 'auto';
  };

  toggleWindowHandle = el => {
    const winEl = document.getElementById(el);
    const blured = document.getElementById('blured');
    const isOpen = window.getComputedStyle(winEl).display === 'none' ? false : true;
    if (isOpen) {
      requestFrame({ from: 1, to: 0, easingFunction: 'easeInCirc', duration: 100 }, s => {
        winEl.style.transform = `scale(${s})`;
        blured.style.opacity = s;
        if (s === 0) {
          winEl.style.display = 'none';
          blured.style.display = 'none';
        }
      });
      isWindowOpened = false;
    } else {
      winEl.style.display = 'initial';
      blured.style.display = 'block';
      requestFrame({ from: 0, to: 1, easingFunction: 'easeOutQuart', duration: 100 }, s => {
        winEl.style.transform = `scale(${s})`;
        blured.style.opacity = s;
      });
      isWindowOpened = true;
    }
  };
  toggleConfirmWindow = () => {
    const winEl = document.getElementById('confirmWindow');
    const blured = document.getElementById('blured');
    const isOpen = window.getComputedStyle(winEl).display === 'none' ? false : true;
    if (isOpen) {
      requestFrame({ from: 1, to: 0, easingFunction: 'easeInCirc', duration: 100 }, s => {
        winEl.style.transform = `scale(${s})`;
        blured.style.opacity = s;
        if (s === 0) {
          winEl.style.display = 'none';
          blured.style.display = 'none';
        }
      });
      isWindowOpened = false;
      document.getElementById('getData').value = '';
    } else {
      winEl.style.display = 'initial';
      blured.style.display = 'block';
      requestFrame({ from: 0, to: 1, easingFunction: 'easeOutQuart', duration: 100 }, s => {
        winEl.style.transform = `scale(${s})`;
        blured.style.opacity = s;
      });
      isWindowOpened = true;
    }
  };
  toggleSaveWindow = () => this.toggleWindowHandle('saveWindow');
  toggleLoadWindow = () => {
    document.querySelectorAll(`.loadCard`).forEach(e => e.removeAttribute('style'));
    this.setState(() => ({ loadCards: this.renderLoadCards() }));
    this.toggleWindowHandle('loadWindow');
  };
  toggleDownloadWindow = () => this.toggleWindowHandle('downloadWindow');
  togglePopUp = () => this.toggleWindowHandle('popUp');

  openPopUp = t => {
    const textEl = document.getElementById('popUpText');
    textEl.innerHTML = t;
    this.togglePopUp();
  };

  saveDrawing = () => {
    this.pauseRender();
    const buttons = document.querySelectorAll('#saveCancleContainer button');
    const pixels = document.querySelectorAll('.lifeDeathPixels[data-live="true"]');
    buttons.forEach(e => (e.disabled = true));
    const newSave = {
      livePixels: [],
      pixelsColors: [],
      savingName: document.getElementById('saveName').value,
      drawngImg: '',
      saveSettings: [
        this.state.gridWidth,
        this.state.gridHeight,
        this.state.pixelSize,
        this.state.pixelSpace,
        this.state.backgroundPixleColor,
      ],
    };
    pixels.forEach(e => newSave.livePixels.push(Number(e.dataset.pos)));
    pixels.forEach(e => newSave.pixelsColors.push(window.getComputedStyle(e).backgroundColor));
    html2canvas(document.querySelector('#lifeDeathContainer'), { scale: 0.5 }).then(canvas => {
      const dataURL = canvas.toDataURL('image/png');
      newSave.drawngImg = dataURL;
      if (localStorage.getItem('saved')) {
        const saved = JSON.parse(localStorage.getItem('saved'));
        saved.push(newSave);
        localStorage.setItem('saved', JSON.stringify(saved));
      } else {
        localStorage.setItem('saved', JSON.stringify([newSave]));
      }
      buttons.forEach(e => (e.disabled = false));
      this.toggleSaveWindow();
    });
  };

  renderLoadCards = () =>
    JSON.parse(localStorage.getItem('saved'))?.map((e, i) => (
      <LoadCards
        loadHandle={() => this.loadSaves(i)}
        removeSaveHandle={e => this.removeSave(e, i)}
        exportSaveHandle={ev => this.exportSelectedData(ev, i, e.savingName)}
        img={e.drawngImg}
        name={e.savingName}
        width={e.saveSettings[0]}
        height={e.saveSettings[1]}
        loadsKeys={i}
        key={i}
      ></LoadCards>
    ));

  loadSaves = i => {
    this.pauseRender();
    let pixels = document.querySelectorAll('.lifeDeathPixels');
    const saved = JSON.parse(localStorage.getItem('saved'));
    this.setState(
      {
        gridWidth: saved[i].saveSettings[0],
        gridHeight: saved[i].saveSettings[1],
        pixelSize: saved[i].saveSettings[2],
        pixelSpace: saved[i].saveSettings[3],
        backgroundPixleColor: saved[i].saveSettings[4],
      },
      () => {
        localStorage.setItem('gridWidth', saved[i].saveSettings[0]);
        localStorage.setItem('gridHeight', saved[i].saveSettings[1]);
        localStorage.setItem('pixelSize', saved[i].saveSettings[2]);
        localStorage.setItem('pixelSpace', saved[i].saveSettings[3]);
        localStorage.setItem('backgroundPixleColor', saved[i].saveSettings[4]);
        pixels.forEach(el => el.remove());
        this.appendDivs(saved[i].saveSettings[0], saved[i].saveSettings[1]);
        pixels = document.querySelectorAll('.lifeDeathPixels');
        saved[i].livePixels.forEach((e, ind) => {
          pixels[e].style.backgroundColor = saved[i].pixelsColors[ind];
          pixels[e].dataset.live = 'true';
        });
        this.toggleLoadWindow();
        undo = [];
        redo = [];
        this.readDrawing();
      }
    );
  };

  removeSave = (e, i) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('saved'));
    saved.splice(i, 1);
    saved.length === 0 ? localStorage.removeItem('saved') : localStorage.setItem('saved', JSON.stringify(saved));
    saved.length === 0
      ? (document.getElementById('noLoads').style.display = 'block')
      : (document.getElementById('noLoads').style.display = 'none');
    this.setState(() => ({ loadCards: this.renderLoadCards() }));
  };

  captureImgs = async (frmaes, interval, delay, backwards) => {
    const el = document.querySelector('#lifeDeathContainer');
    const buttons = document.querySelectorAll('#downloadCancleContainer button');
    const recordAnimation = document.getElementById('recordAnimation');
    const downloadAnimation = document.getElementById('downloadAnimation');
    const frameCountEl = document.getElementById('frameCount');
    const isMP4 = document.getElementById('downloadVideo').checked ? true : false;
    const imgs = [];
    for (let i = 1; i <= frmaes; i++) {
      frameCountEl.innerHTML = i;
      await html2canvas(el).then(canvas => imgs.push(canvas.toDataURL('image/png')));
      this.renderLifeDeath();
    }
    if (delay) for (let i = 0; i < delay; i++) imgs.unshift(imgs[0]);

    if (backwards) {
      const revArray = [];
      for (let i = imgs.length - 1; i >= 0; i--) revArray.push(imgs[i]);
      imgs.push(...revArray);
    }

    recordAnimation.style.display = 'none';
    downloadAnimation.style.display = 'block';

    createGIF(
      {
        images: imgs,
        gifWidth: this.state.gridWidth * (this.state.pixelSpace * 2 + this.state.pixelSize),
        gifHeight: this.state.gridHeight * (this.state.pixelSpace * 2 + this.state.pixelSize),
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
    const recordAnimation = document.getElementById('recordAnimation');
    const isPNG = document.getElementById('downloadPNG').checked ? true : false;
    const isBounce = document.getElementById('gifBounce').checked ? true : false;
    const frames = Number(document.getElementById('gifFrames').value);
    const inval = Number(document.getElementById('gifInterval').value);
    const delay = Number(document.getElementById('gifDelay').value);
    if (isPNG) {
      this.downloadImg();
      this.toggleDownloadWindow();
    } else {
      recordAnimation.style.display = 'block';
      buttons.forEach(e => (e.disabled = true));
      this.captureImgs(frames, inval, delay, isBounce);
    }
  };

  findPanelsPos = id => {
    const panels = ['controlPanel', 'gridControlPanel', 'colorControlPanel', 'saveControlPanel', 'moveControlPanel'];
    panels.splice(
      panels.findIndex(e => e === id),
      1
    );
    const pos = panels.map(e => [
      document.getElementById(e).getBoundingClientRect().left + window.scrollX,
      document.getElementById(e).getBoundingClientRect().bottom + window.scrollY,
      document.getElementById(e).getBoundingClientRect().right + window.scrollX,
      document.getElementById(e).getBoundingClientRect().top + window.scrollY,
    ]);
    panelsPos = pos;
  };

  paintBuc = i => {
    const pixels = document.querySelectorAll('.lifeDeathPixels');
    const correntColor = window.getComputedStyle(pixels[i]).backgroundColor;
    const hexToRGB = c => `rgb(${colorToArr(c)[0]}, ${colorToArr(c)[1]}, ${colorToArr(c)[2]})`;
    const sameColor = correntColor !== hexToRGB(this.state.pixleColor);
    const width = this.state.gridWidth;
    const height = this.state.gridHeight;
    const isEmpty = d => {
      if (
        pixels[d] &&
        this.state.eraser &&
        pixels[d].dataset.live === 'true' &&
        window.getComputedStyle(pixels[d]).backgroundColor === correntColor
      ) {
        return true;
      } else if (
        pixels[d] &&
        !this.state.eraser &&
        window.getComputedStyle(pixels[d]).backgroundColor === correntColor &&
        sameColor
      ) {
        return true;
      } else return false;
    };

    const toDraw = x => {
      if (this.state.eraser) {
        pixels[x].style.backgroundColor = this.state.backgroundPixleColor;
        pixels[x].removeAttribute('data-live');
      } else {
        pixels[x].style.backgroundColor = this.state.isRandomColor
          ? `hsla(${Math.random() * 360}, 100%, 40%, 1)`
          : this.state.pixleColor;
        pixels[x].dataset.live = 'true';
      }
    };

    const checkAround = x => {
      const next = x + 1;
      const previous = x - 1;
      const up = x - width;
      const down = x + width;
      if (isEmpty(next) && !Number.isInteger((i + 1) / width)) {
        toDraw(next);
        checkAround(next);
      }
      if (isEmpty(previous) && !Number.isInteger(i / width)) {
        toDraw(previous);
        checkAround(previous);
      }
      if (isEmpty(up) && ~~(i / width) !== 0) {
        toDraw(up);
        checkAround(up);
      }
      if (isEmpty(down) && ~~(i / this.state.gridWidth) !== height) {
        toDraw(down);
        checkAround(down);
      }
    };
    toDraw(i);
    checkAround(i);
  };

  exportData = () => {
    const myData = localStorage.getItem('saved');
    const myblob = new Blob([myData], { type: 'application/json' });
    saveAs(myblob, 'saved-drawings', { type: 'application/json' });
  };

  exportSelectedData = (e, i, name) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('saved'));
    const toExport = JSON.stringify([saved[i]]);
    const myblob = new Blob([toExport], { type: 'application/json' });
    saveAs(myblob, name, { type: 'application/json' });
  };

  confirmAdd = () => {
    const LocalData = localStorage.getItem('saved');
    if (LocalData) {
      const oldData = JSON.parse(LocalData);
      const imported = JSON.parse(extractedData);
      oldData.push(...imported);
      localStorage.setItem('saved', JSON.stringify(oldData));
      this.toggleLoadWindow();
    } else this.openPopUp('Old data not found');
    this.toggleConfirmWindow();
  };

  confirmReplace = () => {
    localStorage.setItem('saved', extractedData);
    this.toggleConfirmWindow();
    this.toggleLoadWindow();
  };

  shiftDraw = e => {
    const pixels = document.querySelectorAll('.lifeDeathPixels');
    const perSquare = this.state.pixelSize + this.state.pixelSpace * 2;
    if (e.movementX < 0 && drawDir === 'x' && xDif !== ~~((xPos - e.x) / perSquare)) {
      this.state.eraser ? this.toDeath(pixels[dirElem]) : this.toLive(pixels[dirElem]);
      this.symmetricalX(dirElem);
      this.symmetricalY(dirElem);
      if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(dirElem));
      xDif = ~~((xPos - e.x) / perSquare);
      dirElem = dirElem - 1;
    } else if (e.movementX > 0 && drawDir === 'x' && xDif !== ~~((e.x - xPos) / perSquare)) {
      this.state.eraser ? this.toDeath(pixels[dirElem]) : this.toLive(pixels[dirElem]);
      this.symmetricalX(dirElem);
      this.symmetricalY(dirElem);
      if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(dirElem));
      xDif = ~~((e.x - xPos) / perSquare);
      dirElem = dirElem + 1;
    } else if (e.movementY < 0 && drawDir === 'y' && yDif !== ~~((yPos - e.y) / perSquare)) {
      this.state.eraser ? this.toDeath(pixels[dirElem]) : this.toLive(pixels[dirElem]);
      this.symmetricalX(dirElem);
      this.symmetricalY(dirElem);
      if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(dirElem));
      yDif = ~~((yPos - e.y) / perSquare);
      dirElem = dirElem - this.state.gridWidth;
    } else if (e.movementY > 0 && drawDir === 'y' && yDif !== ~~((e.y - yPos) / perSquare)) {
      this.state.eraser ? this.toDeath(pixels[dirElem]) : this.toLive(pixels[dirElem]);
      this.symmetricalX(dirElem);
      this.symmetricalY(dirElem);
      if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(dirElem));
      yDif = ~~((e.y - yPos) / perSquare);
      dirElem = dirElem + this.state.gridWidth;
    }
  };

  getMouseDir = e => {
    if (!drawDir) {
      drawDir = e.movementY < 0 || e.movementY > 0 ? 'y' : e.movementX < 0 || e.movementX > 0 ? 'x' : false;
    }
  };

  moveGrid = dir => {
    this.readDrawing();
    const pixels = document.querySelectorAll('.lifeDeathPixels');
    const width = this.state.gridWidth;
    const height = this.state.gridHeight;
    let row = [];
    let colors = [];

    for (let i = 0; i < width * height; i++) {
      if (pixels[i].dataset.live === 'true') {
        row.push(i);
        colors.push(window.getComputedStyle(pixels[i]).backgroundColor);
        this.toDeath(pixels[i]);
      }
    }

    if (dir === 'up') {
      row.forEach((e, x) => {
        if (pixels[e - width]) {
          pixels[e - width].style.backgroundColor = colors[x];
          pixels[e - width].dataset.live = 'true';
        }
      });
    } else if (dir === 'down') {
      row.forEach((e, x) => {
        if (pixels[e + width]) {
          pixels[e + width].style.backgroundColor = colors[x];
          pixels[e + width].dataset.live = 'true';
        }
      });
    } else if (dir === 'left') {
      row.forEach((e, x) => {
        if (pixels[e - 1]) {
          pixels[e - 1].style.backgroundColor = colors[x];
          pixels[e - 1].dataset.live = 'true';
        }
      });
    } else if (dir === 'right') {
      row.forEach((e, x) => {
        if (pixels[e + 1]) {
          pixels[e + 1].style.backgroundColor = colors[x];
          pixels[e + 1].dataset.live = 'true';
        }
      });
    }
  };

  render() {
    return (
      <>
        <div id='controlPanel' className='controlPanel'>
          <div
            id='grabPad'
            onMouseDown={e => {
              const el = document.getElementById('controlPanel');
              this.findPanelsPos('controlPanel');
              windowLeft = el.getBoundingClientRect().left - e.clientX;
              windowTop = el.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabPanel);
            }}
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
            <svg
              viewBox='0 0 24 24'
              width='24'
              height='24'
              xmlns='http://www.w3.org/2000/svg'
              fillRule='evenodd'
              clipRule='evenodd'
              fill='#D7D7D7'
            >
              <path d='M5.662 23l-5.369-5.365c-.195-.195-.293-.45-.293-.707 0-.256.098-.512.293-.707l14.929-14.928c.195-.194.451-.293.707-.293.255 0 .512.099.707.293l7.071 7.073c.196.195.293.451.293.708 0 .256-.097.511-.293.707l-11.216 11.219h5.514v2h-12.343zm3.657-2l-5.486-5.486-1.419 1.414 4.076 4.072h2.829zm.456-11.429l-4.528 4.528 5.658 5.659 4.527-4.53-5.657-5.657z' />
            </svg>
          </button>

          <button
            className='buttons'
            style={{
              backgroundColor: this.state.paintBuc ? '#383838' : 'initial',
              border: this.state.paintBuc ? 'solid 1px #636363' : 'none',
            }}
            title='Fill Bucket (b)'
            onClick={() => (this.state.paintBuc ? this.setState({ paintBuc: false }) : this.setState({ paintBuc: true }))}
          >
            <svg
              viewBox='0 0 24 24'
              width='24'
              height='24'
              xmlns='http://www.w3.org/2000/svg'
              fillRule='evenodd'
              clipRule='evenodd'
              fill='#D7D7D7'
            >
              <path d='M21.143 9.667c-.733-1.392-1.914-3.05-3.617-4.753-2.977-2.978-5.478-3.914-6.785-3.914-.414 0-.708.094-.86.246l-1.361 1.36c-1.899-.236-3.42.106-4.294.983-.876.875-1.164 2.159-.792 3.523.492 1.806 2.305 4.049 5.905 5.375.038.323.157.638.405.885.588.588 1.535.586 2.121 0s.588-1.533.002-2.119c-.588-.587-1.537-.588-2.123-.001l-.17.256c-2.031-.765-3.395-1.828-4.232-2.9l3.879-3.875c.496 2.73 6.432 8.676 9.178 9.178l-7.115 7.107c-.234.153-2.798-.316-6.156-3.675-3.393-3.393-3.175-5.271-3.027-5.498l1.859-1.856c-.439-.359-.925-1.103-1.141-1.689l-2.134 2.131c-.445.446-.685 1.064-.685 1.82 0 1.634 1.121 3.915 3.713 6.506 2.764 2.764 5.58 4.243 7.432 4.243.648 0 1.18-.195 1.547-.562l8.086-8.078c.91.874-.778 3.538-.778 4.648 0 1.104.896 1.999 2 1.999 1.105 0 2-.896 2-2 0-3.184-1.425-6.81-2.857-9.34zm-16.209-5.371c.527-.53 1.471-.791 2.656-.761l-3.209 3.206c-.236-.978-.049-1.845.553-2.445zm9.292 4.079l-.03-.029c-1.292-1.292-3.803-4.356-3.096-5.063.715-.715 3.488 1.521 5.062 3.096.862.862 2.088 2.247 2.937 3.458-1.717-1.074-3.491-1.469-4.873-1.462z' />
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
          <input
            id='getImage'
            type='file'
            name='getImage'
            accept='.png,.jpg'
            onChange={() => {
              const selectedFile = document.getElementById('getImage').files[0];
              if (selectedFile) {
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
              }
            }}
          ></input>
          <label id='getImageLabel' className='buttons' htmlFor='getImage' title='Add Image Layer'>
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z' />
            </svg>
          </label>

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
          <select
            title='Insert Patrens'
            disabled={this.state.isPlaying}
            onChange={e => {
              const value = e.target.value;
              if (this.state.gridWidth < 45 || this.state.gridHeight < 45) {
                this.openPopUp('This patren requiers a 45x45 grid and greater');
              } else if (value === 'simkinGliderGun') {
                this.applyPattren(pattrens[value], undefined, 60, 0, 1);
              } else if (value === 'PentaDecathlon') {
                this.applyPattren(pattrens[value], undefined, 60, 4, 8);
              } else if (value === 'pulsar') {
                this.applyPattren(pattrens[value], undefined, 60, 7, 7);
              } else if (value === 'LightWeightSpaceship') {
                this.applyPattren(pattrens[value], undefined, 60, 0, 2);
              } else if (value === 'MiddleWeightSpaceship') {
                this.applyPattren(pattrens[value], undefined, 60, 0, 3);
              } else if (value === 'HeavyWeightSpaceship') {
                this.applyPattren(pattrens[value], undefined, 60, 0, 3);
              } else if (value === 'omarDrawing') {
                this.applyPattren(pattrens[value], undefined, 60, 4, 2);
              } else if (value === 'heart') {
                this.applyPattren(pattrens[value], undefined, 60, 1, 2);
              } else if (value !== '---') this.applyPattren(pattrens[value], undefined, 60);
            }}
          >
            <option value='---'>---</option>
            <option value='heart'>Heart</option>
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

        <div id='gridControlPanel' className='controlPanel'>
          <div
            id='grabPad'
            onMouseDown={e => {
              const el = document.getElementById('gridControlPanel').getBoundingClientRect();
              this.findPanelsPos('gridControlPanel');
              windowLeft = el.left - e.clientX;
              windowTop = el.top - e.clientY;
              window.addEventListener('mousemove', this.grabGridPanel);
            }}
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
          <input
            className='inputNumber'
            type='number'
            title='How many squares per row'
            min='5'
            max='100'
            value={this.state.gridWidth}
            disabled={this.state.isPlaying}
            onChange={e => {
              const value = Number(e.target.value) > 100 ? 100 : Number(e.target.value) < 5 ? 5 : Number(e.target.value);
              const pixels = document.querySelectorAll('.lifeDeathPixels');
              const width = this.state.gridWidth;
              const height = this.state.gridHeight;
              const live = [];
              const colors = [];
              this.setState({ gridWidth: value }, () => {
                pixels.forEach((e, i) => {
                  if (e.dataset.live === 'true') {
                    live.push(i);
                    colors.push(window.getComputedStyle(e).backgroundColor);
                  }
                });
                if (value < width) {
                  for (let i = width * height - 1; i > value * height - 1; i--) {
                    pixels[i].remove();
                  }
                  this.applyPattren(live, colors, width);
                } else {
                  this.appendDivs(value, height, width * height);
                  this.applyPattren(live, colors, width);
                }
                localStorage.setItem('gridWidth', value);
                undo = [];
              });
            }}
          ></input>
          <p className='controlLabel'>Per Row</p>
          <input
            className='inputNumber'
            type='number'
            title='How many squares per column'
            min='5'
            max='100'
            value={this.state.gridHeight}
            disabled={this.state.isPlaying}
            onChange={e => {
              const value = Number(e.target.value) > 100 ? 100 : Number(e.target.value) < 5 ? 5 : Number(e.target.value);
              this.setState({ gridHeight: value });
              const pixels = document.querySelectorAll('.lifeDeathPixels');
              const width = this.state.gridWidth;
              const height = this.state.gridHeight;
              if (value < height) {
                for (let i = value * width; i < width * height; i++) {
                  pixels[i].remove();
                }
              } else {
                this.appendDivs(width, value, width * height);
              }
              localStorage.setItem('gridHeight', value);
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
        </div>

        <div id='colorControlPanel' className='controlPanel'>
          <div
            id='grabPad'
            onMouseDown={e => {
              const el = document.getElementById('colorControlPanel').getBoundingClientRect();
              this.findPanelsPos('colorControlPanel');
              windowLeft = el.left - e.clientX;
              windowTop = el.top - e.clientY;
              window.addEventListener('mousemove', this.grabColorPanel);
            }}
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
          <button
            className='buttons'
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
        </div>

        <div id='saveControlPanel' className='controlPanel'>
          <div
            id='grabPad'
            onMouseDown={e => {
              const el = document.getElementById('saveControlPanel').getBoundingClientRect();
              this.findPanelsPos('saveControlPanel');
              windowLeft = el.left - e.clientX;
              windowTop = el.top - e.clientY;
              window.addEventListener('mousemove', this.grabSavePanel);
            }}
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
          <div className='twoButtonsContainer'>
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

          <div className='devider'></div>
          <div className='twoButtonsContainer'>
            <button title='Save drawing' onClick={this.toggleSaveWindow}>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#D7D7D7'>
                <path d='M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z' />{' '}
              </svg>
            </button>
            <button title='Load drawing' onClick={this.toggleLoadWindow}>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#D7D7D7'>
                <path d='M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z' />{' '}
              </svg>
            </button>
          </div>

          <div className='devider'></div>
          <div className='twoButtonsContainer'>
            <button title='Copy drawing to Clipboard' onClick={this.copyToClipBoard}>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#D7D7D7'>
                <path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' />
              </svg>
            </button>
            <button title='Download drawing' onClick={this.toggleDownloadWindow}>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#D7D7D7'>
                <path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />{' '}
              </svg>
            </button>
          </div>
        </div>

        <div id='moveControlPanel' className='controlPanel'>
          <div
            id='grabPad'
            onMouseDown={e => {
              const el = document.getElementById('moveControlPanel');
              this.findPanelsPos('moveControlPanel');
              windowLeft = el.getBoundingClientRect().left - e.clientX;
              windowTop = el.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabMovePanel);
            }}
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

          <button className='buttons' onClick={() => this.moveGrid('up')} title='Move the drawing up'>
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z' />
            </svg>
          </button>

          <div className='twoButtonsContainer'>
            <button onClick={() => this.moveGrid('left')} title='Move the drawing left'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                enableBackground='new 0 0 24 24'
                height='20px'
                viewBox='0 0 24 24'
                width='20px'
                fill='#D7D7D7'
              >
                <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
              </svg>
            </button>
            <button onClick={() => this.moveGrid('right')} title='Move the drawing right'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                enableBackground='new 0 0 24 24'
                height='20px'
                viewBox='0 0 24 24'
                width='20px'
                fill='#D7D7D7'
              >
                <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' />
              </svg>
            </button>
          </div>

          <button className='buttons' title='Move the drawing down' onClick={() => this.moveGrid('down')}>
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z' />
            </svg>
          </button>
        </div>

        <div id='popUp'>
          <div
            id='popUpHeader'
            onMouseDown={e => {
              windowLeft = e.target.getBoundingClientRect().left - e.clientX;
              windowTop = e.target.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabPopUp);
            }}
          >
            <p>Alert</p>
            <button id='closePopUp' onClick={this.togglePopUp} onMouseDown={e => e.stopPropagation()}>
              <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </button>
          </div>
          <p id='popUpText'></p>
          <button onClick={this.togglePopUp}>OK</button>
        </div>

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
          <div id='recordAnimation'>
            <p id='frameCount'>0</p>
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
              e.target.checked
                ? el.forEach(element => (element.disabled = true))
                : el.forEach(element => (element.disabled = false));
            }}
          ></input>
          <label htmlFor='downloadPNG'>Download as png file.</label>
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

        <div id='saveWindow'>
          <div
            id='saveWindowHeader'
            onMouseDown={e => {
              windowLeft = e.target.getBoundingClientRect().left - e.clientX;
              windowTop = e.target.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabSave);
            }}
          >
            <p>Save your drawing to the browser</p>
            <button id='closeSave' onClick={this.toggleSaveWindow} onMouseDown={e => e.stopPropagation()}>
              <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </button>
          </div>
          <input id='saveName' type='text' name='saveName' placeholder='Name'></input>
          <label htmlFor='saveName'>Choose a name for your drawing</label>
          <div id='saveCancleContainer'>
            <button onClick={this.saveDrawing}>Save</button>
            <button onClick={this.toggleSaveWindow}>Cancle</button>
          </div>
        </div>

        <div id='confirmWindow'>
          <div
            id='confirmWindowHeader'
            onMouseDown={e => {
              windowLeft = e.target.getBoundingClientRect().left - e.clientX;
              windowTop = e.target.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabConfirm);
            }}
          >
            <p>Please Confirm</p>
            <button id='closeConfirm' onClick={this.toggleConfirmWindow} onMouseDown={e => e.stopPropagation()}>
              <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </button>
            <p id='confirmTxt'>Do you want to replace your exciting data or add the new data to your old one</p>
          </div>
          <div id='addReplaceContainer'>
            <button onClick={this.confirmAdd}>Add</button>
            <button onClick={this.confirmReplace}>Replace</button>
          </div>
        </div>

        <div id='loadWindow'>
          <div
            id='loadWindowHeader'
            onMouseDown={e => {
              windowLeft = e.target.getBoundingClientRect().left - e.clientX;
              windowTop = e.target.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabLoad);
            }}
          >
            <p>Load your drawings from the browser</p>
            <button id='closeSave' onClick={this.toggleLoadWindow} onMouseDown={e => e.stopPropagation()}>
              <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </button>
          </div>
          <div id='exportImportContainer'>
            <input
              id='getData'
              type='file'
              name='getData'
              accept='.json'
              onChange={() => {
                const selectedFile = document.getElementById('getData').files[0];
                if (selectedFile) {
                  const reader = new FileReader();
                  reader.onload = e => {
                    const res = e.target.result;
                    if (res) {
                      extractedData = res;
                      this.toggleLoadWindow();
                      this.toggleConfirmWindow();
                    } else console.error('error occurred while loading the file');
                  };
                  reader.readAsText(selectedFile);
                }
              }}
            ></input>
            <label className='buttons' htmlFor='getData' title='Import your saved drawing from JSON file'>
              Import
            </label>
            <button onClick={this.exportData} title='Export your saved drawing to JSON file'>
              Export
            </button>
          </div>

          <div id='loadContents'>
            {this.state.loadCards}
            <p id='noLoads' style={{ display: this.state.loadCards ? 'none' : 'block' }}>
              No Saved Drawings found
            </p>
          </div>
        </div>

        <div id='imageLayer'>
          <div
            id='layerHeader'
            onMouseDown={e => {
              windowLeft = e.target.getBoundingClientRect().left - e.clientX;
              windowTop = e.target.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabLayer);
            }}
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
                document.querySelectorAll('#imageLayer img')[0].style.opacity = e.target.value;
              }}
            ></input>
            <button
              id='closeImg'
              onClick={() => {
                document.getElementById('imageLayer').style.display = 'none';
                document.getElementById('getImage').value = '';
              }}
              onMouseDown={e => e.stopPropagation()}
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
              windowLeft = e.target.getBoundingClientRect().left - e.clientX;
              windowTop = e.target.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabGrid);
            }}
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
              window.addEventListener('mousemove', this.getMouseDir);
              e.preventDefault();
            }}
            onMouseUp={() => {
              this.setState({ drwaMode: false });
              this.readDrawing();
              window.removeEventListener('mousemove', this.getMouseDir);
              window.removeEventListener('mousemove', this.shiftDraw);
              [drawDir, dirElem, xDif, yDif] = Array(4).fill(false);
            }}
            onMouseLeave={() => {
              this.setState({ drwaMode: false });
              document.getElementById('MouseHorizenLine').style.display = 'none';
              document.getElementById('MouseVerticalLine').style.display = 'none';
              window.removeEventListener('mousemove', this.trackMouse);
              window.removeEventListener('mousemove', this.getMouseDir);
              window.removeEventListener('mousemove', this.shiftDraw);
              [drawDir, dirElem, xDif, yDif] = Array(4).fill(false);
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
                    : this.state.pixelSpace * 2 + 'px',
                backgroundColor: this.state.SymmetryLinesColor,
                top: `calc(50%  - ${
                  this.state.gridHeight % 2 !== 0 ? (this.state.pixelSpace * 4 + this.state.pixelSize) / 2 : this.state.pixelSpace
                }px)`,
              }}
            ></nav>
            <nav
              id='verticalLine'
              style={{
                width:
                  this.state.gridWidth % 2 !== 0
                    ? this.state.pixelSpace * 4 + this.state.pixelSize + 'px'
                    : this.state.pixelSpace * 2 + 'px',
                backgroundColor: this.state.SymmetryLinesColor,
                left: `calc(50%  - ${
                  this.state.gridWidth % 2 !== 0 ? (this.state.pixelSpace * 4 + this.state.pixelSize) / 2 : this.state.pixelSpace
                }px)`,
              }}
            ></nav>
            <nav id='MouseHorizenLine'></nav>
            <nav id='MouseVerticalLine'></nav>
          </div>
        </div>

        <div id='blured'></div>
      </>
    );
  }
}

function LoadCards(p) {
  return (
    <div className='loadCard' data-key={p.loadsKeys} onClick={p.loadHandle}>
      <img src={p.img} alt='loadimg'></img>
      <div className='loadInfos'>
        <p>Name : {p.name}</p>
        <p>
          Size : {p.width} x {p.height} Grid
        </p>
      </div>
      <button className='deleteSave' onClick={p.removeSaveHandle} title='Delete this from saved drawings'>
        <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
          <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
        </svg>
      </button>
      <button className='exportSave' onClick={p.exportSaveHandle} title='Export this to JSON file'>
        <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
          <path d='M23 0v20h-8v-2h6v-16h-18v16h6v2h-8v-20h22zm-12 13h-4l5-6 5 6h-4v11h-2v-11z' />{' '}
        </svg>
      </button>
    </div>
  );
}
