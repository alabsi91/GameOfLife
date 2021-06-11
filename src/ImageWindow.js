import React, { Component } from 'react';

let windowLeft, windowTop, forResize;

export default class ImageWindow extends Component {
  componentDidMount() {
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', this.grabLayer);
      window.removeEventListener('mousemove', this.imgResizeCorner);
      window.removeEventListener('mousemove', this.imgResizeHeight);
      window.removeEventListener('mousemove', this.imgResizeWidth);
    });
  }

  grabLayer = l => {
    l.preventDefault();
    const grabEl = document.getElementById('imageLayer');
    grabEl.style.top = `${l.pageY < 10 ? 10 : l.pageY + windowTop}px`;
    grabEl.style.left = `${l.pageX + windowLeft}px`;
    };
    
  imgResizeCorner = e => {
    e.preventDefault();
    const aspect = forResize[1] / forResize[0];
    const width = forResize[0] + (e.clientX - forResize[2] + e.clientY - forResize[3]) / 1.5;
    document.getElementById('img').style.height = width * aspect + 'px';
    document.getElementById('img').style.width = width + 'px';
  };

  imgResizeHeight = e => {
    e.preventDefault();
    document.getElementById('img').style.height = forResize[1] + (e.clientY - forResize[3]) + 'px';
  };

  imgResizeWidth = e => {
    e.preventDefault();
    document.getElementById('img').style.width = forResize[0] + (e.clientX - forResize[2]) + 'px';
  };

  render() {
    return (
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
        <div id='sideImgResize'>
          <svg
            id='resizeWidth'
            title='Resize'
            onMouseDown={e => {
              const img = document.getElementById('img');
              forResize = [img.getBoundingClientRect().width, img.getBoundingClientRect().height, e.clientX, e.clientY];
              img.style.height = forResize[1] + 'px';
              window.addEventListener('mousemove', this.imgResizeWidth);
            }}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 10 40'
          >
            <circle cx='5' cy='5' r='5' />
            <circle cx='5' cy='20' r='5' />
            <circle cx='5' cy='35' r='5' />
          </svg>
        </div>
        <div id='imgResize'>
          <svg
            id='resizeCorner'
            onMouseDown={e => {
              const img = document.getElementById('img');
              forResize = [img.getBoundingClientRect().width, img.getBoundingClientRect().height, e.clientX, e.clientY];
              window.addEventListener('mousemove', this.imgResizeCorner);
            }}
            title='Resize'
            version='1.1'
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

          <svg
            id='resizeHeight'
            title='Resize'
            onMouseDown={e => {
              const img = document.getElementById('img');
              forResize = [img.getBoundingClientRect().width, img.getBoundingClientRect().height, e.clientX, e.clientY];
              img.style.width = img.getBoundingClientRect().width + 'px';
              window.addEventListener('mousemove', this.imgResizeHeight);
            }}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 10 40'
          >
            <circle cx='5' cy='5' r='5' />
            <circle cx='5' cy='20' r='5' />
            <circle cx='5' cy='35' r='5' />
          </svg>
        </div>
      </div>
    );
  }
}
