let csrfToken = null;

async function ensureCsrfToken(forceRefresh = false) {
    if (csrfToken && !forceRefresh) {
        return csrfToken;
    }

    try {
        const response = await fetch('/server/auth.php?action=check', {
            credentials: 'same-origin',
        });

        if (!response.ok) {
            throw new Error('Unable to fetch CSRF token');
        }

        const data = await response.json();
        csrfToken = data.csrfToken || null;
        return csrfToken;
    } catch (error) {
        console.error('CSRF token initialization failed', error);
        return null;
    }
}

async function csrfFetch(url, options = {}) {
    const opts = { ...options };
    opts.headers = { ...(options.headers || {}) };
    opts.credentials = options.credentials || 'same-origin';

    const inferredMethod = opts.method || (opts.body ? 'POST' : 'GET');
    const method = inferredMethod.toUpperCase();

    if (method !== 'GET') {
        if (!csrfToken) {
            await ensureCsrfToken();
        }
        if (csrfToken) {
            opts.headers['X-CSRF-Token'] = csrfToken;
        }
    }

    opts.method = method;
    return fetch(url, opts);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- DICTIONNAIRE DE TRADUCTION COMPLET ---
    const translations = {
        fr: {
            nav_about: "À propos",
            nav_how_it_works: "Comment ça marche",
            nav_solutions: "Nos Solutions",
            nav_ai_advisor: "✨ Conseiller IA",
            nav_account: "Mon Compte",
            nav_get_quote: "Obtenir un devis",
            nav_about_mobile: "À propos",
            nav_how_it_works_mobile: "Comment ça marche",
            nav_solutions_mobile: "Nos Solutions",
            nav_ai_advisor_mobile: "✨ Conseiller IA",
            nav_account_mobile: "Mon Compte",
            nav_get_quote_mobile: "Obtenir un devis",
            hero_title: "Du traditionnel au smart - connectez votre ferme à l'avenir.",
            hero_subtitle: "Solutions de modernisation abordables pour une agriculture plus efficace.",
            hero_button: "Découvrir nos solutions",
            summary_about_title: "Notre Vision : Un Futur Intelligent",
            summary_about_desc: "Nous démocratisons l'agriculture intelligente. Découvrez comment notre engagement envers l'innovation \"retrofit\" relève les défis mondiaux et crée un avenir durable pour tous.",
            learn_more_about_us: "En savoir plus sur nous",
            summary_solutions_title: "Solutions Modulaires Puissantes",
            summary_solutions_desc: "Irrigation intelligente, contrôle des pompes, surveillance environnementale. Explorez nos solutions conçues pour optimiser vos ressources et maximiser vos rendements.",
            explore_solutions: "Explorer nos solutions",
            summary_ai_advisor_title: "Votre Agronome Personnel",
            summary_ai_advisor_desc: "Un problème avec vos cultures ? Décrivez-le à notre Conseiller IA et recevez une analyse et des recommandations instantanées pour protéger votre récolte.",
            try_ai_advisor: "Essayer le conseiller IA",
            summary_contact_title: "Prêt à moderniser votre ferme ?",
            summary_contact_desc: "Discutons de vos besoins. Contactez-nous dès aujourd'hui pour obtenir un devis personnalisé et découvrir comment FarmLink peut transformer votre exploitation.",
            contact_us_button: "Contactez-nous",
            testimonials_title: "Ce que disent nos agriculteurs",
            testimonial_1_text: "\"FarmLink a transformé ma gestion de l'eau. J'économise du temps et de l'argent, et mes rendements n'ont jamais été aussi bons.\"",
            testimonial_1_name: "Karim A.",
            testimonial_1_location: "Agriculteur, Sidi Bouzid",
            testimonial_2_text: "\"L'installation a été incroyablement simple sur mon équipement existant. Le panneau de contrôle est très intuitif.\"",
            testimonial_2_name: "Fatma M.",
            testimonial_2_location: "Exploitante d'oliveraie, Sfax",
            testimonial_3_text: "\"Le conseiller IA est un véritable plus. Il m'a aidé à identifier un problème de ravageurs avant qu'il ne se propage. C'est l'avenir !\"",
            testimonial_3_name: "Youssef B.",
            testimonial_3_location: "Serriste, Kairouan",
            footer_copyright: "&copy; 2025 FarmLink. Tous droits réservés.",
            about_main_title: "L'Agriculture de Demain, Une Récolte à la Fois.",
            about_vision_title: "Notre Vision : Un futur où chaque ferme est intelligente.",
            about_intro_text: "Chez FarmLink, nous voyons l'agriculture non pas comme une industrie du passé, mais comme la technologie la plus essentielle de l'avenir. Notre mission est de démocratiser l'agriculture intelligente.",
            about_commitment_title: "Notre Engagement : Affronter les défis mondiaux avec l'innovation \"retrofit\".",
            about_commitment_text: "Dans un monde où les ressources sont limitées et les défis climatiques s'intensifient, la mission de FarmLink est plus vitale que jamais.",
            how_it_works_title: "Comment ça marche ?",
            step1_title: "Installation \"Retrofit\"",
            step1_desc: "Nous installons nos modules sur votre équipement existant, sans remplacement coûteux.",
            step2_title: "Connexion au Cloud",
            step2_desc: "Les capteurs envoient les données en temps réel à notre plateforme sécurisée.",
            step3_title: "Contrôle & Optimisation",
            step3_desc: "Vous gérez tout depuis le panneau de contrôle et recevez des recommandations de l'IA.",
            solutions_title: "Nos Solutions Modulaires",
            solution_irrigation_title: "Irrigation Intelligente",
            solution_irrigation_desc: "Optimisez votre consommation d'eau avec des vannes intelligentes et une planification automatisée.",
            solution_pump_title: "Contrôle des Pompes",
            solution_pump_desc: "Gérez vos pompes à distance et surveillez le débit et la pression en temps réel.",
            solution_env_title: "Surveillance Environnementale",
            solution_env_desc: "Prenez des décisions éclairées grâce aux données des capteurs de température, d'humidité et de sol.",
            ai_advisor_title: "✨ Conseiller Agricole IA",
            ai_welcome: "Bonjour ! Posez-moi une question sur vos cultures ou envoyez-moi une photo.",
            privacyNote: "Confidentialité garantie : Toute l'analyse est effectuée sur votre appareil.",
            contact_title: "Contactez-nous",
            contact_intro: "Une question ? Un projet ? N'hésitez pas à nous contacter. Notre équipe est prête à vous aider à franchir le pas vers l'agriculture intelligente.",
            contact_name: "Nom",
            contact_email: "Email",
            contact_phone: "Numéro de téléphone",
            contact_message: "Message",
            contact_send: "<i class='fas fa-paper-plane mr-2'></i> Envoyer le Message",
            account_title: "Mon Compte",
            auth_login_title: "Se connecter",
            auth_login_btn: "Se connecter",
            auth_register_prompt: "Pas encore de compte ? <a href='register.html' class='text-brand-green-400 font-bold'>Créer un compte</a>",
            auth_register_title: "Créer un compte",
            auth_register_btn: "Créer le compte",
            auth_last_name_placeholder: "Nom",
            auth_first_name_placeholder: "Prénom",
            auth_email_placeholder: "Email",
            auth_phone_placeholder: "Numéro de téléphone",
            auth_region_placeholder: "Région",
            auth_login_prompt: "Déjà un compte ? <a href='account.html' class='text-brand-blue-500 font-bold'>Se connecter</a>",
            products_section_title: "Mes Produits",
            add_product_btn: "Ajouter",
            logout_btn: "Se déconnecter",
            context_agricole: `
                ### SUJET: AGRICULTURE EN TUNISIE ###
                L'agriculture en Tunisie fait face à des défis comme la sécheresse et la salinité des sols. Les cultures principales sont les olives, les céréales, les dattes et les agrumes. La bonne gestion de l'eau est cruciale.
                ### PROBLÈME: FEUILLES JAUNES (CHLOROSE) ###
                Les feuilles jaunes sur une plante sont souvent un signe de carence en nutriments ou de maladie.
                - Sur les tomates, des taches jaunes peuvent indiquer le mildiou, surtout si le temps est humide. Une autre cause est la carence en azote, qui fait jaunir les vieilles feuilles en premier.
                - Sur les oliviers, le jaunissement peut être causé par un manque d'eau, un sol trop calcaire, ou une maladie comme la verticilliose.
                - Sur les agrumes (citronniers, orangers), des feuilles jaunes avec des nervures vertes indiquent souvent une carence en fer (chlorose ferrique), fréquente dans les sols calcaires tunisiens. Solution : apport de chélate de fer.
                ### PROBLÈME: PARASITES COMMUNS ###
                - Les pucerons sont de petits insectes verts ou noirs qui sucent la sève, affaiblissant la plante et transmettant des maladies. Solution : savon noir dilué ou insecticide naturel.
                - La mouche de l'olivier pond ses œufs dans les olives, provoquant leur chute. Solution : surveillance avec des pièges (phéromones) et traitement si nécessaire.
                - L'araignée rouge se développe par temps chaud et sec et crée de fines toiles sous les feuilles. Solution : pulvérisation d'eau sur le feuillage pour augmenter l'humidité.
            `,
        },
        en: {
            nav_about: "About",
            nav_how_it_works: "How It Works",
            nav_solutions: "Solutions",
            nav_ai_advisor: "✨ AI Advisor",
            nav_account: "My Account",
            nav_get_quote: "Get a Quote",
            nav_about_mobile: "About",
            nav_how_it_works_mobile: "How It Works",
            nav_solutions_mobile: "Solutions",
            nav_ai_advisor_mobile: "✨ AI Advisor",
            nav_account_mobile: "My Account",
            nav_get_quote_mobile: "Get a Quote",
            hero_title: "From traditional to smart – connect your farm to the future.",
            hero_subtitle: "Affordable retrofit solutions for more efficient farming.",
            hero_button: "Discover our solutions",
            summary_about_title: "Our Vision: A Smart Future",
            summary_about_desc: "We are democratizing smart agriculture. Discover how our commitment to 'retrofit' innovation addresses global challenges and creates a sustainable future for all.",
            learn_more_about_us: "Learn More About Us",
            summary_solutions_title: "Powerful Modular Solutions",
            summary_solutions_desc: "Smart irrigation, pump control, environmental monitoring. Explore our solutions designed to optimize your resources and maximize your yields.",
            explore_solutions: "Explore Our Solutions",
            summary_ai_advisor_title: "Your Personal Agronomist",
            summary_ai_advisor_desc: "Have a problem with your crops? Describe it to our AI Advisor and receive an instant analysis and recommendations to protect your harvest.",
            try_ai_advisor: "Try the AI Advisor",
            summary_contact_title: "Ready to upgrade your farm?",
            summary_contact_desc: "Let's discuss your needs. Contact us today for a personalized quote and find out how FarmLink can transform your operation.",
            contact_us_button: "Contact Us",
            testimonials_title: "What Our Farmers Say",
            testimonial_1_text: "\"FarmLink has transformed my water management. I save time and money, and my yields have never been better.\"",
            testimonial_1_name: "Karim A.",
            testimonial_1_location: "Farmer, Sidi Bouzid",
            testimonial_2_text: "\"The installation was incredibly simple on my existing equipment. The control panel is very intuitive.\"",
            testimonial_2_name: "Fatma M.",
            testimonial_2_location: "Olive grove owner, Sfax",
            testimonial_3_text: "\"The AI advisor is a real game-changer. It helped me identify a pest problem before it spread. This is the future!\"",
            testimonial_3_name: "Youssef B.",
            testimonial_3_location: "Greenhouse farmer, Kairouan",
            footer_copyright: "&copy; 2025 FarmLink. All rights reserved.",
            about_main_title: "The Future of Farming, One Harvest at a Time.",
            about_vision_title: "Our Vision: A future where every farm is smart.",
            about_intro_text: "At FarmLink, we see agriculture not as an industry of the past, but as the most essential technology of the future. Our mission is to democratize smart farming.",
            about_commitment_title: "Our Commitment: Tackling global challenges with 'retrofit' innovation.",
            about_commitment_text: "In a world of limited resources and intensifying climate challenges, FarmLink's mission is more vital than ever.",
            how_it_works_title: "How It Works?",
            step1_title: "\"Retrofit\" Installation",
            step1_desc: "We install our modules on your existing equipment, without costly replacements.",
            step2_title: "Cloud Connection",
            step2_desc: "Sensors send real-time data to our secure platform.",
            step3_title: "Control & Optimization",
            step3_desc: "You manage everything from the control panel and receive AI-powered recommendations.",
            solutions_title: "Our Modular Solutions",
            solution_irrigation_title: "Smart Irrigation",
            solution_irrigation_desc: "Optimize your water consumption with smart valves and automated scheduling.",
            solution_pump_title: "Pump Control",
            solution_pump_desc: "Manage your pumps remotely and monitor flow and pressure in real time.",
            solution_env_title: "Environmental Monitoring",
            solution_env_desc: "Make informed decisions with data from temperature, humidity, and soil sensors.",
            ai_advisor_title: "✨ AI Farming Advisor",
            ai_welcome: "Hello! Ask me a question about your crops or send me a photo.",
            privacyNote: "Privacy guaranteed: All analysis is performed on your device.",
            contact_title: "Contact Us",
            contact_intro: "A question? A project? Don't hesitate to contact us. Our team is ready to help you take the step towards smart agriculture.",
            contact_name: "Name",
            contact_email: "Email",
            contact_phone: "Phone Number",
            contact_message: "Message",
            contact_send: "<i class='fas fa-paper-plane mr-2'></i> Send Message",
            account_title: "My Account",
            auth_login_title: "Log In",
            auth_login_btn: "Log In",
            auth_register_prompt: "Don't have an account yet? <a href='register.html' class='text-brand-green-400 font-bold'>Create an account</a>",
            auth_register_title: "Create an Account",
            auth_register_btn: "Create Account",
            auth_last_name_placeholder: "Last Name",
            auth_first_name_placeholder: "First Name",
            auth_email_placeholder: "Email",
            auth_phone_placeholder: "Phone Number",
            auth_region_placeholder: "Region",
            auth_login_prompt: "Already have an account? <a href='account.html' class='text-brand-blue-500 font-bold'>Log In</a>",
            products_section_title: "My Products",
            add_product_btn: "Add",
            logout_btn: "Log Out",
            context_agricole: `
                ### SUBJECT: AGRICULTURE IN TUNISIA ###
                Agriculture in Tunisia faces challenges like drought and soil salinity. Main crops include olives, cereals, dates, and citrus fruits. Good water management is crucial.
                ### PROBLEM: YELLOW LEAVES (CHLOROSIS) ###
                Yellow leaves on a plant are often a sign of nutrient deficiency or disease.
                - On tomatoes, yellow spots can indicate downy mildew, especially in humid weather. Another cause is nitrogen deficiency, which yellows older leaves first.
                - On olive trees, yellowing can be caused by lack of water, soil that is too calcareous, or a disease like Verticillium wilt.
                - On citrus trees (lemon, orange), yellow leaves with green veins often indicate an iron deficiency (iron chlorosis), common in Tunisian calcareous soils. Solution: apply iron chelate.
            `,
        },
        ar: {
            nav_about: "نبذة عنا",
            nav_how_it_works: "كيف نعمل",
            nav_solutions: "حلولنا",
            nav_ai_advisor: "✨ المستشار الذكي",
            nav_account: "حسابي",
            nav_get_quote: "اطلب عرض سعر",
            nav_about_mobile: "نبذة عنا",
            nav_how_it_works_mobile: "كيف نعمل",
            nav_solutions_mobile: "حلولنا",
            nav_ai_advisor_mobile: "✨ المستشار الذكي",
            nav_account_mobile: "حسابي",
            nav_get_quote_mobile: "اطلب عرض سعر",
            hero_title: "من الزراعة التقليدية إلى الذكية – اربط مزرعتك بالمستقبل.",
            hero_subtitle: "حلول تحديث بأسعار معقولة لزراعة أكثر كفاءة.",
            hero_button: "اكتشف حلولنا",
            summary_about_title: "رؤيتنا: مستقبل ذكي",
            summary_about_desc: "نحن نعمل على نشر الزراعة الذكية. اكتشف كيف يواجه التزامنا بالابتكار \"التحديثي\" التحديات العالمية ويخلق مستقبلًا مستدامًا للجميع.",
            learn_more_about_us: "اعرف المزيد عنا",
            summary_solutions_title: "حلول معيارية قوية",
            summary_solutions_desc: "الري الذكي، التحكم في المضخات، المراقبة البيئية. استكشف حلولنا المصممة لتحسين مواردك وزيادة غلتك.",
            explore_solutions: "استكشف حلولنا",
            summary_ai_advisor_title: "مهندسك الزراعي الشخصي",
            summary_ai_advisor_desc: "هل لديك مشكلة في محاصيلك؟ صفها لمستشارنا الذكي واحصل على تحليل وتوصيات فورية لحماية محصولك.",
            try_ai_advisor: "جرب المستشار الذكي",
            summary_contact_title: "هل أنت مستعد لتحديث مزرعتك؟",
            summary_contact_desc: "دعنا نناقش احتياجاتك. اتصل بنا اليوم للحصول على عرض أسعار شخصي واكتشف كيف يمكن لـ FarmLink تحويل عملياتك الزراعية.",
            contact_us_button: "اتصل بنا",
            testimonials_title: "ماذا يقول مزارعونا",
            testimonial_1_text: "\"لقد غيرت FarmLink إدارة المياه لدي. أوفر الوقت والمال، ومحاصيلي لم تكن أفضل من أي وقت مضى.\"",
            testimonial_1_name: "كريم أ.",
            testimonial_1_location: "مزارع، سيدي بوزيد",
            testimonial_2_text: "\"كان التركيب بسيطًا بشكل لا يصدق على معداتي الحالية. لوحة التحكم سهلة الاستخدام للغاية.\"",
            testimonial_2_name: "فاطمة م.",
            testimonial_2_location: "صاحبة بستان زيتون، صفاقس",
            testimonial_3_text: "\"المستشار الذكي هو إضافة حقيقية. لقد ساعدني في تحديد مشكلة الآفات قبل انتشارها. هذا هو المستقبل!\"",
            testimonial_3_name: "يوسف ب.",
            testimonial_3_location: "مزارع صوبات، القيروان",
            footer_copyright: "&copy; 2025 FarmLink. جميع الحقوق محفوظة.",
            about_main_title: "زراعة الغد، حصادًا بعد حصاد.",
            about_vision_title: "رؤيتنا: مستقبل تكون فيه كل مزرعة ذكية.",
            about_intro_text: "في FarmLink، مهمتنا هي جعل الزراعة الذكية في متناول الجميع.",
            about_commitment_title: "التزامنا: مواجهة التحديات العالمية بابتكار \"التحديث\".",
            about_commitment_text: "في عالم تتزايد فيه ندرة الموارد وتتفاقم التحديات المناخية، أصبحت مهمة FarmLink أكثر أهمية من أي وقت مضى.",
            how_it_works_title: "كيف نعمل؟",
            step1_title: "تركيب \"تحديثي\"",
            step1_desc: "نقوم بتركيب وحداتنا على معداتك الحالية، دون الحاجة إلى استبدالها بالكامل.",
            step2_title: "الاتصال السحابي",
            step2_desc: "ترسل المستشعرات البيانات في الوقت الفعلي إلى منصتنا الآمنة.",
            step3_title: "التحكم والتحسين",
            step3_desc: "يمكنك إدارة كل شيء من لوحة التحكم وتلقي توصيات مدعومة بالذكاء الاصطناعي.",
            solutions_title: "حلولنا المعيارية",
            solution_irrigation_title: "الري الذكي",
            solution_irrigation_desc: "حسّن استهلاكك للمياه باستخدام الصمامات الذكية والجدولة الآلية.",
            solution_pump_title: "التحكم في المضخات",
            solution_pump_desc: "أدر مضخاتك عن بعد وراقب التدفق والضغط في الوقت الفعلي.",
            solution_env_title: "المراقبة البيئية",
            solution_env_desc: "اتخذ قرارات مستنيرة بفضل بيانات مستشعرات درجة الحرارة والرطوبة والتربة.",
            ai_advisor_title: "✨ المستشار الزراعي الذكي",
            ai_welcome: "مرحباً! اسألني سؤالاً عن محاصيلك أو أرسل لي صورة.",
            privacyNote: "الخصوصية مضمونة: يتم إجراء جميع التحليلات على جهازك.",
            contact_title: "اتصل بنا",
            contact_intro: "سؤال؟ مشروع؟ لا تتردد في الاتصال بنا. فريقنا مستعد لمساعدتك على اتخاذ الخطوة نحو الزراعة الذكية.",
            contact_name: "الاسم",
            contact_email: "البريد الإلكتروني",
            contact_phone: "رقم الهاتف",
            contact_message: "الرسالة",
            contact_send: "<i class='fas fa-paper-plane ml-2'></i> إرسال الرسالة",
            account_title: "حسابي",
            auth_login_title: "تسجيل الدخول",
            auth_login_btn: "تسجيل الدخول",
            auth_register_prompt: "لا يوجد لديك حساب بعد؟ <a href='register.html' class='text-brand-green-400 font-bold'>إنشاء حساب</a>",
            auth_register_title: "إنشاء حساب",
            auth_register_btn: "إنشاء الحساب",
            auth_last_name_placeholder: "اللقب",
            auth_first_name_placeholder: "الاسم الأول",
            auth_email_placeholder: "البريد الإلكتروني",
            auth_phone_placeholder: "رقم الهاتف",
            auth_region_placeholder: "المنطقة",
            auth_login_prompt: "لديك حساب بالفعل؟ <a href='account.html' class='text-brand-blue-500 font-bold'>تسجيل الدخول</a>",
            products_section_title: "منتجاتي",
            add_product_btn: "أضف",
            logout_btn: "تسجيل الخروج",
            context_agricole: `
                ### الموضوع: الزراعة في تونس ###
                تواجه الزراعة في تونس تحديات مثل الجفاف وملوحة التربة. المحاصيل الرئيسية تشمل الزيتون والحبوب والتمور والحمضيات. الإدارة الجيدة للمياه أمر بالغ الأهمية.
            `,
        }
    };
    

    // --- SÉLECTEURS D'ÉLÉMENTS ---
   let currentLang = 'fr';
    const htmlElement = document.documentElement;
    const body = document.body;
    const languageSwitcher = document.getElementById('language-switcher');
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const navLinks = document.querySelectorAll('.nav-link, #mobile-menu a');
    const ctaButtons = document.querySelectorAll('.button, .cta-button');

    const applyLanguage = (lang) => {
        currentLang = lang;
        htmlElement.lang = lang;
        htmlElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (!el.dataset.original) {
                el.dataset.original = el.innerHTML;
            }
            const translation = translations[lang] && translations[lang][key];
            if (translation) {
                el.innerHTML = translation;
            } else {
                el.innerHTML = el.dataset.original;
                console.warn(`Missing translation for key '${key}' in language '${lang}'`);
            }
        });
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.setAttribute('placeholder', translations[lang][key]);
            }
        });
    };

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark');
            if(themeIconLight) themeIconLight.classList.add('hidden');
            if(themeIconDark) themeIconDark.classList.remove('hidden');
        } else {
            body.classList.remove('dark');
            if(themeIconLight) themeIconLight.classList.remove('hidden');
            if(themeIconDark) themeIconDark.classList.add('hidden');
        }
    };

    const savedLang = localStorage.getItem('language') || 'fr';
    if (languageSwitcher) languageSwitcher.value = savedLang;
    applyLanguage(savedLang);

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });

    if (languageSwitcher) languageSwitcher.addEventListener('change', (e) => {
        const newLang = e.target.value;
        localStorage.setItem('language', newLang);
        applyLanguage(newLang);
    });
    if (menuBtn && mobileMenu) menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    if (themeToggle) themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- LOGIQUE SPÉCIFIQUE À LA PAGE AI-ADVISOR ---
    if (document.getElementById('ai-advisor')) {
        let models = { image: null, ready: false };
        let stream = null;

        const aiInputForm = document.getElementById('ai-input-form');
        const textInput = document.getElementById('text-input');
        const fileInput = document.getElementById('fileInput');
        const webcamBtn = document.getElementById('webcamBtn');
        const captureBtn = document.getElementById('captureBtn');

        const imagePreviewWrapper = document.getElementById('image-preview-wrapper');
        const previewImg = document.getElementById('previewImg');
        const cam = document.getElementById('cam');
        const aiResponseText = document.getElementById('ai-response-text');
        const aiSpinner = document.getElementById('ai-spinner');

        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progressBar');

        function showSpinner(show) { aiSpinner.classList.toggle('hidden', !show); }
        function updateProgressBar(p) { if(progressBar) progressBar.style.width = `${p}%`; }

        function setInputEnabled(enabled) {
            textInput.disabled = !enabled;
            aiInputForm.querySelector('button[type="submit"]').disabled = !enabled;
            textInput.placeholder = enabled ? "Posez votre question ici..." : "Chargement des modèles IA...";
        }

        async function preloadModels() {
            setInputEnabled(false);
            progressContainer.classList.remove('hidden');
            updateProgressBar(10);
            aiResponseText.textContent = "Chargement des modèles IA...";
            try {
                if (typeof mobilenet !== 'undefined') {
                    await tf.setBackend('webgl');
                    models.image = await mobilenet.load({ version: 2, alpha: 1.0 });
                    console.log('Modèle IA Image chargé.');
                    updateProgressBar(100);
                }
                models.ready = true;
                aiResponseText.innerHTML = `<p data-translate="ai_welcome">${translations[currentLang].ai_welcome}</p>`;
                setInputEnabled(true);
            } catch (error) {
                console.error("Échec du chargement des modèles:", error);
                aiResponseText.textContent = "Erreur lors du chargement des modèles IA.";
            } finally {
                 setTimeout(() => progressContainer.classList.add('hidden'), 1000);
            }
        }

        async function handleTextAnalysis(question) {
            if (!question.trim()) return;
            showSpinner(true);
            aiResponseText.textContent = '';
            imagePreviewWrapper.classList.add('hidden');

            try {
                const response = await fetch('/server/ai.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: question })
                });
                const data = await response.json();
                if (data && data.answer) {
                    aiResponseText.textContent = data.answer;
                } else {
                    aiResponseText.textContent = 'Aucune réponse reçue.';
                }
            } catch (error) {
                console.error('Erreur IA:', error);
                aiResponseText.textContent = "Une erreur est survenue lors de l'analyse.";
            } finally {
                showSpinner(false);
            }
        }

        async function handleImageAnalysis(imageElement) {
            if (!imageElement || !imageElement.src) return;
            if (!models.ready || !models.image) {
                 aiResponseText.textContent = "Le modèle IA image n'est pas encore prêt.";
                 return;
            }
            showSpinner(true);
            aiResponseText.textContent = "Analyse de l'image en cours...";

            try {
                const predictions = await models.image.classify(imageElement);
                if (predictions && predictions.length > 0) {
                     const mainObject = predictions[0].className.split(',')[0];
                     const generatedQuestion = `Quelles sont les causes des taches sur une feuille de ${mainObject} ?`;
                     textInput.value = generatedQuestion;
                     textInput.style.height = 'auto'; textInput.style.height = textInput.scrollHeight + 'px';
                     aiResponseText.innerHTML = `<p>J'ai identifié un(e) <strong>${mainObject}</strong>. J'ai préparé une question pour vous. Appuyez sur Envoyer pour obtenir une analyse.</p>`;
                } else {
                    aiResponseText.innerHTML = "<p>Aucun objet n'a pu être identifié. Essayez une autre photo.</p>";
                }
            } catch (error) {
                console.error("Erreur MobileNet:", error);
                aiResponseText.textContent = "Une erreur est survenue lors de l'analyse de l'image.";
            } finally {
                showSpinner(false);
            }
        }

        function displayImage(src) {
            imagePreviewWrapper.classList.remove('hidden');
            previewImg.src = src;
            previewImg.hidden = false;
            cam.hidden = true;
            captureBtn.classList.add('hidden');
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                webcamBtn.classList.remove('active');
            }
            handleImageAnalysis(previewImg);
        }

        async function toggleCam() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                cam.hidden = true;
                captureBtn.classList.add('hidden');
                webcamBtn.classList.remove('active');
                aiResponseText.innerHTML = `<p data-translate="ai_welcome">${translations[currentLang].ai_welcome}</p>`;
                return;
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                cam.srcObject = stream;
                await cam.play();
                imagePreviewWrapper.classList.remove('hidden');
                cam.hidden = false;
                previewImg.hidden = true;
                webcamBtn.classList.add('active');
                captureBtn.classList.remove('hidden');
                aiResponseText.innerHTML = `<p>Caméra active. Appuyez sur le bouton <i class="fas fa-camera"></i> pour capturer.</p>`;
            } catch (err) {
                console.error("Erreur caméra:", err);
                alert("Impossible d'accéder à la caméra.");
            }
        }

        function captureImageFromCam() {
            if (!stream) return;
            const canvas = document.createElement('canvas');
            canvas.width = cam.videoWidth;
            canvas.height = cam.videoHeight;
            canvas.getContext('2d').drawImage(cam, 0, 0);
            const imageUrl = canvas.toDataURL('image/jpeg');
            displayImage(imageUrl);
        }

        aiInputForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleTextAnalysis(textInput.value);
            textInput.value = '';
            textInput.style.height = '40px';
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => displayImage(event.target.result);
                reader.readAsDataURL(file);
            }
        });

        if(webcamBtn) webcamBtn.addEventListener('click', toggleCam);
        if(captureBtn) captureBtn.addEventListener('click', captureImageFromCam);

        if(textInput) textInput.addEventListener('input', () => {
            textInput.style.height = 'auto';
            textInput.style.height = textInput.scrollHeight + 'px';
        });

        if (document.getElementById('ai-advisor')) {
            preloadModels();
        }
    }
    const path = location.pathname.toLowerCase();
  const map = [
    { key: 'home',      match: ['/', '/index.php'] },
    { key: 'how',       match: ['/how-it-works.php', '/how-it-works.html'] },
    { key: 'solutions', match: ['/solutions.php', '/solutions.html'] },
    { key: 'account',   match: ['/account.php', '/register.php', '/login.php'] },
    { key: 'contact',   match: ['/contact.php', '/contact.html'] }
  ];
  const current = map.find(m => m.match.includes(path));
  if (current) {
    const el = document.querySelector(`.site-nav a[data-nav="${current.key}"]`);
    if (el) el.classList.add('active');
  }
    // Fetch CSRF token for the session
    ensureCsrfToken().then(token => {
        if (!token) {
            return;
        }
        document.querySelectorAll('input[name="csrf_token"]').forEach(input => {
            input.value = token;
        });
    }).catch(() => {});

    // --- NOUVELLE LOGIQUE POUR LA PAGE 'ACCOUNT.HTML' ---
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');
    const authSection = document.getElementById('auth-section');
    if (authSection && registerForm) {
        console.log("Script for account page is running."); // Ligne de débogage
        const loginForm = document.getElementById('login-form');
        const registerSection = document.getElementById('register-section');
        const loginMessage = document.getElementById('login-message');

        // Gère la soumission du formulaire d'inscription
        if (registerForm) registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const lastName = document.getElementById('register-last-name').value.trim();
            const firstName = document.getElementById('register-first-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const phone = document.getElementById('register-phone').value.trim();
            const region = document.getElementById('register-region').value.trim();
            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (registerMessage) registerMessage.textContent = 'Email invalide.';
                return;
            }
            if (!/^\d{8,}$/.test(phone)) {
                if (registerMessage) registerMessage.textContent = 'Le numéro de téléphone doit contenir au moins 8 chiffres.';
                return;
            }

            csrfFetch('/server/auth.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, last_name: lastName, first_name: firstName, email, phone, region })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Auto-login after registration then redirect to profile
                    csrfFetch('/server/auth.php?action=login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    })
                    .then(res => res.json())
                    .then(loginData => {
                        if (loginData.success) {
                            window.location.href = 'profile.html';
                        } else {
                            if (registerMessage) registerMessage.textContent = 'Compte créé, mais connexion impossible.';
                        }
                    });
                } else {
                    if (registerMessage) registerMessage.textContent = data.message || 'Erreur lors de la création du compte.';
                }
            })
            .catch(() => {
                if (registerMessage) registerMessage.textContent = 'Erreur réseau.';
            });
        });

        // Gère la soumission du formulaire de connexion
        if (loginForm) loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            csrfFetch('/server/auth.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'profile.html';
                } else {
                    if (loginMessage) loginMessage.textContent = data.message || "Nom d'utilisateur ou mot de passe incorrect.";
                }
            })
            .catch(() => {
                if (loginMessage) loginMessage.textContent = 'Erreur réseau.';
            });
        });

        csrfFetch('/server/auth.php?action=check', { method: 'GET' })
            .then(res => res.json())
            .then(data => {
                csrfToken = data.csrfToken;
                if (data.loggedIn) {
                    window.location.href = 'profile.html';
                } else {
                    if (authSection) authSection.classList.remove('hidden');
                    if (registerSection) registerSection.classList.remove('hidden');
                }
            });
    }

    if (registerForm && !authSection) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (registerMessage) {
                registerMessage.textContent = '';
                registerMessage.classList.remove('text-red-500', 'text-green-500');
            }

            const formData = new FormData(registerForm);
            const usernameField = registerForm.querySelector('[name="username"]');

            const payload = {
                last_name: (formData.get('last_name') || '').toString().trim(),
                first_name: (formData.get('first_name') || '').toString().trim(),
                email: (formData.get('email') || '').toString().trim(),
                phone: (formData.get('phone') || '').toString(),
                region: (formData.get('region') || '').toString().trim(),
                password: (formData.get('password') || '').toString(),
            };

            const username = usernameField ? usernameField.value.trim() : '';
            if (username !== '') {
                payload.username = username;
            }

            const phoneDigits = payload.phone.replace(/\D/g, '');
            const errors = [];

            if (!payload.last_name || !payload.first_name || !payload.email || !payload.phone || !payload.region || !payload.password) {
                errors.push('Tous les champs sont requis.');
            }
            if (payload.email && !/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(payload.email)) {
                errors.push('Adresse e-mail invalide.');
            }
            if (phoneDigits.length < 8) {
                errors.push('Le numéro de téléphone doit contenir au moins 8 chiffres.');
            }
            if (usernameField && username.length === 0) {
                errors.push("Le nom d'utilisateur est requis.");
            } else if (usernameField && username.length < 3) {
                errors.push("Le nom d'utilisateur doit contenir au moins 3 caractères.");
            }
            if (payload.password.length < 8) {
                errors.push('Le mot de passe doit contenir au moins 8 caractères.');
            }

            if (errors.length) {
                if (registerMessage) {
                    registerMessage.textContent = errors.join(' ');
                    registerMessage.classList.remove('text-green-500');
                    registerMessage.classList.add('text-red-500');
                }
                return;
            }

            payload.phone = phoneDigits;

            const token = await ensureCsrfToken();
            if (!token) {
                if (registerMessage) {
                    registerMessage.textContent = "Impossible de contacter le serveur. Veuillez réessayer.";
                    registerMessage.classList.add('text-red-500');
                }
                return;
            }

            try {
                const response = await csrfFetch('/server/auth.php?action=register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const result = await response.json().catch(() => null);

                if (!result) {
                    throw new Error('Réponse du serveur invalide.');
                }

                if (!response.ok || !(result.success === true || result.status === 'success')) {
                    const message = result.message || 'Erreur lors de la création du compte.';
                    throw new Error(message);
                }

                registerForm.reset();
                if (registerMessage) {
                    registerMessage.textContent = result.message || 'Compte créé avec succès !';
                    registerMessage.classList.remove('text-red-500');
                    registerMessage.classList.add('text-green-500');
                }
            } catch (error) {
                const message = error instanceof Error
                    ? `Erreur réseau ou serveur : ${error.message}`
                    : 'Erreur réseau ou serveur.';
                if (registerMessage) {
                    registerMessage.textContent = message;
                    registerMessage.classList.remove('text-green-500');
                    registerMessage.classList.add('text-red-500');
                }
            }
        });
    }

        // Gère la soumission du formulaire d'ajout de produit
        if (addProductForm) addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('product-name').value,
                quantity: parseInt(document.getElementById('product-quantity').value) || 0,
                phone: document.getElementById('product-phone').value,
                ph: parseFloat(document.getElementById('product-ph').value) || null,
                rain: parseFloat(document.getElementById('product-rain').value) || null,
                humidity: parseFloat(document.getElementById('product-humidity').value) || null,
                soil_humidity: parseFloat(document.getElementById('product-soil_humidity').value) || null,
                light: parseFloat(document.getElementById('product-light').value) || null,
                valve_open: document.getElementById('product-valve_open').checked ? 1 : 0,
                valve_angle: parseInt(document.getElementById('product-valve_angle').value) || 0
            };
            csrfFetch('/server/products.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(() => {
                displayProducts();
                addProductForm.reset();
            });
        });

        // Gère la déconnexion
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            csrfFetch('/server/auth.php?action=logout', { method: 'POST' })
                .then(() => { currentUser = null; checkAuth(); });
        });

        // Affiche la liste des produits de l'utilisateur
        const displayProducts = () => {
            if (!productList) return;
            csrfFetch('/server/products.php')
                .then(res => res.json())
                .then(products => {
                    productList.innerHTML = '';
                    if (Array.isArray(products) && products.length > 0) {
                        products.forEach(prod => {
                            const tr = document.createElement('tr');
                            const fields = ['name','quantity','ph','rain','humidity','soil_humidity','light'];
                            fields.forEach(f => {
                                const td = document.createElement('td');
                                td.className = 'px-2';
                                td.textContent = prod[f] ?? '';
                                tr.appendChild(td);
                            });

                            const valveTd = document.createElement('td');
                            valveTd.className = 'px-2';
                            const valveBtn = document.createElement('button');
                            valveBtn.className = 'button button--glass';
                            valveBtn.textContent = prod.valve_open == 1 ? 'Fermer' : 'Ouvrir';
                            valveBtn.addEventListener('click', () => {
                                csrfFetch(`/server/products.php?id=${prod.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ valve_open: prod.valve_open == 1 ? 0 : 1 })
                                }).then(displayProducts);
                            });
                            valveTd.appendChild(valveBtn);
                            tr.appendChild(valveTd);

                            const angleTd = document.createElement('td');
                            angleTd.className = 'px-2';
                            const angleInput = document.createElement('input');
                            angleInput.type = 'number';
                            angleInput.value = prod.valve_angle;
                            angleInput.className = 'form-input w-20';
                            angleInput.addEventListener('change', () => {
                                csrfFetch(`/server/products.php?id=${prod.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ valve_angle: parseInt(angleInput.value) || 0 })
                                }).then(displayProducts);
                            });
                            angleTd.appendChild(angleInput);
                            tr.appendChild(angleTd);

                            productList.appendChild(tr);
                        });
                    } else {
                        const tr = document.createElement('tr');
                        const td = document.createElement('td');
                        td.colSpan = 9;
                        td.textContent = 'Aucun produit ajouté.';
                        tr.appendChild(td);
                        productList.appendChild(tr);
                    }
                });
        };


    // --- LOGIQUE POUR LA PAGE 'PROFILE.HTML' ---
    if (document.getElementById('profile')) {
        const profileForm = document.getElementById('profile-form');
        const lastNameInput = document.getElementById('profile-last-name');
        const firstNameInput = document.getElementById('profile-first-name');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');
        const regionInput = document.getElementById('profile-region');
        const profileMessage = document.getElementById('profile-message');

        const loadProfile = () => {
            csrfFetch('/server/user.php')
                .then(res => {
                    if (!res.ok) throw new Error('Unauthorized');
                    return res.json();
                })
                .then(data => {
                    lastNameInput.value = data.last_name || '';
                    firstNameInput.value = data.first_name || '';
                    emailInput.value = data.email || '';
                    phoneInput.value = data.phone || '';
                    regionInput.value = data.region || '';
                })
                .catch(() => {
                    window.location.href = 'account.html';
                });
        };
        loadProfile();

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payload = {
                last_name: lastNameInput.value.trim(),
                first_name: firstNameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                region: regionInput.value.trim()
            };
            csrfFetch('/server/user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    profileMessage.textContent = 'Profil mis à jour';
                    profileMessage.classList.remove('text-red-500');
                    profileMessage.classList.add('text-green-500');
                } else {
                    profileMessage.textContent = data.message || 'Erreur lors de la mise à jour.';
                    profileMessage.classList.remove('text-green-500');
                    profileMessage.classList.add('text-red-500');
                }
            })
            .catch(() => {
                profileMessage.textContent = 'Erreur réseau.';
                profileMessage.classList.remove('text-green-500');
                profileMessage.classList.add('text-red-500');
            });
        });
    }

    // Gère la soumission du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            csrfFetch('/server/contact.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || (data.success ? 'Message envoyé avec succès!' : 'Une erreur est survenue.'));
                if (data.success) contactForm.reset();
            })
            .catch(() => {
                alert('Erreur réseau.');
            });
        });
    }
});

