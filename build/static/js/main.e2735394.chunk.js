(this["webpackJsonpgame-of-life"]=this["webpackJsonpgame-of-life"]||[]).push([[0],{13:function(e,t,a){},15:function(e,t,a){"use strict";a.r(t);var i,n,l,r,o,s,c,d=a(1),h=a.n(d),g=a(3),u=a.n(g),m=(a(13),a(4)),p=a(5),v=a(8),x=a(7),b=a(6),y=a.n(b),f={gliderGun:[240,241,301,300,310,250,370,191,431,492,493,132,133,314,195,435,256,316,376,317,322,261,201,141,140,200,260,82,84,24,324,384,154,155,214,215],simkinGliderGun:[61,62,122,121,68,128,129,69,246,245,305,306,802,742,682,623,624,803,804,626,627,688,749,808,867,752,753,813,812,1102,1101,1161,1222,1223,1224,1284],HeavyWeightSpaceship:[300,180,121,122,123,124,125,126,186,246,305,363,362],MiddleWeightSpaceship:[60,180,241,242,243,244,245,185,125,64,2],LightWeightSpaceship:[240,120,61,62,63,64,124,184,243],PentaDecathlon:[123,124,125,64,4,303,304,305,364,424,484,544,603,604,605,783,784,785,844,904],pulsar:[181,241,301,363,364,365,306,246,186,65,64,63,188,248,308,369,370,371,69,70,71,313,253,193,483,484,485,546,606,666,489,491,490,548,668,608,541,601,661,553,613,673,790,791,789,785,784,783],omarDrawing:[180,181,182,186,187,188,241,247,304,364,424,484,602,603,604,605,606,661,667]},j=a(0),w=[],S=[],C=function(e){Object(v.a)(a,e);var t=Object(x.a)(a);function a(){var e;Object(m.a)(this,a);for(var d=arguments.length,h=new Array(d),g=0;g<d;g++)h[g]=arguments[g];return(e=t.call.apply(t,[this].concat(h))).state={isPlaying:!1,isPaused:!1,drwaMode:!1,isRandomColor:!1,symmetricalX:!1,symmetricalY:!1,eraser:!1,speed:localStorage.getItem("speed")?Number(localStorage.getItem("speed")):100,pixelSize:localStorage.getItem("pixelSize")?Number(localStorage.getItem("pixelSize")):15,gridWidth:localStorage.getItem("gridWidth")?Number(localStorage.getItem("gridWidth")):90,gridHeight:localStorage.getItem("gridHeight")?Number(localStorage.getItem("gridHeight")):50,pixelSpace:localStorage.getItem("pixelSpace")?Number(localStorage.getItem("pixelSpace")):.5,pixleColor:localStorage.getItem("pixleColor")?localStorage.getItem("pixleColor"):"#ffffff",betweenPixleColor:localStorage.getItem("betweenPixleColor")?localStorage.getItem("betweenPixleColor"):"#282828",SymmetryLinesColor:localStorage.getItem("SymmetryLinesColor")?localStorage.getItem("SymmetryLinesColor"):"#868686",backgroundPixleColor:localStorage.getItem("backgroundPixleColor")?localStorage.getItem("backgroundPixleColor"):"#000000"},e.keyboardShourtcuts=function(){window.addEventListener("keyup",(function(t){t.ctrlKey&&"z"===t.key.toLowerCase()&&w.length>0&&!e.state.drwaMode?(document.querySelectorAll('input[type="number"').forEach((function(e){return e.blur()})),e.undo()):t.ctrlKey&&"y"===t.key.toLowerCase()&&S.length>0&&!e.state.drwaMode?(document.querySelectorAll('input[type="number"').forEach((function(e){return e.blur()})),e.redo()):"e"!==t.key.toLowerCase()||e.state.drwaMode||(document.querySelectorAll('input[type="number"').forEach((function(e){return e.blur()})),e.state.eraser?e.setState({eraser:!1}):e.setState({eraser:!0}))}))},e.undo=function(){w.length>0&&("Death"===w[w.length-1][0]?w[w.length-1].forEach((function(t){return"Death"!==t?e.toDeath(t):""})):w[w.length-1].forEach((function(t){return"Live"!==t?e.toLive(t):""})),S.push(w[w.length-1]),w.splice(w.length-1))},e.redo=function(){S.length>0&&("Death"===S[S.length-1][0]?S[S.length-1].forEach((function(t){"Death"!==t&&(e.state.isRandomColor?t.style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):t.style.backgroundColor=e.state.pixleColor,t.dataset.live="true")})):S[S.length-1].forEach((function(t){"Live"!==t&&(t.style.backgroundColor=e.state.backgroundPixleColor,t.removeAttribute("data-live"))})),w.push(S[S.length-1]),S.splice(S.length-1))},e.applyPattren=function(t,a,i,n){var l=document.querySelectorAll(".lifeDeathPixels");l.forEach((function(t){t.style.backgroundColor=e.state.backgroundPixleColor,t.removeAttribute("data-live")}));var r=e.state.gridWidth-a,o=(i?~~(e.state.gridWidth/2)-i:0)+(n?~~e.state.gridWidth*(~~(e.state.gridHeight/2)-n):0);t.forEach((function(t){var i=Math.floor(t/a)*r;e.state.isRandomColor?l[t+i+o].style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):l[t+i+o].style.backgroundColor=e.state.pixleColor,l[t+i+o].dataset.live="true"}))},e.symmetricalX=function(t,a){if(e.state.symmetricalX){var i=~~(t/e.state.gridWidth)*e.state.gridWidth+Math.floor(e.state.gridWidth/2),n=Number.isInteger(e.state.gridWidth/2)?i-(t-i+1):i-(t-i),l=document.querySelectorAll('.lifeDeathPixels[data-pos="'.concat(n,'"]'))[0];a?e.toDeath(l):e.toLive(l)}},e.symmetricalY=function(t,a){if(e.state.symmetricalY){var i=~~(t/e.state.gridWidth),n=Math.floor(e.state.gridHeight/2)-i,l=Number.isInteger(e.state.gridWidth/2)?t+n*e.state.gridWidth*2-e.state.gridWidth:t+n*e.state.gridWidth*2,r=document.querySelectorAll('.lifeDeathPixels[data-pos="'.concat(l,'"]'))[0];return a?e.toDeath(r):e.toLive(r),l}},e.appendDivs=function(t,a){for(var i=document.getElementById("lifeDeathContainer"),n=function(t){var a=document.createElement("div");a.className="lifeDeathPixels",a.dataset.pos=t,a.style.margin=e.state.pixelSpace+"px",a.style.backgroundColor=e.state.backgroundPixleColor,a.style.width=e.state.pixelSize+"px",a.style.height=e.state.pixelSize+"px",a.addEventListener("mouseenter",(function(a){e.state.drwaMode&&!e.state.eraser?(e.symmetricalX(t),e.symmetricalY(t),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t)),e.toLive(a.target)):e.state.drwaMode&&e.state.eraser&&(e.symmetricalX(t,!0),e.symmetricalY(t,!0),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t,!0),!0),e.toDeath(a.target))})),a.addEventListener("mousedown",(function(a){e.setState({isPaused:!1}),w.push([]),S=[],e.state.isPlaying||e.state.eraser?!e.state.isPlaying&&e.state.eraser&&(w[w.length-1].push("Live"),e.symmetricalX(t,!0),e.symmetricalY(t,!0),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t,!0),!0),e.toDeath(a.target)):(w[w.length-1].push("Death"),e.symmetricalX(t),e.symmetricalY(t),e.state.symmetricalY&&e.state.symmetricalX&&e.symmetricalX(e.symmetricalY(t)),e.toLive(a.target))})),i.appendChild(a)},l=0;l<t*a;l++)n(l)},e.checkliveOrDead=function(t){var a=document.getElementsByClassName("lifeDeathPixels"),i=0,n=e.state.gridWidth,l="true"===a[t].dataset.live,r=Number.isInteger(t/n),o=Number.isInteger((t+1)/n),s=function(e){var t;"true"===(null===(t=a[e])||void 0===t?void 0:t.dataset.live)&&i++};return o||s(t+1),r||s(t-1),s(t+n),o||s(t+n+1),r||s(t+n-1),s(t-n),o||s(t-n+1),r||s(t-n-1),!(l&&i<2)&&(!(!l||2!==i&&3!==i)||!(l&&i>3)&&(!l&&3===i||void 0))},e.toLive=function(t){"true"!==t.dataset.live&&(w[w.length-1].push(t),e.state.isRandomColor?t.style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):t.style.backgroundColor=e.state.pixleColor,t.dataset.live="true")},e.toDeath=function(t){"true"===t.dataset.live&&(w[w.length-1].push(t),t.style.backgroundColor=e.state.backgroundPixleColor,t.removeAttribute("data-live"))},e.play=function(){if(e.state.isPlaying)e.pauseRender();else{e.setState({isPlaying:!0});var t=document.querySelectorAll('.lifeDeathPixels[data-live="true"]');if(!e.state.isPaused){var a=[];t.forEach((function(e){return a.push(Number(e.dataset.pos))})),n=a,l=[e.state.gridWidth,e.state.gridHeight],localStorage.setItem("lastPaint",JSON.stringify(a)),localStorage.setItem("lastPaintGrid",JSON.stringify(l))}i=setInterval((function(){e.renderLifeDeath()}),e.state.speed)}},e.renderLifeDeath=function(){for(var t=document.getElementsByClassName("lifeDeathPixels"),a=[],i=[],n=0;n<t.length;n++)e.checkliveOrDead(n)?a.push(n):i.push(n),n===t.length-1&&(a.forEach((function(a){e.state.isRandomColor?t[a].style.backgroundColor="hsla(".concat(360*Math.random(),", 100%, 40%, 1)"):t[a].style.backgroundColor=e.state.pixleColor,t[a].dataset.live="true"})),i.forEach((function(a){t[a].style.backgroundColor=e.state.backgroundPixleColor,t[a].removeAttribute("data-live")})))},e.resetRender=function(){clearInterval(i),w.push([]),document.querySelectorAll(".lifeDeathPixels[data-live=true]").forEach((function(t){return e.toDeath(t)})),e.setState({isPlaying:!1,isPaused:!1})},e.pauseRender=function(){e.state.isPlaying&&(clearInterval(i),e.setState({isPlaying:!1,isPaused:!0}))},e.renderLast=function(){if(clearInterval(i),e.setState({isPlaying:!1,isPaused:!1}),n)l[0]>e.state.gridWidth||l[1]>e.state.gridHeight?alert("can't retrive last paint, current grid size is smaller than ".concat(l[0],"x").concat(l[1])):l[0]!==e.state.gridWidth||l[1]!==e.state.gridHeight?(alert("this paint was painted orginaly on ".concat(l[0],"x").concat(l[1]," grid")),e.applyPattren(n,l[0])):e.applyPattren(n,l[0]);else if(localStorage.getItem("lastPaint")){var t=JSON.parse(localStorage.getItem("lastPaint")),a=JSON.parse(localStorage.getItem("lastPaintGrid"));a[0]>e.state.gridWidth||a[1]>e.state.gridHeight?alert("can't retrive last paint, current grid size is smaller than ".concat(a[0],"x").concat(a[1])):e.applyPattren(t,a[0])}else alert("Last Paint Not found")},e.trackMouse=function(e){document.getElementById("MouseHorizenLine").style.top="".concat(e.clientY-s,"px"),document.getElementById("MouseVerticalLine").style.left="".concat(e.clientX-c,"px")},e.grabPanel=function(e){var t=document.getElementById("controlPanel");t.style.top="".concat(e.clientY,"px"),t.style.left="".concat(e.clientX,"px")},e.grabGrid=function(e){e.preventDefault();var t=document.getElementById("windowContainer");t.style.transform="translate(".concat(o,"px,").concat(r,"px)"),t.style.top="".concat(e.clientY,"px"),t.style.left="".concat(e.clientX,"px")},e.grabLayer=function(e){e.preventDefault();var t=document.getElementById("imageLayer");t.style.transform="translate(".concat(o,"px,").concat(r,"px)"),t.style.top="".concat(e.clientY,"px"),t.style.left="".concat(e.clientX,"px")},e.copyToClipBoard=function(){e.pauseRender(),y()(document.querySelector("#lifeDeathContainer")).then((function(e){e.toBlob((function(e){navigator.permissions.query({name:"clipboard-write"}).then((function(t){"granted"!==t.state&&"prompt"!==t.state||navigator.clipboard.write([new ClipboardItem({"image/png":e})])}))}),"image/png")}))},e}return Object(p.a)(a,[{key:"componentDidMount",value:function(){if(this.appendDivs(this.state.gridWidth,this.state.gridHeight),localStorage.getItem("lastPaint")){var e=JSON.parse(localStorage.getItem("lastPaint")),t=JSON.parse(localStorage.getItem("lastPaintGrid"));t[0]>this.state.gridWidth||t[1]>this.state.gridHeight?alert("can't retrive last paint, current grid size is smaller than ".concat(t[0],"x").concat(t[1])):this.applyPattren(e,t[0])}this.keyboardShourtcuts()}},{key:"render",value:function(){var e=this;return Object(j.jsxs)(j.Fragment,{children:[Object(j.jsxs)("div",{id:"controlPanel",children:[Object(j.jsx)("div",{id:"grabPad",onMouseDown:function(){return window.addEventListener("mousemove",e.grabPanel)},onMouseUp:function(){return window.removeEventListener("mousemove",e.grabPanel)},children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M20,9H4v2h16V9z M4,15h16v-2H4V15z"})})}),Object(j.jsx)("div",{className:"devider"}),Object(j.jsxs)("div",{id:"undoredoContainer",children:[Object(j.jsx)("button",{onClick:this.undo,title:"undo (Ctrl + z)",children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"20px",viewBox:"0 0 24 24",width:"20px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"})})}),Object(j.jsx)("button",{onClick:this.redo,title:"redo (Ctrl + y)",children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"20px",viewBox:"0 0 24 24",width:"20px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"})})})]}),Object(j.jsx)("button",{className:"buttons",title:"Copy drawing to Clipboard",onClick:this.copyToClipBoard,children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"})})}),Object(j.jsx)("input",{id:"getImage",type:"file",name:"getImage",accept:".png,.jpg",onChange:function(e){var t=document.getElementById("getImage").files[0],a=new FileReader,i=document.querySelectorAll("img")[0];i.title=t.name,a.onload=function(e){i.src=e.target.result,document.getElementById("imageLayer").style.display="block"},a.readAsDataURL(t)}}),Object(j.jsx)("label",{id:"getImageLabel",htmlFor:"getImage",children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"})})}),Object(j.jsx)("div",{className:"devider"}),Object(j.jsxs)("button",{className:"buttons",title:this.state.isPlaying?"Pause":"play",onClick:this.play,style:{backgroundColor:this.state.isPlaying?"#383838":"initial",border:this.state.isPlaying?"solid 1px #636363":"none"},children:[Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",style:{display:this.state.isPlaying?"none":"initial"},children:Object(j.jsx)("path",{d:"M8 5v14l11-7z"})}),Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",style:{display:this.state.isPlaying?"initial":"none"},children:Object(j.jsx)("path",{d:"M6 19h4V5H6v14zm8-14v14h4V5h-4z"})})]}),Object(j.jsx)("button",{className:"buttons",onClick:this.renderLast,title:"Last Drawing",children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"})})}),Object(j.jsx)("button",{className:"buttons",onClick:this.resetRender,title:"Reset",children:Object(j.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",enableBackground:"new 0 0 24 24",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:[Object(j.jsx)("path",{d:"M12,5V2L8,6l4,4V7c3.31,0,6,2.69,6,6c0,2.97-2.17,5.43-5,5.91v2.02c3.95-0.49,7-3.85,7-7.93C20,8.58,16.42,5,12,5z"}),Object(j.jsx)("path",{d:"M6,13c0-1.65,0.67-3.15,1.76-4.24L6.34,7.34C4.9,8.79,4,10.79,4,13c0,4.08,3.05,7.44,7,7.93v-2.02 C8.17,18.43,6,15.97,6,13z"})]})}),Object(j.jsx)("button",{className:"buttons",style:{backgroundColor:this.state.eraser?"#383838":"initial",border:this.state.eraser?"solid 1px #636363":"none"},title:"Eraser (e)",onClick:function(){return e.state.eraser?e.setState({eraser:!1}):e.setState({eraser:!0})},children:Object(j.jsx)("svg",{width:"24",height:"24",xmlns:"http://www.w3.org/2000/svg",fillRule:"evenodd",clipRule:"evenodd",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M5.662 23l-5.369-5.365c-.195-.195-.293-.45-.293-.707 0-.256.098-.512.293-.707l14.929-14.928c.195-.194.451-.293.707-.293.255 0 .512.099.707.293l7.071 7.073c.196.195.293.451.293.708 0 .256-.097.511-.293.707l-11.216 11.219h5.514v2h-12.343zm3.657-2l-5.486-5.486-1.419 1.414 4.076 4.072h2.829zm.456-11.429l-4.528 4.528 5.658 5.659 4.527-4.53-5.657-5.657z"})})}),Object(j.jsx)("button",{className:"buttons",style:{backgroundColor:this.state.symmetricalX?"#383838":"initial",border:this.state.symmetricalX?"solid 1px #636363":"none"},title:"Vertical Lines of Symmetry",onClick:function(){e.state.symmetricalX?e.setState({symmetricalX:!1}):e.setState({symmetricalX:!0})},children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M3 9h2V7H3v2zm0-4h2V3H3v2zm4 16h2v-2H7v2zm0-8h2v-2H7v2zm-4 0h2v-2H3v2zm0 8h2v-2H3v2zm0-4h2v-2H3v2zM7 5h2V3H7v2zm12 12h2v-2h-2v2zm-8 4h2V3h-2v18zm8 0h2v-2h-2v2zm0-8h2v-2h-2v2zm0-10v2h2V3h-2zm0 6h2V7h-2v2zm-4-4h2V3h-2v2zm0 16h2v-2h-2v2zm0-8h2v-2h-2v2z"})})}),Object(j.jsx)("button",{className:"buttons",style:{backgroundColor:this.state.symmetricalY?"#383838":"initial",border:this.state.symmetricalY?"solid 1px #636363":"none"},title:"Horizontal Lines of Symmetry",onClick:function(){e.state.symmetricalY?e.setState({symmetricalY:!1}):e.setState({symmetricalY:!0})},children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M3 21h2v-2H3v2zM5 7H3v2h2V7zM3 17h2v-2H3v2zm4 4h2v-2H7v2zM5 3H3v2h2V3zm4 0H7v2h2V3zm8 0h-2v2h2V3zm-4 4h-2v2h2V7zm0-4h-2v2h2V3zm6 14h2v-2h-2v2zm-8 4h2v-2h-2v2zm-8-8h18v-2H3v2zM19 3v2h2V3h-2zm0 6h2V7h-2v2zm-8 8h2v-2h-2v2zm4 4h2v-2h-2v2zm4 0h2v-2h-2v2z"})})}),Object(j.jsx)("div",{className:"devider"}),Object(j.jsx)("input",{id:"rangeInput",type:"range",title:'Refresh every "ms"',value:this.state.speed,min:"1",max:"300",disabled:this.state.isPlaying,onChange:function(t){t.preventDefault(),e.setState({speed:t.target.value}),localStorage.setItem("speed",t.target.value)}}),Object(j.jsx)("p",{className:"controlLabel",children:"Speed"}),Object(j.jsx)("div",{className:"devider"}),Object(j.jsx)("input",{className:"inputNumber",type:"number",title:"Grid Width",min:"20",max:"150",value:this.state.gridWidth,disabled:this.state.isPlaying,onChange:function(t){e.setState({gridWidth:Number(t.target.value)}),document.querySelectorAll(".lifeDeathPixels").forEach((function(e){return e.remove()})),e.appendDivs(Number(t.target.value),e.state.gridHeight),localStorage.setItem("gridWidth",Number(t.target.value)),w=[]}}),Object(j.jsx)("p",{className:"controlLabel",children:"Grid Width"}),Object(j.jsx)("input",{className:"inputNumber",type:"number",title:"Grid Height",min:"20",max:"150",value:this.state.gridHeight,disabled:this.state.isPlaying,onChange:function(t){e.setState({gridHeight:Number(t.target.value)}),document.querySelectorAll(".lifeDeathPixels").forEach((function(e){return e.remove()})),e.appendDivs(e.state.gridWidth,Number(t.target.value)),localStorage.setItem("gridHeight",Number(t.target.value)),w=[]}}),Object(j.jsx)("p",{className:"controlLabel",children:"Grid Height"}),Object(j.jsx)("input",{className:"inputNumber",type:"number",title:"Pixel Size",min:"1",max:"50",value:this.state.pixelSize,onChange:function(t){e.setState({pixelSize:Number(t.target.value)}),document.querySelectorAll(".lifeDeathPixels").forEach((function(e){e.style.width=t.target.value+"px",e.style.height=t.target.value+"px"})),localStorage.setItem("pixelSize",Number(t.target.value))}}),Object(j.jsx)("p",{className:"controlLabel",children:"Pixels Size"}),Object(j.jsx)("input",{className:"inputNumber",type:"number",title:"Between Pixels Space",min:"0",max:"5",step:"0.1",value:this.state.pixelSpace,onChange:function(t){e.setState({pixelSpace:Number(t.target.value)}),document.querySelectorAll(".lifeDeathPixels").forEach((function(e){e.style.margin=t.target.value+"px"})),localStorage.setItem("pixelSpace",Number(t.target.value))}}),Object(j.jsx)("p",{className:"controlLabel",children:"Grid Lines"}),Object(j.jsx)("div",{className:"devider"}),Object(j.jsx)("button",{className:"randomColors",style:{backgroundColor:this.state.isRandomColor?"#383838":"initial",border:this.state.isRandomColor?"solid 1px #636363":"none"},title:"Random Colors",onClick:function(){return e.state.isRandomColor?e.setState({isRandomColor:!1}):e.setState({isRandomColor:!0})},children:Object(j.jsx)("svg",{width:"20",height:"20",xmlns:"http://www.w3.org/2000/svg",fillRule:"evenodd",clipRule:"evenodd",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"})})}),Object(j.jsx)("p",{className:"controlLabel",children:"Random"}),Object(j.jsx)("input",{className:"inputColor",type:"color",title:"Pixel Color",value:this.state.pixleColor,onChange:function(t){e.setState({pixleColor:t.target.value,isRandomColor:!1}),localStorage.setItem("pixleColor",t.target.value)}}),Object(j.jsx)("p",{className:"controlLabel",children:"Drawing"}),Object(j.jsx)("input",{className:"inputColor",type:"color",title:"Backgorund Pixel Color",value:this.state.backgroundPixleColor,onChange:function(t){e.setState({backgroundPixleColor:t.target.value}),document.querySelectorAll("#lifeDeathContainer > div:not([data-live=true])").forEach((function(e){return e.style.backgroundColor=t.target.value})),localStorage.setItem("backgroundPixleColor",t.target.value)}}),Object(j.jsx)("p",{className:"controlLabel",children:"Background"}),Object(j.jsx)("input",{className:"inputColor",type:"color",title:"Between Pixels Color",value:this.state.betweenPixleColor,onChange:function(t){e.setState({betweenPixleColor:t.target.value}),localStorage.setItem("betweenPixleColor",t.target.value)}}),Object(j.jsx)("p",{className:"controlLabel",children:"Grid Lines"}),Object(j.jsx)("input",{className:"inputColor",type:"color",title:"Symmetry Lines Color",value:this.state.SymmetryLinesColor,onChange:function(t){e.setState({SymmetryLinesColor:t.target.value}),localStorage.setItem("SymmetryLinesColor",t.target.value)}}),Object(j.jsx)("p",{className:"controlLabel",children:"Sym- Lines"}),Object(j.jsx)("div",{className:"devider"}),Object(j.jsxs)("select",{title:"Insert Patrens",disabled:this.state.isPlaying,onChange:function(t){var a=t.target.value;e.state.gridWidth<45||e.state.gridHeight<45?alert("this patren requiers a 45x45 grid and greater"):"simkinGliderGun"===a?e.applyPattren(f[a],60,0,1):"PentaDecathlon"===a?e.applyPattren(f[a],60,4,8):"pulsar"===a?e.applyPattren(f[a],60,7,7):"LightWeightSpaceship"===a?e.applyPattren(f[a],60,0,2):"MiddleWeightSpaceship"===a||"HeavyWeightSpaceship"===a?e.applyPattren(f[a],60,0,3):"omarDrawing"===a?e.applyPattren(f[a],60,4,2):"---"!==a&&e.applyPattren(f[a],60)},children:[Object(j.jsx)("option",{value:"---",children:"---"}),Object(j.jsx)("option",{value:"gliderGun",children:"Glider Gun"}),Object(j.jsx)("option",{value:"simkinGliderGun",children:"Simkin Glider Gun"}),Object(j.jsx)("option",{value:"LightWeightSpaceship",children:"Light Weight Spaceship"}),Object(j.jsx)("option",{value:"MiddleWeightSpaceship",children:"Middle Weight Spaceship"}),Object(j.jsx)("option",{value:"HeavyWeightSpaceship",children:"Heavy Weight Spaceship"}),Object(j.jsx)("option",{value:"PentaDecathlon",children:"Penta Decathlon"}),Object(j.jsx)("option",{value:"pulsar",children:"Pulsar"}),Object(j.jsx)("option",{value:"omarDrawing",children:"Omar's Drawing"})]}),Object(j.jsx)("p",{className:"controlLabel",children:"Pattrens"})]}),Object(j.jsxs)("div",{id:"imageLayer",children:[Object(j.jsxs)("div",{id:"layerHeader",onMouseDown:function(t){o=t.target.getBoundingClientRect().left-t.pageX,r=t.target.getBoundingClientRect().top-t.pageY,window.addEventListener("mousemove",e.grabLayer)},onMouseUp:function(){return window.removeEventListener("mousemove",e.grabLayer)},children:[Object(j.jsx)("input",{type:"range",id:"imgOpacity",step:"0.1",min:"0.1",max:"1",defaultValue:"0.5",onMouseDown:function(e){return e.stopPropagation(),!1},onChange:function(e){document.getElementById("img").style.opacity=e.target.value}}),Object(j.jsx)("button",{id:"closeImg",onClick:function(){document.getElementById("imageLayer").style.display="none",document.getElementById("getImage").value=""},children:Object(j.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",height:"20px",viewBox:"0 0 24 24",width:"20px",fill:"#D7D7D7",children:Object(j.jsx)("path",{d:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"})})})]}),Object(j.jsx)("img",{id:"img",alt:"imageLayer"})]}),Object(j.jsxs)("div",{id:"windowContainer",children:[Object(j.jsx)("div",{id:"windowHeader",onMouseDown:function(t){o=t.target.getBoundingClientRect().left-t.pageX,r=t.target.getBoundingClientRect().top-t.pageY,window.addEventListener("mousemove",e.grabGrid)},onMouseUp:function(){return window.removeEventListener("mousemove",e.grabGrid)},children:Object(j.jsxs)("p",{children:[this.state.gridWidth," x ",this.state.gridWidth," px / ",this.state.gridWidth*this.state.gridWidth," pixels"]})}),Object(j.jsxs)("div",{id:"lifeDeathContainer",style:{width:this.state.gridWidth*(2*this.state.pixelSpace+this.state.pixelSize)+"px",height:this.state.gridHeight*(2*this.state.pixelSpace+this.state.pixelSize)+"px",backgroundColor:this.state.betweenPixleColor},onMouseDown:function(t){e.state.isPlaying||e.setState({drwaMode:!0}),document.querySelectorAll("#controlPanel > *").forEach((function(e){return e.blur()})),t.preventDefault()},onMouseUp:function(){e.setState({drwaMode:!1})},onMouseLeave:function(){e.setState({drwaMode:!1}),document.getElementById("MouseHorizenLine").style.display="none",document.getElementById("MouseVerticalLine").style.display="none",window.removeEventListener("mousemove",e.trackMouse)},onMouseEnter:function(t){e.state.isPlaying||(s=t.target.getBoundingClientRect().top,c=t.target.getBoundingClientRect().left,document.getElementById("MouseHorizenLine").style.display="block",document.getElementById("MouseVerticalLine").style.display="block",window.addEventListener("mousemove",e.trackMouse))},children:[Object(j.jsx)("nav",{id:"horizenLine",style:{height:this.state.gridHeight%2!==0?4*this.state.pixelSpace+this.state.pixelSize+"px":2*this.state.pixelSpace,backgroundColor:this.state.SymmetryLinesColor}}),Object(j.jsx)("nav",{id:"verticalLine",style:{width:this.state.gridWidth%2!==0?4*this.state.pixelSpace+this.state.pixelSize+"px":2*this.state.pixelSpace,backgroundColor:this.state.SymmetryLinesColor}}),Object(j.jsx)("nav",{id:"MouseHorizenLine"}),Object(j.jsx)("nav",{id:"MouseVerticalLine"})]})]})]})}}]),a}(d.Component),O=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function P(e,t){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var a=e.installing;null!=a&&(a.onstatechange=function(){"installed"===a.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}u.a.render(Object(j.jsx)(h.a.StrictMode,{children:Object(j.jsx)(C,{})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var t="".concat("","/service-worker.js");O?(!function(e,t){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(a){var i=a.headers.get("content-type");404===a.status||null!=i&&-1===i.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):P(e,t)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(t,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):P(t,e)}))}}()}},[[15,1,2]]]);
//# sourceMappingURL=main.e2735394.chunk.js.map