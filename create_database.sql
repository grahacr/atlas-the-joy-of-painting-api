CREATE DATABASE IF NOT EXISTS joy_of_painting;

USE joy_of_painting;

CREATE TABLE IF NOT EXISTS episodes (
    episode_id INT AUTO_INCREMENT PRIMARY KEY,
    painting_title VARCHAR(255),
    air_date DATE,
    month VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS subjects (
    episode_id INT,
    subject_name VARCHAR (255),
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id)
);

CREATE TABLE IF NOT EXISTS colors (
    episode_id INT,
    color VARCHAR(255),
    color_hex VARCHAR(255),
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id)
);