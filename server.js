import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import session from "express-session";
import { Pool } from "pg"; // PostgreSQL client
import SQLiteStore from "connect-sqlite3";
import { DateTime } from 'luxon';

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // update if needed
  credentials: true
}));
app.use(express.json());

// Session setup (still using SQLite for session storage)
const SQLiteStoreClass = SQLiteStore(session);
app.use(session({
  store: new SQLiteStoreClass({ db: 'sessions.db', dir: './' }),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// --- Cloud SQL connection ---
const isCloudRun = !!process.env.DB_INSTANCE;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: isCloudRun ? `/cloudsql/${process.env.DB_INSTANCE}` : process.env.DB_HOST || 'localhost',
  port: 5432
});







const quizConfigs = {
  norfolk:       { quizId: 3,  showDateISO: '2025-11-15T21:00:00', timezone: 'America/New_York', scoringDelayHours: 0, scoringEnabled: true },
  philadelphia:  { quizId: 4,  showDateISO: '2025-11-16T21:00:00', timezone: 'America/New_York', scoringDelayHours: 0, scoringEnabled: true },
  brooklyn:      { quizId: 5,  showDateISO: '2025-11-18T21:00:00', timezone: 'America/New_York', scoringDelayHours: 0, scoringEnabled: true },
  boston:        { quizId: 6,  showDateISO: '2025-11-20T21:00:00', timezone: 'America/New_York', scoringDelayHours: 0, scoringEnabled: true },
  sayreville:    { quizId: 7,  showDateISO: '2025-11-22T21:00:00', timezone: 'America/New_York', scoringDelayHours: 0, scoringEnabled: true },
  toronto:       { quizId: 8,  showDateISO: '2025-11-23T21:00:00', timezone: 'America/Toronto', scoringDelayHours: 0, scoringEnabled: true },

  pittsburgh:    { quizId: 9,  showDateISO: '2025-11-25T21:00:00', timezone: 'America/New_York', scoringDelayHours: 0, scoringEnabled: true },
  detroit:       { quizId: 10, showDateISO: '2025-11-26T21:00:00', timezone: 'America/New_York', scoringDelayHours: 0, scoringEnabled: true },
  chicago:       { quizId: 11, showDateISO: '2025-11-28T21:00:00', timezone: 'America/Chicago', scoringDelayHours: 3, scoringEnabled: false },
  columbus:      { quizId: 12, showDateISO: '2025-11-29T21:00:00', timezone: 'America/New_York', scoringDelayHours: 3, scoringEnabled: false },

  stlouis:       { quizId: 13, showDateISO: '2025-12-02T21:00:00', timezone: 'America/Chicago', scoringDelayHours: 3, scoringEnabled: false },
  denver:        { quizId: 14, showDateISO: '2025-12-04T21:00:00', timezone: 'America/Denver', scoringDelayHours: 3, scoringEnabled: false },
  saltlakecity:  { quizId: 15, showDateISO: '2025-12-06T21:00:00', timezone: 'America/Denver', scoringDelayHours: 3, scoringEnabled: false },

  seattle:       { quizId: 16, showDateISO: '2025-12-08T21:00:00', timezone: 'America/Los_Angeles', scoringDelayHours: 3, scoringEnabled: false },
  portland:      { quizId: 17, showDateISO: '2025-12-09T21:00:00', timezone: 'America/Los_Angeles', scoringDelayHours: 3, scoringEnabled: false },

  sanfrancisco:  { quizId: 18, showDateISO: '2025-12-12T21:00:00', timezone: 'America/Los_Angeles', scoringDelayHours: 3, scoringEnabled: false },
  sacramento:    { quizId: 19, showDateISO: '2025-12-13T21:00:00', timezone: 'America/Los_Angeles', scoringDelayHours: 3, scoringEnabled: false },

  lasvegas:      { quizId: 20, showDateISO: '2025-12-15T21:00:00', timezone: 'America/Los_Angeles', scoringDelayHours: 3, scoringEnabled: false },
  phoenix:       { quizId: 21, showDateISO: '2025-12-17T21:00:00', timezone: 'America/Phoenix', scoringDelayHours: 3, scoringEnabled: false }, // stays MST

  losangeles:    { quizId: 22, showDateISO: '2025-12-18T21:00:00', timezone: 'America/Los_Angeles', scoringDelayHours: 3, scoringEnabled: false }
};



// ANSWER KEYS (for scoring) — adapt per show
const answerKeys = {

  // Washington DC (example placeholder; replace real answers after show)
  // dc: {
  //   q1: "Peach",
  //   q2: "Not Warriors",
  //   q3: ["Violet","What We Do For Fun","Closer"],
  //   q4: ["Violet","What We Do For Fun","Closer"],
  //   q5: ["Violet","What We Do For Fun","Closer"],
  //   q6: "21 Questions",
  //   q7: "Tantrum"
  // }
  norfolk: {
    q1: "Peach",
    q2: "Not Warriors",
    q3: ["It Follows", "Sleep Alone", "Swing, Swing"],
    q4: ["It Follows", "Sleep Alone", "Swing, Swing"],
    q5: ["It Follows", "Sleep Alone", "Swing, Swing"],
    q6: "21 Questions",
    q7: "Reboot"

  },

   philadelphia: {
    q1: "Peach",
    q2: "Not Warriors",
    q3: ["Dizzy", "Violet", "Taste", "Group Chat"],
    q4: ["Dizzy", "Violet", "Taste", "Group Chat"],
    q5: ["Dizzy", "Violet", "Taste", "Group Chat"],
    q6: "21 Questions",
    q7: "Tantrum"

  },

    brooklyn: {
    q1: "Telephone",
    q2: "Gloom Boys",
    q3: ["Rare", "Natural Blue", "Easy to Hate"],
    q4: ["Rare", "Natural Blue", "Easy to Hate"],
    q5: ["Rare", "Natural Blue", "Easy to Hate"],
    q6: "21 Questions",
    q7: "Tantrum"

  },

  boston: {
    q1: "Peach",
    q2: "Not Warriors",
    q3: ["Teenage Jealousy", "Worst", "Violet!"],
    q4: ["Teenage Jealousy", "Worst", "Violet!"],
    q5: ["Teenage Jealousy", "Worst", "Violet!"],
    q6: "Lucky People",
    q7: "Tantrum"

  },

  sayreville : {
    q1: "Peach",
    q2: "Gloom Boys",
    q3: ["Snow Globe", "We Need To Talk", "Mad All The Time", "Fantastic"],
    q4: ["Snow Globe", "We Need To Talk", "Mad All The Time", "Fantastic"],
    q5: ["Snow Globe", "We Need To Talk", "Mad All The Time", "Fantastic"],
    q6: "Lucky People",
    q7: "Tantrum"

  },

    toronto : {
    q1: "Telephone",
    q2: "Gloom Boys",
    q3: ["Closer", "Not Warriors", "Silver", "Call Me Beep Me"],
    q4: ["Closer", "Not Warriors", "Silver", "Call Me Beep Me"],
    q5: ["Closer", "Not Warriors", "Silver", "Call Me Beep Me"],
    q6: "21 Questions",
    q7: "Tantrum"

  },

    pittsburgh : {
    q1: "Peach",
    q2: "Not Warriors",
    q3: ["Easy To Hate", "Sleep Alone", "Powerless"],
    q4: ["Easy To Hate", "Sleep Alone", "Powerless"],
    q5: ["Easy To Hate", "Sleep Alone", "Powerless"],
    q6: "21 Questions",
    q7: "Reboot"

  },

    detroit : {
    q1: "Peach",
    q2: "Gloom Boys",
    q3: [],
    q4: [],
    q5: [],
    q6: ["Lucky People", "21 Questions"],
    q7: "Reboot"

  }
};

// Utility: get config by param shortId
function getQuizConfig(shortId) {
  return quizConfigs[shortId] || null;
}

// --- Auth routes ---
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing username/password" });

  try {
    const existsRes = await pool.query("SELECT id FROM users WHERE username=$1", [username]);
    if (existsRes.rows.length > 0) return res.status(400).json({ message: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashed]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userRes = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    const user = userRes.rows[0];
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Could not log out" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/profile", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  res.json({ id: req.session.userId, username: req.session.username });
});

// --- Unified quiz routes ---

async function computeStatusForQuiz(shortId, userId) {
  const cfg = getQuizConfig(shortId);
  if (!cfg) return { status: "unknown", error: "Quiz config not found" };

  const { showDateISO, timezone } = cfg;
  const showDate = DateTime.fromISO(showDateISO, { zone: timezone });
  if (!showDate.isValid) return { status: "unknown", error: "Invalid show date" };

  const now = DateTime.now().setZone(timezone);

  // Open 2 days before show
  const opensAt = showDate.minus({ days: 2 });
  const closesAt = showDate;

  try {
    const result = await pool.query(
      "SELECT id FROM submissions WHERE quiz_id=$1 AND user_id=$2",
      [cfg.quizId, userId]
    );

    if (result.rows.length > 0) return { status: "submitted" };
  } catch (err) {
    console.error("Error checking submission:", err);
    return { status: "unknown", error: "DB error" };
  }

  if (now < opensAt) return { status: "not-open-yet", opensOn: opensAt.toISO() };
  if (now >= closesAt) return { status: "closed" };
  return { status: "open" };
}



// GET status: returns open|closed|submitted (401 if not logged in)
app.get("/quiz/:shortId/status", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });

  const { shortId } = req.params;
  const cfg = getQuizConfig(shortId);
  if (!cfg) return res.status(404).json({ message: "Quiz not found" });

  const stat = await computeStatusForQuiz(shortId, req.session.userId);
  if (stat.error) return res.status(400).json({ message: stat.error });

  // normalize to 'submitted' | 'open' | 'closed'
  if (stat.status === 'submitted') return res.json({ status: 'submitted' });
  if (stat.status === 'open') return res.json({ status: 'open' });
  if (stat.status === 'not-open-yet') return res.json({ status: 'not-open-yet', opensOn: stat.opensOn });
  if (stat.status === 'closed') return res.json({ status: 'closed' });
});

// POST submit: accept guesses when quiz is open and user hasn't submitted
app.post("/quiz/:shortId/submit", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });

  const { shortId } = req.params;
  const cfg = getQuizConfig(shortId);
  if (!cfg) return res.status(404).json({ message: "Quiz not found" });

  const statusObj = await computeStatusForQuiz(shortId, req.session.userId);
  if (statusObj.status === 'submitted') return res.status(400).json({ message: "Already submitted" });
  if (statusObj.status !== 'open') return res.status(400).json({ message: "Form not open" });

  const { q1,q2,q3,q4,q5,q6,q7 } = req.body;
  const now = new Date().toISOString();

  try {
    // Insert submission
    const insertRes = await pool.query(
      `INSERT INTO submissions (user_id, quiz_id, q1, q2, q3, q4, q5, q6, q7, timestamp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [req.session.userId, cfg.quizId, q1||'', q2||'', q3||'', q4||'', q5||'', q6||'', q7||'', now]
    );

    const submissionId = insertRes.rows[0].id;

    res.json({ message: "Guesses Received" });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get("/quiz/:shortId/score", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });

  const { shortId } = req.params;
  const cfg = getQuizConfig(shortId);
  if (!cfg) return res.status(404).json({ message: "Quiz not found" });

  // Only return score if scoring is enabled
  if (!cfg.scoringEnabled) return res.json({ score: null });

  try {
    const rowRes = await pool.query(
      "SELECT score FROM submissions WHERE quiz_id=$1 AND user_id=$2",
      [cfg.quizId, req.session.userId]
    );
    const row = rowRes.rows[0];

    res.json({ score: row ? row.score : null });
  } catch (err) {
    console.error("Score fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// --- Scoring utilities ---

function scoreSubmissionForQuiz(shortId, submission) {
  const key = answerKeys[shortId];
  if (!key) return null; // no key defined

  let score = 0;

  // Radio questions (q1,q2,q6,q7) — 1 point each
  const singleQs = ["q1", "q2", "q6", "q7"];
  singleQs.forEach(q => {
    const userVal = submission[q];
    const correct = key[q];
    if (userVal && correct) {
      const u = userVal.toString().trim().toLowerCase();

      if (Array.isArray(correct)) {
        // Case: multiple accepted answers (like Q6 now)
        const normalizedCorrect = correct.map(a => a.toString().trim().toLowerCase());
        if (normalizedCorrect.includes(u)) score += 1;
      } else {
        // Normal single-answer case
        const c = correct.toString().trim().toLowerCase();
        if (u === c) score += 1;
      }
    }
  });

  // Surprise songs (q3,q4,q5) — 2 points each, partial matches allowed
  if (Array.isArray(key.q3)) {
    const correctSet = key.q3.map(s => s.toString().trim().toLowerCase());
    const available = [...correctSet];

    const userSurprises = [submission.q3, submission.q4, submission.q5].map(s => (s || '').toString().trim().toLowerCase());

    userSurprises.forEach(u => {
      if (!u) return;

      for (let i = 0; i < available.length; i++) {
        const c = available[i];
        // partial match: user includes correct OR correct includes user input
        if (c.includes(u) || u.includes(c)) {
          score += 2;
          available.splice(i, 1); // remove matched song
          break;
        }
      }
    });
  }

  return score;
}


// POST compute-scores: compute and persist scores for a quiz
app.post("/quiz/:shortId/compute-scores", async (req, res) => {
  const { shortId } = req.params;
  const cfg = getQuizConfig(shortId);
  if (!cfg) return res.status(404).json({ message: "Quiz not found" });

  if (!cfg.scoringEnabled && req.query.force !== '1') {
    return res.status(400).json({ message: "Scoring not enabled for this quiz yet" });
  }

  const now = new Date();
  const showDate = new Date(cfg.showDateISO);
  const scoringOpenDate = new Date(showDate.getTime() + (cfg.scoringDelayHours || 0) * 60 * 60 * 1000);
  const force = req.query.force === '1';

  if (!force && now < scoringOpenDate) {
    return res.status(400).json({ message: "Scoring window not open yet", scoringOpensAt: scoringOpenDate.toISOString() });
  }

  try {
    // Get all submissions without a score
    const rowsRes = await pool.query(
      "SELECT * FROM submissions WHERE quiz_id=$1 AND score IS NULL",
      [cfg.quizId]
    );
    const rows = rowsRes.rows;

    if (!answerKeys[shortId]) return res.status(400).json({ message: "No answer key defined for this quiz" });

    const results = [];

    for (const sub of rows) {
      const computed = scoreSubmissionForQuiz(shortId, sub);
      if (computed === null) continue;

      await pool.query(
        "UPDATE submissions SET score=$1 WHERE id=$2",
        [computed, sub.id]
      );

      results.push({ user_id: sub.user_id, submission_id: sub.id, score: computed });
    }

    res.json({ scored: results.length, details: results });
  } catch (err) {
    console.error("Compute scores error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// GET leaderboard for a specific show (top 5)
app.get("/leaderboard/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const cfg = getQuizConfig(shortId);
  if (!cfg) return res.status(404).json({ message: "Quiz not found" });

  try {
    const query = `
      SELECT 
        u.username,
        s.score,
        s.timestamp
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.quiz_id = $1 AND s.score IS NOT NULL
      ORDER BY s.score DESC, s.timestamp ASC
      LIMIT 5;
    `;

    const result = await pool.query(query, [cfg.quizId]);

    res.json({
      shortId,
      quizId: cfg.quizId,
      top5: result.rows
    });

  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Return all quizzes with scoring status + leaderboard
app.get("/api/quizzes", async (req, res) => {
  const list = [];

  for (const [shortId, cfg] of Object.entries(quizConfigs)) {
    // Format date like "11/15"
    const dateObj = DateTime.fromISO(cfg.showDateISO);
    const displayDate = dateObj.toFormat("M/d");

    // Fetch top 3 if scored
    let leaderboard = [];
    if (cfg.scoringEnabled) {
      const query = `
        SELECT u.username, s.score, s.timestamp
        FROM submissions s
        JOIN users u ON s.user_id = u.id
        WHERE s.quiz_id=$1 AND s.score IS NOT NULL
        ORDER BY s.score DESC, s.timestamp ASC
        LIMIT 5;
      `;
      const result = await pool.query(query, [cfg.quizId]);
      leaderboard = result.rows;
    }

    list.push({
      shortId,
      quizId: cfg.quizId,
      name: shortId.charAt(0).toUpperCase() + shortId.slice(1),
      date: displayDate,
      scored: cfg.scoringEnabled,
      leaderboard
    });
  }

  res.json(list);
});


//GET for results page
app.get("/quiz/:shortId/results", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });

  const { shortId } = req.params;
  const cfg = getQuizConfig(shortId);
  if (!cfg) return res.status(404).json({ message: "Quiz not found" });

  // fetch submission
  let submission = null;
  try {
    const subRes = await pool.query(
      "SELECT q1,q2,q3,q4,q5,q6,q7 FROM submissions WHERE quiz_id=$1 AND user_id=$2",
      [cfg.quizId, req.session.userId]
    );
    if (subRes.rows.length > 0) submission = subRes.rows[0];
  } catch (err) {
    console.error("Fetching submission failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  // fetch correct answers from answerKeys
  const answers = answerKeys[shortId] || null;

  res.json({ submission, answers });
});



// For Setlist Trends
// pie chart queries
app.get('/api/orstats', async (req, res) => {
  const { question } = req.query; // q1, q2, q6, q7

  if (!['q1','q2','q6','q7'].includes(question)) {
    return res.status(400).json({ error: 'Invalid question' });
  }

  try {
    const result = await pool.query(
      `SELECT option_chosen, COUNT(*) AS option_count
       FROM or_question_stats
       WHERE question_name = $1
       GROUP BY option_chosen
       ORDER BY option_count DESC`,
      [question]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('OR stats query failed:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET top 5 most played surprise songs (live aggregation)
app.get('/api/top5songs', async (req, res) => {
  try {
    const query = `
      SELECT s.title, s.album, COUNT(sa.song_id) AS play_count
      FROM show_answers sa
      JOIN songs s ON sa.song_id = s.id
      GROUP BY s.id
      ORDER BY play_count DESC
      LIMIT 10;
    `;
    const result = await pool.query(query);
    res.json(result.rows); // array of { title, album, play_count }
  } catch (err) {
    console.error('Failed to fetch top 10 songs:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// top 5 most guessed (live aggregation)

app.get('/api/top-guessed-songs', async (req, res) => {
  try {
    const query = `
      SELECT guess AS song, COUNT(*) AS count
      FROM (
        SELECT q3 AS guess FROM submissions
        UNION ALL
        SELECT q4 AS guess FROM submissions
        UNION ALL
        SELECT q5 AS guess FROM submissions
      ) AS all_guesses
      WHERE guess IS NOT NULL AND guess <> ''
      GROUP BY guess
      ORDER BY count DESC
      LIMIT 10;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top guessed songs:', error);
    res.status(500).json({ error: 'Server error fetching top guessed songs' });
  }
});



//get album counts for horizontal bar chart (live aggregation)
app.get('/api/album-distribution', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.album AS album_name,
                COUNT(*) AS play_count
            FROM show_answers sa
            JOIN songs s ON sa.song_id = s.id
            GROUP BY s.album
            ORDER BY play_count DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching album distribution', error);
        res.status(500).json({ error: 'Failed to fetch album distribution' });
    }
});

// Get all distinct cities with shows that have already happened
app.get("/api/cities", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT city
       FROM show_answers
       WHERE show_date <= CURRENT_DATE
       ORDER BY city ASC`
    );
    res.json(result.rows.map(r => r.city));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});


// surprise songs by city
app.get("/api/songs-by-city", async (req, res) => {
  const { city } = req.query;
  try {
    const result = await pool.query(
      `SELECT songs.title, songs.album
      FROM show_answers
      LEFT JOIN songs ON show_answers.song_id = songs.id
      WHERE show_answers.city = $1
      ORDER BY show_answers.show_date ASC`,
      [city]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch songs by city" });
  }
});

// unplayed songs

app.get('/api/unplayed-songs', async (req, res) => {
  const { album } = req.query;
  if (!album) return res.status(400).json({ error: 'Album parameter is required' });

  try {
    const result = await pool.query(
      `SELECT s.id, s.title
       FROM songs s
       WHERE s.album = $1
       AND s.id NOT IN (
         SELECT DISTINCT song_id FROM show_answers
         WHERE song_id IS NOT NULL
       )
       ORDER BY s.title ASC`,
      [album]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching unplayed songs' });
  }
});

// Serve front-end (public)
app.use(express.static(path.join(__dirname, "public")));


//SPA Fallback

app.get(/^\/(?!login|register|profile|logout|quiz).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});


// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


