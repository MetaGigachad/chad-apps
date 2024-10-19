CREATE TABLE users (
    id SHORTKEY PRIMARY KEY,
    username VARCHAR (50) UNIQUE NOT NULL, 
    password VARCHAR (60) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_users_genid BEFORE INSERT ON users FOR EACH ROW EXECUTE PROCEDURE shortkey_generate();
