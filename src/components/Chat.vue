<template>
  <div class="chat-container">
    <header class="header">
      <div class="logo">
        <img src="@/assets/open-logo.png" alt="Open Logo" class="logo-image">
      </div>
    </header>

    <main class="chat-content" ref="chatContentRef">
      <div v-if="messages.length === 0" class="empty-state">
        <p>Start the conversation by asking a question.</p>
      </div>

      <div v-else class="messages-container">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <div class="message-bubble">
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>

        <div v-if="isLoading" class="message assistant-message">
          <div class="message-bubble">
            <div class="message-content loading">
              <div class="dot-typing"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="input-container">
      <div class="input-wrapper">
        <input
          type="text"
          placeholder="Ask anything..."
          class="chat-input"
          v-model="userInput"
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        />
        <button class="send-button" @click="sendMessage" :disabled="isLoading || !userInput.trim()">
          <svg class="send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20L12 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M18 10L12 4L6 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {ref, watch, nextTick} from 'vue';

const CLOUD_FUNCTION_URL = 'https://us-central1-open-openai-app.cloudfunctions.net/askOpenAI';

const userInput = ref('');
const messages = ref([]);
const isLoading = ref(false);
const chatContentRef = ref(null);

// Watch for changes in messages array and scroll down
watch(messages, () => {
  scrollToBottom();
}, {deep: true});

const sendMessage = async () => {
  if (userInput.value.trim() && !isLoading.value) {
    const userMessage = userInput.value.trim();

    messages.value.push({
      role: 'user',
      content: userMessage
    });

    userInput.value = '';
    isLoading.value = true;

    try {
      await scrollToBottom();

      const response = await callCloudFunction(userMessage);

      messages.value.push({
        role: 'assistant',
        content: response.data.text
      });
    } catch (error) {
      console.error('Error occurred during sending message:', error);

      messages.value.push({
        role: 'assistant',
        content: 'Error occurred. Please try again later.'
      });
    } finally {
      isLoading.value = false;
      await scrollToBottom();
    }
  }
};

const callCloudFunction = async (prompt) => {
  const response = await fetch(CLOUD_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({prompt})
  });

  return await response.json();
};

// Function to scroll the chat content to the bottom
const scrollToBottom = async () => {
  await nextTick();
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
  }
};

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Main container taking full screen */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #ffffff;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  background-color: #fafafa;
}

.logo {
  position: relative;
  width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
}

.chat-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #ffffff;
  scroll-behavior: smooth;
}

.empty-state {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #888;
  text-align: center;
  padding: 20px;
  font-size: 0.95em;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  max-width: 80%;
}
.user-message {
  justify-content: flex-end;
  align-self: flex-end;
}

.assistant-message {
  justify-content: flex-start;
  align-self: flex-start;
  max-width: fit-content;
}

.message-bubble {
  padding: 12px 18px;
  border-radius: 20px;
  max-width: 100%;
}

.user-message .message-bubble {
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 5px;
}

.assistant-message .message-bubble {
  background-color: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 5px;
}

.message-content {
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-wrap: break-word;
  max-width: 100%;
}

.message-content.loading {
  min-width: 50px;
  min-height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.dot-typing {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888;
  color: #888;
  animation: dot-typing-jump 1.4s infinite ease-in-out;
}

.dot-typing::before,
.dot-typing::after {
  content: '';
  position: absolute;
  top: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888;
  color: #888;
  animation: dot-typing-jump 1.4s infinite ease-in-out;
}

.dot-typing::before {
  left: -15px; /* Space out dots */
  animation-delay: -0.32s;
}

.dot-typing::after {
  left: 15px; /* Space out dots */
  animation-delay: -0.16s;
}

@keyframes dot-typing-jump {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.input-container {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  background-color: #fafafa;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 25px;
  padding: 5px 10px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #007bff;
  box-shadow: 0 1px 4px rgba(0, 123, 255, 0.2);
}

.chat-input {
  flex-grow: 1;
  border: none;
  background: transparent;
  padding: 12px 15px;
  font-size: 1rem;
  outline: none;
  color: #333;
}

.chat-input::placeholder {
  color: #999;
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #007bff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 5px;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  color: white;
}

.send-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.send-button:disabled {
  background-color: #a0c7e4;
  opacity: 0.7;
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
}

/* Responsive Adjustments */
/* Keep full width on mobile */
/* Adjust layout slightly for tablets and smaller desktops */
@media (min-width: 768px) {
  .message {
    max-width: 75%;
  }

  .input-wrapper {
    max-width: 90%;
    margin: 0 auto;
  }

  .chat-container {
    max-width: 1000px;
    margin: 10px auto;
    height: calc(100vh - 20px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
}

/* Adjust layout for larger desktops */
@media (min-width: 1200px) {
  .chat-content {
    padding: 24px 30px;
  }

  .input-container {
    padding: 20px 30px;
  }

  .message {
    max-width: 70%;
  }

  .chat-container {
    max-width: 1200px;
    margin: 20px auto;
    height: calc(100vh - 40px);
  }
}

.logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background-color: #eee;
}

.logo-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

</style>
