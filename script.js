// =============================================================
// KONFIGURATION — Sätt in din PandaScore API-nyckel här
// Skapa ett gratis konto på https://pandascore.co för att få en nyckel
// =============================================================
const API_TOKEN = 'YOUR_PANDASCORE_API_TOKEN';

const BASE_URL = 'https://api.pandascore.co';
const PER_PAGE = 10; // Antal matcher att visa per spel

// API-endpoints för varje spel
const ENDPOINTS = {
  lol: '/lol/matches/upcoming',
  cs: '/csgo/matches/upcoming',
};

// =============================================================
// Tidsformatering — visar matchens starttid i lokal tid
// =============================================================
function formatTime(isoString) {
  if (!isoString) return 'Tid ej bestämd';

  const date = new Date(isoString);
  const now = new Date();

  // Kolla om matchen är idag eller imorgon
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const matchDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let dayLabel = '';
  if (matchDay.getTime() === today.getTime()) {
    dayLabel = 'Idag';
  } else if (matchDay.getTime() === tomorrow.getTime()) {
    dayLabel = 'Imorgon';
  } else {
    dayLabel = date.toLocaleDateString('sv-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  const time = date.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dayLabel}, ${time}`;
}

// =============================================================
// Hämta matcher från API:et
// =============================================================
async function fetchMatches(game) {
  const url = `${BASE_URL}${ENDPOINTS[game]}?per_page=${PER_PAGE}&sort=scheduled_at`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  // Hantera specifika HTTP-felkoder
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// =============================================================
// Skapa ett team-element (logotyp + namn)
// =============================================================
function createTeamElement(opponent) {
  const team = document.createElement('div');
  team.className = 'team';

  if (opponent && opponent.opponent) {
    const teamData = opponent.opponent;

    // Logotyp med fallback till initial-bokstav
    if (teamData.image_url) {
      const logo = document.createElement('img');
      logo.className = 'team-logo';
      logo.src = teamData.image_url;
      logo.alt = teamData.name;
      logo.loading = 'lazy';
      // Om bilden inte kan laddas, visa initial istället
      logo.onerror = function () {
        const initial = document.createElement('div');
        initial.className = 'team-initial';
        initial.textContent = teamData.name.charAt(0).toUpperCase();
        this.replaceWith(initial);
      };
      team.appendChild(logo);
    } else {
      const initial = document.createElement('div');
      initial.className = 'team-initial';
      initial.textContent = teamData.name.charAt(0).toUpperCase();
      team.appendChild(initial);
    }

    const name = document.createElement('span');
    name.className = 'team-name';
    name.textContent = teamData.name;
    team.appendChild(name);
  } else {
    // Lag ej bestämt (TBD)
    const initial = document.createElement('div');
    initial.className = 'team-initial';
    initial.textContent = '?';
    team.appendChild(initial);

    const name = document.createElement('span');
    name.className = 'team-name';
    name.textContent = 'TBD';
    team.appendChild(name);
  }

  return team;
}

// =============================================================
// Skapa ett matchkort
// =============================================================
function createMatchCard(match, game) {
  const card = document.createElement('div');
  card.className = 'match-card';

  // Turnering + spel-tagg
  const tournament = document.createElement('div');
  tournament.className = 'match-tournament';

  const tournamentName = document.createElement('span');
  tournamentName.className = 'tournament-name';
  tournamentName.textContent = match.tournament?.name || match.league?.name || 'Okänd turnering';

  const gameTag = document.createElement('span');
  gameTag.className = `game-tag ${game}`;
  gameTag.textContent = game === 'lol' ? 'LoL' : 'CS';

  tournament.appendChild(tournamentName);
  tournament.appendChild(gameTag);
  card.appendChild(tournament);

  // Lag vs lag
  const teams = document.createElement('div');
  teams.className = 'match-teams';

  const teamA = createTeamElement(match.opponents?.[0]);
  const vs = document.createElement('span');
  vs.className = 'vs-label';
  vs.textContent = 'VS';
  const teamB = createTeamElement(match.opponents?.[1]);

  teams.appendChild(teamA);
  teams.appendChild(vs);
  teams.appendChild(teamB);
  card.appendChild(teams);

  // Starttid
  const time = document.createElement('div');
  time.className = 'match-time';
  time.textContent = formatTime(match.scheduled_at);
  card.appendChild(time);

  return card;
}

// =============================================================
// Rendera alla matcher i en sektion
// =============================================================
function renderMatches(matches, containerId, game) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (matches.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Inga kommande matcher just nu.';
    container.appendChild(empty);
    return;
  }

  matches.forEach((match) => {
    const card = createMatchCard(match, game);
    container.appendChild(card);
  });
}

// =============================================================
// UI-hjälpfunktioner (spinner, felmeddelande)
// =============================================================
function showSpinner(id) {
  document.getElementById(id).hidden = false;
}

function hideSpinner(id) {
  document.getElementById(id).hidden = true;
}

function showError(id, message, game) {
  const el = document.getElementById(id);
  el.hidden = false;
  el.innerHTML = '';

  const text = document.createElement('div');
  text.className = 'error-text';
  text.textContent = message;
  el.appendChild(text);

  // Retry-knapp
  const btn = document.createElement('button');
  btn.className = 'retry-btn';
  btn.textContent = 'Försök igen';
  btn.addEventListener('click', () => {
    el.hidden = true;
    loadSection(game);
  });
  el.appendChild(btn);
}

function hideError(id) {
  document.getElementById(id).hidden = true;
}

// =============================================================
// Felmeddelanden baserat på HTTP-statuskod
// =============================================================
function getErrorMessage(error) {
  if (error.status === 401 || error.status === 403) {
    return 'Ogiltig API-nyckel. Uppdatera API_TOKEN i script.js.';
  }
  if (error.status === 429) {
    return 'För många anrop. Vänta en minut och försök igen.';
  }
  if (error.status) {
    return `Serverfel (${error.status}). Försök igen senare.`;
  }
  return 'Kunde inte ansluta. Kontrollera din internetanslutning.';
}

// =============================================================
// Ladda en sektion (hämta data + rendera)
// =============================================================
async function loadSection(game) {
  const spinnerId = `${game}-spinner`;
  const errorId = `${game}-error`;
  const containerId = `${game}-matches`;

  showSpinner(spinnerId);
  hideError(errorId);

  try {
    const matches = await fetchMatches(game);
    hideSpinner(spinnerId);
    renderMatches(matches, containerId, game);
  } catch (error) {
    hideSpinner(spinnerId);
    showError(errorId, getErrorMessage(error), game);
  }
}

// =============================================================
// Initialisering — körs när sidan laddats
// =============================================================
async function init() {
  // Visa varning om ingen API-nyckel är satt
  if (API_TOKEN === 'YOUR_PANDASCORE_API_TOKEN') {
    document.getElementById('api-warning').hidden = false;
  }

  // Hämta matcher för båda spelen parallellt
  await Promise.allSettled([
    loadSection('lol'),
    loadSection('cs'),
  ]);
}

document.addEventListener('DOMContentLoaded', init);
