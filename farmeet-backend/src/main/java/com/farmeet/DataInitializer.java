package com.farmeet;

import com.farmeet.entity.*;
import com.farmeet.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
        // Users - 存在確認をしてから作成または取得
        User farmer = userRepository.findByUsername("tanaka_farm").orElse(null);
        if (farmer == null) {
            farmer = new User();
            farmer.setUsername("tanaka_farm");
            farmer.setEmail("tanaka@example.com");
            farmer.setPassword(passwordEncoder.encode("password"));
            farmer.setRole(User.Role.FARMER);
            userRepository.save(farmer);
        }

        User user = userRepository.findByUsername("suzuki_user").orElse(null);
        if (user == null) {
            user = new User();
            user.setUsername("suzuki_user");
            user.setEmail("suzuki@example.com");
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole(User.Role.USER);
            userRepository.save(user);
        }

        System.out.println("Users checked/created.");

        System.out.println("Users checked/created.");

        // Farms - 全国10箇所
        // 1. 北海道 - じゃがいも・とうもろこし
        createFarmAndEvents(farmer, "富良野ファーム",
                "北海道富良野の大自然の中で、じゃがいもやとうもろこしの収穫体験ができます。ラベンダー畑も見学できる絶景スポットです。",
                "北海道富良野市",
                "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
                new EventData("じゃがいも収穫＆バター作り体験", "北海道名物のじゃがいもを収穫し、その場でバター作りも体験できます。", 7, 15, 3200),
                new EventData("とうもろこし収穫＆BBQ", "朝採れとうもろこしを収穫して、その場でBBQ。甘くてジューシーなとうもろこしをお楽しみください。", 14, 12, 3800));

        // 2. 青森 - りんご
        createFarmAndEvents(farmer, "津軽りんご園",
                "青森県津軽地方の広大なりんご園。もぎたてのりんごは格別の味わいです。品種も豊富で、食べ比べができます。",
                "青森県弘前市",
                "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80",
                new EventData("りんご狩り＆アップルパイ作り", "もぎたてのりんごでアップルパイを作ります。お土産用のりんごも詰め放題！", 10, 20, 2800),
                new EventData("紅玉りんご収穫体験", "酸味と甘みのバランスが絶妙な紅玉りんごを収穫。りんごジュース試飲付き。", 21, 18, 2500),
                new EventData("ふじりんご食べ比べツアー", "複数品種のりんごを食べ比べて、お気に入りを見つけよう。園内ガイドツアー付き。", 28, 15, 3000));

        // 3. 長野 - 野菜全般
        createFarmAndEvents(farmer, "田中農園",
                "北アルプスの麓、長野県松本市で無農薬野菜を育てています。新鮮な空気と水で育った野菜は格別です。収穫体験を通して、土に触れる喜びを感じてください。",
                "長野県松本市",
                "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
                new EventData("夏野菜収穫体験＆BBQ", "トマト、きゅうり、ナスなどの夏野菜を収穫します。収穫後は採れたて野菜を使ってBBQを楽しみましょう！", 7, 10, 3500),
                new EventData("朝採れトウモロコシ収穫", "糖度抜群の朝採れトウモロコシを収穫します。生でも食べられる甘さを体験してください。", 14, 15, 1500));

        // 4. 山梨 - ぶどう・桃
        createFarmAndEvents(farmer, "サンシャインファーム",
                "山梨県北杜市の高原にある農園です。太陽の恵みをたっぷり浴びたぶどうや桃が自慢です。家族みんなで楽しめる収穫イベントを定期的に開催しています。",
                "山梨県北杜市",
                "https://images.unsplash.com/photo-1595855709940-577268785a7d?w=800&q=80",
                new EventData("ぶどう狩り食べ放題", "巨峰やシャインマスカットなど、高級ぶどうが食べ放題。お土産用の量り売りもあります。", 9, 25, 3300),
                new EventData("桃狩り体験", "山梨県産の甘い桃を収穫。もぎたての桃の美味しさは格別です。", 12, 20, 3000));

        // 5. 千葉 - いちご
        createFarmAndEvents(farmer, "房総いちごファーム",
                "千葉県房総半島の温暖な気候で育った甘いいちごを存分に楽しめます。高設栽培で立ったまま摘めるので、お子様からご高齢の方まで楽しめます。",
                "千葉県木更津市",
                "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80",
                new EventData("いちご狩り食べ放題", "練乳・チョコソース付きで、甘いいちごが60分食べ放題。品種は5種類以上！", 5, 30, 2200),
                new EventData("いちごスイーツ作り体験", "収穫したいちごでパフェやタルトを作ります。お子様も楽しめるプログラムです。", 8, 15, 2800));

        // 6. 静岡 - お茶・みかん
        createFarmAndEvents(farmer, "富士茶園",
                "富士山の麓で育つ高品質な茶葉。お茶摘み体験と製茶工程の見学ができます。景色も最高で、インスタ映えスポットとしても人気です。",
                "静岡県富士市",
                "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
                new EventData("お茶摘み＆製茶体験", "新茶の時期に茶摘みを体験。摘んだお茶を自分で製茶してお持ち帰りできます。", 11, 12, 3500),
                new EventData("茶道体験ツアー", "お茶の淹れ方を学び、富士山を眺めながらお茶を楽しむ贅沢な時間。", 18, 10, 2500));

        // 7. 京都 - 野菜・米
        createFarmAndEvents(farmer, "京野菜ファーム",
                "京都の伝統野菜を育てる農園。九条ねぎ、賀茂なすなど、京野菜ならではの味わいを楽しめます。稲刈り体験も人気です。",
                "京都府亀岡市",
                "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
                new EventData("京野菜収穫＆料理教室", "九条ねぎや賀茂なすを収穫し、京都の家庭料理を学びます。", 6, 12, 4200),
                new EventData("稲刈り体験", "昔ながらの手作業で稲刈りを体験。新米の試食もあります。", 20, 20, 2800),
                new EventData("秋野菜収穫祭", "さつまいも掘りや大根抜きなど、秋の味覚を満喫。焼き芋のサービスもあり。", 25, 25, 2000));

        // 8. 岡山 - 白桃・マスカット
        createFarmAndEvents(farmer, "晴れの国フルーツ農園",
                "岡山県が誇る白桃とマスカットの農園。高級フルーツを自分で収穫できる贅沢な体験をお楽しみください。",
                "岡山県岡山市",
                "https://images.unsplash.com/photo-1595855709940-577268785a7d?w=800&q=80",
                new EventData("白桃収穫体験", "岡山県が誇る白桃を収穫。とろけるような甘さの高級桃を味わえます。", 10, 15, 4500),
                new EventData("マスカット狩り", "シャインマスカットなど高級ぶどうを収穫。宝石のような美しさと甘さを堪能。", 17, 18, 4200));

        // 9. 福岡 - いちご・柿
        createFarmAndEvents(farmer, "あまおう農園",
                "福岡県の特産品「あまおう」いちごを栽培する農園。大粒で甘いいちごが食べ放題です。併設のカフェでいちごスイーツも楽しめます。",
                "福岡県久留米市",
                "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&q=80",
                new EventData("あまおういちご狩り", "福岡県産「あまおう」いちごの食べ放題。大粒で甘いいちごをお楽しみください。", 4, 35, 2500),
                new EventData("いちごジャム作り体験", "あまおういちごを使った手作りジャム体験。お土産にも最適です。", 11, 15, 2200));

        // 10. 沖縄 - パイナップル・マンゴー
        createFarmAndEvents(farmer, "南国トロピカル農園",
                "沖縄の太陽をたっぷり浴びたパイナップルやマンゴーを収穫できます。南国気分を味わいながら、トロピカルフルーツを堪能してください。",
                "沖縄県名護市",
                "https://images.unsplash.com/photo-1587049352846-4a222e784538?w=800&q=80",
                new EventData("パイナップル収穫体験", "完熟パイナップルを自分で収穫。南国の雰囲気を満喫できます。", 8, 20, 3000),
                new EventData("マンゴー狩り", "沖縄の太陽をたっぷり浴びたマンゴーを収穫。濃厚な甘さが自慢です。", 15, 15, 4000),
                new EventData("トロピカルフルーツツアー", "パパイヤ、ドラゴンフルーツなど、様々な南国フルーツを見学・試食できます。", 22, 12, 2800));

        System.out.println("Data initialization completed.");
    }

    private void createFarmAndEvents(User owner, String name, String description, String location, String imageUrl,
            EventData... eventDatas) {
        Farm farm = farmRepository.findByName(name);
        if (farm != null) {
            System.out.println("Farm already exists: " + name);
            return;
        }

        farm = new Farm();
        farm.setName(name);
        farm.setDescription(description);
        farm.setLocation(location);
        farm.setOwner(owner);
        farm.setImageUrl(imageUrl);
        farm = farmRepository.save(farm);
        System.out.println("Created farm: " + name);

        List<ExperienceEvent> events = new ArrayList<>();
        for (EventData ed : eventDatas) {
            events.add(createEvent(farm, ed.title, ed.description, ed.daysFromNow, ed.capacity, ed.price));
        }
        eventRepository.saveAll(events);
    }

    private static class EventData {
        String title;
        String description;
        int daysFromNow;
        int capacity;
        int price;

        public EventData(String title, String description, int daysFromNow, int capacity, int price) {
            this.title = title;
            this.description = description;
            this.daysFromNow = daysFromNow;
            this.capacity = capacity;
            this.price = price;
        }
    }

    private ExperienceEvent createEvent(Farm farm, String title, String description,
            int daysFromNow, int capacity, int price) {
        ExperienceEvent event = new ExperienceEvent();
        event.setFarm(farm);
        event.setTitle(title);
        event.setDescription(description);
        event.setEventDate(LocalDateTime.now().plusDays(daysFromNow));
        event.setCapacity(capacity);
        event.setPrice(BigDecimal.valueOf(price));
        event.setAvailableSlots(capacity);
        return event;
    }
}
