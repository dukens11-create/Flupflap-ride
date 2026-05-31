const STORAGE_KEYS = {
  accessToken: 'drive.accessToken',
  refreshToken: 'drive.refreshToken',
  user: 'drive.user'
};
const MAP_EDGE_PADDING_PERCENT = 2;

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setMessage(kind, text) {
  const error = document.getElementById('dashboard-error');
  const success = document.getElementById('dashboard-success');
  error.classList.add('d-none');
  success.classList.add('d-none');
  if (!text) return;
  const target = kind === 'error' ? error : success;
  target.textContent = text;
  target.classList.remove('d-none');
}

function toggleLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  const text = button.querySelector('.btn-text');
  const spinner = button.querySelector('.spinner-border');
  if (text && spinner) {
    text.classList.toggle('d-none', isLoading);
    spinner.classList.toggle('d-none', !isLoading);
  }
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return false;
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const payload = await response.json();
  if (!response.ok || payload.error || !payload.accessToken) return false;
  localStorage.setItem(STORAGE_KEYS.accessToken, payload.accessToken);
  if (payload.refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, payload.refreshToken);
  }
  return true;
}

async function apiRequest(path, options = {}, retry = true) {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json();

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiRequest(path, options, false);
  }
  if (response.status === 401) {
    clearSession();
    window.location.href = '/';
    throw new Error('Session expired');
  }

  if (!response.ok || payload.error) {
    const message = payload.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

function renderProfile() {
  const user = getStoredUser();
  document.getElementById('user-email').textContent = user.email || '-';
  document.getElementById('user-role').textContent = user.role || '-';
  document.getElementById('user-id').textContent = user.id || '-';
  document.getElementById('jwt-token').value = localStorage.getItem(STORAGE_KEYS.accessToken) || '';
}

function renderRides(rides) {
  const list = document.getElementById('ride-history');
  list.innerHTML = '';
  if (!Array.isArray(rides) || rides.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'list-group-item text-body-secondary';
    empty.textContent = 'No rides yet.';
    list.appendChild(empty);
    return;
  }

  rides.forEach(ride => {
    const item = document.createElement('li');
    item.className = 'list-group-item';
    const title = document.createElement('div');
    title.className = 'fw-semibold text-capitalize';
    title.textContent = `${ride.status} • ${ride.fareEstimate ?? '-'} ${ride.currency || 'USD'}`;
    const details = document.createElement('small');
    details.className = 'text-body-secondary d-block mt-1';
    details.textContent = `Ride ID: ${ride.id} | ${ride.updatedAt || ride.createdAt || ''}`;
    item.appendChild(title);
    item.appendChild(details);
    list.appendChild(item);
  });
}

async function loadRideHistory() {
  const payload = await apiRequest('/api/rides/history');
  renderRides(payload.rides);
}

async function requestRide(event) {
  event.preventDefault();
  const button = document.getElementById('request-ride-btn');
  toggleLoading(button, true);
  try {
    const pickupLat = Number(document.getElementById('pickup-lat').value);
    const pickupLng = Number(document.getElementById('pickup-lng').value);
    const dropoffLat = Number(document.getElementById('dropoff-lat').value);
    const dropoffLng = Number(document.getElementById('dropoff-lng').value);

    if ([pickupLat, pickupLng, dropoffLat, dropoffLng].some(value => Number.isNaN(value))) {
      throw new Error('Invalid coordinates. Enter valid numbers for all fields.');
    }

    await apiRequest('/api/rides/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickupLat, pickupLng, dropoffLat, dropoffLng })
    });
    setMessage('success', 'Ride requested successfully.');
    await loadRideHistory();
  } catch (error) {
    setMessage('error', error.message || 'Could not request ride');
  } finally {
    toggleLoading(button, false);
  }
}

function plotLocation(latitude, longitude) {
  const text = document.getElementById('location-text');
  const pin = document.getElementById('location-pin');
  text.textContent = `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`;
  const x = ((longitude + 180) / 360) * 100;
  const y = ((90 - latitude) / 180) * 100;
  pin.style.left = `${Math.max(MAP_EDGE_PADDING_PERCENT, Math.min(100 - MAP_EDGE_PADDING_PERCENT, x))}%`;
  pin.style.top = `${Math.max(MAP_EDGE_PADDING_PERCENT, Math.min(100 - MAP_EDGE_PADDING_PERCENT, y))}%`;
  pin.classList.remove('d-none');
}

function initLocation() {
  if (!navigator.geolocation) {
    document.getElementById('location-text').textContent = 'Geolocation not supported.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => plotLocation(coords.latitude, coords.longitude),
    () => {
      document.getElementById('location-text').textContent = 'Location permission denied.';
    },
    { timeout: 8000, maximumAge: 60_000 }
  );
}

async function logout() {
  try {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    }
  } finally {
    clearSession();
    window.location.href = '/';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (!accessToken) {
    window.location.href = '/';
    return;
  }

  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('ride-form').addEventListener('submit', requestRide);
  document.getElementById('refresh-history-btn').addEventListener('click', async () => {
    try {
      await loadRideHistory();
      setMessage('success', 'Ride history refreshed.');
    } catch (error) {
      setMessage('error', error.message || 'Failed to load history');
    }
  });

  renderProfile();
  initLocation();
  try {
    await loadRideHistory();
  } catch (error) {
    setMessage('error', error.message || 'Failed to load history');
  }
});
