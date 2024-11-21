CREATE DATABASE IF NOT EXISTS joy_of_painting;

USE joy_of_painting;

ALTER TABLE episodes ADD COLUMN month VARCHAR(20);

CREATE TABLE episodes (
    episode_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    air_date DATE,
    season INT
);

CREATE TABLE subjects(
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    episode_id INT,
    subject_name VARCHAR (255),
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id)
);

CREATE TABLE colors (
    color_id INT AUTO_INCREMENT PRIMARY KEY,
    painting_index INT,
    img_src VARCHAR(255),
    painting_title VARCHAR(255),
    season INT,
    episode_id INT,
    num_colors INT,
    youtube_src VARCHAR(255),
    color_name VARCHAR(255),
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id)
);