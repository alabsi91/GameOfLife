(this["webpackJsonpgame-of-life"]=this["webpackJsonpgame-of-life"]||[]).push([[0],{12:function(e,t,a){},14:function(e,t,a){"use strict";a.r(t);var i,l,s,r=a(1),o=a.n(r),n=a(3),c=a.n(n),d=(a(12),a(4)),h=a(5),u=a(7),m=a(6),g={gliderGun:[240,241,301,300,310,250,370,191,431,492,493,132,133,314,195,435,256,316,376,317,322,261,201,141,140,200,260,82,84,24,324,384,154,155,214,215],simkinGliderGun:[61,62,122,121,68,128,129,69,246,245,305,306,802,742,682,623,624,803,804,626,627,688,749,808,867,752,753,813,812,1102,1101,1161,1222,1223,1224,1284],HeavyWeightSpaceship:[300,180,121,122,123,124,125,126,186,246,305,363,362],MiddleWeightSpaceship:[60,180,241,242,243,244,245,185,125,64,2],LightWeightSpaceship:[240,120,61,62,63,64,124,184,243],PentaDecathlon:[123,124,125,64,4,303,304,305,364,424,484,544,603,604,605,783,784,785,844,904],pulsar:[181,241,301,363,364,365,306,246,186,65,64,63,188,248,308,369,370,371,69,70,71,313,253,193,483,484,485,546,606,666,489,491,490,548,668,608,541,601,661,553,613,673,790,791,789,785,784,783],omarDrawing:[180,181,182,186,187,188,241,247,304,364,424,484,602,603,604,605,606,661,667]},p=a(0),v=[],x=[],b=function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(){var e;Object(d.a)(this,a);for(var r=arguments.length,o=new Array(r),n=0;n<r;n++)o[n]=arguments[n];return(e=t.call.apply(t,[this].concat(o))).state={isPlaying:!1,isPaused:!1,drwaMode:!1,isRandomColor:!1,symmetricalX:!1,symmetricalY:!1,eraser:!1,speed:localStorage.getItem("speed")?Number(localStorage.getItem("speed")):100,pixelSize:localStorage.getItem("pixelSize")?Number(localStorage.getItem("pixelSize")):14,gridWidth:localStorage.getItem("gridWidth")?Number(localStorage.getItem("gridWidth")):61,pixelSpace:localStorage.getItem("pixelSpace")?Number(localStorage.getItem("pixelSpace")):.5,pixleColor:localStorage.getItem("pixleColor")?localStorage.getItem("pixleColor"):"#ffffff",betweenPixleColor:localStorage.getItem("betweenPixleColor")?localStorage.getItem("betweenPixleColor"):"#282828",SymmetryLinesColor:localStorage.getItem("SymmetryLinesColor")?localStorage.getItem("SymmetryLinesColor"):"#868686",backgroundPixleColor:localStorage.getItem("backgroundPixleColor")?localStorage.getItem("backgroundPixleColor"):"#000000"},e.keyboardShourtcuts=function(){window.addEventListener("keyup",(function(t){t.ctrlKey&&"z"===t.key.toLowerCase()&&v.length>0&&!e.state.drwaMode?e.undo():t.ctrlKey&&"y"===t.key.toLowerCase()&&x.length>0&&!e.state.drwaMode?e.redo():"e"!==t.key.toLowerCase()||e.state.drwaMode||(e.state.eraser?e.setState({eraser:!1}):e.setState({eraser:!0}))}))},e.undo=function(){v.length>0&&("Death"===v[v.length-1][0]?v[v.length-1].forEach((function(t){return"Death"!==t?e.toDeath(t):""})):v[v.length-1].forEach((function(t){return"Live"!==t?e.toLive(t):""})),x.push(v[v.length-1]),v.splice(v.length-1))},e.redo=function(){x.length>0&&("Death"===x[x.length-1][0]?x[x.length-1].forEach((function(t){"Death"!==t&&(e.state.isRandomColor?t.style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):t.style.backgroundColor=e.state.pixleColor,t.dataset.live="true")})):x[x.length-1].forEach((function(t){"Live"!==t&&(t.style.backgroundColor=e.state.backgroundPixleColor,t.removeAttribute("data-live"))})),v.push(x[x.length-1]),x.splice(x.length-1))},e.applyPattren=function(t,a,i,l){var s=document.querySelectorAll(".lifeDeathPixels");s.forEach((function(t){t.style.backgroundColor=e.state.backgroundPixleColor,t.removeAttribute("data-live")}));var r=e.state.gridWidth-a,o=(i?~~(e.state.gridWidth/2)-i:0)+(l?~~e.state.gridWidth*(~~(e.state.gridWidth/2)-l):0);t.forEach((function(t){var i=Math.floor(t/a)*r;e.state.isRandomColor?s[t+i+o].style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):s[t+i+o].style.backgroundColor=e.state.pixleColor,s[t+i+o].dataset.live="true"}))},e.symmetricalX=function(t,a){if(e.state.symmetricalX){var i=~~(t/e.state.gridWidth)*e.state.gridWidth+Math.floor(e.state.gridWidth/2),l=Number.isInteger(e.state.gridWidth/2)?i-(t-i+1):i-(t-i),s=document.querySelectorAll('.lifeDeathPixels[data-pos="'.concat(l,'"]'))[0];a?e.toDeath(s):e.toLive(s)}},e.symmetricalY=function(t,a){if(e.state.symmetricalY){var i=~~(t/e.state.gridWidth),l=Math.floor(e.state.gridWidth/2)-i,s=Number.isInteger(e.state.gridWidth/2)?t+l*e.state.gridWidth*2-e.state.gridWidth:t+l*e.state.gridWidth*2,r=document.querySelectorAll('.lifeDeathPixels[data-pos="'.concat(s,'"]'))[0];return a?e.toDeath(r):e.toLive(r),s}},e.appendDivs=function(t){for(var a=document.getElementById("lifeDeathContainer"),i=function(t){var i=document.createElement("div");i.className="lifeDeathPixels",i.dataset.pos=t,i.style.margin=e.state.pixelSpace+"px",i.style.backgroundColor=e.state.backgroundPixleColor,i.style.width=e.state.pixelSize+"px",i.style.height=e.state.pixelSize+"px",i.addEventListener("mouseenter",(function(a){e.state.drwaMode&&!e.state.eraser?(e.symmetricalX(t),e.symmetricalY(t),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t)),e.toLive(a.target)):e.state.drwaMode&&e.state.eraser&&(e.symmetricalX(t,!0),e.symmetricalY(t,!0),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t,!0),!0),e.toDeath(a.target))})),i.addEventListener("mousedown",(function(a){v.push([]),x=[],e.state.isPlaying||e.state.eraser?!e.state.isPlaying&&e.state.eraser&&(v[v.length-1].push("Live"),e.symmetricalX(t,!0),e.symmetricalY(t,!0),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t,!0),!0),e.toDeath(a.target)):(v[v.length-1].push("Death"),e.symmetricalX(t),e.symmetricalY(t),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t)),e.toLive(a.target))})),a.appendChild(i)},l=0;l<Math.pow(t,2);l++)i(l)},e.checkliveOrDead=function(t){var a=document.getElementsByClassName("lifeDeathPixels"),i=0,l=e.state.gridWidth,s="true"===a[t].dataset.live,r=Number.isInteger(t/l),o=Number.isInteger((t+1)/l),n=function(e){var t;"true"===(null===(t=a[e])||void 0===t?void 0:t.dataset.live)&&i++};return o||n(t+1),r||n(t-1),n(t+l),o||n(t+l+1),r||n(t+l-1),n(t-l),o||n(t-l+1),r||n(t-l-1),!(s&&i<2)&&(!(!s||2!==i&&3!==i)||!(s&&i>3)&&(!s&&3===i||void 0))},e.toLive=function(t){"true"!==t.dataset.live&&(v[v.length-1].push(t),e.state.isRandomColor?t.style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):t.style.backgroundColor=e.state.pixleColor,t.dataset.live="true")},e.toDeath=function(t){"true"===t.dataset.live&&(v[v.length-1].push(t),t.style.backgroundColor=e.state.backgroundPixleColor,t.removeAttribute("data-live"))},e.play=function(){e.setState({isPlaying:!0});var t=document.querySelectorAll('.lifeDeathPixels[data-live="true"]');if(!e.state.isPlaying){if(!e.state.isPaused){var a=[];t.forEach((function(e){return a.push(Number(e.dataset.pos))})),l=a,s=e.state.gridWidth,localStorage.setItem("lastPaint",JSON.stringify(a)),localStorage.setItem("lastPaintGrid",e.state.gridWidth)}i=setInterval((function(){e.renderLifeDeath()}),e.state.speed)}},e.renderLifeDeath=function(){for(var t=document.getElementsByClassName("lifeDeathPixels"),a=[],i=[],l=0;l<t.length;l++)e.checkliveOrDead(l)?a.push(l):i.push(l),l===t.length-1&&(a.forEach((function(a){e.state.isRandomColor?t[a].style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):t[a].style.backgroundColor=e.state.pixleColor,t[a].dataset.live="true"})),i.forEach((function(a){t[a].style.backgroundColor=e.state.backgroundPixleColor,t[a].removeAttribute("data-live")})))},e.resetRender=function(){clearInterval(i),v.push([]),document.querySelectorAll(".lifeDeathPixels[data-live=true]").forEach((function(t){return e.toDeath(t)})),e.setState({isPlaying:!1})},e.pauseRender=function(){clearInterval(i),e.setState({isPlaying:!1,isPaused:!0})},e.renderLast=function(){if(clearInterval(i),e.setState({isPlaying:!1}),l)s>e.state.gridWidth?alert("can't retrive last paint, current grid size is smaller than ".concat(s)):s!==e.state.gridWidth?(alert("this paint was painted orginaly on ".concat(s," grid")),e.applyPattren(l,s)):e.applyPattren(l,s);else if(localStorage.getItem("lastPaint")){var t=JSON.parse(localStorage.getItem("lastPaint")),a=Number(localStorage.getItem("lastPaintGrid"));a>e.state.gridWidth?alert("can't retrive last paint, current grid size is smaller than ".concat(a)):e.applyPattren(t,a)}else alert("Last Paint Not found")},e.trackMouse=function(e){document.getElementById("MouseHorizenLine").style.top="".concat(e.clientY,"px"),document.getElementById("MouseverticalLine").style.left="".concat(e.clientX,"px")},e.grabPanel=function(e){var t=document.getElementById("controlPanel");t.style.top="".concat(e.clientY,"px"),t.style.left="".concat(e.clientX,"px")},e}return Object(h.a)(a,[{key:"componentDidMount",value:function(){if(this.appendDivs(this.state.gridWidth),localStorage.getItem("lastPaint")){var e=JSON.parse(localStorage.getItem("lastPaint")),t=Number(localStorage.getItem("lastPaintGrid"));t>this.state.gridWidth?alert("can't retrive last paint, current grid size is smaller than ".concat(t)):this.applyPattren(e,t)}this.keyboardShourtcuts()}},{key:"render",value:function(){var e=this;return Object(p.jsxs)(p.Fragment,{children:[Object(p.jsxs)("div",{id:"controlPanel",children:[Object(p.jsx)("div",{id:"grabPad",onMouseDown:function(t){return window.addEventListener("mousemove",e.grabPanel)},onMouseUp:function(t){return window.removeEventListener("mousemove",e.grabPanel)},children:Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M20,9H4v2h16V9z M4,15h16v-2H4V15z"})})}),Object(p.jsx)("div",{className:"devider"}),Object(p.jsxs)("div",{id:"undoredoContainer",children:[Object(p.jsx)("button",{onClick:this.undo,title:"undo (Ctrl + z)",children:Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"20px",viewBox:"0 0 24 24",width:"20px",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"})})}),Object(p.jsx)("button",{onClick:this.redo,title:"redo (Ctrl + y)",children:Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"20px",viewBox:"0 0 24 24",width:"20px",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"})})})]}),Object(p.jsx)("div",{className:"devider"}),Object(p.jsxs)("button",{className:"buttons",title:this.state.isPlaying?"Pause":"play",onClick:this.state.isPlaying?this.pauseRender:this.play,style:{backgroundColor:this.state.isPlaying?"#383838":"initial",border:this.state.isPlaying?"solid 1px #636363":"none"},children:[Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",style:{display:this.state.isPlaying?"none":"initial"},children:Object(p.jsx)("path",{d:"M8 5v14l11-7z"})}),Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",style:{display:this.state.isPlaying?"initial":"none"},children:Object(p.jsx)("path",{d:"M6 19h4V5H6v14zm8-14v14h4V5h-4z"})})]}),Object(p.jsx)("button",{className:"buttons",onClick:this.renderLast,title:"Last Drawing",children:Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"})})}),Object(p.jsx)("button",{className:"buttons",onClick:this.resetRender,title:"Reset",children:Object(p.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:[Object(p.jsx)("path",{d:"M12,5V2L8,6l4,4V7c3.31,0,6,2.69,6,6c0,2.97-2.17,5.43-5,5.91v2.02c3.95-0.49,7-3.85,7-7.93C20,8.58,16.42,5,12,5z"}),Object(p.jsx)("path",{d:"M6,13c0-1.65,0.67-3.15,1.76-4.24L6.34,7.34C4.9,8.79,4,10.79,4,13c0,4.08,3.05,7.44,7,7.93v-2.02 C8.17,18.43,6,15.97,6,13z"})]})}),Object(p.jsx)("button",{className:"buttons",style:{backgroundColor:this.state.eraser?"#383838":"initial",border:this.state.eraser?"solid 1px #636363":"none"},title:"Eraser (e)",onClick:function(){return e.state.eraser?e.setState({eraser:!1}):e.setState({eraser:!0})},children:Object(p.jsx)("svg",{width:"24",height:"24",xmlns:"http://www.w3.org/2000/svg",fillRule:"evenodd",clipRule:"evenodd",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M5.662 23l-5.369-5.365c-.195-.195-.293-.45-.293-.707 0-.256.098-.512.293-.707l14.929-14.928c.195-.194.451-.293.707-.293.255 0 .512.099.707.293l7.071 7.073c.196.195.293.451.293.708 0 .256-.097.511-.293.707l-11.216 11.219h5.514v2h-12.343zm3.657-2l-5.486-5.486-1.419 1.414 4.076 4.072h2.829zm.456-11.429l-4.528 4.528 5.658 5.659 4.527-4.53-5.657-5.657z"})})}),Object(p.jsx)("button",{className:"buttons",style:{backgroundColor:this.state.symmetricalX?"#383838":"initial",border:this.state.symmetricalX?"solid 1px #636363":"none"},title:"Vertical Lines of Symmetry",onClick:function(){e.state.symmetricalX?e.setState({symmetricalX:!1}):e.setState({symmetricalX:!0})},children:Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M3 9h2V7H3v2zm0-4h2V3H3v2zm4 16h2v-2H7v2zm0-8h2v-2H7v2zm-4 0h2v-2H3v2zm0 8h2v-2H3v2zm0-4h2v-2H3v2zM7 5h2V3H7v2zm12 12h2v-2h-2v2zm-8 4h2V3h-2v18zm8 0h2v-2h-2v2zm0-8h2v-2h-2v2zm0-10v2h2V3h-2zm0 6h2V7h-2v2zm-4-4h2V3h-2v2zm0 16h2v-2h-2v2zm0-8h2v-2h-2v2z"})})}),Object(p.jsx)("button",{className:"buttons",style:{backgroundColor:this.state.symmetricalY?"#383838":"initial",border:this.state.symmetricalY?"solid 1px #636363":"none"},title:"Horizontal Lines of Symmetry",onClick:function(){e.state.symmetricalY?e.setState({symmetricalY:!1}):e.setState({symmetricalY:!0})},children:Object(p.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M3 21h2v-2H3v2zM5 7H3v2h2V7zM3 17h2v-2H3v2zm4 4h2v-2H7v2zM5 3H3v2h2V3zm4 0H7v2h2V3zm8 0h-2v2h2V3zm-4 4h-2v2h2V7zm0-4h-2v2h2V3zm6 14h2v-2h-2v2zm-8 4h2v-2h-2v2zm-8-8h18v-2H3v2zM19 3v2h2V3h-2zm0 6h2V7h-2v2zm-8 8h2v-2h-2v2zm4 4h2v-2h-2v2zm4 0h2v-2h-2v2z"})})}),Object(p.jsx)("div",{className:"devider"}),Object(p.jsx)("input",{id:"rangeInput",type:"range",title:'Refresh every "ms"',value:this.state.speed,min:"1",max:"300",disabled:this.state.isPlaying,onChange:function(t){t.preventDefault(),e.setState({speed:t.target.value}),localStorage.setItem("speed",t.target.value)}}),Object(p.jsx)("p",{className:"controlLabel",children:"Speed"}),Object(p.jsx)("div",{className:"devider"}),Object(p.jsx)("input",{className:"inputNumber",type:"number",title:"Grid Size",min:"20",max:"100",value:this.state.gridWidth,disabled:this.state.isPlaying,onChange:function(t){e.setState({gridWidth:Number(t.target.value)}),document.querySelectorAll(".lifeDeathPixels").forEach((function(e){return e.remove()})),e.appendDivs(Number(t.target.value)),localStorage.setItem("gridWidth",Number(t.target.value)),v=[]}}),Object(p.jsx)("p",{className:"controlLabel",children:"Grid Size"}),Object(p.jsx)("input",{className:"inputNumber",type:"number",title:"Pixel Size",min:"1",max:"20",value:this.state.pixelSize,onChange:function(t){e.setState({pixelSize:Number(t.target.value)}),document.querySelectorAll(".lifeDeathPixels").forEach((function(e){e.style.width=t.target.value+"px",e.style.height=t.target.value+"px"})),localStorage.setItem("pixelSize",Number(t.target.value))}}),Object(p.jsx)("p",{className:"controlLabel",children:"Pixels Size"}),Object(p.jsx)("input",{className:"inputNumber",type:"number",title:"Between Pixels Space",min:"0",max:"5",step:"0.1",value:this.state.pixelSpace,onChange:function(t){e.setState({pixelSpace:Number(t.target.value)}),document.querySelectorAll(".lifeDeathPixels").forEach((function(e){e.style.margin=t.target.value+"px"})),localStorage.setItem("pixelSpace",Number(t.target.value))}}),Object(p.jsx)("p",{className:"controlLabel",children:"Grid Lines"}),Object(p.jsx)("div",{className:"devider"}),Object(p.jsx)("button",{className:"randomColors",style:{backgroundColor:this.state.isRandomColor?"#383838":"initial",border:this.state.isRandomColor?"solid 1px #636363":"none"},title:"Random Colors",onClick:function(){return e.state.isRandomColor?e.setState({isRandomColor:!1}):e.setState({isRandomColor:!0})},children:Object(p.jsx)("svg",{width:"20",height:"20",xmlns:"http://www.w3.org/2000/svg",fillRule:"evenodd",clipRule:"evenodd",fill:"#D7D7D7",children:Object(p.jsx)("path",{d:"M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"})})}),Object(p.jsx)("p",{className:"controlLabel",children:"Random"}),Object(p.jsx)("input",{className:"inputColor",type:"color",title:"Pixel Color",value:this.state.pixleColor,onChange:function(t){e.setState({pixleColor:t.target.value,isRandomColor:!1}),document.querySelectorAll("[data-live=true]").forEach((function(e){e.style.backgroundColor=t.target.value})),localStorage.setItem("pixleColor",t.target.value)}}),Object(p.jsx)("p",{className:"controlLabel",children:"Drawing"}),Object(p.jsx)("input",{className:"inputColor",type:"color",title:"Backgorund Pixel Color",value:this.state.backgroundPixleColor,onChange:function(t){e.setState({backgroundPixleColor:t.target.value}),document.querySelectorAll("#lifeDeathContainer > div:not([data-live=true])").forEach((function(e){return e.style.backgroundColor=t.target.value})),localStorage.setItem("backgroundPixleColor",t.target.value)}}),Object(p.jsx)("p",{className:"controlLabel",children:"Background"}),Object(p.jsx)("input",{className:"inputColor",type:"color",title:"Between Pixels Color",value:this.state.betweenPixleColor,onChange:function(t){e.setState({betweenPixleColor:t.target.value}),localStorage.setItem("betweenPixleColor",t.target.value)}}),Object(p.jsx)("p",{className:"controlLabel",children:"Grid Lines"}),Object(p.jsx)("input",{className:"inputColor",type:"color",title:"Symmetry Lines Color",value:this.state.SymmetryLinesColor,onChange:function(t){e.setState({SymmetryLinesColor:t.target.value}),localStorage.setItem("SymmetryLinesColor",t.target.value)}}),Object(p.jsx)("p",{className:"controlLabel",children:"Sym- Lines"}),Object(p.jsx)("div",{className:"devider"}),Object(p.jsxs)("select",{title:"Insert Patrens",disabled:this.state.isPlaying,onChange:function(t){var a=t.target.value;e.state.gridWidth<45?alert("this patren requiers a 45x45 grid and greater"):"simkinGliderGun"===a?e.applyPattren(g[a],60,0,1):"PentaDecathlon"===a?e.applyPattren(g[a],60,4,8):"pulsar"===a?e.applyPattren(g[a],60,7,7):"LightWeightSpaceship"===a?e.applyPattren(g[a],60,0,2):"MiddleWeightSpaceship"===a||"HeavyWeightSpaceship"===a?e.applyPattren(g[a],60,0,3):"omarDrawing"===a?e.applyPattren(g[a],60,4,2):"---"!==a&&e.applyPattren(g[a],60)},children:[Object(p.jsx)("option",{value:"---",children:"---"}),Object(p.jsx)("option",{value:"gliderGun",children:"Glider Gun"}),Object(p.jsx)("option",{value:"simkinGliderGun",children:"Simkin Glider Gun"}),Object(p.jsx)("option",{value:"LightWeightSpaceship",children:"Light Weight Spaceship"}),Object(p.jsx)("option",{value:"MiddleWeightSpaceship",children:"Middle Weight Spaceship"}),Object(p.jsx)("option",{value:"HeavyWeightSpaceship",children:"Heavy Weight Spaceship"}),Object(p.jsx)("option",{value:"PentaDecathlon",children:"Penta Decathlon"}),Object(p.jsx)("option",{value:"pulsar",children:"Pulsar"}),Object(p.jsx)("option",{value:"omarDrawing",children:"Omar's Drawing"})]}),Object(p.jsx)("p",{className:"controlLabel",children:"Pattrens"})]}),Object(p.jsxs)("div",{id:"lifeDeathContainer",style:{width:this.state.gridWidth*(2*this.state.pixelSpace+this.state.pixelSize)+"px",height:this.state.gridWidth*(2*this.state.pixelSpace+this.state.pixelSize)+"px",backgroundColor:this.state.betweenPixleColor},onMouseDown:function(t){e.state.isPlaying||e.setState({drwaMode:!0}),document.querySelectorAll("#controlPanel > *").forEach((function(e){return e.blur()})),t.preventDefault()},onMouseUp:function(){e.setState({drwaMode:!1})},onMouseLeave:function(){e.setState({drwaMode:!1}),document.getElementById("MouseHorizenLine").style.display="none",document.getElementById("MouseverticalLine").style.display="none",window.removeEventListener("mousemove",e.trackMouse)},onMouseEnter:function(t){e.state.isPlaying||(document.getElementById("MouseHorizenLine").style.display="block",document.getElementById("MouseverticalLine").style.display="block",window.addEventListener("mousemove",e.trackMouse))},children:[Object(p.jsx)("nav",{id:"horizenLine",style:{height:this.state.gridWidth%2!==0?4*this.state.pixelSpace+this.state.pixelSize+"px":2*this.state.pixelSpace,backgroundColor:this.state.SymmetryLinesColor}}),Object(p.jsx)("nav",{id:"verticalLine",style:{width:this.state.gridWidth%2!==0?4*this.state.pixelSpace+this.state.pixelSize+"px":2*this.state.pixelSpace,backgroundColor:this.state.SymmetryLinesColor}}),Object(p.jsx)("nav",{id:"MouseHorizenLine",style:{width:this.state.gridWidth*(2*this.state.pixelSpace+this.state.pixelSize)+"px"}}),Object(p.jsx)("nav",{id:"MouseverticalLine",style:{height:this.state.gridWidth*(2*this.state.pixelSpace+this.state.pixelSize)+"px"}})]})]})}}]),a}(r.Component);c.a.render(Object(p.jsx)(o.a.StrictMode,{children:Object(p.jsx)(b,{})}),document.getElementById("root"))}},[[14,1,2]]]);
//# sourceMappingURL=main.6b0981f4.chunk.js.map