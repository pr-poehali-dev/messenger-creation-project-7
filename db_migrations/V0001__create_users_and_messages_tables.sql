CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

INSERT INTO users (username, email, password, full_name, online) VALUES
('alexander', 'alexander@example.com', 'password123', 'Александр Иванов', true),
('maria', 'maria@example.com', 'password123', 'Мария Петрова', true),
('dmitry', 'dmitry@example.com', 'password123', 'Дмитрий Сидоров', false),
('anna', 'anna@example.com', 'password123', 'Анна Кузнецова', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO messages (sender_id, receiver_id, message_text) VALUES
(2, 1, 'Привет! Как дела?'),
(1, 2, 'Отлично! Работаю над новым проектом'),
(2, 1, 'Звучит круто! Расскажешь подробнее?');
