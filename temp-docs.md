@font-face {
	font-family: 'GT-Flexa';
	src: url('https://assets.codepen.io/61488/GT-Flexa-VF-Trial.woff2');
	font-display: block;
	font-style: normal italic;
	font-weight: 100 800;
	font-stretch: 10% 200%;
}

:root {
    --fw: 600; // font weight target 100-800
	--fs: 150; // font stretch target 10-150%
    --fontSize: 15; // vw units
    --baseColor: "red";
}

html {
	box-sizing: border-box;
}

*, *:before, *:after {
	box-sizing: inherit;
}

html, body {
	width: 100%;
	height: 100%;
}

body {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FF7F99;
    font-family: 'GT-Flexa';
    font-size: 20px;
    color: white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    cursor: url("data:image/svg+xml,%3Csvg width='64px' height='64px' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 700'%3E%3Cpath d='M419.99,560.0013c83.627,0,151.67-68.041,151.67-151.67v-198.33A46.6565,46.6565,0,0,0,499.047,171.22a46.6714,46.6714,0,0,0-70-23.3323,46.7853,46.7853,0,0,0-44.055-31.219,46.2641,46.2641,0,0,0-23.332,6.2773V46.669a46.668,46.668,0,1,0-93.336,0v272.79l-64.145-32.082a70.2983,70.2983,0,0,0-31.289-7.375,44.6638,44.6638,0,0,0-31.5,76.23l150.88,150.87A179.4167,179.4167,0,0,0,420,560ZM172.9,303.33a21.3182,21.3182,0,0,0-15.0035,36.379l150.9,150.88a156.058,156.058,0,0,0,111.18,46.082c70.77,0,128.36-57.562,128.36-128.33V210.001a23.332,23.332,0,1,0-46.664,0v58.332a11.668,11.668,0,0,1-23.336,0V186.669a23.332,23.332,0,1,0-46.664,0v81.668a11.668,11.668,0,0,1-23.336,0v-105a23.332,23.332,0,0,0-46.664,0v105a11.668,11.668,0,0,1-23.336,0V46.677a23.332,23.332,0,0,0-46.664,0v291.67a11.66,11.66,0,0,1-16.8712,10.43l-81.035-40.508a46.9273,46.9273,0,0,0-20.863-4.9258Z' transform='translate(0 -0.001)' fill='%23fff'/%3E%3Cpath d='M420,560a179.4167,179.4167,0,0,1-127.73-52.898L141.39,356.232a44.6638,44.6638,0,0,1,31.5-76.23,70.2983,70.2983,0,0,1,31.289,7.375l64.145,32.082V46.669a46.668,46.668,0,1,1,93.336,0v76.277a46.2641,46.2641,0,0,1,23.332-6.2773,46.7853,46.7853,0,0,1,44.055,31.219,46.6714,46.6714,0,0,1,70,23.3323A46.6565,46.6565,0,0,1,571.66,210.0013v198.33c0,83.629-68.043,151.67-151.67,151.67ZM172.9,303.33a21.3182,21.3182,0,0,0-15.0035,36.379l150.9,150.88a156.058,156.058,0,0,0,111.18,46.082c70.77,0,128.36-57.562,128.36-128.33V210.001a23.332,23.332,0,1,0-46.664,0v58.332a11.668,11.668,0,0,1-23.336,0V186.669a23.332,23.332,0,1,0-46.664,0v81.668a11.668,11.668,0,0,1-23.336,0v-105a23.332,23.332,0,0,0-46.664,0v105a11.668,11.668,0,0,1-23.336,0V46.677a23.332,23.332,0,0,0-46.664,0v291.67a11.66,11.66,0,0,1-16.8712,10.43l-81.035-40.508a46.9273,46.9273,0,0,0-20.863-4.9258Z' transform='translate(0 -0.001)'/%3E%3C/svg%3E%0A") 32 32, pointer;
    
}

.stage {
	position: relative;
    display: grid;
    place-items: center;
	width: 100%;
	height: 100%;
	visibility: hidden;
}
.content {
    text-align: center;
}

.txt {
    margin: 0;
    font-size: calc(var(--fontSize)*1vw);
	font-weight: var(--fw); // 100-800
	font-stretch: calc(var(--fs) * 1%); // 10-150%
    line-height: 0.6;
    letter-spacing: -1vw;
    // text-transform: uppercase;
    user-select: none; 
    text-shadow: 0 0.05em 0 #FFB0C0,
                 0 0.1em 0.1em rgba(70,0,35, 0.3),
                 0 0.4em 0.3em rgba(70,0,35, 0.1);
}

.char {
    padding-top: 1.08vw;
    text-align: center;
    will-change: font-weight, font-stretch, transform;
    &:hover {
        // cursor: grab;
    }
}

.grab {
    cursor: url("data:image/svg+xml,%3Csvg width='64px' height='64px' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 700'%3E%3Cpath d='M419.9949,560.0013a179.4167,179.4167,0,0,1-127.73-52.898l-46.691-46.668a81.2138,81.2138,0,0,1-23.914-57.77v-35.352a81.1643,81.1643,0,0,1,23.918-57.75l22.75-22.723v-53.504a46.6566,46.6566,0,0,1,72.613-38.7813,46.691,46.691,0,0,1,88.106,0,46.6714,46.6714,0,0,1,70,23.3323,46.6566,46.6566,0,0,1,72.613,38.7813v151.67c0,83.625-68.039,151.66-151.67,151.66Zm-151.6526-221.66a11.666,11.666,0,1,0,23.332,0v-46.645a.19.19,0,0,1,.0039-.0469V233.34a23.332,23.332,0,1,1,46.664,0v35a11.666,11.666,0,1,0,23.332,0l.0039-58.336a23.332,23.332,0,1,1,46.664,0V268.34a11.666,11.666,0,1,0,23.332,0l.0039-35a23.332,23.332,0,1,1,46.664,0v35a11.666,11.666,0,1,0,23.332,0l.0039-11.668a23.332,23.332,0,1,1,46.664,0l-.0039,151.67c0,70.768-57.59,128.33-128.36,128.33a156.1776,156.1776,0,0,1-111.21-46.059l-46.691-46.668a58.0537,58.0537,0,0,1-17.078-41.254v-35.352a57.9448,57.9448,0,0,1,17.082-41.254l6.2539-6.2539Z' fill='%23fff'/%3E%3Cpath d='M419.9949,560.0013a179.4167,179.4167,0,0,1-127.73-52.898l-46.691-46.668a81.2138,81.2138,0,0,1-23.914-57.77v-35.352a81.1643,81.1643,0,0,1,23.918-57.75l22.75-22.723v-53.504a46.6566,46.6566,0,0,1,72.613-38.7813,46.691,46.691,0,0,1,88.106,0,46.6714,46.6714,0,0,1,70,23.3323,46.6566,46.6566,0,0,1,72.613,38.7813v151.67c0,83.625-68.039,151.66-151.67,151.66Zm-151.66-240.17-6.2539,6.2539a57.9448,57.9448,0,0,0-17.082,41.254v35.352a58.0537,58.0537,0,0,0,17.078,41.254l46.691,46.668a156.1776,156.1776,0,0,0,111.21,46.059c70.77,0,128.36-57.562,128.36-128.33l.0039-151.67a23.332,23.332,0,1,0-46.664,0l-.0039,11.668a11.666,11.666,0,1,1-23.332,0v-35a23.332,23.332,0,1,0-46.664,0l-.0039,35a11.666,11.666,0,1,1-23.332,0v-58.336a23.332,23.332,0,1,0-46.664,0l-.0039,58.336a11.666,11.666,0,1,1-23.332,0v-35a23.332,23.332,0,1,0-46.664,0v58.309a.19.19,0,0,0-.0039.0469v46.645a11.666,11.666,0,1,1-23.332,0Z'/%3E%3C/svg%3E") 32 32, pointer;
}

p {
    margin: 32px 0 0;
}

// Drag Hand by icon 54 from NounProject.com
// Link Select by icon 54 from NounProject.com
















console.clear();

select = e => document.querySelector(e);
selectAll = e => document.querySelectorAll(e);

const style = getComputedStyle(document.body)
const stage = select('.stage');
const weightInit = style.getPropertyValue('--fw'); // 600 in example
const weightTarget = 400; // 100-800
const weightDiff = weightInit - weightTarget;
const stretchInit = style.getPropertyValue('--fs'); // 150 in example
const stretchTarget = 80; // 10-200
const stretchDiff = stretchInit - stretchTarget;
const maxYScale = 2.5;
const body = document.body;

let mySplitText = new SplitText('.txt', {type:"chars", charsClass:"char", position: "relative" }); 
let chars = selectAll('.char');
let txt = select('.txt');

let numChars = chars.length;
let isMouseDown = false;
let letters = selectAll('.char');
let mouseInitialY = 0;
let mouseFinalY = 0;
let distY = 0;
let charIndexSelected = 0;
let charH = 0;
let elasticDropOff = 0.8; // The higher the value the less dispersion of elasticity.
let dragYScale = 0;

function init() {
    resize();
    
    gsap.set(stage, { autoAlpha: 1 });
    gsap.set(chars, {
        transformOrigin: 'center bottom'
    })
    animInTxt();
}

function animInTxt() {
    let elem = document.querySelector('.char');
    let rect = elem.getBoundingClientRect();
    gsap.from(chars, {
        y: ()=> {
            return -1*(rect.y + charH + 500); // add an extra 100px buffer to make sure off screen
        },
        fontWeight: weightTarget,
        fontStretch: stretchTarget,
        scaleY: 2,
        ease: "elastic(0.2, 0.1)",
        duration: 1.5,
        delay: 0.5,
        stagger: {
            each: 0.05,
            from: 'random'
        },
        onComplete: initEvents
    })
}

function initEvents() {
    
    body.onmouseup = function(e) { 
        if(isMouseDown) {
            mouseFinalY = e.clientY;
            isMouseDown = false;
            snapBackText();
            body.classList.remove("grab");
        }
    }
    
    body.onmousemove = function(e) { 
        if(isMouseDown) {
            mouseFinalY = e.clientY;
            calcDist();
            setFontDragDimensions();
        }
    }
    
    body.addEventListener("mouseleave", (event) => {  
        if (event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {  
            snapBackText();
            isMouseDown = false;
        }  
    });
    
    chars.forEach((char, index) => {
        char.addEventListener("mousedown", function(e) {
            mouseInitialY = e.clientY;
            charIndexSelected = index;
            charSelected = e.target;
            isMouseDown = true;
            body.classList.add("grab");
            console.clear();
        });
    })
}

function calcDist() {
    let maxYDragDist = charH*(maxYScale-1);
    distY = mouseInitialY - mouseFinalY;
    dragYScale = distY/maxYDragDist;
    if(dragYScale>(maxYScale-1)) {
        dragYScale = maxYScale-1;
    }
    else if (dragYScale<-0.5) {
        dragYScale = -0.5;
    }
}

function setFontDragDimensions() {
    gsap.to(chars, {
        y: (index, target) => {
            let fracDispersion = calcfracDispersion(index);
            return fracDispersion*-50;
        },
        fontWeight: (index, target) => {
            let fracDispersion = calcfracDispersion(index);
            return (weightInit - (fracDispersion*weightDiff));
        },
        fontStretch: (index, target) => {
            let fracDispersion = calcfracDispersion(index);
            return (stretchInit - (fracDispersion*stretchDiff));
        },
        scaleY: (index, target) => {
            let fracDispersion = calcfracDispersion(index);
            let scaleY = 1 + fracDispersion;
            if(scaleY<0.5) scaleY = 0.5;
            return scaleY;
        },
        ease: "power4",
        duration: 0.6
    });
}

function calcfracDispersion(index) {
    let dispersion = 1 - (Math.abs(index-charIndexSelected)/(numChars*elasticDropOff)); // fractional index dispersion
    return dispersion*dragYScale;
}

function snapBackText() {
    gsap.to(chars, {
        y: 0,
        fontWeight: weightInit,
        fontStretch: stretchInit,
        scale: 1,
        ease: "elastic(0.35, 0.1)",
        duration: 1,
        stagger: {
            each: 0.02,
            from: charIndexSelected
        }
    })
}

function resize() {
    charH = txt.offsetHeight;
}

window.onload = () => {
	init();
};

window.onresize = () => {
	resize();
};