# EarnPlay - Quiz Earning Game

## Current State
New project with no existing features.

## Requested Changes (Diff)

### Add
- Quiz game where users answer multiple-choice questions
- Earn virtual INR coins by answering questions correctly
- User wallet showing balance in Indian Rupees (₹)
- Leaderboard showing top earners
- User profile with total earnings and stats
- Daily quiz challenges with reward bonuses
- Question categories (General Knowledge, Sports, Bollywood, Science)

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan

### Backend (Motoko)
- User registration and profile management
- Quiz questions storage with categories and correct answers
- Answer submission and scoring logic
- Virtual INR wallet per user (earn coins per correct answer)
- Track user stats: total questions answered, correct answers, earnings
- Leaderboard query (top users by earnings)
- Daily bonus tracking (one bonus per day per user)
- Seed initial quiz questions across categories

### Frontend (React)
- Landing/home page with game intro and play button
- User registration/login with name entry
- Quiz game screen: question, 4 answer options, timer, current earnings
- Results screen after each question with correct answer and reward earned
- Wallet page showing ₹ balance and transaction history
- Leaderboard page with top earners
- Profile page with stats
- Navigation bar
- Indian Rupee (₹) currency display throughout
