-- Users
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
    name VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (60) NOT NULL,
    first_name VARCHAR (50),  
    last_name VARCHAR (50)
);

-- Exercises
CREATE TABLE exercises (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR (50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE exercises_muscle_groups (
    id serial PRIMARY KEY,
    exercise_id INT REFERENCES exercises (id),
    muscle_group VARCHAR (50)
);

-- Workouts
CREATE TABLE workouts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES users (id),
    name VARCHAR (50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE workout_exercises (
    id serial PRIMARY KEY,
    workout_id INT REFERENCES workouts (id),
    exercise_id INT REFERENCES exercises (id)
);

CREATE TABLE sets (
    id serial PRIMARY KEY,
    workout_exercise_id INT REFERENCES workout_exercises(id), 
    comment TEXT
);

CREATE TYPE E_WEIGHT_UNIT AS ENUM ('kg', 'pd');
CREATE TABLE repetitions (
    id serial PRIMARY KEY,
    set_id INT REFERENCES sets(id),
    weight INT NOT NULL,
    weight_unit E_WEIGHT_UNIT NOT NULL, 
    count INT NOT NULL
);
