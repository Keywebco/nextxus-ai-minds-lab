/**
 * Federation Integration Pack v1
 * NextXus Federation — Gemini AI Chat + Google Sign-In + Media Library
 * Gold (#c9a84c) on Black (#0a0a0a), monospace, truth-first
 * 
 * Pre-rendered semantic HTML injected server-side; JS enhances interactivity.
 * GEMINI_API_KEY is NEVER exposed client-side — all AI calls proxy through /api/gemini
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const FED_CONFIG = {
    geminiEndpoint: '/api/gemini',
    googleClientId: '134917241648-9goc8mcat23m1qkts62ujnq723a81n2v.apps.googleusercontent.com',
    isThrone: false,      // Set true on nextxus.tech admin pages
    siteName: document.title || 'NextXus',
  };

  // Detect config from page
  if (window.FED_GOOGLE_CLIENT_ID) FED_CONFIG.googleClientId = window.FED_GOOGLE_CLIENT_ID;
  if (document.body.dataset.fedThrone === 'true') FED_CONFIG.isThrone = true;
  if (window.location.hostname.includes('nextxus.tech')) FED_CONFIG.isThrone = true;

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k,v]) => {
      if (k === 'className') e.className = v;
      else if (k === 'innerHTML') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    if (children) {
      if (typeof children === 'string') e.textContent = children;
      else if (Array.isArray(children)) children.forEach(c => { if(c) e.appendChild(c); });
      else e.appendChild(children);
    }
    return e;
  }

  function initGeminiChat() {
    const trigger = el('button', { className: 'fed-chat-trigger', 'aria-label': 'Open Federation AI Chat', title: 'Federation AI Assistant', innerHTML: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>' });
    const panel = el('div', { className: 'fed-chat-panel' });
    panel.innerHTML = '<div class="fed-chat-header"><h3>FEDERATION AI</h3><button class="fed-chat-close" aria-label="Close chat">&times;</button></div><div class="fed-chat-messages" role="log" aria-live="polite"><div class="fed-msg system">Federation AI Assistant</div></div><div class="fed-chat-input-area"><input class="fed-chat-input" type="text" placeholder="Type your question..." aria-label="Chat message" autocomplete="off"><button class="fed-chat-send" aria-label="Send message">SEND</button></div>';
    document.body.appendChild(trigger);
    document.body.appendChild(panel);
    const messages = panel.querySelector('.fed-chat-messages');
    const input = panel.querySelector('.fed-chat-input');
    const sendBtn = panel.querySelector('.fed-chat-send');
    const closeBtn = panel.querySelector('.fed-chat-close');
    let isOpen = false;
    function toggleChat() { isOpen = !isOpen; panel.classList.toggle('active', isOpen); if (isOpen) input.focus(); }
    trigger.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    document.addEventListener('click', function(e) { if (isOpen && !panel.contains(e.target) && !trigger.contains(e.target)) { isOpen = false; panel.classList.remove('active'); } });
    function addMessage(text, role) { const msg = el('div', { className: 'fed-msg ' + role }, text); messages.appendChild(msg); messages.scrollTop = messages.scrollHeight; return msg; }
    async function sendMessage() { const text = input.value.trim(); if (!text) return; input.value = ''; sendBtn.disabled = true; addMessage(text, 'user'); try { const resp = await fetch(FED_CONFIG.geminiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) }); if (!resp.ok) throw new Error('Network error'); const data = await resp.json(); if (data.reply) addMessage(data.reply, 'assistant'); else addMessage('No response.', 'system'); } catch (err) { addMessage('Connection error.', 'system'); } sendBtn.disabled = false; input.focus(); }
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  }

  function initGoogleSignIn() {
    const stored = localStorage.getItem('fed_user');
    if (stored) { try { showWelcome(JSON.parse(stored)); return; } catch(e) { localStorage.removeItem('fed_user'); } }
    if (!FED_CONFIG.googleClientId) { injectSignInButton(null); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    script.onload = function() { google.accounts.id.initialize({ client_id: FED_CONFIG.googleClientId, callback: handleGoogleSignIn, auto_select: false }); injectSignInButton(true); };
    document.head.appendChild(script);
  }

  function injectSignInButton(gsiReady) {
    const nav = document.querySelector('nav, header, [role="navigation"], .nav, .header, .navbar');
    if (!nav) return;
    const container = el('div', { className: 'fed-auth-bar' });
    if (gsiReady) { const btn = el('button', { className: 'fed-google-signin', innerHTML: 'Sign in with Google' }); btn.addEventListener('click', function() { google.accounts.id.prompt(); }); container.appendChild(btn); }
    else { const btn = el('button', { className: 'fed-google-signin', innerHTML: 'Sign in (config pending)' }); btn.disabled = true; btn.style.opacity = '0.5'; container.appendChild(btn); }
    nav.appendChild(container);
  }

  function handleGoogleSignIn(response) { const payload = JSON.parse(atob(response.credential.split('.')[1])); const user = { name: payload.name || payload.email, email: payload.email, picture: payload.picture || '', sub: payload.sub }; localStorage.setItem('fed_user', JSON.stringify(user)); showWelcome(user); }
  function showWelcome(user) { document.querySelectorAll('.fed-auth-bar').forEach(e => e.remove()); const nav = document.querySelector('nav, header, [role="navigation"], .nav, .header, .navbar'); if (!nav) return; const container = el('div', { className: 'fed-auth-bar' }); const welcome = el('div', { className: 'fed-user-welcome' }); welcome.appendChild(el('span', {}, 'Welcome, ' + user.name.split(' ')[0])); const signout = el('button', { className: 'fed-user-signout' }, 'Sign out'); signout.addEventListener('click', function() { localStorage.removeItem('fed_user'); location.reload(); }); container.appendChild(welcome); container.appendChild(signout); nav.appendChild(container); }

  function initMediaLibrary() { if (!FED_CONFIG.isThrone) return; }

  function init() { if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); } }
  function boot() { initGeminiChat(); initGoogleSignIn(); initMediaLibrary(); console.log('[Federation Integration Pack v1] Loaded'); }
  init();
})();
