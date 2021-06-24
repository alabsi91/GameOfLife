import React, { Component } from 'react';
import { pattrens } from './pattrens';
import { saveAs } from 'file-saver';
import ImageWindow from './ImageWindow';
import LoadCards from './LoadCards';
import PopUp from './PopUp';
import DownloadWindow from './DownloadWindow';
import extractColors from 'extract-colors';
import { requestNum } from 'request-animation-number';

let interval, lastPaint, lastPaintColors, lastPaintGrid, windowTop, windowLeft, isWindowOpened, panelsPos, extractedData;
let undo = [];
let redo = [];
let xPos, yPos, xDif, yDif, drawDir, dirElem, xColor, yColor;
let renderDate;

export default class GameOfLife extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorPlate: '',
      isColorCopy: false,
      isPlaying: false,
      isPaused: false,
      drwaMode: false,
      isRandomColor: false,
      symmetricalX: false,
      symmetricalY: false,
      eraser: false,
      paintBuc: false,
      shiftPressed: false,
      maintainColorPlay: false,
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
    this.appendCanvas();
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
      this.grabColorPlate,
    ];
    window.addEventListener('mouseup', () => grabHandles.forEach(e => window.removeEventListener('mousemove', e)));
    this.keyboardShourtcuts();
    this.readDrawing();
    this.dropImage();
  }

  dropImage = () => {
    const preventDefault = e => {
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener('dragenter', preventDefault, false);
    window.addEventListener('dragexit', preventDefault, false);
    window.addEventListener('dragover', preventDefault, false);

    window.addEventListener('drop', e => {
      e.stopPropagation();
      e.preventDefault();
      const imgTag = document.getElementById('img');
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile?.type?.includes('image')) {
        const reader = new FileReader();
        imgTag.removeAttribute('style');
        reader.onload = e => {
          document.getElementById('imageLayer').style.display = 'block';
          document.getElementById('colorPlateControlPanel').style.display = 'block';
          imgTag.src = e.target.result;
          extractColors(e.target.result, { saturationImportance: 0, splitPower: 5, distance: 0.1, pixels: 100 })
            .then(e => {
              this.setState({ colorPlate: e.map((c, i) => <ColorPlate key={i} color={c.hex} that={this} />) });
            })
            .catch(console.log);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        this.openPopUp('Only Image files are acceptable');
      }
    });
  };

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
    const last = undo.length - 1;
    if (undo.length > 1) {
      this.setState({ gridWidth: undo[last - 1][2][0], gridHeight: undo[last - 1][2][1] }, () => {
        this.applyPattren(undo[last - 1]?.[0], undo[last - 1]?.[1], undo[last - 1]?.[2]?.[0]);
        redo.push(undo[last]);
        undo.splice(last, 1);
      });
    }
  };

  redo = () => {
    if (redo.length > 0) {
      const last = redo.length - 1;
      this.setState({ gridWidth: redo[last][2][0], gridHeight: redo[last][2][1] }, () => {
        this.applyPattren(redo[last][0], redo[last][1], redo[last][2][0]);
        undo.push(redo[last]);
        redo.splice(last, 1);
      });
    }
  };

  readDrawing = () => {
    const width = this.state.gridWidth;
    const height = this.state.gridHeight;
    const lives = this.getLivePixels();
    const reg = [lives[0], lives[1], [width, height]];
    undo.push(reg);
  };

  applyPattren = (patren, colors, pWidth, x, y) => {
    this.drawCanvas();
    const dif = this.state.gridWidth - pWidth;
    const moveX = x ? ~~(this.state.gridWidth / 2) - x : 0;
    const moveY = y ? ~~this.state.gridWidth * (~~(this.state.gridHeight / 2) - y) : 0;
    const centre = moveX + moveY;

    for (let i = 0; i < patren.length; i++) {
      let div = Math.floor(patren[i] / pWidth) * dif;
      this.toLive(patren[i] + div + centre, colors ? colors[i] : this.state.pixleColor);
    }
  };

  symmetricalX = i => {
    if (this.state.symmetricalX) {
      const findRow = ~~(i / this.state.gridWidth) * this.state.gridWidth;
      const middleRow = findRow + Math.floor(this.state.gridWidth / 2);
      const findOp = Number.isInteger(this.state.gridWidth / 2) ? middleRow - (i - middleRow + 1) : middleRow - (i - middleRow);
      if (this.state.eraser) {
        this.toDeath(findOp);
      } else {
        this.toLive(findOp);
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
      if (this.state.eraser) {
        this.toDeath(findOp);
      } else {
        this.toLive(findOp);
      }
      return findOp;
    }
  };

  drawCanvas = () => {
    const canvas = document.getElementById('canvas');
    const [width, height, margin, pxSize, bgColor] = [
      this.state.gridWidth,
      this.state.gridHeight,
      this.state.pixelSpace,
      this.state.pixelSize,
      this.state.backgroundPixleColor,
    ];

    canvas.width = width * (margin * 2 + pxSize);
    canvas.height = height * (margin * 2 + pxSize);
    const ctx = canvas.getContext('2d');
    if (margin !== 0) ctx.translate(0.5, 0.5);

    this.drawSym();

    ctx.fillStyle = bgColor;
    for (let x = margin; x < canvas.width; x = x + (margin * 2 + pxSize)) {
      ctx.fillRect(x, margin, pxSize, pxSize);
      for (let y = margin * 3 + pxSize; y < canvas.height; y = y + (margin * 2 + pxSize)) {
        ctx.fillRect(x, y, pxSize, pxSize);
      }
    }
  };

  appendCanvas = () => {
    const canvas = document.getElementById('canvas');

    this.drawCanvas();

    const getSquare = (x, y) => {
      const row = ~~(y / (this.state.pixelSize + this.state.pixelSpace * 2));
      const column = ~~(x / (this.state.pixelSize + this.state.pixelSpace * 2));
      const pos = row * this.state.gridWidth + column;
      return pos;
    };

    const draw = e => {
      const fromTop = canvas.getBoundingClientRect().top;
      const fromLeft = canvas.getBoundingClientRect().left;
      const square = getSquare(e.clientX - fromLeft, e.clientY - fromTop);

      this.paintBuc(square);

      if (this.state.eraser) {
        this.toDeath(square);
      } else {
        this.toLive(square);
        this.imageColorPic(e);
      }

      this.symmetricalX(square);
      this.symmetricalY(square);

      if (this.state.symmetricalY && this.state.symmetricalX && !this.state.shiftPressed)
        this.symmetricalX(this.symmetricalY(square));
    };

    const shiftDraw = e => {
      const fromTop = canvas.getBoundingClientRect().top;
      const fromLeft = canvas.getBoundingClientRect().left;
      const square = getSquare(e.clientX - fromLeft, e.clientY - fromTop);
      if (!dirElem) dirElem = square;
      xPos = e.x;
      yPos = e.y;
      window.addEventListener('mousemove', this.shiftDraw);
    };

    canvas.addEventListener('mousedown', e => {
      if (!this.state.isPlaying) {
        draw(e);
        if (this.state.shiftPressed && !this.state.paintBuc) {
          shiftDraw(e);
        } else canvas.addEventListener('mousemove', draw);
      }
    });
    window.addEventListener('mouseup', () => {
      canvas.removeEventListener('mousemove', draw);
    });
  };

  drawSym = () => {
    const [canvas, width, height, margin, pxSize, symColor] = [
      document.getElementById('canvas'),
      this.state.gridWidth,
      this.state.gridHeight,
      this.state.pixelSpace,
      this.state.pixelSize,
      this.state.SymmetryLinesColor,
    ];
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = symColor;
    width % 2 !== 0
      ? ctx.fillRect(canvas.width / 2 - (margin * 2 + pxSize / 2), 0, margin * 4 + pxSize, canvas.height)
      : ctx.fillRect(canvas.width / 2 - margin, 0, margin * 2, canvas.height);
    height % 2 !== 0
      ? ctx.fillRect(0, canvas.height / 2 - (margin * 2 + pxSize / 2), canvas.width, margin * 4 + pxSize)
      : ctx.fillRect(0, canvas.height / 2 - margin, canvas.width, margin * 2);
  };

  toLive = (p, color) => {
    const [canvas, pxSize] = [document.getElementById('canvas'), this.state.pixelSize];
    const ctx = canvas.getContext('2d');
    const pos = this.getPos(p);
    ctx.fillStyle = color
      ? color
      : this.state.isRandomColor
      ? // ? `hsla(0, 0%, ${Math.floor(Math.random() * (100 - 50 + 1) + 50)}%, 1)`
        `hsla(${Math.random() * 360}, 100%, 40%, 1)`
      : this.state.pixleColor;
    ctx.fillRect(pos.x, pos.y, pxSize, pxSize);
  };

  toDeath = p => {
    const [canvas, pxSize] = [document.getElementById('canvas'), this.state.pixelSize];
    const ctx = canvas.getContext('2d');
    const pos = this.getPos(p);
    ctx.fillStyle = this.state.backgroundPixleColor;
    ctx.fillRect(pos.x, pos.y, pxSize, pxSize);
  };

  getPos = p => {
    const [width, margin, pxSize] = [this.state.gridWidth, this.state.pixelSpace, this.state.pixelSize];
    const findRow = ~~(p / width);
    const findColumn = p - findRow * width;
    const x = findColumn * (pxSize + margin * 2) + margin;
    const y = findRow * (pxSize + margin * 2) + margin;
    return { x: x, y: y };
  };

  changePixelColor = newColor => {
    const canvas = document.getElementById('canvas');
    const [margin, pxSize, bgColor] = [this.state.pixelSpace, this.state.pixelSize, this.state.backgroundPixleColor];

    const ctx = canvas.getContext('2d');

    const checkLive = (x, y) => {
      const data = ctx.getImageData(x + pxSize / 2, y + pxSize / 2, 1, 1).data;
      const isLive = this.RGBToHex(data[0], data[1], data[2]) !== bgColor;
      return isLive;
    };

    ctx.fillStyle = newColor;
    for (let x = margin; x < canvas.width; x = x + (margin * 2 + pxSize)) {
      if (!checkLive(x, margin)) ctx.fillRect(x, margin, pxSize, pxSize);
      for (let y = margin * 3 + pxSize; y < canvas.height; y = y + (margin * 2 + pxSize)) {
        if (!checkLive(x, y)) ctx.fillRect(x, y, pxSize, pxSize);
      }
    }
    this.setState({ backgroundPixleColor: newColor });
    localStorage.setItem('backgroundPixleColor', newColor);
  };

  changePixelSize = newSize => {
    if (Number(newSize)) {
      newSize = Number(newSize) < 1 ? 1 : Number(newSize);
      const live = this.getLivePixels();
      this.setState({ pixelSize: Number(newSize) }, () => {
        this.drawCanvas();
        live[0].forEach((e, i) => {
          this.toLive(e, live[1][i]);
        });
        localStorage.setItem('pixelSize', Number(newSize));
      });
    }
  };

  changeGridWidth = newWidth => {
    if (Number(newWidth)) {
      newWidth = Number(newWidth) > 1000 ? 1000 : Number(newWidth) < 5 ? 5 : Number(newWidth);
      const live = this.getLivePixels();
      const pWidth = this.state.gridWidth;
      this.setState({ gridWidth: newWidth }, () => {
        this.drawCanvas();
        this.applyPattren(live[0], live[1], pWidth);
        this.readDrawing();
        localStorage.setItem('gridWidth', newWidth);
      });
    }
  };

  changeGridHeight = newHeight => {
    if (Number(newHeight)) {
      newHeight = Number(newHeight) > 1000 ? 1000 : Number(newHeight) < 5 ? 5 : Number(newHeight);
      const live = this.getLivePixels();
      this.setState({ gridHeight: newHeight }, () => {
        this.drawCanvas();
        live[0].forEach((e, i) => {
          this.toLive(e, live[1][i]);
        });
        this.readDrawing();
        localStorage.setItem('gridHeight', newHeight);
      });
    }
  };

  changeLinesSize = newSize => {
    if (Number(newSize) !== null) {
      const live = this.getLivePixels();
      this.setState({ pixelSpace: Number(newSize / 2) }, () => {
        this.drawCanvas();
        live[0].forEach((e, i) => {
          this.toLive(e, live[1][i]);
        });
        localStorage.setItem('pixelSpace', Number(newSize / 2));
      });
    }
  };

  getLivePixels = () => {
    const [canvas, width, height, margin, bgColor, pxSize] = [
      document.getElementById('canvas'),
      this.state.gridWidth,
      this.state.gridHeight,
      this.state.pixelSpace,
      this.state.backgroundPixleColor,
      this.state.pixelSize,
    ];

    const ctx = canvas.getContext('2d');
    const ctxData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const checkLive = p => {
      const findRow = ~~(p / width);
      const findColumn = p - findRow * width;
      const x = ~~(findColumn * (pxSize + margin * 2) + margin + pxSize / 2);
      const y = ~~(findRow * (pxSize + margin * 2) + margin + pxSize / 2);

      const red = y * (canvas.width * 4) + x * 4;
      const color = this.RGBToHex(ctxData[red], ctxData[red + 1], ctxData[red + 2]);
      const isLive = color !== bgColor;
      return { is: isLive, color: color };
    };

    let lives = [[], []];
    for (let i = 0; i < width * height; i++) {
      const check = checkLive(i);
      if (check.is) {
        lives[0].push(i);
        lives[1].push(check.color);
      }
    }
    return lives;
  };

  checkLive = p => {
    const [canvas, width, margin, bgColor, pxSize] = [
      document.getElementById('canvas'),
      this.state.gridWidth,
      this.state.pixelSpace,
      this.state.backgroundPixleColor,
      this.state.pixelSize,
    ];
    const ctx = canvas.getContext('2d');
    const findRow = ~~(p / width);
    const findColumn = p - findRow * width;
    const x = findColumn * (pxSize + margin * 2) + margin;
    const y = findRow * (pxSize + margin * 2) + margin;

    const data = ctx.getImageData(x + pxSize / 2, y + pxSize / 2, 1, 1).data;
    const color = this.RGBToHex(data[0], data[1], data[2]);
    const isLive = color !== bgColor;
    return { is: isLive, color: color };
  };

  checkGameRules = i => {
    let livePixels = 0;
    const [width, height] = [this.state.gridWidth, this.state.gridHeight];
    const firstPixle = Number.isInteger(i / width);
    const lastPixle = Number.isInteger((i + 1) / width);
    const isLive = renderDate.has(i);

    const checkNeighbours = n => {
      if (n >= 0 && n < width * height && renderDate.has(n)) livePixels++;
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

  play = () => {
    if (this.state.pixleColor === this.state.backgroundPixleColor) {
      this.openPopUp('Drawing color and background color should not be the same');
    } else if (!this.state.isPlaying) {
      this.setState({ isPlaying: true });
      if (!this.state.isPaused) {
        this.saveLastPaint();
      }
      renderDate = new Set(this.getLivePixels()[0]);
      interval = setInterval(() => {
        this.renderLifeDeath();
      }, this.state.speed);
    } else this.pauseRender();
  };

  renderLifeDeath = record => {
    const width = this.state.gridWidth;
    const height = this.state.gridHeight;
    const toLive = [];
    const toDeath = [];
    if (record && !renderDate) renderDate = new Set(this.getLivePixels()[0]);

    for (let i = 0; i < width * height; i++) this.checkGameRules(i) ? toLive.push(i) : toDeath.push(i);

    for (let i = 0; i < toLive.length; i++) {
      if (this.state.maintainColorPlay) {
        const index = lastPaint.indexOf(toLive[i]);
        index !== -1 ? this.toLive(toLive[i], lastPaintColors[index]) : this.toLive(toLive[i]);
      } else this.toLive(toLive[i]);
      renderDate.add(toLive[i]);
    }

    for (let i = 0; i < toDeath.length; i++) {
      renderDate.delete(toDeath[i]);
      this.toDeath(toDeath[i]);
    }
  };

  pauseRender = () => {
    if (this.state.isPlaying) {
      clearInterval(interval);
      this.setState({ isPlaying: false, isPaused: true });
      renderDate = null;
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
    const container = document.getElementById('lifeDeathContainer');
    const top = container.getBoundingClientRect().top;
    const left = container.getBoundingClientRect().left;
    document.getElementById('MouseHorizenLine').style.top = `${l.pageY - top - window.scrollY}px`;
    document.getElementById('MouseVerticalLine').style.left = `${l.pageX - left - window.scrollX}px`;
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
  grabColorPlate = l => this.stickyGrapHandle(l, 'colorPlateControlPanel');

  grabWindowHandel = (l, el) => {
    l.preventDefault();
    const grabEl = document.getElementById(el);
    grabEl.style.top = `${l.pageY < 10 ? 10 : l.pageY + windowTop}px`;
    grabEl.style.left = `${l.pageX + windowLeft}px`;
  };
  grabGrid = l => this.grabWindowHandel(l, 'windowContainer');
  grabSave = l => this.grabWindowHandel(l, 'saveWindow');
  grabLoad = l => this.grabWindowHandel(l, 'loadWindow');
  grabConfirm = l => this.grabWindowHandel(l, 'confirmWindow');

  copyToClipBoard = () => {
    this.pauseRender();
    const canvas = document.getElementById('canvas');
    canvas.toBlob(e => {
      navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
        if (result.state === 'granted' || result.state === 'prompt') {
          // eslint-disable-next-line no-undef
          navigator.clipboard.write([new ClipboardItem({ 'image/png': e })]);
        }
      });
    }, 'image/png');
  };

  toggleWindowHandle = el => {
    const winEl = document.getElementById(el);
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
      isWindowOpened = false;
    } else {
      winEl.style.display = 'initial';
      blured.style.display = 'block';
      requestNum({ from: 0, to: 1, easingFunction: 'easeOutQuart', duration: 100 }, s => {
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
      requestNum({ from: 1, to: 0, easingFunction: 'easeInCirc', duration: 100 }, s => {
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
      requestNum({ from: 0, to: 1, easingFunction: 'easeOutQuart', duration: 100 }, s => {
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
    const canvas = document.getElementById('canvas');
    const lives = this.getLivePixels();
    buttons.forEach(e => (e.disabled = true));
    const newSave = {
      livePixels: lives[0],
      pixelsColors: lives[1],
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
    const saved = JSON.parse(localStorage.getItem('saved'));
    this.setState(
      {
        isPaused: false,
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
        this.applyPattren(saved[i].livePixels, saved[i].pixelsColors, saved[i].saveSettings[0]);
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

  findPanelsPos = id => {
    const panels = [
      'controlPanel',
      'gridControlPanel',
      'colorControlPanel',
      'saveControlPanel',
      'moveControlPanel',
      'colorPlateControlPanel',
    ];
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
    if (this.state.paintBuc) {
      const start = Date.now();
      const [canvas, width, height, margin, bgColor, pxSize] = [
        document.getElementById('canvas'),
        this.state.gridWidth,
        this.state.gridHeight,
        this.state.pixelSpace,
        this.state.backgroundPixleColor,
        this.state.pixelSize,
      ];
      const ctx = canvas.getContext('2d');
      const ctxData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      const checkLive = p => {
        const findRow = ~~(p / width);
        const findColumn = p - findRow * width;
        const x = ~~(findColumn * (pxSize + margin * 2) + margin + pxSize / 2);
        const y = ~~(findRow * (pxSize + margin * 2) + margin + pxSize / 2);
        const red = y * (canvas.width * 4) + x * 4;
        const color = this.RGBToHex(ctxData[red], ctxData[red + 1], ctxData[red + 2]);
        const isLive = color !== bgColor;
        return { is: isLive, color: color };
      };
      const correntColor = checkLive(i).color;
      const sameColor = correntColor !== this.state.pixleColor;

      const isEmpty = d => {
        if (d >= 0 && d < width * height) {
          const check = checkLive(d);
          if (this.state.eraser && check.is && check.color === correntColor) {
            return true;
          } else if (!this.state.eraser && check.color === correntColor && sameColor) {
            return true;
          } else return false;
        } else return false;
      };

      const drawn = new Set([]);
      const toDraw = x => {
        if (this.state.eraser) {
          this.toDeath(x);
        } else {
          this.toLive(x);
        }
        drawn.add(x);
      };
      const delay = ms => new Promise(res => setTimeout(res, ms));
      const checkAround = async x => {
        await delay(1);
        const next = x + 1;
        const previous = x - 1;
        const up = x - width;
        const down = x + width;
        if (isEmpty(next) && !Number.isInteger((x + 1) / width) && !drawn.has(next)) {
          toDraw(next);
          checkAround(next);
        }
        if (isEmpty(previous) && !Number.isInteger(x / width) && !drawn.has(previous)) {
          toDraw(previous);
          checkAround(previous);
        }
        if (isEmpty(up) && ~~(x / width) !== 0 && !drawn.has(up)) {
          toDraw(up);
          checkAround(up);
        }
        if (isEmpty(down) && ~~(x / width) !== height && !drawn.has(down)) {
          toDraw(down);
          checkAround(down);
        }
        if (x === 0) console.log((Date.now() - start) / 1000);
      };
      toDraw(i);
      checkAround(i);
    }
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
    const perSquare = this.state.pixelSize + this.state.pixelSpace * 2;
    if (e.movementX < 0 && drawDir === 'x' && xDif !== ~~((xPos - e.x) / perSquare)) {
      this.state.eraser ? this.toDeath(dirElem) : this.toLive(dirElem);
      this.symmetricalX(dirElem);
      this.symmetricalY(dirElem);
      if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(dirElem));
      xDif = ~~((xPos - e.x) / perSquare);
      dirElem = dirElem - 1;
    } else if (e.movementX > 0 && drawDir === 'x' && xDif !== ~~((e.x - xPos) / perSquare)) {
      this.state.eraser ? this.toDeath(dirElem) : this.toLive(dirElem);
      this.symmetricalX(dirElem);
      this.symmetricalY(dirElem);
      if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(dirElem));
      xDif = ~~((e.x - xPos) / perSquare);
      dirElem = dirElem + 1;
    } else if (e.movementY < 0 && drawDir === 'y' && yDif !== ~~((yPos - e.y) / perSquare)) {
      this.state.eraser ? this.toDeath(dirElem) : this.toLive(dirElem);
      this.symmetricalX(dirElem);
      this.symmetricalY(dirElem);
      if (this.state.symmetricalY && this.state.symmetricalX) this.symmetricalX(this.symmetricalY(dirElem));
      yDif = ~~((yPos - e.y) / perSquare);
      dirElem = dirElem - this.state.gridWidth;
    } else if (e.movementY > 0 && drawDir === 'y' && yDif !== ~~((e.y - yPos) / perSquare)) {
      this.state.eraser ? this.toDeath(dirElem) : this.toLive(dirElem);
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
    const width = this.state.gridWidth;
    const lives = this.getLivePixels();
    let row = lives[0];
    let colors = lives[1];

    this.drawCanvas();
    if (dir === 'up') {
      row.forEach((e, x) => this.toLive(e - width, colors[x]));
    } else if (dir === 'down') {
      row.forEach((e, x) => this.toLive(e + width, colors[x]));
    } else if (dir === 'left') {
      row.forEach((e, x) => this.toLive(e - 1, colors[x]));
    } else if (dir === 'right') {
      row.forEach((e, x) => this.toLive(e + 1, colors[x]));
    }
  };

  autoFill = () => {
    const img = document.getElementById('img');
    const can = document.getElementById('can');
    const canvas = document.getElementById('canvas');
    const fromLeft = img.getBoundingClientRect().left;
    const fromTop = img.getBoundingClientRect().top;
    const [margin, pxSize] = [this.state.pixelSpace, this.state.pixelSize];

    can.width = img.width;
    can.height = img.height;
    can.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    const ctx = canvas.getContext('2d');

    const copy = (x, y) => {
      const nx = x + canvas.getBoundingClientRect().left + pxSize / 2 - fromLeft;
      const ny = y + canvas.getBoundingClientRect().top + pxSize / 2 - fromTop;
      if (nx <= can.width && nx >= 0 && ny <= can.height && ny >= 0) {
        const p = can.getContext('2d').getImageData(nx, ny, 1, 1).data;
        const color = p[3] / 255 === 0 ? this.RGBToHex(p[0], p[1], p[2]) + '00' : this.RGBToHex(p[0], p[1], p[2]);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, pxSize, pxSize);
      }
    };
    for (let x = margin; x < canvas.width; x = x + (margin * 2 + pxSize)) {
      copy(x, margin);
      for (let y = margin * 3 + pxSize; y < canvas.height; y = y + (margin * 2 + pxSize)) {
        copy(x, y);
      }
    }

    this.readDrawing();
  };

  imageColorPic = e => {
    let color;
    const layer = document.getElementById('imageLayer');
    if (this.state.isColorCopy && window.getComputedStyle(layer).display === 'block') {
      const img = document.getElementById('img');
      const canvas = document.getElementById('can');
      xColor = e.clientX - img.getBoundingClientRect().left;
      yColor = e.clientY - img.getBoundingClientRect().top;

      if (img.width === canvas.width && img.height === canvas.height) {
        const p = canvas.getContext('2d').getImageData(xColor, yColor, 1, 1).data;
        color = p[3] / 255 === 0 ? this.RGBToHex(p[0], p[1], p[2]) + '00' : this.RGBToHex(p[0], p[1], p[2]);
        console.log(color);
        this.setState({ pixleColor: color });
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        const p = canvas.getContext('2d').getImageData(xColor, yColor, 1, 1).data;
        color = this.RGBToHex(p[0], p[1], p[2]);
      }
      this.setState({ pixleColor: color });
    }
  };

  RGBToHex = (r, g, b) => {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length === 1) r = '0' + r;
    if (g.length === 1) g = '0' + g;
    if (b.length === 1) b = '0' + b;

    return '#' + r + g + b;
  };

  getTransparentCanvas = () => {
    const [canvas, can, margin, pxSize] = [
      document.getElementById('canvas'),
      document.getElementById('can'),
      this.state.pixelSpace,
      this.state.pixelSize,
    ];
    const lives = this.getLivePixels();
    can.width = canvas.width;
    can.height = canvas.height;
    const ctx = can.getContext('2d');
    if (margin !== 0) ctx.translate(0.5, 0.5);
    lives[0].forEach((e, i) => {
      const pos = this.getPos(e);
      ctx.fillStyle = lives[1][i];
      ctx.fillRect(pos.x, pos.y, pxSize, pxSize);
    });
  };

  saveLastPaint = () => {
    const lives = this.getLivePixels();
    lastPaint = lives[0];
    lastPaintColors = lives[1];
    lastPaintGrid = [this.state.gridWidth, this.state.gridHeight];
    localStorage.setItem('lastPaint', JSON.stringify(lives[0]));
    localStorage.setItem('lastPaintColors', JSON.stringify(lives[1]));
    localStorage.setItem('lastPaintGrid', JSON.stringify(lastPaintGrid));
  };

  windowOpen = boolean => (isWindowOpened = boolean);
  restRenderData = () => (renderDate = null);
  checkColorsBefroRender = () =>
    this.state.pixleColor === this.state.backgroundPixleColor
      ? this.openPopUp('Drawing color and background color should not be the same')
      : true;

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

          <button className='buttons' onClick={this.drawCanvas} title='Reset'>
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
                  extractColors(e.target.result, { saturationImportance: 0, splitPower: 5, distance: 0.1, pixels: 100 })
                    .then(e => {
                      this.setState({ colorPlate: e.map((c, i) => <ColorPlate key={i} color={c.hex} that={this} />) });
                    })
                    .catch(console.log);
                  document.getElementById('imageLayer').style.display = 'block';
                  document.getElementById('colorPlateControlPanel').style.display = 'block';
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
          <button
            className='buttons'
            style={{
              backgroundColor: this.state.maintainColorPlay ? '#383838' : 'initial',
              border: this.state.maintainColorPlay ? 'solid 1px #636363' : 'none',
            }}
            title='Maintain Colors while playing if possible'
            onClick={() => {
              this.state.maintainColorPlay
                ? this.setState({ maintainColorPlay: false })
                : this.setState({ maintainColorPlay: true });
            }}
          >
            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
              <path d='M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' />
            </svg>
          </button>
          <p className='controlLabel'>Maintain</p>
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
            id='inputWidth'
            className='inputNumber'
            type='number'
            title='How many squares per row'
            min='5'
            max='1000'
            value={this.state.gridWidth}
            disabled={this.state.isPlaying}
            onChange={e => this.changeGridWidth(e.target.value)}
            onClick={e => e.target.select()}
            onKeyDown={e => {
              const el = document.getElementById('inputWidthType');
              el.style.display = 'block';
              e.target.style.display = 'none';
              el.value = this.state.gridWidth;
              el.select();
            }}
          ></input>
          <input
            id='inputWidthType'
            className='inputNumber'
            type='number'
            title='How many squares per row'
            min='5'
            max='1000'
            disabled={this.state.isPlaying}
            style={{ display: 'none' }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                this.changeGridWidth(e.target.value);
                e.target.style.display = 'none';
                document.getElementById('inputWidth').style.display = 'block';
              }
            }}
            onBlur={e => {
              this.changeGridWidth(e.target.value);
              e.target.style.display = 'none';
              document.getElementById('inputWidth').style.display = 'block';
            }}
          ></input>
          <p className='controlLabel'>Per Row</p>
          <input
            id='inputHeight'
            className='inputNumber'
            type='number'
            title='How many squares per column'
            min='5'
            max='1000'
            value={this.state.gridHeight}
            disabled={this.state.isPlaying}
            onChange={e => this.changeGridHeight(e.target.value)}
            onClick={e => e.target.select()}
            onKeyDown={e => {
              const el = document.getElementById('inputHeightType');
              el.style.display = 'block';
              e.target.style.display = 'none';
              el.value = this.state.gridWidth;
              el.select();
            }}
          ></input>
          <input
            id='inputHeightType'
            className='inputNumber'
            type='number'
            title='How many squares per column'
            min='5'
            max='1000'
            disabled={this.state.isPlaying}
            style={{ display: 'none' }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                this.changeGridHeight(e.target.value);
                e.target.style.display = 'none';
                document.getElementById('inputHeight').style.display = 'block';
              }
            }}
            onBlur={e => {
              this.changeGridHeight(e.target.value);
              e.target.style.display = 'none';
              document.getElementById('inputHeight').style.display = 'block';
            }}
          ></input>
          <p className='controlLabel'>Per Column</p>

          <input
            id='inputPSize'
            className='inputNumber'
            type='number'
            title='Square size in px'
            min='1'
            max='50'
            value={this.state.pixelSize}
            onChange={e => this.changePixelSize(e.target.value)}
            onClick={e => e.target.select()}
            onKeyDown={e => {
              const el = document.getElementById('inputPSizeType');
              el.style.display = 'block';
              e.target.style.display = 'none';
              el.value = this.state.gridWidth;
              el.select();
            }}
          ></input>
          <input
            id='inputPSizeType'
            className='inputNumber'
            type='number'
            title='Square size in px'
            min='1'
            max='50'
            style={{ display: 'none' }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                this.changePixelSize(e.target.value);
                e.target.style.display = 'none';
                document.getElementById('inputPSize').style.display = 'block';
              }
            }}
            onBlur={e => {
              this.changePixelSize(e.target.value);
              e.target.style.display = 'none';
              document.getElementById('inputPSize').style.display = 'block';
            }}
          ></input>
          <p className='controlLabel'>Square Size</p>

          <input
            id='inputMargin'
            className='inputNumber'
            type='number'
            title='Between squares space in px'
            min='0'
            max='10'
            step='0.5'
            value={this.state.pixelSpace * 2}
            onChange={e => this.changeLinesSize(e.target.value)}
            onClick={e => e.target.select()}
            onKeyDown={e => {
              const el = document.getElementById('inputMarginType');
              el.style.display = 'block';
              e.target.style.display = 'none';
              el.value = this.state.gridWidth;
              el.select();
            }}
          ></input>
          <input
            id='inputMarginType'
            className='inputNumber'
            type='number'
            title='Between squares space in px'
            min='0'
            max='10'
            step='0.5'
            style={{ display: 'none' }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                this.changeLinesSize(e.target.value);
                e.target.style.display = 'none';
                document.getElementById('inputMargin').style.display = 'block';
              }
            }}
            onBlur={e => {
              this.changeLinesSize(e.target.value);
              e.target.style.display = 'none';
              document.getElementById('inputMargin').style.display = 'block';
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
              this.changePixelColor(e.target.value);

              // const pixels = document.querySelectorAll('#lifeDeathContainer > div:not([data-live=true])');
              // pixels.forEach(el => (el.style.backgroundColor = e.target.value));
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
              this.setState({ SymmetryLinesColor: e.target.value }, () => {
                this.drawSym();
                localStorage.setItem('SymmetryLinesColor', e.target.value);
              });
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

        <div id='colorPlateControlPanel' className='controlPanel'>
          <div
            id='grabPad'
            onMouseDown={e => {
              const el = document.getElementById('colorPlateControlPanel');
              this.findPanelsPos('colorPlateControlPanel');
              windowLeft = el.getBoundingClientRect().left - e.clientX;
              windowTop = el.getBoundingClientRect().top - e.clientY;
              window.addEventListener('mousemove', this.grabColorPlate);
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
            title='Copy the image layer to your grid, make sure there are the same size'
            onClick={this.autoFill}
          >
            <svg width='20' height='20' xmlns='http://www.w3.org/2000/svg' fillRule='evenodd' clipRule='evenodd' fill='#D7D7D7'>
              <path d='M22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z' />
            </svg>
          </button>
          <p className='controlLabel'>Auto fill</p>
          <button
            className='buttons'
            style={{
              backgroundColor: this.state.isColorCopy ? '#383838' : 'initial',
              border: this.state.isColorCopy ? 'solid 1px #636363' : 'none',
            }}
            title='Copy color from image layer'
            onClick={() =>
              this.state.isColorCopy ? this.setState({ isColorCopy: false }) : this.setState({ isColorCopy: true })
            }
          >
            <svg width='20' height='20' xmlns='http://www.w3.org/2000/svg' fillRule='evenodd' clipRule='evenodd' fill='#D7D7D7'>
              <path d='M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z' />
            </svg>
          </button>
          <p className='controlLabel'>Copy</p>
          <div className='devider'></div>
          <p className='controlLabel'>Image colors</p>
          {this.state.colorPlate}
        </div>

        <PopUp windowOpen={this.windowOpen}></PopUp>

        <DownloadWindow
          pauseRender={this.pauseRender}
          renderLifeDeath={this.renderLifeDeath}
          gridWidth={this.state.gridWidth}
          gridHeight={this.state.gridHeight}
          pixelSize={this.state.pixelSize}
          pixelSpace={this.state.pixelSpace}
          getTransparentCanvas={this.getTransparentCanvas}
          restRenderData={this.restRenderData}
          checkColor={this.checkColorsBefroRender}
          saveLastPaint={this.saveLastPaint}
        ></DownloadWindow>

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

        <ImageWindow></ImageWindow>

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
                document.getElementById('MouseHorizenLine').style.display = 'block';
                document.getElementById('MouseVerticalLine').style.display = 'block';
                window.addEventListener('mousemove', this.trackMouse);
              }
            }}
          >
            <canvas id='canvas' style={{ backgroundColor: this.state.betweenPixleColor }}></canvas>

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
        <canvas id='can' style={{ display: 'none' }}></canvas>
      </>
    );
  }
}

function ColorPlate(props) {
  return (
    <button
      className='colorPlateButtons'
      style={{ backgroundColor: props.color }}
      onClick={() => {
        props.that.setState({ pixleColor: props.color });
      }}
    ></button>
  );
}
