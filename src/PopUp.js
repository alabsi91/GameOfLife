import React, { Component } from 'react';
import { requestFrame } from 'selector_dom';

let windowLeft, windowTop;
export default class PopUp extends Component {
  componentDidMount() {
    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', this.grabPopUp));
  }

  grabPopUp = l => {
    l.preventDefault();
    const grabEl = document.getElementById('popUp');
    grabEl.style.top = `${l.pageY < 10 ? 10 : l.pageY + windowTop}px`;
    grabEl.style.left = `${l.pageX + windowLeft}px`;
  };

  togglePopUp = () => {
    const winEl = document.getElementById('popUp');
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
    } else {
      winEl.style.display = 'initial';
      blured.style.display = 'block';
      requestFrame({ from: 0, to: 1, easingFunction: 'easeOutQuart', duration: 100 }, s => {
        winEl.style.transform = `scale(${s})`;
        blured.style.opacity = s;
      });
    }
  };

  render() {
    return (
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
    );
  }
}
