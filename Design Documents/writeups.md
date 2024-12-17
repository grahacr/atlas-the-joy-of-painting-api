# Project Proposal: Joy of Painting ETL

For my final project, I decided to continue developing the **Joy of Painting ETL** to add several new features. The goal of this project is to create a custom API that serves data related to Bob Ross's painting episodes, with the following new features:

- **Pagination**: To enable efficient browsing of the episodes.
- **Logger**: To implement logging for debugging and monitoring.
- **Unit Tests**: To ensure code quality and robustness.

These additions align with the project objective of building a custom API from scratch.

---

## Tools and Technologies

This project utilizes a range of tools and libraries to build and manage the backend, front-end, and database:

- **Express**: Web framework for Node.js to handle API routing and middleware.
- **MySQL**: Relational database for storing painting episode data.
- **Winston**: Logger library to record and track application events and errors.
- **Papaparse**: CSV parser for handling the input data.
- **Jest**: Testing framework for writing and running unit tests.
- **Supertest**: HTTP assertion library for testing API endpoints.
- **Bootstrap**: Front-end framework for responsive design.

---

## Database Design

The database schema is designed to hold information about Bob Ross’s painting episodes. Below is the structure of the **MySQL** database:

### Database Name:
- **Joy_of_painting**

### Table: paintings

| Column Name      | Description                                                  |
|------------------|--------------------------------------------------------------|
| **episode_id**    | Unique identifier for each episode.                          |
| **season**        | The season number in which the episode appeared.             |
| **episode**       | The episode number within the season.                        |
| **painting_title**| Title of the painting featured in the episode.               |
| **colors**        | List of colors used in the painting.                         |
| **subjects**      | List of subjects painted in the episode.                     |
| **image**         | URL or path to the image of the painting.                    |

This structure supports filtering and querying relevant data related to Bob Ross's episodes.

---

## Development Timeline

The development of the project was broken down into the following key phases:

### 1. **CSV Parsing** - 6 days
- The primary challenge in this phase was learning how to properly sanitize and normalize the data from various CSV sources into a single compiled CSV file. This took the majority of the time.

### 2. **Database Management and Manipulation** - 4 days
- Created the `db.js` file for managing MySQL database interactions.
- Set up the MySQL database with the `paintings` table and ensured the data could be easily inserted and queried.

### 3. **Front-End Usability** - 4 days
- Developed the front-end interface, including:
  - **index.html**: Structure of the main page.
  - **styles.css**: Styling for the page using custom and Bootstrap styles.
  - **script.js**: JavaScript functionality to interact with the backend API.

---

## Conclusion

The **Joy of Painting ETL** project has successfully implemented key features like pagination, logging, and unit testing, providing a solid foundation for further enhancements. This project has not only met the goal of building a custom API from scratch, but also helped me sharpen my skills in CSV parsing, database management, and API development.
