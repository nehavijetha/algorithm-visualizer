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

function randInt(min,max){ 
  return Math.floor(Math.random()*(max-min+1)) + min; 
}

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

    if(arr.length > 60) bar.classList.add('small');

    const h = (arr[i]/max)*100;
    bar.style.height = h+'%';

    if(highlights[i]){
      bar.classList.add(highlights[i]);
    }

    container.appendChild(bar);
  }
}

/* ============================================
   BUBBLE SORT STEPS
============================================ */
function bubbleSteps(a){
  const steps = [];
  const arr = a.slice();

  for(let i=0;i<arr.length;i++){
    for(let j=0;j<arr.length-1-i;j++){

      steps.push({type:'bubble-compare', i:j, j:j+1});

      if(arr[j] > arr[j+1]){
        steps.push({type:'bubble-swap', i:j, j:j+1});
        let tmp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = tmp;
      }
    }
  }
  steps.push({type:'done'});
  return steps;
}

/* ============================================
   MERGE SORT STEPS
============================================ */
function mergeSteps(a){
  const steps = [];
  const arr = a.slice();

  function merge(l,m,r){
    const left = arr.slice(l,m+1);
    const right = arr.slice(m+1,r+1);
    let i=0,j=0,k=l;

    while(i < left.length && j < right.length){
      steps.push({type:'merge-left', index: l+i});
      steps.push({type:'merge-right', index: m+1+j});

      if(left[i] <= right[j]){
        steps.push({type:'merge-write', index:k, value:left[i]});
        arr[k++] = left[i++];
      } else {
        steps.push({type:'merge-write', index:k, value:right[j]});
        arr[k++] = right[j++];
      }
    }

    while(i < left.length){
      steps.push({type:'merge-write', index:k, value:left[i]});
      arr[k++] = left[i++];
    }
    while(j < right.length){
      steps.push({type:'merge-write', index:k, value:right[j]});
      arr[k++] = right[j++];
    }
  }

  function dfs(l,r){
    if(l>=r) return;
    const m = Math.floor((l+r)/2);
    dfs(l,m); dfs(m+1,r);
    merge(l,m,r);
  }

  dfs(0,arr.length-1);
  steps.push({type:'done'});
  return steps;
}

/* ============================================
   BINARY SEARCH STEPS
============================================ */
function binarySearchSteps(a,target){
  const steps = [];
  let arr = a.slice().sort((x,y)=>x-y);

  steps.push({type:'initSorted', arr:arr.slice()});

  let l=0, r=arr.length-1;

  while(l <= r){
    let mid = Math.floor((l+r)/2);
    steps.push({type:'binary-mid', index:mid});

    if(arr[mid] === target){
      steps.push({type:'binary-found', index:mid});
      steps.push({type:'done'});
      return steps;
    }

    if(arr[mid] < target){
      for(let i=l;i<=mid;i++)
        steps.push({type:'binary-discarded', index:i});
      l = mid + 1;
    } else {
      for(let i=mid;i<=r;i++)
        steps.push({type:'binary-discarded', index:i});
      r = mid - 1;
    }
  }

  steps.push({type:'done'});
  return steps;
}

/* ============================================
   ANIMATION ENGINE
============================================ */
async function runSteps(steps){
  if(isRunning) return;
  isRunning = true;

  const delay = ms => new Promise(res=>setTimeout(res,ms));
  let localArr = arr.slice();

  for(const s of steps){

    if(s.type === 'bubble-compare'){
      renderArray({[s.i]:'bubble-compare', [s.j]:'bubble-compare'});

    } else if(s.type === 'bubble-swap'){
      let temp = localArr[s.i];
      localArr[s.i] = localArr[s.j];
      localArr[s.j] = temp;
      arr = localArr.slice();
      renderArray({[s.i]:'bubble-swap', [s.j]:'bubble-swap'});

    } else if(s.type === 'merge-left'){
      renderArray({[s.index]:'merge-left'});

    } else if(s.type === 'merge-right'){
      renderArray({[s.index]:'merge-right'});

    } else if(s.type === 'merge-write'){
      localArr[s.index] = s.value;
      arr = localArr.slice();
      renderArray({[s.index]:'merge-write'});

    } else if(s.type === 'binary-mid'){
      renderArray({[s.index]:'binary-mid'});

    } else if(s.type === 'binary-found'){
      renderArray({[s.index]:'binary-found'});
      message.textContent = "Value found at index " + s.index;

    } else if(s.type === 'binary-discarded'){
      renderArray({[s.index]:'binary-discarded'});

    } else if(s.type === 'initSorted'){
      arr = s.arr.slice();
      renderArray();
      message.textContent = "Sorted array for binary search";

    } else if(s.type === 'done'){
      renderArray();
      message.textContent = "Operation Complete!";
    }

    await delay(Number(speedSelect.value) + 120);
  }

  isRunning = false;
}

/* ============================================
   BUTTON LOGIC
============================================ */
sizeInput.addEventListener('input', ()=>generateArray(Number(sizeInput.value)));
randomizeBtn.addEventListener('click', ()=>generateArray(Number(sizeInput.value)));

bubbleBtn.addEventListener('click', ()=>{
  if(!isRunning) runSteps(bubbleSteps(arr));
});

mergeBtn.addEventListener('click', ()=>{
  if(!isRunning) runSteps(mergeSteps(arr));
});

binaryBtn.addEventListener('click', ()=>{
  if(isRunning) return;
  const val = Number(searchValInput.value);
  if(Number.isNaN(val)) message.textContent="Enter a valid number";
  else runSteps(binarySearchSteps(arr,val));
});

generateArray(Number(sizeInput.value));
