ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
UPDATE users SET nickname = full_name WHERE nickname IS NULL;

CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);

INSERT INTO groups (name, description, creator_id) VALUES
('Адский Треп', 'Место где троллят без остановки', 1),
('Мемы из Преисподней', 'Только огненные мемы', 2)
ON CONFLICT DO NOTHING;

INSERT INTO group_members (group_id, user_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 4)
ON CONFLICT DO NOTHING;
