package com.farmeet.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class DbCheck implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== DB CHECK START ===");

        List<Map<String, Object>> users = jdbcTemplate.queryForList("SELECT id, username, email, deleted FROM users");
        System.out.println("--- USERS ---");
        for (Map<String, Object> user : users) {
            System.out.println(user);
        }

        List<Map<String, Object>> farms = jdbcTemplate.queryForList("SELECT id, name, owner_id, deleted FROM farms");
        System.out.println("--- FARMS ---");
        for (Map<String, Object> farm : farms) {
            System.out.println(farm);
        }

        System.out.println("=== DB CHECK END ===");
    }
}
