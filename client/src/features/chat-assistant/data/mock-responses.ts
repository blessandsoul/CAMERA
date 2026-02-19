import type { ChatCategory, MockResponse } from '../types';

export const TYPING_DELAY = { min: 700, max: 1500 };

export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: 'გამარჯობა! მე ვარ TechBrain ასისტენტი. დაგეხმარებით სათვალთვალო კამერისა და უსაფრთხოების სისტემის არჩევაში. რით შემიძლია დაგეხმარო?',
  timestamp: new Date(),
  showQuickActions: true,
};

export const MOCK_RESPONSES: Record<ChatCategory, MockResponse[]> = {
  cameras: [
    {
      patterns: ['კამერა', 'camera', 'ip', 'სათვალთვალო', 'bullet', 'dome', 'ptz', 'wifi', 'უკაბელო'],
      responses: [
        'გვაქვს IP, WiFi, PTZ და Dome კამერები. Uniview, Tiandy, Tenda — ყველა ბრენდი. რა ტიპის კამერა გჭირდებათ?',
        'სახლისთვის WiFi კამერა, ოფისისთვის IP Bullet, ტერიტორიისთვის PTZ — რომელი ვარიანტი გაინტერესებთ?',
      ],
      followUpActions: ['accessories', 'support'],
    },
    {
      patterns: ['სახლ', 'home', 'ბინა', 'apartment'],
      responses: [
        'სახლისთვის გირჩევთ WiFi კამერას ან 2-4 კამერიან NVR კომპლექტს. მარტივი მონტაჟი და ტელეფონიდან ყურება!',
      ],
      followUpActions: ['cameras', 'accessories'],
    },
    {
      patterns: ['ოფის', 'office', 'მაღაზია', 'shop', 'ბიზნეს', 'business'],
      responses: [
        'ბიზნესისთვის ვირჩევთ 4-16 კამერიან სისტემას NVR-ით. ჩვენ მონტაჟსაც ვაკეთებთ — 500+ კამერა დამონტაჟებული!',
      ],
      followUpActions: ['accessories', 'support'],
    },
  ],
  lenses: [
    {
      patterns: ['nvr', 'რეგისტრატორ', 'ჩამწერ', 'recorder', 'კომპლექტ', 'kit', 'სისტემა', 'system'],
      responses: [
        'NVR კომპლექტები 4-16 არხიანი, კამერებით კომპლექტში. ფასები 400₾-დან. კატალოგში ნახეთ!',
        'სისტემის არჩევისთვის გჭირდებათ: კამერების რაოდენობა + NVR + HDD. დაგეხმარებით გათვლაში!',
      ],
      followUpActions: ['cameras', 'accessories'],
    },
  ],
  accessories: [
    {
      patterns: ['hdd', 'მეხსიერება', 'memory', 'sd', 'storage', 'დისკი'],
      responses: [
        'HDD დისკები 1TB-დან 8TB-მდე. გირჩევთ WD Purple — სპეციალურად ვიდეო-თვალთვალისთვის!',
      ],
      followUpActions: ['cameras', 'support'],
    },
    {
      patterns: ['კაბელ', 'cable', 'poe', 'switch', 'როუტერ', 'router', 'აქსესუარ', 'accessor'],
      responses: [
        'PoE სვიჩები, UTP კაბელები, სამონტაჟო მასალა — ყველაფერი ერთ ადგილას. რა გჭირდებათ?',
      ],
      followUpActions: ['cameras', 'support'],
    },
    {
      patterns: ['მონტაჟ', 'install', 'დამონტაჟ', 'setup'],
      responses: [
        'პროფესიონალური მონტაჟი მთელ საქართველოში! 500+ კამერა დამონტაჟებული. დარეკეთ 597470518.',
      ],
      followUpActions: ['cameras', 'support'],
    },
  ],
  support: [
    {
      patterns: ['ფასი', 'price', 'ღირება', 'cost', 'რამდენი'],
      responses: [
        'კამერების ფასები 79₾-დან. კატალოგში ფილტრებით ნახეთ ან დარეკეთ 597470518!',
        'ფასი დამოკიდებულია მოდელსა და კომპლექტაციაზე. NVR კომპლექტები 400₾-დან.',
      ],
      followUpActions: ['cameras', 'accessories'],
    },
    {
      patterns: ['მიწოდება', 'delivery', 'გარანტია', 'warranty', 'დაბრუნება', 'return'],
      responses: [
        'მიწოდება 1-3 დღეში თბილისში. 2 წლიანი გარანტია ყველა პროდუქტზე!',
      ],
      followUpActions: ['support'],
    },
    {
      patterns: ['დახმარება', 'help', 'კითხვა', 'question', 'problem', 'ტელეფონ', 'phone', 'რეკვა', 'call'],
      responses: [
        'დარეკეთ: 597470518 ან მოგვწერეთ WhatsApp-ზე. მენეჯერი სწრაფად გიპასუხებთ!',
      ],
      followUpActions: ['cameras', 'accessories'],
    },
  ],
  general: [
    {
      patterns: ['გამარჯობა', 'hello', 'hi', 'hey', 'სალამი'],
      responses: [
        'გამარჯობა! რით დაგეხმაროთ? კამერის არჩევა, მონტაჟი, ფასები — ვარ აქ!',
        'სალამი! TechBrain ასისტენტი ვარ. რა გაინტერესებთ?',
      ],
      followUpActions: ['cameras', 'accessories', 'support'],
    },
    {
      patterns: ['გმადლობ', 'thanks', 'thank you', 'მადლობა'],
      responses: [
        'გთხოვთ! უსაფრთხო ყოფნა!',
        'ნებისმიერ დროს! რაიმე სხვა კითხვა?',
      ],
    },
    {
      patterns: ['ვინ ხარ', 'who are you', 'bot', 'ბოტი'],
      responses: [
        'მე ვარ TechBrain ვირტუალური ასისტენტი — ვეხმარები სათვალთვალო კამერისა და უსაფრთხოების სისტემის არჩევაში!',
      ],
    },
  ],
};

export const DEFAULT_RESPONSE = {
  responses: [
    'საინტერესოა! ჩვენი მენეჯერი უფრო დეტალურად დაგეხმარება. დარეკეთ 597470518!',
    'სცადეთ: "კამერა", "NVR", "მონტაჟი" ან "ფასი".',
    'ამ კითხვაზე მენეჯერი გიპასუხებს! WhatsApp: 597470518.',
  ],
  followUpActions: ['cameras', 'support', 'accessories'],
};
