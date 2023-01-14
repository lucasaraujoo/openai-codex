import './style.css';

import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  },300)
}


function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      
    }else{
      clearInterval(interval);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },20);
  
}

function generateUniqueId(){
  const timestamp = Date.now();
  const randonNumber = Math.random();

  const hexadecimalString = randonNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;

}

function chatStripe(isAI, value, uniqueId){
  return(
    `

      <div class="wrapper ${isAI && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAI ? bot : user }"
              alt="${isAI ? 'bot' : 'user'}"
            />
            
          </div>
          <div class="message" id="${uniqueId}" >${value}</div>
        </div>
      </div>

    `
  )
}

const handleSubmit = async (e) =>{
  e.preventDefault();

  const data = new FormData(form);

  if (data.get('prompt').trim() === "" ){
    
    return;
  }
  //user chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt')); 
  form.reset();
  
  //bot chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from the server and bot response
  const response = await fetch('http://localhost:5000',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    })
  });

  clearInterval(loadInterval);

  messageDiv.innerHTML = '';

  if (response.ok){
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  }else{
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
  
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) =>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
});

