DROP SCHEMA IF EXISTS training_service_schema CASCADE;

CREATE SCHEMA IF NOT EXISTS training_service_schema;

CREATE TABLE IF NOT EXISTS training_service_schema.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS training_service_schema.workouts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id INT NOT NULL,
        CONSTRAINT fk_workouts_owner
            FOREIGN KEY (owner_id) REFERENCES training_service_schema.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_service_schema.exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sets INT NOT NULL,
    rep_range INT[] NOT NULL, -- Array of two numbers for the rep range
    body_weight BOOLEAN NOT NULL,
    muscle_groups TEXT[] NOT NULL, -- Array of strings for muscle groups
    owner_id INT NOT NULL,
        CONSTRAINT fk_workouts_owner
            FOREIGN KEY (owner_id) REFERENCES training_service_schema.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_service_schema.workout_exercises (
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    PRIMARY KEY (workout_id, exercise_id),
    FOREIGN KEY (workout_id) REFERENCES training_service_schema.workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES training_service_schema.exercises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_service_schema.workout_muscle_groups (
    workout_id INT PRIMARY KEY,
    muscle_groups TEXT[] NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES training_service_schema.workouts(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_workout_muscle_groups() RETURNS TRIGGER AS $$
BEGIN
    -- Update the workout_muscle_groups table with the union of muscle groups
    UPDATE training_service_schema.workout_muscle_groups
    SET muscle_groups = (
        SELECT ARRAY(SELECT DISTINCT unnest(e.muscle_groups))
        FROM training_service_schema.exercises e
        JOIN training_service_schema.workout_exercises we ON e.id = we.exercise_id
        WHERE we.workout_id = NEW.workout_id
    )
    WHERE workout_id = NEW.workout_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update muscle groups when exercises are added to a workout
CREATE TRIGGER trg_update_workout_muscle_groups
AFTER INSERT OR DELETE ON training_service_schema.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION update_workout_muscle_groups();
