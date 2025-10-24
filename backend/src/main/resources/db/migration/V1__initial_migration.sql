CREATE TABLE currencies
(
    id     INT AUTO_INCREMENT NOT NULL,
    code   VARCHAR(255)       NOT NULL,
    name   VARCHAR(255)       NOT NULL,
    symbol VARCHAR(255)       NOT NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (id)
);

CREATE TABLE expense_categories
(
    id            INT AUTO_INCREMENT NOT NULL,
    `description` VARCHAR(255)       NULL,
    name          VARCHAR(255)       NOT NULL,
    user_id       BLOB               NULL,
    budget        FLOAT              NOT NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (id)
);

CREATE TABLE expenses
(
    id            INT AUTO_INCREMENT NOT NULL,
    amount        FLOAT              NOT NULL,
    currency_id   INT                NULL,
    date          date               NOT NULL,
    `description` VARCHAR(255)       NULL,
    last_update   date               NULL,
    month         INT                NOT NULL,
    user_id       BLOB               NULL,
    week          INT                NOT NULL,
    year          INT                NOT NULL,
    category_id   INT                NULL,
    tag_id        INT                NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (id)
);

CREATE TABLE flyway_schema_history
(
    installed_rank INT                     NOT NULL,
    version        VARCHAR(50)             NULL,
    `description`  VARCHAR(200)            NOT NULL,
    type           VARCHAR(20)             NOT NULL,
    script         VARCHAR(1000)           NOT NULL,
    checksum       INT                     NULL,
    installed_by   VARCHAR(100)            NOT NULL,
    installed_on   timestamp DEFAULT NOW() NOT NULL,
    execution_time INT                     NOT NULL,
    success        TINYINT(1)              NOT NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (installed_rank)
);

CREATE TABLE income_categories
(
    id            INT AUTO_INCREMENT NOT NULL,
    `description` VARCHAR(255)       NULL,
    name          VARCHAR(255)       NOT NULL,
    user_id       BLOB               NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (id)
);

CREATE TABLE incomes
(
    id            INT AUTO_INCREMENT NOT NULL,
    amount        FLOAT              NOT NULL,
    currency_id   INT                NULL,
    date          date               NOT NULL,
    `description` VARCHAR(255)       NULL,
    last_update   date               NULL,
    month         INT                NOT NULL,
    user_id       BLOB               NULL,
    week          INT                NOT NULL,
    year          INT                NOT NULL,
    category_id   INT                NULL,
    tag_id        INT                NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (id)
);

CREATE TABLE tags
(
    id            INT AUTO_INCREMENT NOT NULL,
    `description` VARCHAR(255)       NULL,
    name          VARCHAR(255)       NOT NULL,
    user_id       BLOB               NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (id)
);

CREATE TABLE users
(
    id              BLOB         NOT NULL,
    creation_date   date         NULL,
    currency_id     INT          NULL,
    email           VARCHAR(255) NOT NULL,
    first_name      VARCHAR(255) NULL,
    last_name       VARCHAR(255) NULL,
    password        VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) NULL,
    username        VARCHAR(255) NOT NULL,
    `role`          TINYINT      NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (id)
);

ALTER TABLE users
    ADD CONSTRAINT UK6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);

ALTER TABLE users
    ADD CONSTRAINT UKr43af9ap4edm43mmtq01oddj6 UNIQUE (username);

CREATE INDEX flyway_schema_history_s_idx ON flyway_schema_history (success);

ALTER TABLE incomes
    ADD CONSTRAINT FK88oslojsu4esbcshis19m212k FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE NO ACTION;

CREATE INDEX FK88oslojsu4esbcshis19m212k ON incomes (tag_id);

ALTER TABLE expenses
    ADD CONSTRAINT FKfd6qfwunb4p1qw1w95i8nb9gf FOREIGN KEY (currency_id) REFERENCES currencies (id) ON DELETE NO ACTION;

CREATE INDEX FKfd6qfwunb4p1qw1w95i8nb9gf ON expenses (currency_id);

ALTER TABLE incomes
    ADD CONSTRAINT FKfq6qeso6vbt9wu7dyhnx8tpu9 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION;

CREATE INDEX FKfq6qeso6vbt9wu7dyhnx8tpu9 ON incomes (user_id);

ALTER TABLE expenses
    ADD CONSTRAINT FKg7aulw52en8nct0mjq8uut03q FOREIGN KEY (category_id) REFERENCES expense_categories (id) ON DELETE NO ACTION;

CREATE INDEX FKg7aulw52en8nct0mjq8uut03q ON expenses (category_id);

ALTER TABLE expenses
    ADD CONSTRAINT FKgcld53kv46rouo2389sb5oln3 FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE NO ACTION;

CREATE INDEX FKgcld53kv46rouo2389sb5oln3 ON expenses (tag_id);

ALTER TABLE incomes
    ADD CONSTRAINT FKgqt7hpl36e3v1d37w0vtr6ort FOREIGN KEY (category_id) REFERENCES income_categories (id) ON DELETE NO ACTION;

CREATE INDEX FKgqt7hpl36e3v1d37w0vtr6ort ON incomes (category_id);

ALTER TABLE expenses
    ADD CONSTRAINT FKhpk0n2cbnfiuu5nrgl0ika3hq FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION;

CREATE INDEX FKhpk0n2cbnfiuu5nrgl0ika3hq ON expenses (user_id);

ALTER TABLE incomes
    ADD CONSTRAINT FKhxk7aknjhb1vr4i04njx948pg FOREIGN KEY (currency_id) REFERENCES currencies (id) ON DELETE NO ACTION;

CREATE INDEX FKhxk7aknjhb1vr4i04njx948pg ON incomes (currency_id);

ALTER TABLE expense_categories
    ADD CONSTRAINT FKjbcw6agqb7ya6s33yrxfe4ymp FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION;

CREATE INDEX FKjbcw6agqb7ya6s33yrxfe4ymp ON expense_categories (user_id);

ALTER TABLE tags
    ADD CONSTRAINT FKpsynysaxl7cyw8mr5c8xevneg FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION;

CREATE INDEX FKpsynysaxl7cyw8mr5c8xevneg ON tags (user_id);

ALTER TABLE users
    ADD CONSTRAINT FKqjjl66iojw1n9m7x36wi8c5t5 FOREIGN KEY (currency_id) REFERENCES currencies (id) ON DELETE NO ACTION;

CREATE INDEX FKqjjl66iojw1n9m7x36wi8c5t5 ON users (currency_id);

ALTER TABLE income_categories
    ADD CONSTRAINT FKql7823s0unf600v1pviwwubfx FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION;

CREATE INDEX FKql7823s0unf600v1pviwwubfx ON income_categories (user_id);