CREATE DATABASE IF NOT EXISTS joy_of_painting;

USE joy_of_painting;

DROP TABLE IF EXISTS episodes;
CREATE TABLE IF NOT EXISTS episodes (
    episode_id INT AUTO_INCREMENT PRIMARY KEY,
    painting_title VARCHAR(255),
    air_date DATE,
    month VARCHAR(255)
);

DROP TABLE IF EXISTS subjects;
CREATE TABLE IF NOT EXISTS subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT,
    subject_name VARCHAR (255),
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id)
);

DROP TABLE IF EXISTS colors;
CREATE TABLE IF NOT EXISTS colors (
    color_id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT,
    color_name VARCHAR(255),
    color_hex VARCHAR(255),
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id)
);