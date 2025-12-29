# Setlist Guessing Game Web App
An interactive full-stack web application where fans predict concert setlists, submit guesses, and compete based on accuracy. Surprise songs earn extra points, and users can view results, scores, and leaderboards after each show.

## Gameplay and Scoring
- Users predict setlists for specific tour dates using a quiz-style form
- Automatic scoring with weighted surprise song logic
- Dynamic result pages showing user guesses vs. correct setlist
- Manual score adjustments possible via Cloud SQL

## User Experience
- User registration, login, and session authentication
- Mobile-responsive design for gameplay on concert days
- Random guess generator for surprise song ideas.
- Personalized dashboard and results history
- Leaderboard displaying top-scoring participants

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: PostgreSQL via Cloud SQL
- Auth: Express session, bcrypt
- Hosting: Google Cloud Run, Docker

## Screenshots
##### Login Page
<img src="assets/login_page.png" width="600" alt="Login page" />

##### Home Screen
<img src="assets/home_screen.png" width="600" alt="Home screen with all shows" /> 

##### How to Play
<img src="assets/how_to_play.png" width="600" alt="Instructions explaining how to play the setlist prediction game" />

##### Submission Form
<img src="assets/submission_form.png" width="600" alt="Quiz submission form for predicting setlist answers" />

##### Results Page
<img src="assets/results_page.png" width="600" alt="Results page showing user's guesses compared to correct answers with score display" />

#### Setlist Trends
<img src="assets/setlist_trends_1.png" width="600" alt="Setlist Trends page showing most guessed surprise songs and pie charts representing the 'or' questions" />
<img src="assets/setlist_trends_2.png" width="600" alt="Setlist Trends page showing most played surprise songs, surprise songs by city, and songs yet to be played" />

### Current Impact
- 120+ registered users
- Supports multiple tour dates dynamically

### Future Enhancement
- Support for multiple tour legs (UK/EU dates)
- Setlist Trends in navbar, condensed navbar

### Acknowledgements
- Inspired by SwiftAlert/Mastermind for The Eras Tour
