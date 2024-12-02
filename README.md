# atlas-the-joy-of-painting-api
Bob Ross themed API for episode filtering

# starting and using database and scripts:
sudo service mysql start
mysql -u root -p
source ./create_database.sql
node painting_data_clean.js
node db.js
node server.js
example CLI query: curl "http://localhost:3000/api/paintings?subject=Bushes&color=Alizarin+Crimson"

example browser query: http://localhost:3000/api/paintings?subject=Bushes&color=Alizarin%20Crimson
