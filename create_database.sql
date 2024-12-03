CREATE DATABASE IF NOT EXISTS joy_of_painting;

USE joy_of_painting;

DROP TABLE IF EXISTS paintings;
CREATE TABLE IF NOT EXISTS paintings (
    episode_id VARCHAR(255) PRIMARY KEY,
    season INT,
    episode INT,
    painting_title VARCHAR(255),
    colors TEXT,
    subjects TEXT,
    image VARCHAR(255)
);
