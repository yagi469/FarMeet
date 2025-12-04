package com.farmeet;

import com.farmeet.entity.*;
import com.farmeet.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FarmRepository farmRepository;
    @Autowired
    private ExperienceEventRepository eventRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0)
            return; // データがあれば何もしない

        // Users
        User farmer = new User();
        farmer.setUsername("tanaka_farm");
        farmer.setEmail("tanaka@example.com");
        farmer.setPassword(passwordEncoder.encode("password"));
        farmer.setRole(User.Role.FARMER);
        userRepository.save(farmer);

        User user = new User();
        user.setUsername("suzuki_user");
        user.setEmail("suzuki@example.com");
        user.setPassword(passwordEncoder.encode("password"));
        user.setRole(User.Role.USER);
        userRepository.save(user);

        System.out.println("Users created: tanaka_farm (FARMER), suzuki_user (USER)");

        // Farms
        Farm farm1 = new Farm();
        farm1.setName("田中農園");
        farm1.setDescription("北アルプスの麓、長野県松本市で無農薬野菜を育てています。新鮮な空気と水で育った野菜は格別です。収穫体験を通して、土に触れる喜びを感じてください。");
        farm1.setLocation("長野県松本市");
        farm1.setOwner(farmer);
        farm1.setImageUrl("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80");
        farmRepository.save(farm1);

        Farm farm2 = new Farm();
        farm2.setName("サンシャインファーム");
        farm2.setDescription("山梨県北杜市の高原にある農園です。太陽の恵みをたっぷり浴びたトマトやトウモロコシが自慢です。家族みんなで楽しめる収穫イベントを定期的に開催しています。");
        farm2.setLocation("山梨県北杜市");
        farm2.setOwner(farmer);
        farm2.setImageUrl("https://images.unsplash.com/photo-1595855709940-577268785a7d?w=800&q=80");
        farmRepository.save(farm2);

        System.out.println("Farms created: 田中農園, サンシャインファーム");

        // Events
        ExperienceEvent event1 = new ExperienceEvent();
        event1.setFarm(farm1);
        event1.setTitle("夏野菜収穫体験＆BBQ");
        event1.setDescription("トマト、きゅうり、ナスなどの夏野菜を収穫します。収穫後は採れたて野菜を使ってBBQを楽しみましょう！");
        event1.setEventDate(LocalDateTime.now().plusDays(7));
        event1.setCapacity(10);
        event1.setPrice(BigDecimal.valueOf(3500));
        event1.setAvailableSlots(10);
        eventRepository.save(event1);

        ExperienceEvent event2 = new ExperienceEvent();
        event2.setFarm(farm2);
        event2.setTitle("完熟トマト狩り放題");
        event2.setDescription("真っ赤に完熟したトマトを好きなだけ収穫して食べられます。お土産用の袋詰め放題付き。");
        event2.setEventDate(LocalDateTime.now().plusDays(14));
        event2.setCapacity(20);
        event2.setPrice(BigDecimal.valueOf(2000));
        event2.setAvailableSlots(20);
        eventRepository.save(event2);

        ExperienceEvent event3 = new ExperienceEvent();
        event3.setFarm(farm1);
        event3.setTitle("朝採れトウモロコシ収穫");
        event3.setDescription("糖度抜群の朝採れトウモロコシを収穫します。生でも食べられる甘さを体験してください。");
        event3.setEventDate(LocalDateTime.now().plusDays(10));
        event3.setCapacity(15);
        event3.setPrice(BigDecimal.valueOf(1500));
        event3.setAvailableSlots(15);
        eventRepository.save(event3);

        System.out.println("Events created.");
    }
}
