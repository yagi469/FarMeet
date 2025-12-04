package com.farmeet.config;

import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 既にデータが存在する場合はスキップ
        if (farmRepository.count() > 0) {
            System.out.println("データは既に存在します。初期化をスキップします。");
            return;
        }

        System.out.println("サンプルデータを初期化中...");

        // サンプル農家ユーザーを作成
        User farmer = createFarmerIfNotExists();

        // サンプル農園データを作成
        createSampleFarms(farmer);

        System.out.println("サンプルデータの初期化が完了しました。");
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

    private void createSampleFarms(User owner) {
        // 農園1: 緑の里オーガニック農園
        createFarm(owner,
                "緑の里オーガニック農園",
                "無農薬・有機栽培にこだわった野菜作りを体験できます。季節の野菜の収穫体験や、農作業の基礎を学べるワークショップも開催しています。",
                "埼玉県秩父市",
                "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80");

        // 農園2: さくらんぼの丘ファーム
        createFarm(owner,
                "さくらんぼの丘ファーム",
                "山形県産の甘くて美味しいさくらんぼを自分で収穫できます。佐藤錦をはじめ、様々な品種を楽しめます。",
                "山形県天童市",
                "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&q=80");

        // 農園3: ひまわり牧場
        createFarm(owner,
                "ひまわり牧場",
                "北海道の大自然の中で、乳搾りやバター作り体験ができます。広大な牧草地でのんびり過ごす牛たちと触れ合えます。",
                "北海道富良野市",
                "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80");

        // 農園4: 棚田の風景農園
        createFarm(owner,
                "棚田の風景農園",
                "美しい棚田で田植えや稲刈り体験ができます。日本の原風景を感じながら、お米作りの大変さと喜びを体験してください。",
                "新潟県十日町市",
                "https://images.unsplash.com/photo-1559884743-74a57598c6c7?w=800&q=80");

        // 農園5: ぶどうの丘ワイナリー
        createFarm(owner,
                "ぶどうの丘ワイナリー",
                "ワイン用ぶどうの収穫体験とワイナリー見学ができます。収穫したぶどうでワイン造りの一部を体験することも可能です。",
                "山梨県甲州市",
                "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80");

        // 農園6: 富士茶園
        createFarm(owner,
                "富士茶園",
                "富士山の麓で育つ高品質なお茶葉。お茶摘み体験と製茶工程の見学ができます。景色も最高で、インスタ映えスポットとしても人気です。",
                "静岡県富士市",
                "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80");

        // 農園7: 京野菜ファーム
        createFarm(owner,
                "京野菜ファーム",
                "京都の伝統野菜を育てる農園。九条ネギ、賀茂なすなど、京野菜ならではの味わいを楽しめます。稀少な体験が人気です。",
                "京都府亀岡市",
                "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80");

        // 農園8: 陽だまりのブルーベリー農園
        createFarm(owner,
                "陽だまりのブルーベリー農園",
                "岡山県が誇る白桃とマスカットの農園。高級フルーツを自分で収穫できる贅沢な体験をお楽しみください。",
                "岡山県岡山市",
                "https://images.unsplash.com/photo-1595855709940-577268785a7d?w=800&q=80");

        // 農園9: あまおう農園
        createFarm(owner,
                "あまおう農園",
                "福岡県の特産品「あまおう」いちごを栽培する農園。大粒で甘いいちごを食べ放題で楽しめます。併設のカフェでいちごスイーツも楽しめます。",
                "福岡県久留米市",
                "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&q=80");

        // 農園10: 南国トロピカル農園
        createFarm(owner,
                "南国トロピカル農園",
                "沖縄の太陽をたっぷり浴びたパイナップルやマンゴーを収穫できます。南国気分を味わいながらトロピカルフルーツを堪能してください。",
                "沖縄県名護市",
                "https://images.unsplash.com/photo-1587049352846-4a222e784538?w=800&q=80");
    }

    private void createFarm(User owner, String name, String description, String location, String imageUrl) {
        Farm farm = new Farm();
        farm.setName(name);
        farm.setDescription(description);
        farm.setLocation(location);
        farm.setImageUrl(imageUrl);
        farm.setOwner(owner);
        farmRepository.save(farm);
    }
}
