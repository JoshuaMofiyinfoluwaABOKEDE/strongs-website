/**
 * The courses platform tables. Sign-in tables (user, session, account, verification)
 * are created by Better Auth; everything below is ours.
 *
 * To change the structure: add a new entry to `migrations` (never edit an old one).
 * Each entry runs once, in order, the first time the site starts after a deploy.
 */
export const migrations: { id: number; name: string; sql: string }[] = [
  {
    id: 1,
    name: "courses platform",
    sql: `
CREATE TABLE IF NOT EXISTS lms_category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lms_course (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES lms_category(id),
  level TEXT NOT NULL DEFAULT 'All levels',
  weeks INT NOT NULL DEFAULT 4,
  effort TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL DEFAULT 'Online, self-paced',
  summary TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  objectives JSONB NOT NULL DEFAULT '[]',
  outcomes JSONB NOT NULL DEFAULT '[]',
  audience TEXT NOT NULL DEFAULT '',
  prerequisites TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  listed BOOLEAN NOT NULL DEFAULT true,
  enrolment_open BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  review JSONB NOT NULL DEFAULT '{}',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lms_course_category_idx ON lms_course(category_id);

CREATE TABLE IF NOT EXISTS lms_module (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES lms_course(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS lms_module_course_idx ON lms_module(course_id);

CREATE TABLE IF NOT EXISTS lms_lesson (
  id SERIAL PRIMARY KEY,
  module_id INT NOT NULL REFERENCES lms_module(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'reading' CHECK (kind IN ('reading', 'assignment')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  scripture TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  resources JSONB NOT NULL DEFAULT '[]',
  minutes INT NOT NULL DEFAULT 15,
  published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lms_lesson_module_idx ON lms_lesson(module_id);

CREATE TABLE IF NOT EXISTS lms_assessment (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES lms_course(id) ON DELETE CASCADE,
  module_id INT REFERENCES lms_module(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'quiz' CHECK (kind IN ('quiz', 'final')),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  pass_mark INT NOT NULL DEFAULT 70 CHECK (pass_mark BETWEEN 0 AND 100),
  published BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS lms_assessment_course_idx ON lms_assessment(course_id);

CREATE TABLE IF NOT EXISTS lms_question (
  id SERIAL PRIMARY KEY,
  assessment_id INT NOT NULL REFERENCES lms_assessment(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'single' CHECK (kind IN ('single', 'multiple')),
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct JSONB NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS lms_question_assessment_idx ON lms_question(assessment_id);

CREATE TABLE IF NOT EXISTS lms_enrolment (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id INT NOT NULL REFERENCES lms_course(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_lesson_id INT REFERENCES lms_lesson(id) ON DELETE SET NULL,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS lms_enrolment_user_idx ON lms_enrolment(user_id);
CREATE INDEX IF NOT EXISTS lms_enrolment_course_idx ON lms_enrolment(course_id);

CREATE TABLE IF NOT EXISTS lms_lesson_progress (
  user_id TEXT NOT NULL,
  lesson_id INT NOT NULL REFERENCES lms_lesson(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS lms_submission (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id INT NOT NULL REFERENCES lms_lesson(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revise')),
  feedback TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS lms_submission_status_idx ON lms_submission(status);

CREATE TABLE IF NOT EXISTS lms_attempt (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  assessment_id INT NOT NULL REFERENCES lms_assessment(id) ON DELETE CASCADE,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lms_attempt_user_idx ON lms_attempt(user_id, assessment_id);

CREATE TABLE IF NOT EXISTS lms_certificate (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  course_id INT NOT NULL REFERENCES lms_course(id) ON DELETE CASCADE,
  learner_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_reason TEXT NOT NULL DEFAULT '',
  UNIQUE (user_id, course_id)
);
`,
  },
];
