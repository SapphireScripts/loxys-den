/**
 * Loxys Den Auth - Backend API version
 * 
 * Uses the real backend instead of localStorage.
 * Set API_BASE to your backend URL (e.g. http://localhost:3000)
 */
(function() {
  const API_BASE = window.LOXYS_API || ((window.location.protocol === 'http:' || window.location.protocol === 'https:') ? window.location.origin : 'http://localhost:3000');
  const TOKEN_KEY = 'loxys_token';
  const USER_KEY = 'loxys_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  function setUser(username) {
    if (username) localStorage.setItem(USER_KEY, username);
    else localStorage.removeItem(USER_KEY);
  }

  async function api(path, options = {}) {
    const url = API_BASE + path;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (getToken()) headers['Authorization'] = 'Bearer ' + getToken();
    const res = await fetch(url, { ...options, headers });
    return res.json();
  }

  window.Auth = {
    register: async function(username, password) {
      const r = await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (r.ok) {
        setToken(r.token);
        setUser(r.user);
      }
      return r;
    },

    login: async function(username, password) {
      const r = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (r.ok) {
        setToken(r.token);
        setUser(r.user);
      }
      return r;
    },

    logout: function() {
      setToken(null);
      setUser(null);
    },

    getCurrentUser: function() {
      return localStorage.getItem(USER_KEY);
    },

    getBalance: async function() {
      const r = await api('/api/balance');
      return r.ok ? r.balance : 10000;
    },

    isAdmin: async function() {
      const r = await api('/api/me');
      return r.ok && r.isAdmin === true;
    },

    giveBalance: async function(targetUsername, amount) {
      const r = await api('/api/admin/give-balance', {
        method: 'POST',
        body: JSON.stringify({ targetUsername, amount })
      });
      return r;
    },

    setBalance: async function(bal) {
      const cur = await this.getBalance();
      return this.addBalance(Math.floor(bal) - cur);
    },

    addBalance: async function(delta) {
      const r = await api('/api/balance', {
        method: 'POST',
        body: JSON.stringify({ delta })
      });
      return r;
    },

    getMe: async function() {
      const r = await api('/api/me');
      if (r.ok && r.user) {
        setUser(r.user);
        return r;
      }
      return r.ok ? r : null;
    },

    requireAuth: function(redirectTo) {
      if (!getToken()) {
        window.location.href = (redirectTo || 'login.html') + 
          (redirectTo && redirectTo.includes('?') ? '&' : '?') + 
          'redirect=' + encodeURIComponent(window.location.href);
        return false;
      }
      return true;
    },

    redirectIfLoggedIn: function(goTo) {
      if (getToken()) {
        window.location.href = goTo || 'index.html';
        return true;
      }
      return false;
    }
  };

  window.formatBalance = function(n) {
    n = Number(n);
    if (isNaN(n) || n < 0) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'b';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(Math.floor(n));
  };

  window.parseBetInput = function(str) {
    if (str == null) return NaN;
    str = String(str).trim().toLowerCase().replace(/\s/g, '');
    if (!str) return NaN;
    const m = str.match(/^([\d.]+)\s*(k|m|b)?$/);
    if (!m) return NaN;
    let n = parseFloat(m[1]);
    if (isNaN(n)) return NaN;
    if (m[2] === 'k') n *= 1e3;
    else if (m[2] === 'm') n *= 1e6;
    else if (m[2] === 'b') n *= 1e9;
    return Math.floor(n);
  };

  window.getLeaderboard = async function(limit) {
    const r = await api('/api/leaderboard?limit=' + (limit || 10));
    return r.ok ? r.entries : [];
  };
})();
