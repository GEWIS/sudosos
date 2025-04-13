// Copied and adapted from https://www.kirupa.com/html5/the_falling_snow_effect.htm

// Array to store our BeerMug objects
const beerMugsUtil: BeerMug[] = [];

// Global variables to store our browser's window size
let browserWidth;
let browserHeight: number;

// Specify the number of beerMugs you want visible
const numberOfBeerMugs = 50;

// Flag to reset the position of the beerMugs
let resetPosition = false;

// Handle accessibility
let enableAnimations = false;
const reduceMotionQuery = matchMedia('(prefers-reduced-motion)');

// Handle animation accessibility preferences
function setAccessibilityState() {
  enableAnimations = !reduceMotionQuery.matches;
}
setAccessibilityState();

reduceMotionQuery.addEventListener('change', setAccessibilityState);

//
// This function returns a number between (maximum - offset) and (maximum + offset)
//
function getPosition(offset: number, size: number) {
  return Math.round(-1 * offset + Math.random() * (size + 2 * offset));
}

//
// Trigger a reset of all the beerMugs' positions
//
function setResetFlag() {
  resetPosition = true;
}

//
// A performant way to set your beerMug's position and size
//
function setTransform(xPos: number, yPos: number, scale: number, el: { style: { transform: string } }) {
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) scale(${scale}, ${scale})`;
}

//
// Constructor for our BeerMug object
//
class BeerMug {
  private readonly element: HTMLElement;

  private readonly speed: number;

  xPos: number;

  yPos: number;

  private scale: number;

  private counter: number;

  private readonly sign: number;

  constructor(element: HTMLElement, speed: number, xPos: number, yPos: number) {
    // set initial beerMug properties
    this.element = element;
    this.speed = speed;
    this.xPos = xPos;
    this.yPos = yPos;
    this.scale = 1;

    // declare variables used for beerMug's motion
    this.counter = 0;
    this.sign = Math.random() < 0.5 ? 1 : -1;

    // setting an initial opacity and size for our beerMug
    this.element.style.opacity = String((0.1 + Math.random()) / 3);
  }

  public update() {
    // using some trigonometry to determine our x and y position
    this.counter += this.speed / 5000;
    this.xPos += (this.sign * this.speed * Math.cos(this.counter)) / 40;
    this.yPos += Math.sin(this.counter) / 40 + this.speed / 30;
    this.scale = 0.5 + Math.abs(10 * Math.cos(this.counter)) / 20;

    // setting our beerMug's position
    setTransform(Math.round(this.xPos), Math.round(this.yPos), this.scale, this.element);

    // if beerMug goes below the browser window, move it back to the top
    if (this.yPos > browserHeight) {
      this.yPos = -50;
    }
  }
}

//
// Responsible for moving each beerMug by calling its update function
//
function moveBeerMugs() {
  if (enableAnimations) {
    for (let i = 0; i < beerMugsUtil.length; i++) {
      const beerMug = beerMugsUtil[i];
      beerMug.update();
    }
  }

  // Reset the position of all the beerMugs to a new value
  if (resetPosition) {
    browserWidth = document.documentElement.clientWidth;
    browserHeight = document.documentElement.clientHeight;

    for (let i = 0; i < beerMugsUtil.length; i++) {
      const beerMug = beerMugsUtil[i];

      beerMug.xPos = getPosition(50, browserWidth);
      beerMug.yPos = getPosition(50, browserHeight);
    }

    resetPosition = false;
  }

  requestAnimationFrame(moveBeerMugs);
}

//
// The function responsible for creating the beerMug
//
function generateBeerMugs() {
  // get our beerMug element from the DOM and store it
  const originalBeerMug = document.getElementsByClassName('beerMug')[0];

  // access our beerMug element's parent container
  const beerMugContainer = document.getElementById('beerMugContainer');

  if (beerMugContainer !== null) {
    beerMugContainer.style.display = 'block';
  }

  // get our browser's size
  browserWidth = document.documentElement.clientWidth;
  browserHeight = document.documentElement.clientHeight;

  // create each individual beerMug
  for (let i = 0; i < numberOfBeerMugs; i++) {
    // clone our original beerMug and add it to beerMugContainer
    const beerMugClone = originalBeerMug.cloneNode(true);

    if (beerMugContainer !== null) {
      beerMugContainer.appendChild(beerMugClone);
    }

    // set our beerMug's initial position and related properties
    const initialXPos = getPosition(50, browserWidth);
    const initialYPos = getPosition(50, browserHeight);
    const speed = 5 + Math.random() * 40;

    // create our BeerMug object
    const beerMugObject = new BeerMug(beerMugClone as unknown as HTMLElement, speed, initialXPos, initialYPos);
    beerMugsUtil.push(beerMugObject);
  }

  // remove the original beerMug because we no longer need it visible
  if (beerMugContainer !== null) {
    beerMugContainer.removeChild(originalBeerMug);
  }

  moveBeerMugs();
}

export default function setupBeerMugs() {
  if (enableAnimations) {
    generateBeerMugs();
    window.addEventListener('resize', setResetFlag, false);
  }
}
