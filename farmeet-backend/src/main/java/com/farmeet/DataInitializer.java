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

        // Farms - データがない場合のみ追加
        if (farmRepository.count() > 0) {
            System.out.println("Farms already exist. Skipping farm data initialization.");
            return;
        }

        // Farms - 全国10箇所
        List<Farm> farms = new ArrayList<>();

        // 1. 北海道 - じゃがいも・とうもろこし
        Farm farm1 = new Farm();
        farm1.setName("富良野ファーム");
        farm1.setDescription("北海道富良野の大自然の中で、じゃがいもやとうもろこしの収穫体験ができます。ラベンダー畑も見学できる絶景スポットです。");
        farm1.setLocation("北海道富良野市");
        farm1.setOwner(farmer);
        farm1.setImageUrl("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80");
        farms.add(farmRepository.save(farm1));

        // 2. 青森 - りんご
        Farm farm2 = new Farm();
        farm2.setName("津軽りんご園");
        farm2.setDescription("青森県津軽地方の広大なりんご園。もぎたてのりんごは格別の味わいです。品種も豊富で、食べ比べができます。");
        farm2.setLocation("青森県弘前市");
        farm2.setOwner(farmer);
        farm2.setImageUrl("https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80");
        farms.add(farmRepository.save(farm2));

        // 3. 長野 - 野菜全般
        Farm farm3 = new Farm();
        farm3.setName("田中農園");
        farm3.setDescription("北アルプスの麓、長野県松本市で無農薬野菜を育てています。新鮮な空気と水で育った野菜は格別です。収穫体験を通して、土に触れる喜びを感じてください。");
        farm3.setLocation("長野県松本市");
        farm3.setOwner(farmer);
        farm3.setImageUrl("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80");
        farms.add(farmRepository.save(farm3));

        // 4. 山梨 - ぶどう・桃
        Farm farm4 = new Farm();
        farm4.setName("サンシャインファーム");
        farm4.setDescription("山梨県北杜市の高原にある農園です。太陽の恵みをたっぷり浴びたぶどうや桃が自慢です。家族みんなで楽しめる収穫イベントを定期的に開催しています。");
        farm4.setLocation("山梨県北杜市");
        farm4.setOwner(farmer);
        farm4.setImageUrl("https://images.unsplash.com/photo-1595855709940-577268785a7d?w=800&q=80");
        farms.add(farmRepository.save(farm4));

        // 5. 千葉 - いちご
        Farm farm5 = new Farm();
        farm5.setName("房総いちごファーム");
        farm5.setDescription("千葉県房総半島の温暖な気候で育った甘いいちごを存分に楽しめます。高設栽培で立ったまま摘めるので、お子様からご高齢の方まで楽しめます。");
        farm5.setLocation("千葉県木更津市");
        farm5.setOwner(farmer);
        farm5.setImageUrl("https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80");
        farms.add(farmRepository.save(farm5));

        // 6. 静岡 - お茶・みかん
        Farm farm6 = new Farm();
        farm6.setName("富士茶園");
        farm6.setDescription("富士山の麓で育つ高品質な茶葉。お茶摘み体験と製茶工程の見学ができます。景色も最高で、インスタ映えスポットとしても人気です。");
        farm6.setLocation("静岡県富士市");
        farm6.setOwner(farmer);
        farm6.setImageUrl("https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80");
        farms.add(farmRepository.save(farm6));

        // 7. 京都 - 野菜・米
        Farm farm7 = new Farm();
        farm7.setName("京野菜ファーム");
        farm7.setDescription("京都の伝統野菜を育てる農園。九条ねぎ、賀茂なすなど、京野菜ならではの味わいを楽しめます。稲刈り体験も人気です。");
        farm7.setLocation("京都府亀岡市");
        farm7.setOwner(farmer);
        farm7.setImageUrl("https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80");
        farms.add(farmRepository.save(farm7));

        // 8. 岡山 - 白桃・マスカット
        Farm farm8 = new Farm();
        farm8.setName("晴れの国フルーツ農園");
        farm8.setDescription("岡山県が誇る白桃とマスカットの農園。高級フルーツを自分で収穫できる贅沢な体験をお楽しみください。");
        farm8.setLocation("岡山県岡山市");
        farm8.setOwner(farmer);
        farm8.setImageUrl("https://images.unsplash.com/photo-1595855709940-577268785a7d?w=800&q=80");
        farms.add(farmRepository.save(farm8));

        // 9. 福岡 - いちご・柿
        Farm farm9 = new Farm();
        farm9.setName("あまおう農園");
        farm9.setDescription("福岡県の特産品「あまおう」いちごを栽培する農園。大粒で甘いいちごが食べ放題です。併設のカフェでいちごスイーツも楽しめます。");
        farm9.setLocation("福岡県久留米市");
        farm9.setOwner(farmer);
        farm9.setImageUrl("https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&q=80");
        farms.add(farmRepository.save(farm9));

        // 10. 沖縄 - パイナップル・マンゴー
        Farm farm10 = new Farm();
        farm10.setName("南国トロピカル農園");
        farm10.setDescription("沖縄の太陽をたっぷり浴びたパイナップルやマンゴーを収穫できます。南国気分を味わいながら、トロピカルフルーツを堪能してください。");
        farm10.setLocation("沖縄県名護市");
        farm10.setOwner(farmer);
        farm10.setImageUrl("https://images.unsplash.com/photo-1587049352846-4a222e784538?w=800&q=80");
        farms.add(farmRepository.save(farm10));

        System.out.println("10 Farms created across Japan!");

        // Events - 各農園に2-3個のイベント
        List<ExperienceEvent> events = new ArrayList<>();

        // 富良野ファーム
        events.add(createEvent(farm1, "じゃがいも収穫＆バター作り体験", "北海道名物のじゃがいもを収穫し、その場でバター作りも体験できます。", 7, 15, 3200));
        events.add(
                createEvent(farm1, "とうもろこし収穫＆BBQ", "朝採れとうもろこしを収穫して、その場でBBQ。甘くてジューシーなとうもろこしをお楽しみください。", 14, 12, 3800));

        // 津軽りんご園
        events.add(createEvent(farm2, "りんご狩り＆アップルパイ作り", "もぎたてのりんごでアップルパイを作ります。お土産用のりんごも詰め放題！", 10, 20, 2800));
        events.add(createEvent(farm2, "紅玉りんご収穫体験", "酸味と甘みのバランスが絶妙な紅玉りんごを収穫。りんごジュース試飲付き。", 21, 18, 2500));
        events.add(createEvent(farm2, "ふじりんご食べ比べツアー", "複数品種のりんごを食べ比べて、お気に入りを見つけよう。園内ガイドツアー付き。", 28, 15, 3000));

        // 田中農園
        events.add(
                createEvent(farm3, "夏野菜収穫体験＆BBQ", "トマト、きゅうり、ナスなどの夏野菜を収穫します。収穫後は採れたて野菜を使ってBBQを楽しみましょう！", 7, 10, 3500));
        events.add(createEvent(farm3, "朝採れトウモロコシ収穫", "糖度抜群の朝採れトウモロコシを収穫します。生でも食べられる甘さを体験してください。", 14, 15, 1500));

        // サンシャインファーム
        events.add(createEvent(farm4, "ぶどう狩り食べ放題", "巨峰やシャインマスカットなど、高級ぶどうが食べ放題。お土産用の量り売りもあります。", 9, 25, 3300));
        events.add(createEvent(farm4, "桃狩り体験", "山梨県産の甘い桃を収穫。もぎたての桃の美味しさは格別です。", 12, 20, 3000));

        // 房総いちごファーム
        events.add(createEvent(farm5, "いちご狩り食べ放題", "練乳・チョコソース付きで、甘いいちごが60分食べ放題。品種は5種類以上！", 5, 30, 2200));
        events.add(createEvent(farm5, "いちごスイーツ作り体験", "収穫したいちごでパフェやタルトを作ります。お子様も楽しめるプログラムです。", 8, 15, 2800));

        // 富士茶園
        events.add(createEvent(farm6, "お茶摘み＆製茶体験", "新茶の時期に茶摘みを体験。摘んだお茶を自分で製茶してお持ち帰りできます。", 11, 12, 3500));
        events.add(createEvent(farm6, "茶道体験ツアー", "お茶の淹れ方を学び、富士山を眺めながらお茶を楽しむ贅沢な時間。", 18, 10, 2500));

        // 京野菜ファーム
        events.add(createEvent(farm7, "京野菜収穫＆料理教室", "九条ねぎや賀茂なすを収穫し、京都の家庭料理を学びます。", 6, 12, 4200));
        events.add(createEvent(farm7, "稲刈り体験", "昔ながらの手作業で稲刈りを体験。新米の試食もあります。", 20, 20, 2800));
        events.add(createEvent(farm7, "秋野菜収穫祭", "さつまいも掘りや大根抜きなど、秋の味覚を満喫。焼き芋のサービスもあり。", 25, 25, 2000));

        // 晴れの国フルーツ農園
        events.add(createEvent(farm8, "白桃収穫体験", "岡山県が誇る白桃を収穫。とろけるような甘さの高級桃を味わえます。", 10, 15, 4500));
        events.add(createEvent(farm8, "マスカット狩り", "シャインマスカットなど高級ぶどうを収穫。宝石のような美しさと甘さを堪能。", 17, 18, 4200));

        // あまおう農園
        events.add(createEvent(farm9, "あまおういちご狩り", "福岡県産「あまおう」いちごの食べ放題。大粒で甘いいちごをお楽しみください。", 4, 35, 2500));
        events.add(createEvent(farm9, "いちごジャム作り体験", "あまおういちごを使った手作りジャム体験。お土産にも最適です。", 11, 15, 2200));

        // 南国トロピカル農園
        events.add(createEvent(farm10, "パイナップル収穫体験", "完熟パイナップルを自分で収穫。南国の雰囲気を満喫できます。", 8, 20, 3000));
        events.add(createEvent(farm10, "マンゴー狩り", "沖縄の太陽をたっぷり浴びたマンゴーを収穫。濃厚な甘さが自慢です。", 15, 15, 4000));
        events.add(createEvent(farm10, "トロピカルフルーツツアー", "パパイヤ、ドラゴンフルーツなど、様々な南国フルーツを見学・試食できます。", 22, 12, 2800));

        // イベント保存
        eventRepository.saveAll(events);

        System.out.println("Total " + events.size() + " events created!");
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
