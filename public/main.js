let typingInterval;
async function sendPrompt() {
  const submitButton = document.getElementById('submit');
  const userPrompt = document.getElementById('userPrompt').value;
  var inputField = document.getElementById('userPrompt');

  submitButton.disabled = true; // Disable the submit button while processing
  // Change the submit button to a stop button
  submitButton.textContent = 'Stop';
  submitButton.onclick = stopTypingEffect; // Change the onclick event to stop the typing effect
  submitButton.disabled = false; // Disable the submit button while processing


  // Clear the input field immediately after capturing the value to improve responsiveness
  inputField.value = '';

  // Display the user's prompt first as static text
  let displayElement = document.getElementById('apiResponse');
  displayElement.innerHTML += "<p>" + "You: " + userPrompt + "</p>";
  displayElement.innerHTML += "GPT: ";

  const response = await fetch('/api/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: userPrompt })
  });

  const data = await response.json();

  // Prepare the API response text for the typing effect
  let responseData = data.response;
  let apiResponseText = formatAPIResponse(JSON.stringify(responseData, null, 2).replace(/\\n/g, '<br>'));

  // Start the typing effect only for the API response
  typeEffect(apiResponseText, displayElement, 30);
}

function typeEffect(text, element, delay) {
  let i = 0;
  const tempElement = document.createElement('span');
  element.appendChild(tempElement); 
  const scrollableContainer = document.getElementById('response');
  
  typingInterval = setInterval(() => {
    if (i < text.length) {
      tempElement.textContent += text.charAt(i);
      i++;
      if (i === text.length) {
        clearInterval(typingInterval);
        finishTyping(); // Call finishTyping to reset the button state
      }
    }
  }, delay);
}

function formatAPIResponse(text) {
  text = text.replace(/```(.*?)```/gs, function(match, p1) {
    // Convert HTML special characters back to their original form inside code blocks
    var codeSnippet = unescapeHtml(p1.trim());
    return '<pre><code>' + codeSnippet + '</code></pre>';
  });
  
  text = text.replace(/<br>/g, '\n');
  return text;
}


function unescapeHtml(safe) {
  return safe
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'");
}


function stopTypingEffect() {
  clearInterval(typingInterval); // Clear the typing interval using the global variable
  finishTyping(); // Call finishTyping to reset the button state
}

function finishTyping() {
  clearInterval(typingInterval); // Ensure the interval is cleared
  const submitButton = document.getElementById('submit');
  submitButton.textContent = 'Submit';
  submitButton.onclick = sendPrompt; // Reset the onclick event to send the prompt
  document.getElementById('userPrompt').disabled = false; // Re-enable the input field
  typingInterval = null; // Clear the global interval ID reference
}


document.addEventListener('DOMContentLoaded', (event) => {
  const input = document.getElementById('userPrompt');
  input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
          e.preventDefault(); // Prevent the default action to stop submitting the form
          sendPrompt();
      }
  });
});

function autoScrollToBottom() {
  const responseElement = document.getElementById('response');
  responseElement.scrollTop = responseElement.scrollHeight;
}
