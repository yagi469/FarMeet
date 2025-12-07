package com.farmeet.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class SimpleMigration {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void migrate() {
        System.out.println("Checking and applying schema migrations...");

        try {
            // Users table
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false NOT NULL");

            // Farms table
            jdbcTemplate.execute("ALTER TABLE farms ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false NOT NULL");

            // ExperienceEvents table
            // Adding a check for table existence might be safer but usually these exist
            jdbcTemplate.execute(
                    "ALTER TABLE experience_events ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false NOT NULL");

            System.out.println("Schema migration completed successfully.");
        } catch (Exception e) {
            System.err.println("Migration warning (might be already applied or permission issue): " + e.getMessage());
            // We don't throw exception here to allow app to try to start if it was just a
            // minor issue
        }
    }
}
