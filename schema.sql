DROP TABLE IF EXISTS alarms;
DROP TABLE IF EXISTS reminders;

CREATE TABLE IF NOT EXISTS alarms (
  user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  hour INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  label TEXT,
  enabled INTEGER NOT NULL,
  repeat TEXT NOT NULL,
  sound TEXT NOT NULL,
  sound_url TEXT,
  ai_text TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS reminders (
  user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  repeat TEXT,
  enabled INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);
