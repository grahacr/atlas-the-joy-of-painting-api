# Bob Ross Themed API for Episode Filtering

This project provides a Bob Ross-themed API for filtering painting episodes by various criteria. The database contains information about Bob Ross's painting episodes, and this API allows you to query paintings based on subjects, colors, and other attributes.

## Prerequisites

Before running the application, ensure you have the following installed:
- MySQL
- Node.js

Or, if you clone the repository, run the following command to install the necessary dependencies defined in package.json:
```bash
npm install
```
This will install or update all necessary dependencies for the app to run.

## Setup and Running the Project

### 1. Start MySQL Service
To start the MySQL service, use the following command:

```bash
sudo service mysql start
```

### 2. Create database
Once MySQL is running, create the database and set it up by executing these commands:
```bash
mysql -u root -p < ./create_database.sql
```

### 3. Clean CSV data
To clean the csv data, run the following command:

```bash
node painting_data_clean.js
```

### 4. Inject compiled and normalized data
To insert the normalized code into the database, run the following command:
```bash
node db.js
```

### 5. Start the MySQL server for front end querying
To start the MySQL server for querying the data based on certain filters, run the following command:
```bash
node server.js
```

### 6. Example Command Line query:
```bash
curl "http://localhost:3000/api/paintings?subject=Bushes&color=Alizarin+Crimson"
```


### 7. Example browser query:
```bash
http://localhost:3000/api/paintings?subject=Bushes&color=Alizarin%20Crimson
```
