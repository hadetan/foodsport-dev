# Foodsport
Foodsports helps users to explore activities happening around them and allows them to join. Once user joins, he can reach to the activity location physically. Kayak, hiking, yoga are few activity examples. Whatever calorie user burns during this activity gets recorded on this application manually.

# Architecture
- Framework: NextJs
- Database: Supabase
- Deployment: Vercel

# Screens
## Signup

1. Signup
2. Google auth
3. user personal details (e.g. name, dob)
4. user personal data (e.g. weight, height)
5. Friend referral code
6. SMS
7. Email

## Login

1. Login
2. Google auth
3. Account recovery
4. Recovery email
5. Email confirmation

## Homepage

### Activities

1. Active activities list
2. Activity details [id]

### User Profile

1. User level [id]
2. Progress bar [id]
3. Current streak [id]
4. Profile picture [id]

### Current Charity

1. List of current charity

### User Profile Dashboard

1. Calories donated [id]
2. Calorie goal [id]
3. Progress bar towards goal [id]
4. Edit calorie goal [id]
5. Total points [id]
6. Calories lost today [id]
7. Leader board rank [id?]

## My Profile

1. Change profile pic
2. Change border
3. Change title
4. Change bio
5. Change name, weight, height, gender, age, activity level

### My Goals

1. Daily goal
2. Weekly goal
3. Monthly goal
4. Yearly goal

### Refer a Friend

1. Code generate for referral

### Badges

1. Get all user badges [id]
2. Track streak and send boolean
3. If hit certain burn calorie give that badge with number of calorie
4. If christmas or halloween save that themed badge

### Activity History

1. Total calories burnt for each activity
2. Points received for each activity and type of activity
3. History of calories donated (date, time and recipient)

### Settings
--No api I could think of--

## Calorie Balance Page

1. Calorie submission through photo [on success update total calories]
2. Verify submitted photo

## Goodwill Page

1. List of charities
2. Charity details [id]

## Activities Page

1. Upcoming events
2. Currently active events
3. Events that are open
4. Events that are closed
5. Participant limit

### Filter
--Will be done on FE--

### Event Joining

1. Event details
2. Create a ticket
3. Send Ticket to user with sms or email (user choice)
4. 5 Minute timeout

## Leaderboards

1. List of top 10 (?) usernames of user in highest to lowest order with fields as -
- Username
- Calorie
- Badges
- Title
- Calorie donated
2. Friends only leader board
3. Community leader board
4. Global leader board


