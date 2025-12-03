// ======================
// スムーススクロール
// ======================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ======================
// ヘッダースクロール効果
// ======================
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ======================
// FAQアコーディオン
// ======================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // すべてのFAQを閉じる
        faqItems.forEach(faq => {
            faq.classList.remove('active');
        });
        
        // クリックされたFAQを開く(既に開いていた場合は閉じる)
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ======================
// フォーム送信処理
// ======================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // フォームデータを取得
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    
    console.log('フォームデータ:', data);
    
    // 実際のアプリケーションでは、ここでAPIにデータを送信します
    // 例: fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
    
    // 成功メッセージを表示
    showSuccessMessage();
    
    // フォームをリセット
    contactForm.reset();
});

function showSuccessMessage() {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 成功メッセージを作成
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem 3rem;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            text-align: center;
            max-width: 90%;
            width: 400px;
        ">
            <div style="
                font-size: 3rem;
                margin-bottom: 1rem;
            ">✅</div>
            <h3 style="
                font-size: 1.5rem;
                font-weight: 700;
                color: #66bb6a;
                margin-bottom: 1rem;
            ">送信完了!</h3>
            <p style="
                color: #546e7a;
                line-height: 1.6;
            ">
                ご登録ありがとうございます。<br>
                担当者より2営業日以内にご連絡いたします。
            </p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 1.5rem;
                padding: 12px 32px;
                background: #66bb6a;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
            ">閉じる</button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        " onclick="this.parentElement.remove()"></div>
    `;
    
    document.body.appendChild(message);
    
    // 3秒後に自動的に閉じる
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
}

// ======================
// モバイルメニュートグル
// ======================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('.nav');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // メニューが開いている時はbodyのスクロールを防ぐ
        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // メニュー内のリンクをクリックしたらメニューを閉じる
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// モバイルメニューのスタイルを追加
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav {
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 2rem;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
        }
        
        .nav.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(style);

// ======================
// スクロールアニメーション
// ======================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll(`
        .problem-card,
        .feature-card,
        .testimonial-card,
        .step,
        .faq-item
    `);
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// ======================
// 統計カウンターアニメーション
// ======================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// ヒーローセクションが表示されたら統計カウンターを開始
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            
            // 各統計の目標値
            const targets = [1200, 50000, 4.8];
            const suffixes = ['+', '+', '★'];
            
            statNumbers.forEach((stat, index) => {
                const target = targets[index];
                const suffix = suffixes[index];
                let current = 0;
                const increment = target / 100;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        if (suffix === '★') {
                            stat.textContent = target + suffix;
                        } else {
                            stat.textContent = Math.floor(target).toLocaleString() + suffix;
                        }
                        clearInterval(timer);
                    } else {
                        if (suffix === '★') {
                            stat.textContent = current.toFixed(1);
                        } else {
                            stat.textContent = Math.floor(current).toLocaleString();
                        }
                    }
                }, 20);
            });
            
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    heroObserver.observe(heroStats);
}

// ======================
// ページ読み込み後の初期化
// ======================
window.addEventListener('load', () => {
    // ヘッダーの初期状態を設定
    if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
    }
    
    // パフォーマンス最適化: 画像の遅延読み込み
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// ======================
// デバッグ用: コンソールにウェルカムメッセージ
// ======================
console.log('%c🌾 FarMeet Landing Page', 'font-size: 20px; font-weight: bold; color: #66bb6a;');
console.log('%c農家さんと家族をつなぐ収穫体験プラットフォーム', 'font-size: 14px; color: #546e7a;');
