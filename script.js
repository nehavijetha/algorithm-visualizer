const container = document.getElementById('arrayContainer');
const sizeInput = document.getElementById('size');
const randomizeBtn = document.getElementById('randomize');
const bubbleBtn = document.getElementById('bubbleBtn');
const mergeBtn = document.getElementById('mergeBtn');
const binaryBtn = document.getElementById('binaryBtn');
const speedSelect = document.getElementById('speed');
const message = document.getElementById('message');
const searchValInput = document.getElementById('searchVal');

let arr = [];
let isRunning = false;

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1)) + min; }

function generateArray(n=30){
  arr = Array.from({length:n}, ()=>randInt(10,500));
  renderArray();
  message.textContent = '';
}

function renderArray(highlights = {}){
  container.innerHTML = '';
  const max = Math.max(...arr,1);
  for (let i=0;i<arr.length;i++){
    const bar = document.createElement('div');
    bar.className = 'bar';
    if (arr.length > 60) bar.classList.add('small');
    const h = (arr[i]/max) * 100;
    bar.style.height = h + '%';
    if (highlights[i] === 'compare') bar.classList.add('highlight');
    if (highlights[i] === 'found') bar.style.background = '#34d399';
    container.appendChild(bar);
  }
}

// Bubble Sort
function bubbleSteps(a){
  const steps = [];
  const arr = a.slice();
  for (let i=0;i<arr.length;i++){
    for (let j=0;j<arr.length-1-i;j++){
      steps.push({type:'compare', i:j, j:j+1});
      if (arr[j] > arr[j+1]){
        steps.push({type:'swap', i:j, j:j+1});
        const tmp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = tmp;
      }
    }
  }
  steps.push({type:'done'});
  return steps;
}

// Merge Sort
function mergeSteps(a){
  const steps = [];
  const arr = a.slice();

  function merge(l, m, r){
    const left = arr.slice(l, m+1);
    const right = arr.slice(m+1, r+1);
    let i=0,j=0,k=l;
    while (i<left.length && j<right.length){
      steps.push({type:'compare', i: l+i, j: m+1+j});
      if (left[i] <= right[j]){
        steps.push({type:'set', index:k, value:left[i]}); arr[k++] = left[i++]
      } else {
        steps.push({type:'set', index:k, value:right[j]}); arr[k++] = right[j++]
      }
    }
    while (i<left.length){
      steps.push({type:'set', index:k, value:left[i]}); arr[k++] = left[i++]
    }
    while (j<right.length){
      steps.push({type:'set', index:k, value:right[j]}); arr[k++] = right[j++]
    }
  }

  function dfs(l,r){
    if (l>=r) return;
    const m = Math.floor((l+r)/2);
    dfs(l,m); dfs(m+1,r);
    merge(l,m,r);
  }
  dfs(0, arr.length-1);
  steps.push({type:'done'});
  return steps;
}

// Binary Search
function binarySearchSteps(a, target){
  const steps = [];
  const arr = a.slice().sort((x,y)=>x-y);
  let l = 0, r = arr.length - 1;
  steps.push({type:'initSorted', arr: arr.slice()});
  while (l <= r){
    const mid = Math.floor((l+r)/2);
    steps.push({type:'compare', i:mid});
    if (arr[mid] === target){
      steps.push({type:'found', index: mid});
      steps.push({type:'done'});
      return steps;
    } else if (arr[mid] < target){
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }
  steps.push({type:'notFound'});
  steps.push({type:'done'});
  return steps;
}

async function runSteps(steps){
  if (isRunning) return;
  isRunning = true;
  const delay = (ms) => new Promise(res => setTimeout(res, ms));
  let localArr = arr.slice();
  for (const s of steps){
    if (s.type === 'compare'){
      renderArray({[s.i]:'compare', [s.j]:'compare'});
    } else if (s.type === 'swap'){
      const tmp = localArr[s.i]; localArr[s.i] = localArr[s.j]; localArr[s.j] = tmp;
      arr = localArr.slice();
      renderArray({[s.i]:'compare', [s.j]:'compare'});
    } else if (s.type === 'set'){
      localArr[s.index] = s.value;
      arr = localArr.slice();
      renderArray({[s.index]:'compare'});
    } else if (s.type === 'initSorted'){
      arr = s.arr.slice();
      renderArray();
      message.textContent = 'Array sorted for binary search';
    } else if (s.type === 'found'){
      renderArray({[s.index]:'found'});
      message.textContent = 'Found element at index ' + s.index;
    } else if (s.type === 'notFound'){
      message.textContent = 'Element not found';
      renderArray();
    } else if (s.type === 'done'){
      renderArray();
      message.textContent = 'Done';
    }
    await delay(Number(speedSelect.value));
  }
  isRunning = false;
}

sizeInput.addEventListener('input', ()=>generateArray(Number(sizeInput.value)));
randomizeBtn.addEventListener('click', ()=>generateArray(Number(sizeInput.value)));

bubbleBtn.addEventListener('click', ()=>{
  if (isRunning) return;
  runSteps(bubbleSteps(arr));
});
mergeBtn.addEventListener('click', ()=>{
  if (isRunning) return;
  runSteps(mergeSteps(arr));
});
binaryBtn.addEventListener('click', ()=>{
  if (isRunning) return;
  const val = Number(searchValInput.value);
  if (Number.isNaN(val)){ message.textContent = 'Enter a number'; return; }
  runSteps(binarySearchSteps(arr,val));
});

generateArray(Number(sizeInput.value));
