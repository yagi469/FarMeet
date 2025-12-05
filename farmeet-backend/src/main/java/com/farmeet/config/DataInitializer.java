package com.farmeet.config;

import com.farmeet.entity.ExperienceEvent;
import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.repository.ExperienceEventRepository;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final FarmRepository farmRepository;
        private final ExperienceEventRepository eventRepository;
        private final PasswordEncoder passwordEncoder;

        public DataInitializer(UserRepository userRepository, FarmRepository farmRepository,
                        ExperienceEventRepository eventRepository, PasswordEncoder passwordEncoder) {
                this.userRepository = userRepository;
                this.farmRepository = farmRepository;
                this.eventRepository = eventRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) throws Exception {
                // 農園データが存在しない場合は全て初期化
                if (farmRepository.count() == 0) {
                        System.out.println("サンプルデータを初期化中...");
                        User farmer = createFarmerIfNotExists();
                        List<Farm> farms = createSampleFarms(farmer);
                        createSampleEvents(farms);
                        System.out.println("サンプルデータの初期化が完了しました。");
                }
                // 農園データは存在するがイベントが存在しない場合はイベントのみ追加
                else if (eventRepository.count() == 0) {
                        System.out.println("イベントデータを初期化中...");
                        List<Farm> farms = farmRepository.findAll();
                        createSampleEvents(farms);
                        System.out.println("イベントデータの初期化が完了しました。");
                } else {
                        System.out.println("データは既に存在します。初期化をスキップします。");
                }

                // 既存イベントでカテゴリがnullのものを更新（本番環境用マイグレーション）
                updateExistingEventsWithCategory();
        }

        private void updateExistingEventsWithCategory() {
                List<ExperienceEvent> events = eventRepository.findAll();
                int updated = 0;
                for (ExperienceEvent event : events) {
                        if (event.getCategory() == null || event.getCategory().isEmpty()) {
                                String category = guessCategoryFromTitle(event.getTitle());
                                event.setCategory(category);
                                eventRepository.save(event);
                                updated++;
                        }
                }
                if (updated > 0) {
                        System.out.println(updated + "件のイベントにカテゴリを設定しました。");
                }
        }

        private String guessCategoryFromTitle(String title) {
                String lowerTitle = title.toLowerCase();
                // 果物系キーワード
                if (lowerTitle.contains("いちご") || lowerTitle.contains("さくらんぼ") ||
                                lowerTitle.contains("ぶどう") || lowerTitle.contains("マスカット") ||
                                lowerTitle.contains("桃") || lowerTitle.contains("マンゴー") ||
                                lowerTitle.contains("パイナップル") || lowerTitle.contains("果物") ||
                                lowerTitle.contains("フルーツ") || lowerTitle.contains("狩り")) {
                        return "FRUIT";
                }
                // 花系キーワード
                if (lowerTitle.contains("花") || lowerTitle.contains("ひまわり") ||
                                lowerTitle.contains("摘み取り") || lowerTitle.contains("フラワー")) {
                        return "FLOWER";
                }
                // デフォルトは野菜
                return "VEGETABLE";
        }

        private User createFarmerIfNotExists() {
                String email = "tanaka@example.com";
                return userRepository.findByEmail(email).orElseGet(() -> {
                        User user = new User();
                        user.setUsername("tanaka_farm");
                        user.setEmail(email);
                        user.setPassword(passwordEncoder.encode("password123"));
                        user.setRole(User.Role.FARMER);
                        return userRepository.save(user);
                });
        }

        private List<Farm> createSampleFarms(User owner) {
                Farm farm1 = createFarm(owner, "緑の里オーガニック農園",
                                "無農薬・有機栽培にこだわった野菜作りを体験できます。", "埼玉県秩父市",
                                "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80");

                Farm farm2 = createFarm(owner, "さくらんぼの丘ファーム",
                                "山形県産の甘くて美味しいさくらんぼを自分で収穫できます。", "山形県天童市",
                                "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&q=80");

                Farm farm3 = createFarm(owner, "ひまわり牧場",
                                "北海道の大自然の中で、乳搾りやバター作り体験ができます。", "北海道富良野市",
                                "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80");

                Farm farm4 = createFarm(owner, "棚田の風景農園",
                                "美しい棚田で田植えや稲刈り体験ができます。", "新潟県十日町市",
                                "https://images.unsplash.com/photo-1559884743-74a57598c6c7?w=800&q=80");

                Farm farm5 = createFarm(owner, "ぶどうの丘ワイナリー",
                                "ワイン用ぶどうの収穫体験とワイナリー見学ができます。", "山梨県甲州市",
                                "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80");

                Farm farm6 = createFarm(owner, "富士茶園",
                                "富士山の麓で育つ高品質なお茶葉。お茶摘み体験ができます。", "静岡県富士市",
                                "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80");

                Farm farm7 = createFarm(owner, "京野菜ファーム",
                                "京都の伝統野菜を育てる農園。京野菜ならではの味わいを楽しめます。", "京都府亀岡市",
                                "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80");

                Farm farm8 = createFarm(owner, "陽だまりのブルーベリー農園",
                                "岡山県が誇る白桃とマスカットの農園。高級フルーツを収穫できます。", "岡山県岡山市",
                                "https://images.unsplash.com/photo-1595855709940-577268785a7d?w=800&q=80");

                Farm farm9 = createFarm(owner, "あまおう農園",
                                "福岡県の特産品あまおういちごを栽培する農園。食べ放題で楽しめます。", "福岡県久留米市",
                                "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&q=80");

                Farm farm10 = createFarm(owner, "南国トロピカル農園",
                                "沖縄の太陽をたっぷり浴びたパイナップルやマンゴーを収穫できます。", "沖縄県名護市",
                                "https://images.unsplash.com/photo-1587049352846-4a222e784538?w=800&q=80");

                return List.of(farm1, farm2, farm3, farm4, farm5, farm6, farm7, farm8, farm9, farm10);
        }

        private Farm createFarm(User owner, String name, String description, String location, String imageUrl) {
                Farm farm = new Farm();
                farm.setName(name);
                farm.setDescription(description);
                farm.setLocation(location);
                farm.setImageUrl(imageUrl);
                farm.setOwner(owner);
                return farmRepository.save(farm);
        }

        private void createSampleEvents(List<Farm> farms) {
                if (farms.size() < 10) {
                        System.out.println("農園データが不足しています。イベントの初期化をスキップします。");
                        return;
                }

                LocalDateTime now = LocalDateTime.now();

                createEvent(farms.get(0), "旬の野菜収穫体験", "季節の有機野菜を収穫してお持ち帰りいただけます。",
                                now.plusDays(7), 20, new BigDecimal("2500"), "VEGETABLE");
                createEvent(farms.get(0), "トマト狩り体験", "甘くて美味しいミニトマトを収穫できます。",
                                now.plusDays(14), 15, new BigDecimal("2000"), "VEGETABLE");

                createEvent(farms.get(1), "さくらんぼ狩り", "佐藤錦の食べ放題！",
                                now.plusDays(10), 30, new BigDecimal("3500"), "FRUIT");

                createEvent(farms.get(2), "ひまわり摘み取り体験", "満開のひまわり畑で花摘みを楽しめます。",
                                now.plusDays(5), 25, new BigDecimal("1500"), "FLOWER");

                createEvent(farms.get(3), "田植え体験", "美しい棚田で田植え体験。お昼はおにぎり付き！",
                                now.plusDays(20), 20, new BigDecimal("4000"), "VEGETABLE");

                createEvent(farms.get(4), "ぶどう収穫体験", "ワイン用ぶどうの収穫とワイナリー見学がセット。",
                                now.plusDays(8), 15, new BigDecimal("5000"), "FRUIT");
                createEvent(farms.get(4), "シャインマスカット狩り", "高級ぶどうを収穫できます。",
                                now.plusDays(12), 10, new BigDecimal("4500"), "FRUIT");

                createEvent(farms.get(5), "新茶摘み体験", "富士山を望みながら新茶を摘む特別な体験。",
                                now.plusDays(15), 20, new BigDecimal("3000"), "VEGETABLE");

                createEvent(farms.get(6), "京野菜収穫体験", "九条ネギや賀茂なすなど京都の伝統野菜を収穫。",
                                now.plusDays(6), 15, new BigDecimal("3500"), "VEGETABLE");

                createEvent(farms.get(7), "白桃狩り", "岡山県産の高級白桃を自分で収穫できます。",
                                now.plusDays(9), 20, new BigDecimal("4000"), "FRUIT");
                createEvent(farms.get(7), "マスカット狩り", "甘くて香り高いマスカットをお楽しみください。",
                                now.plusDays(18), 15, new BigDecimal("3800"), "FRUIT");

                createEvent(farms.get(8), "あまおういちご狩り食べ放題", "大粒で甘いあまおうを60分食べ放題！",
                                now.plusDays(3), 25, new BigDecimal("2800"), "FRUIT");

                createEvent(farms.get(9), "マンゴー収穫体験", "完熟マンゴーを自分で収穫できる贅沢な体験。",
                                now.plusDays(11), 10, new BigDecimal("5500"), "FRUIT");
                createEvent(farms.get(9), "パイナップル収穫体験", "沖縄産パイナップルを収穫してお持ち帰り。",
                                now.plusDays(16), 15, new BigDecimal("3000"), "FRUIT");

                createEvent(farms.get(5), "茶畑でのお茶花摘み", "珍しいお茶の花を摘む体験。",
                                now.plusDays(25), 10, new BigDecimal("2500"), "FLOWER");
                createEvent(farms.get(6), "京都の花摘み体験", "季節の花々を摘んでフラワーアレンジメント。",
                                now.plusDays(22), 12, new BigDecimal("3000"), "FLOWER");
        }

        private void createEvent(Farm farm, String title, String description, LocalDateTime eventDate,
                        int capacity, BigDecimal price, String category) {
                ExperienceEvent event = new ExperienceEvent();
                event.setFarm(farm);
                event.setTitle(title);
                event.setDescription(description);
                event.setEventDate(eventDate);
                event.setCapacity(capacity);
                event.setAvailableSlots(capacity);
                event.setPrice(price);
                event.setCategory(category);
                eventRepository.save(event);
        }
}
