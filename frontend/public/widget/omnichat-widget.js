(function() {
  'use strict';

  // Get configuration from window
  const config = window.OmniChatConfig || {};
  
  const defaultConfig = {
    widgetId: 'default-widget',
    apiUrl: 'http://localhost:3001',
    primaryColor: '#3b82f6',
    position: 'bottom-right',
    greetingMessage: 'Hi! How can we help you today?',
    welcomeMessage: 'Welcome! We\'re here to help.',
    offlineMessage: 'We\'re currently offline. Leave us a message!',
    showAgentAvatar: true,
    enableFileUpload: true,
    enableEmoji: true,
    soundEnabled: true
  };

  // Merge configs
  const widgetConfig = { ...defaultConfig, ...config };

  // Widget state
  let isOpen = false;
  let isMinimized = false;
  let messages = [];
  let sessionId = null;
  let userName = null;
  let userEmail = null;
  let socket = null;

  // Initialize Socket.IO connection
  function initializeSocket() {
    // Load Socket.IO library
    if (typeof io === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
      script.onload = () => {
        connectSocket();
      };
      document.head.appendChild(script);
    } else {
      connectSocket();
    }
  }

  function connectSocket() {
    socket = io(widgetConfig.apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ Widget connected to Socket.IO');
      
      // Join room for this session
      socket.emit('join-widget-session', {
        sessionId: sessionId,
        widgetId: widgetConfig.widgetId
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Widget disconnected from Socket.IO');
    });

    // Listen for incoming messages from agent
    socket.on('sent-message', (data) => {
      // Check if message is for this session
      if (data.chatId === sessionId || data.conversationId === sessionId) {
        console.log('📨 Received message from agent:', data);
        
        addMessage({
          text: data.message.content,
          sender: 'agent',
          timestamp: new Date(data.message.timestamp)
        });

        // Play notification sound
        if (widgetConfig.soundEnabled) {
          playNotificationSound();
        }

        // Show badge if widget is closed
        if (!isOpen) {
          const badge = document.getElementById('omnichat-badge');
          const currentCount = parseInt(badge.textContent) || 0;
          badge.textContent = currentCount + 1;
          badge.style.display = 'block';
        }
      }
    });

    // Listen for typing indicator
    socket.on('agent-typing', (data) => {
      if (data.chatId === sessionId || data.conversationId === sessionId) {
        if (data.isTyping) {
          showTypingIndicator();
        } else {
          hideTypingIndicator();
        }
      }
    });
  }

  // Create widget HTML
  function createWidget() {
    const positionClasses = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };

    const position = positionClasses[widgetConfig.position] || positionClasses['bottom-right'];

    const widgetHTML = `
      <div id="omnichat-widget" class="omnichat-widget ${position}">
        <!-- Chat Button -->
        <div id="omnichat-button" class="omnichat-button" style="background-color: ${widgetConfig.primaryColor}">
          <svg class="omnichat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span id="omnichat-badge" class="omnichat-badge" style="display: none;">0</span>
        </div>

        <!-- Chat Window -->
        <div id="omnichat-window" class="omnichat-window" style="display: none;">
          <!-- Header -->
          <div class="omnichat-header" style="background-color: ${widgetConfig.primaryColor}">
            <div class="omnichat-header-content">
              <div class="omnichat-header-info">
                <h3 class="omnichat-header-title">Customer Support</h3>
                <p class="omnichat-header-status">
                  <span class="omnichat-status-dot"></span>
                  Online
                </p>
              </div>
              <div class="omnichat-header-actions">
                <button id="omnichat-minimize" class="omnichat-header-btn" title="Minimize">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button id="omnichat-close" class="omnichat-header-btn" title="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div id="omnichat-messages" class="omnichat-messages">
            <div class="omnichat-welcome" id="omnichat-welcome-screen">
              <div class="omnichat-welcome-icon" style="background-color: ${widgetConfig.primaryColor}20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${widgetConfig.primaryColor}" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h4 class="omnichat-welcome-title">${widgetConfig.welcomeMessage}</h4>
              <p class="omnichat-welcome-text">${widgetConfig.greetingMessage}</p>
              
              <!-- Name Form -->
              <div class="omnichat-name-form" id="omnichat-name-form">
                <p class="omnichat-form-label">Please introduce yourself to get started:</p>
                <input 
                  type="text" 
                  id="omnichat-name-input" 
                  class="omnichat-form-input" 
                  placeholder="Your name *"
                  required
                />
                <input 
                  type="email" 
                  id="omnichat-email-input" 
                  class="omnichat-form-input" 
                  placeholder="Your email (optional)"
                />
                <button 
                  id="omnichat-start-chat" 
                  class="omnichat-start-btn" 
                  style="background-color: ${widgetConfig.primaryColor}"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="omnichat-input-container">
            <div class="omnichat-input-wrapper">
              ${widgetConfig.enableFileUpload ? `
                <button id="omnichat-attach" class="omnichat-input-btn" title="Attach file">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </button>
              ` : ''}
              <input 
                type="text" 
                id="omnichat-input" 
                class="omnichat-input" 
                placeholder="Type your message..."
                autocomplete="off"
              />
              ${widgetConfig.enableEmoji ? `
                <button id="omnichat-emoji" class="omnichat-input-btn" title="Add emoji">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </button>
              ` : ''}
              <button id="omnichat-send" class="omnichat-send-btn" style="background-color: ${widgetConfig.primaryColor}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>

          <!-- Powered by -->
          <div class="omnichat-footer">
            <span class="omnichat-footer-text">Powered by <strong>OmniChat</strong></span>
          </div>
        </div>
      </div>
    `;

    // Inject styles
    injectStyles();

    // Inject HTML
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);

    // Attach event listeners
    attachEventListeners();

    // Initialize session
    initializeSession();
  }

  function injectStyles() {
    const styles = `
      .omnichat-widget {
        position: fixed;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .omnichat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        position: relative;
      }

      .omnichat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .omnichat-icon {
        color: white;
      }

      .omnichat-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ef4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }

      .omnichat-window {
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 100px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin-bottom: 80px;
      }

      .omnichat-header {
        padding: 16px;
        color: white;
      }

      .omnichat-header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .omnichat-header-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 4px 0;
      }

      .omnichat-header-status {
        font-size: 12px;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        opacity: 0.9;
      }

      .omnichat-status-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        display: inline-block;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .omnichat-header-actions {
        display: flex;
        gap: 8px;
      }

      .omnichat-header-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .omnichat-header-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .omnichat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f9fafb;
      }

      .omnichat-welcome {
        text-align: center;
        padding: 32px 16px;
      }

      .omnichat-welcome-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
      }

      .omnichat-welcome-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 8px 0;
      }

      .omnichat-welcome-text {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }

      .omnichat-message {
        margin-bottom: 12px;
        display: flex;
        gap: 8px;
      }

      .omnichat-message.user {
        flex-direction: row-reverse;
      }

      .omnichat-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e5e7eb;
        flex-shrink: 0;
      }

      .omnichat-message-content {
        max-width: 70%;
      }

      .omnichat-message-bubble {
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
      }

      .omnichat-message.agent .omnichat-message-bubble {
        background: white;
        color: #111827;
        border-bottom-left-radius: 4px;
      }

      .omnichat-message.user .omnichat-message-bubble {
        background: ${widgetConfig.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .omnichat-message-time {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 4px;
        padding: 0 4px;
      }

      .omnichat-input-container {
        border-top: 1px solid #e5e7eb;
        background: white;
      }

      .omnichat-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
      }

      .omnichat-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .omnichat-input:focus {
        border-color: ${widgetConfig.primaryColor};
      }

      .omnichat-input-btn {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .omnichat-input-btn:hover {
        background: #f3f4f6;
        color: #111827;
      }

      .omnichat-send-btn {
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .omnichat-send-btn:hover {
        transform: scale(1.05);
      }

      .omnichat-footer {
        padding: 8px 16px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .omnichat-footer-text {
        font-size: 11px;
        color: #9ca3af;
      }

      .omnichat-name-form {
        margin-top: 24px;
        padding: 0 16px;
      }

      .omnichat-form-label {
        font-size: 13px;
        color: #6b7280;
        margin: 0 0 12px 0;
        text-align: left;
      }

      .omnichat-form-input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 10px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .omnichat-form-input:focus {
        border-color: ${widgetConfig.primaryColor};
      }

      .omnichat-start-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 4px;
      }

      .omnichat-start-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .omnichat-start-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      @media (max-width: 480px) {
        .omnichat-window {
          width: calc(100vw - 32px);
          height: calc(100vh - 100px);
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  function attachEventListeners() {
    const button = document.getElementById('omnichat-button');
    const closeBtn = document.getElementById('omnichat-close');
    const minimizeBtn = document.getElementById('omnichat-minimize');
    const sendBtn = document.getElementById('omnichat-send');
    const input = document.getElementById('omnichat-input');
    const startChatBtn = document.getElementById('omnichat-start-chat');
    const nameInput = document.getElementById('omnichat-name-input');

    button.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', closeWidget);
    minimizeBtn.addEventListener('click', minimizeWidget);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Name form listeners
    if (startChatBtn) {
      startChatBtn.addEventListener('click', handleStartChat);
    }
    if (nameInput) {
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleStartChat();
      });
    }
  }

  function toggleWidget() {
    const window = document.getElementById('omnichat-window');
    const button = document.getElementById('omnichat-button');
    
    if (isOpen) {
      window.style.display = 'none';
      button.style.display = 'flex';
      isOpen = false;
    } else {
      window.style.display = 'flex';
      button.style.display = 'none';
      isOpen = true;
      
      // Clear badge
      const badge = document.getElementById('omnichat-badge');
      badge.style.display = 'none';
      badge.textContent = '0';
    }
  }

  function closeWidget() {
    toggleWidget();
  }

  function minimizeWidget() {
    const window = document.getElementById('omnichat-window');
    const button = document.getElementById('omnichat-button');
    
    window.style.display = 'none';
    button.style.display = 'flex';
    isOpen = false;
    isMinimized = true;
  }

  function sendMessage() {
    const input = document.getElementById('omnichat-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message to UI
    addMessage({
      text: message,
      sender: 'user',
      timestamp: new Date()
    });

    // Clear input
    input.value = '';

    // Send to API
    sendToAPI(message);
  }

  function addMessage(message) {
    const messagesContainer = document.getElementById('omnichat-messages');
    
    // Remove welcome message if exists
    const welcome = messagesContainer.querySelector('.omnichat-welcome');
    if (welcome) welcome.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `omnichat-message ${message.sender}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    messageEl.innerHTML = `
      ${message.sender === 'agent' && widgetConfig.showAgentAvatar ? '<div class="omnichat-message-avatar"></div>' : ''}
      <div class="omnichat-message-content">
        <div class="omnichat-message-bubble">${escapeHtml(message.text)}</div>
        <div class="omnichat-message-time">${time}</div>
      </div>
    `;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    messages.push(message);
  }

  function sendToAPI(message) {
    // Show typing indicator
    showTypingIndicator();

    const headers = {
      'Content-Type': 'application/json'
    };

    // Add API key if provided
    if (widgetConfig.apiKey) {
      headers['X-API-Key'] = widgetConfig.apiKey;
    }

    // Emit typing event via Socket.IO
    if (socket && socket.connected) {
      socket.emit('customer-typing', {
        sessionId: sessionId,
        widgetId: widgetConfig.widgetId,
        isTyping: false
      });
    }

    fetch(`${widgetConfig.apiUrl}/api/widget/message`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        widgetId: widgetConfig.widgetId,
        sessionId: sessionId,
        message: message,
        userName: userName,
        userEmail: userEmail,
        timestamp: new Date().toISOString()
      })
    })
    .then(response => response.json())
    .then(data => {
      hideTypingIndicator();
      
      if (data.success && data.reply) {
        addMessage({
          text: data.reply,
          sender: 'agent',
          timestamp: new Date()
        });

        // Play sound if enabled
        if (widgetConfig.soundEnabled) {
          playNotificationSound();
        }
      }
    })
    .catch(error => {
      hideTypingIndicator();
      console.error('Failed to send message:', error);
      
      // Show error message
      addMessage({
        text: 'Sorry, we couldn\'t send your message. Please try again.',
        sender: 'agent',
        timestamp: new Date()
      });
    });
  }

  function showTypingIndicator() {
    const messagesContainer = document.getElementById('omnichat-messages');
    const indicator = document.createElement('div');
    indicator.id = 'omnichat-typing';
    indicator.className = 'omnichat-message agent';
    indicator.innerHTML = `
      <div class="omnichat-message-avatar"></div>
      <div class="omnichat-message-content">
        <div class="omnichat-message-bubble">
          <span style="opacity: 0.5;">Typing...</span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('omnichat-typing');
    if (indicator) indicator.remove();
  }

  function handleStartChat() {
    const nameInput = document.getElementById('omnichat-name-input');
    const emailInput = document.getElementById('omnichat-email-input');
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    // Validate name
    if (!name) {
      nameInput.focus();
      nameInput.style.borderColor = '#ef4444';
      setTimeout(() => {
        nameInput.style.borderColor = '#e5e7eb';
      }, 2000);
      return;
    }

    // Save user info
    userName = name;
    userEmail = email || null;
    localStorage.setItem('omnichat-user-name', userName);
    if (userEmail) {
      localStorage.setItem('omnichat-user-email', userEmail);
    }

    // Hide name form
    const nameForm = document.getElementById('omnichat-name-form');
    const welcomeTitle = document.querySelector('.omnichat-welcome-title');
    const welcomeText = document.querySelector('.omnichat-welcome-text');
    
    if (nameForm) nameForm.style.display = 'none';
    if (welcomeTitle) welcomeTitle.textContent = `Hi ${userName}!`;
    if (welcomeText) welcomeText.textContent = 'How can we help you today?';

    // Enable input
    const input = document.getElementById('omnichat-input');
    if (input) {
      input.disabled = false;
      input.placeholder = 'Type your message...';
      input.focus();
    }

    // Send welcome message from agent
    addMessage({
      text: `Hi ${userName}! Thanks for reaching out. How can I assist you today?`,
      sender: 'agent',
      timestamp: new Date()
    });
  }

  function initializeSession() {
    // Generate or retrieve session ID
    sessionId = localStorage.getItem('omnichat-session-id');
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('omnichat-session-id', sessionId);
    }

    // Retrieve user info if exists
    userName = localStorage.getItem('omnichat-user-name');
    userEmail = localStorage.getItem('omnichat-user-email');

    // Check if user has already provided their info
    if (userName) {
      // Hide name form and show welcome back message
      const nameForm = document.getElementById('omnichat-name-form');
      const welcomeTitle = document.querySelector('.omnichat-welcome-title');
      const welcomeText = document.querySelector('.omnichat-welcome-text');
      
      if (nameForm) nameForm.style.display = 'none';
      if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${userName}!`;
      if (welcomeText) welcomeText.textContent = 'How can we help you today?';
      
      // Enable input
      const input = document.getElementById('omnichat-input');
      if (input) input.disabled = false;
    } else {
      // Disable input until user provides name
      const input = document.getElementById('omnichat-input');
      if (input) {
        input.disabled = true;
        input.placeholder = 'Please introduce yourself first...';
      }
    }

    // Initialize Socket.IO connection
    initializeSocket();

    // Load previous messages if any
    loadPreviousMessages();
  }

  function loadPreviousMessages() {
    // TODO: Implement loading previous messages from API
  }

  function playNotificationSound() {
    // Simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();
