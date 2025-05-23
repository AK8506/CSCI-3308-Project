# Powder Junkie

<!-- Application Description -->
Powder Junkie is a ski resort review app that provides real-time, crowd-sourced updates on mountain conditions and terrain quality. 

It is for skiers and snowboarders who want to explore new mountains, to find the best resort to visit each day, and to share their experiences and opinions with the world.

Unlike traditional review platforms with static information, Powder Junkie ensures users make informed decisions on the go and get the most out of the ski season.

## Project Structure
```
.
├── docker-compose.yaml
├── .env                     ← Environment variables go here (not committed)
├── .gitignore               ← Ensures .env and other sensitive files are ignored
├── README.md
├── MilestoneSubmissions/
│   ├── 3308 Project Proposal.pdf
│   ├── CSCI 3308 User Acceptance Testing.pdf
│   ├── Week1.txt
│   ├── Week2_Release_Notes
│   ├── Week3_Release_Notes.txt
│   └── Week4_Release_Notes.txt
├── ProjectSourceCode/
│   ├── index.js
│   ├── node_modules/        ← Installed dependencies (auto-generated)
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── init_data/
│   │   │   ├── create.sql
│   │   │   └── insert.sql
│   │   └── views/
│   │       ├── layouts/
│   │       │   └── main.hbs
│   │       ├── pages/
│   │       │   ├── home.hbs
│   │       │   ├── login.hbs
│   │       │   ├── logout.hbs
│   │       │   ├── manage_reviews.hbs
│   │       │   ├── map.js
│   │       │   ├── mountain.hbs
│   │       │   ├── register.hbs
│   │       │   └── stars.js
│   │       └── partials/
│   │           ├── footer.hbs
│   │           ├── header.hbs
│   │           ├── message.hbs
│   │           ├── nav.hbs
│   │           └── navigation.hbs
│   ├── test/
│   │   └── server.spec.js
│   └── uploads/
└── TeamMeetingLogs/
    ├── Week1.txt
    ├── Week2.txt
    ├── Week3.txt
    ├── Week4.txt
    └── Week5.txt
```

## Contributors

<!-- Listed in alphabetical order -->
* Akshay Patnaik
* Joshua Huang
* Julia DiTomas
* Thomas Parameswaran
* Lance Kluge


## Technology Used
* GitHub
* Visual Studio Code
* JavaScript
* Node.js
* PostgreSQL
* Docker
* Render
* HTML
* CSS
* Bootstrap
* HandleBars (HBS)
* Mocha and Chai
* National Weather Service API
* Google Maps API


## Prerequisites to run the application
To run the app, simply open up your favorite web browser and open the [deployed application](https://csci-3308-project-auvs.onrender.com/). 

No other prerequisites required! 


## Instructions to run the application locally
To run Powder Junkie locally, you will need the following set up:
* Docker
* Your own Google Maps API
    * To get your Google Maps API set up, go to [this website](https://developers.google.com/maps/get-started)

* Set up .env file
    * Here's the set up for the .env file you should use the following format:

<!-- CODE START -->
```.env
# database credentials
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="users_db"
HOST="db" 
PGPORT=5432

# Node vars
SESSION_SECRET="<CHOOSE YOUR OWN>" # eg. "Super Duper Secret!"
GOOGLE_MAPS_API_KEY = "<YOUR GOOGLE MAPS API KEY>"
```
<!-- CODE END -->


## How to run tests
Once your local setup is done, simply run the following command in the terminal from the root directory:

```bash
docker compose up
```

The tests automatically run while Docker is starting up.

### [Link to Deployed Application](https://csci-3308-project-auvs.onrender.com/)
