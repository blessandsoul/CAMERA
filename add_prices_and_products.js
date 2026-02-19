#!/usr/bin/env node
// Add realistic prices to cameras and create more products for all categories
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'client/public/data/products');

// ─── 1. PRICE CAMERA FILES ──────────────────────────────────────────────────
// Price logic: base by brand × resolution multiplier, then rounded to clean number
const BRAND_BASE = {
  'Dahua':     { '2 მპ': 89,  '4 მპ': 119, '5 მპ': 139, '8 მპ': 189, default: 99  },
  'Hikvision': { '2 მპ': 99,  '4 მპ': 129, '5 მპ': 149, '8 მპ': 199, default: 109 },
  'HiWatch':   { '2 მპ': 79,  '4 მპ': 109, '5 მპ': 129, '8 მპ': 169, default: 89  },
  'Uniview':   { '2 მპ': 85,  '4 მპ': 115, '5 მპ': 135, '8 მპ': 175, default: 95  },
  'Tiandy':    { '2 მპ': 75,  '4 მპ': 105, '5 მპ': 125, '8 მპ': 165, default: 85  },
  'Tenda':     { '2 მპ': 69,  '4 მპ': 99,  '5 მპ': 119, '8 მპ': 159, default: 79  },
  'Ezviz':     { '2 მპ': 79,  '4 მპ': 109, '5 მპ': 129, '8 მპ': 169, default: 89  },
};

// Small random variation ±5-15 GEL, rounded to nearest 9
function priceFor(brand, res) {
  const table = BRAND_BASE[brand] || { default: 99 };
  const base = table[res] || table['default'];
  const jitter = Math.floor(Math.random() * 4) * 5 - 10; // -10, -5, 0, or +5
  const raw = base + jitter;
  // Round to nearest 9 ending (e.g. 89, 99, 109, 119...)
  return Math.round((raw - 9) / 10) * 10 + 9;
}

const camFiles = fs.readdirSync(DIR).filter(f => f.startsWith('camera-'));
camFiles.forEach(f => {
  const fpath = path.join(DIR, f);
  const p = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  const brand = (p.specs.find(s => s.key.ka === 'ბრენდი') || {}).value || '';
  const res   = (p.specs.find(s => s.key.ka === 'რეზოლუცია') || {}).value || '';
  p.price = priceFor(brand, res);
  fs.writeFileSync(fpath, JSON.stringify(p, null, 2), 'utf8');
});
console.log(`Priced ${camFiles.length} camera files`);

// ─── 2. MORE NVR KIT PRODUCTS ────────────────────────────────────────────────
const nvrProducts = [
  {
    id: 'nvr-002',
    slug: '4ch-nvr-4mp-kit',
    category: 'nvr-kits',
    price: 299,
    isFeatured: true,
    images: ['b50db9b7-3c9e-4da0-996c-172a2774fdc5.jpg'],
    name: { ka: '4 არხიანი NVR 4MP კომპლექტი', ru: 'Комплект NVR 4CH 4MP', en: '4CH NVR 4MP Kit' },
    description: {
      ka: '4 კამერის კომპლექტი NVR-ით, 1TB HDD, IP დაკავშირება.',
      ru: 'Комплект из 4 камер с NVR, 1TB HDD, IP подключение.',
      en: '4-camera kit with NVR, 1TB HDD, IP connectivity.',
    },
    specs: [
      { key: { ka: 'არხები', ru: 'Каналы', en: 'Channels' }, value: '4CH' },
      { key: { ka: 'გარჩევადობა', ru: 'Разрешение', en: 'Resolution' }, value: '4MP' },
      { key: { ka: 'HDD', ru: 'HDD', en: 'HDD' }, value: '1TB' },
      { key: { ka: 'კავშირი', ru: 'Подключение', en: 'Connectivity' }, value: 'IP' },
    ],
  },
  {
    id: 'nvr-003',
    slug: '16ch-nvr-4mp-kit',
    category: 'nvr-kits',
    price: 749,
    isFeatured: false,
    images: ['8a68aea7-2acf-4f03-ad6b-b3d50b6828c0.jpg'],
    name: { ka: '16 არხიანი NVR 4MP კომპლექტი', ru: 'Комплект NVR 16CH 4MP', en: '16CH NVR 4MP Kit' },
    description: {
      ka: '16 კამერის კომპლექტი NVR-ით, 4TB HDD, PoE კავშირი.',
      ru: 'Комплект из 16 камер с NVR, 4TB HDD, PoE подключение.',
      en: '16-camera kit with NVR, 4TB HDD, PoE connectivity.',
    },
    specs: [
      { key: { ka: 'არხები', ru: 'Каналы', en: 'Channels' }, value: '16CH' },
      { key: { ka: 'გარჩევადობა', ru: 'Разрешение', en: 'Resolution' }, value: '4MP' },
      { key: { ka: 'HDD', ru: 'HDD', en: 'HDD' }, value: '4TB' },
      { key: { ka: 'კავშირი', ru: 'Подключение', en: 'Connectivity' }, value: 'PoE + IP' },
    ],
  },
  {
    id: 'nvr-004',
    slug: '8ch-nvr-8mp-4k-kit',
    category: 'nvr-kits',
    price: 899,
    isFeatured: true,
    images: ['eac16318-c98a-481f-9e34-384ac6d69ee1.jpg'],
    name: { ka: '8 არხიანი NVR 4K კომპლექტი', ru: 'Комплект NVR 8CH 4K', en: '8CH NVR 4K Kit' },
    description: {
      ka: '8 კამერის 4K კომპლექტი NVR-ით, 2TB HDD, PoE.',
      ru: '4K комплект из 8 камер с NVR, 2TB HDD, PoE.',
      en: '4K 8-camera kit with NVR, 2TB HDD, PoE.',
    },
    specs: [
      { key: { ka: 'არხები', ru: 'Каналы', en: 'Channels' }, value: '8CH' },
      { key: { ka: 'გარჩევადობა', ru: 'Разрешение', en: 'Resolution' }, value: '8MP / 4K' },
      { key: { ka: 'HDD', ru: 'HDD', en: 'HDD' }, value: '2TB' },
      { key: { ka: 'კავშირი', ru: 'Подключение', en: 'Connectivity' }, value: 'PoE' },
    ],
  },
  {
    id: 'nvr-005',
    slug: '4ch-dvr-analog-kit',
    category: 'nvr-kits',
    price: 219,
    isFeatured: false,
    images: ['b50db9b7-3c9e-4da0-996c-172a2774fdc5.jpg'],
    name: { ka: '4 არხიანი DVR ანალოგური კომპლექტი', ru: 'Аналоговый комплект DVR 4CH', en: '4CH DVR Analog Kit' },
    description: {
      ka: '4 ანალოგური კამერის კომპლექტი DVR-ით, 500GB HDD.',
      ru: 'Аналоговый комплект из 4 камер с DVR, 500GB HDD.',
      en: '4-camera analog kit with DVR, 500GB HDD.',
    },
    specs: [
      { key: { ka: 'არხები', ru: 'Каналы', en: 'Channels' }, value: '4CH' },
      { key: { ka: 'ტიპი', ru: 'Тип', en: 'Type' }, value: 'DVR Analog' },
      { key: { ka: 'HDD', ru: 'HDD', en: 'HDD' }, value: '500GB' },
    ],
  },
  {
    id: 'nvr-006',
    slug: '8ch-poe-nvr-standalone',
    category: 'nvr-kits',
    price: 349,
    isFeatured: false,
    images: ['8a68aea7-2acf-4f03-ad6b-b3d50b6828c0.jpg'],
    name: { ka: '8 არხიანი PoE NVR რეგისტრატორი', ru: 'PoE NVR регистратор 8CH', en: '8CH PoE NVR Recorder' },
    description: {
      ka: 'NVR ვიდეო რეგისტრატორი 8 PoE პორტით, H.265+, max 8TB.',
      ru: 'NVR видеорегистратор с 8 PoE портами, H.265+, max 8TB.',
      en: 'NVR recorder with 8 PoE ports, H.265+, max 8TB.',
    },
    specs: [
      { key: { ka: 'არხები', ru: 'Каналы', en: 'Channels' }, value: '8CH' },
      { key: { ka: 'PoE', ru: 'PoE', en: 'PoE' }, value: '8 ports' },
      { key: { ka: 'კოდეკი', ru: 'Кодек', en: 'Codec' }, value: 'H.265+' },
      { key: { ka: 'max HDD', ru: 'max HDD', en: 'max HDD' }, value: '8TB' },
    ],
  },
];

// ─── 3. MORE STORAGE PRODUCTS ────────────────────────────────────────────────
const storageProducts = [
  {
    id: 'hdd-002',
    slug: 'surveillance-hdd-2tb',
    category: 'storage',
    price: 109,
    isFeatured: false,
    images: ['a7da6607-2d13-4282-bc42-51033c748f0e.jpg'],
    name: { ka: '2TB სათვალთვალო HDD', ru: '2TB HDD для видеонаблюдения', en: '2TB Surveillance HDD' },
    description: {
      ka: 'სპეციალური HDD ვიდეო სათვალთვალო სისტემებისთვის. 24/7 მუშაობა.',
      ru: 'HDD для систем видеонаблюдения. Работа 24/7.',
      en: 'Dedicated HDD for video surveillance. 24/7 operation.',
    },
    specs: [
      { key: { ka: 'მოცულობა', ru: 'Ёмкость', en: 'Capacity' }, value: '2TB' },
      { key: { ka: 'ინტერფეისი', ru: 'Интерфейс', en: 'Interface' }, value: 'SATA 6Gb/s' },
      { key: { ka: 'მუშაობა', ru: 'Работа', en: 'Operation' }, value: '24/7' },
      { key: { ka: 'RPM', ru: 'RPM', en: 'RPM' }, value: '5400' },
    ],
  },
  {
    id: 'hdd-003',
    slug: 'surveillance-hdd-6tb',
    category: 'storage',
    price: 239,
    isFeatured: false,
    images: ['9b1629dd-4098-448e-8988-ed036c52d25a.jpg'],
    name: { ka: '6TB სათვალთვალო HDD', ru: '6TB HDD для видеонаблюдения', en: '6TB Surveillance HDD' },
    description: {
      ka: '6TB სათვალთვალო HDD 24/7 მუშაობისთვის, მაღალი საიმედოობა.',
      ru: '6TB HDD для видеонаблюдения 24/7, высокая надёжность.',
      en: '6TB surveillance HDD for 24/7 operation, high reliability.',
    },
    specs: [
      { key: { ka: 'მოცულობა', ru: 'Ёмкость', en: 'Capacity' }, value: '6TB' },
      { key: { ka: 'ინტერფეისი', ru: 'Интерфейс', en: 'Interface' }, value: 'SATA 6Gb/s' },
      { key: { ka: 'მუშაობა', ru: 'Работа', en: 'Operation' }, value: '24/7' },
      { key: { ka: 'RPM', ru: 'RPM', en: 'RPM' }, value: '7200' },
    ],
  },
  {
    id: 'hdd-004',
    slug: 'surveillance-hdd-8tb',
    category: 'storage',
    price: 329,
    isFeatured: false,
    images: ['a7da6607-2d13-4282-bc42-51033c748f0e.jpg'],
    name: { ka: '8TB სათვალთვალო HDD', ru: '8TB HDD для видеонаблюдения', en: '8TB Surveillance HDD' },
    description: {
      ka: '8TB სათვალთვალო HDD მაქსიმალური ჩაწერის ხანგრძლივობისთვის.',
      ru: '8TB HDD для максимального времени записи.',
      en: '8TB surveillance HDD for maximum recording duration.',
    },
    specs: [
      { key: { ka: 'მოცულობა', ru: 'Ёмкость', en: 'Capacity' }, value: '8TB' },
      { key: { ka: 'ინტერფეისი', ru: 'Интерфейс', en: 'Interface' }, value: 'SATA 6Gb/s' },
      { key: { ka: 'მუშაობა', ru: 'Работа', en: 'Operation' }, value: '24/7' },
      { key: { ka: 'RPM', ru: 'RPM', en: 'RPM' }, value: '7200' },
    ],
  },
  {
    id: 'hdd-005',
    slug: 'surveillance-hdd-1tb',
    category: 'storage',
    price: 79,
    isFeatured: false,
    images: ['9b1629dd-4098-448e-8988-ed036c52d25a.jpg'],
    name: { ka: '1TB სათვალთვალო HDD', ru: '1TB HDD для видеонаблюдения', en: '1TB Surveillance HDD' },
    description: {
      ka: '1TB სათვალთვალო HDD საბაზო სისტემებისთვის.',
      ru: '1TB HDD для начальных систем видеонаблюдения.',
      en: '1TB surveillance HDD for entry-level systems.',
    },
    specs: [
      { key: { ka: 'მოცულობა', ru: 'Ёмкость', en: 'Capacity' }, value: '1TB' },
      { key: { ka: 'ინტერფეისი', ru: 'Интерфейс', en: 'Interface' }, value: 'SATA 6Gb/s' },
      { key: { ka: 'მუშაობა', ru: 'Работа', en: 'Operation' }, value: '24/7' },
      { key: { ka: 'RPM', ru: 'RPM', en: 'RPM' }, value: '5400' },
    ],
  },
];

// ─── 4. MORE SERVICES ────────────────────────────────────────────────────────
const serviceProducts = [
  {
    id: 'service-002',
    slug: 'nvr-dvr-setup-service',
    category: 'services',
    price: 0,
    isFeatured: false,
    images: [],
    name: { ka: 'NVR/DVR კონფიგურაცია', ru: 'Настройка NVR/DVR', en: 'NVR/DVR Configuration' },
    description: {
      ka: 'NVR ან DVR ჩამწერის კონფიგურაცია, ჩაწერის, მოძრაობის სენსორისა და ქსელური წვდომის დაყენება.',
      ru: 'Настройка NVR или DVR регистратора, записи, датчика движения и сетевого доступа.',
      en: 'NVR or DVR recorder configuration, recording, motion detection and remote access setup.',
    },
    specs: [
      { key: { ka: 'გარანტია', ru: 'Гарантия', en: 'Warranty' }, value: '6 months' },
    ],
  },
  {
    id: 'service-003',
    slug: 'cable-installation-service',
    category: 'services',
    price: 0,
    isFeatured: false,
    images: [],
    name: { ka: 'კაბელის გაყვანა', ru: 'Прокладка кабеля', en: 'Cable Installation' },
    description: {
      ka: 'UTP/COAX კაბელის ჩამალული ან ღია გაყვანა. ფასი მეტრაჟის მიხედვით.',
      ru: 'Скрытая или открытая прокладка UTP/COAX кабеля. Цена по метражу.',
      en: 'Concealed or open UTP/COAX cable routing. Price per meter.',
    },
    specs: [],
  },
  {
    id: 'service-004',
    slug: 'remote-access-setup-service',
    category: 'services',
    price: 0,
    isFeatured: false,
    images: [],
    name: { ka: 'დისტანციური წვდომის დაყენება', ru: 'Настройка удалённого доступа', en: 'Remote Access Setup' },
    description: {
      ka: 'სმარტფონიდან კამერებზე წვდომის კონფიგურაცია — P2P, DDNS, ან VPN.',
      ru: 'Настройка доступа к камерам со смартфона — P2P, DDNS или VPN.',
      en: 'Mobile phone access to cameras — P2P, DDNS, or VPN setup.',
    },
    specs: [],
  },
  {
    id: 'service-005',
    slug: 'maintenance-service',
    category: 'services',
    price: 0,
    isFeatured: false,
    images: [],
    name: { ka: 'სისტემის ტექნიკური მომსახურება', ru: 'Техническое обслуживание системы', en: 'System Maintenance' },
    description: {
      ka: 'პერიოდული ტექნიკური შემოწმება, კამერების გაწმენდა, პროგრამული განახლება.',
      ru: 'Периодическая диагностика, очистка камер, обновление ПО.',
      en: 'Periodic diagnostics, camera cleaning, firmware updates.',
    },
    specs: [],
  },
];

// ─── 5. ACCESSORIES CATEGORY ─────────────────────────────────────────────────
const accessoryProducts = [
  {
    id: 'acc-001',
    slug: 'poe-switch-8port',
    category: 'accessories',
    price: 89,
    isFeatured: false,
    images: ['33dc5b1d-cf5d-45d7-9624-a4ab889d38e1.jpg'],
    name: { ka: '8 პორტიანი PoE Switch', ru: 'PoE коммутатор 8 портов', en: '8-Port PoE Switch' },
    description: {
      ka: '8 პორტიანი PoE კომუტატორი IP კამერებისთვის, 48V, max 120W.',
      ru: '8-портовый PoE коммутатор для IP камер, 48V, max 120W.',
      en: '8-port PoE switch for IP cameras, 48V, max 120W.',
    },
    specs: [
      { key: { ka: 'პორტები', ru: 'Порты', en: 'Ports' }, value: '8' },
      { key: { ka: 'ძაბვა', ru: 'Напряжение', en: 'Voltage' }, value: '48V' },
      { key: { ka: 'სიმძლავრე', ru: 'Мощность', en: 'Power' }, value: '120W' },
    ],
  },
  {
    id: 'acc-002',
    slug: 'poe-switch-4port',
    category: 'accessories',
    price: 49,
    isFeatured: false,
    images: ['33dc5b1d-cf5d-45d7-9624-a4ab889d38e1.jpg'],
    name: { ka: '4 პორტიანი PoE Switch', ru: 'PoE коммутатор 4 порта', en: '4-Port PoE Switch' },
    description: {
      ka: '4 პორტიანი PoE კომუტატორი IP კამერებისთვის, 48V, max 60W.',
      ru: '4-портовый PoE коммутатор для IP камер, 48V, max 60W.',
      en: '4-port PoE switch for IP cameras, 48V, max 60W.',
    },
    specs: [
      { key: { ka: 'პორტები', ru: 'Порты', en: 'Ports' }, value: '4' },
      { key: { ka: 'ძაბვა', ru: 'Напряжение', en: 'Voltage' }, value: '48V' },
      { key: { ka: 'სიმძლავრე', ru: 'Мощность', en: 'Power' }, value: '60W' },
    ],
  },
  {
    id: 'acc-003',
    slug: 'utp-cable-305m',
    category: 'accessories',
    price: 69,
    isFeatured: false,
    images: ['4b8215c3-4dc0-4f79-87db-4aa50bc43aff.jpg'],
    name: { ka: 'UTP კაბელი Cat5e 305მ (ბობინა)', ru: 'UTP кабель Cat5e 305м (бухта)', en: 'UTP Cable Cat5e 305m (Roll)' },
    description: {
      ka: 'UTP Cat5e კაბელი 305მ, შეიფერებული, IP კამერებისთვის.',
      ru: 'UTP Cat5e кабель 305м, экранированный, для IP камер.',
      en: 'UTP Cat5e cable 305m roll for IP cameras.',
    },
    specs: [
      { key: { ka: 'ტიპი', ru: 'Тип', en: 'Type' }, value: 'UTP Cat5e' },
      { key: { ka: 'სიგრძე', ru: 'Длина', en: 'Length' }, value: '305m' },
    ],
  },
  {
    id: 'acc-004',
    slug: 'camera-mount-bracket',
    category: 'accessories',
    price: 12,
    isFeatured: false,
    images: ['bf1e3d48-75e1-4bd1-8f3d-5510097868f0.jpg'],
    name: { ka: 'კამერის საკიდი კრონშტეინი', ru: 'Кронштейн для камеры', en: 'Camera Mounting Bracket' },
    description: {
      ka: 'უნივერსალური კამერის კრონშტეინი, ლითონი, კედლისა და ჭერის მონტაჟისთვის.',
      ru: 'Универсальный кронштейн для камеры, металл, настенный и потолочный монтаж.',
      en: 'Universal camera bracket, metal, for wall and ceiling mounting.',
    },
    specs: [
      { key: { ka: 'მასალა', ru: 'Материал', en: 'Material' }, value: 'Metal' },
      { key: { ka: 'მონტაჟი', ru: 'Монтаж', en: 'Mount' }, value: 'Wall / Ceiling' },
    ],
  },
  {
    id: 'acc-005',
    slug: 'rj45-connectors-100pack',
    category: 'accessories',
    price: 8,
    isFeatured: false,
    images: ['f449409c-085d-47aa-89db-6e0e31b17fb7.jpg'],
    name: { ka: 'RJ45 კონექტორი 100 ცალი', ru: 'Разъёмы RJ45 100 штук', en: 'RJ45 Connectors 100pcs' },
    description: {
      ka: 'RJ45 კონექტორები Cat5e/Cat6 კაბელებისთვის, 100 ცალი პაკეტი.',
      ru: 'Разъёмы RJ45 для Cat5e/Cat6 кабелей, упаковка 100 штук.',
      en: 'RJ45 connectors for Cat5e/Cat6 cables, pack of 100.',
    },
    specs: [
      { key: { ka: 'სტანდარტი', ru: 'Стандарт', en: 'Standard' }, value: 'Cat5e/Cat6' },
      { key: { ka: 'რაოდენობა', ru: 'Количество', en: 'Quantity' }, value: '100 pcs' },
    ],
  },
  {
    id: 'acc-006',
    slug: 'power-adapter-12v2a',
    category: 'accessories',
    price: 15,
    isFeatured: false,
    images: ['17cacbf4-9c6e-4720-8ef1-a93c09945c46.jpg'],
    name: { ka: '12V 2A კამერის ბლოკი', ru: 'Блок питания 12V 2A для камеры', en: '12V 2A Camera Power Adapter' },
    description: {
      ka: '12V 2A სტაბილიზირებული კვების ბლოკი ანალოგური კამერებისთვის.',
      ru: '12V 2A стабилизированный блок питания для аналоговых камер.',
      en: '12V 2A stabilized power adapter for analog cameras.',
    },
    specs: [
      { key: { ka: 'ძაბვა', ru: 'Напряжение', en: 'Voltage' }, value: '12V DC' },
      { key: { ka: 'დენი', ru: 'Ток', en: 'Current' }, value: '2A' },
    ],
  },
  {
    id: 'acc-007',
    slug: 'ups-backup-power',
    category: 'accessories',
    price: 129,
    isFeatured: false,
    images: ['7fab6ec9-9ebd-438a-ac47-188638f8565c.jpg'],
    name: { ka: 'UPS უწყვეტი კვების წყარო 1000VA', ru: 'ИБП источник питания 1000VA', en: 'UPS 1000VA Backup Power' },
    description: {
      ka: 'UPS 1000VA სათვალთვალო სისტემებისთვის, ავტომატური გადართვა, 12V ბატარეა.',
      ru: 'ИБП 1000VA для систем видеонаблюдения, автопереключение, аккумулятор 12V.',
      en: 'UPS 1000VA for surveillance systems, auto-switching, 12V battery.',
    },
    specs: [
      { key: { ka: 'სიმძლავრე', ru: 'Мощность', en: 'Power' }, value: '1000VA / 600W' },
      { key: { ka: 'ბატარეა', ru: 'Батарея', en: 'Battery' }, value: '12V 7Ah' },
    ],
  },
  {
    id: 'acc-008',
    slug: 'coax-cable-100m',
    category: 'accessories',
    price: 39,
    isFeatured: false,
    images: ['4b8215c3-4dc0-4f79-87db-4aa50bc43aff.jpg'],
    name: { ka: 'Coax კაბელი RG59 100მ', ru: 'Коаксиальный кабель RG59 100м', en: 'Coax Cable RG59 100m' },
    description: {
      ka: 'RG59 კოაქსიალური კაბელი ანალოგური კამერებისთვის, 100მ.',
      ru: 'Коаксиальный кабель RG59 для аналоговых камер, 100м.',
      en: 'RG59 coaxial cable for analog cameras, 100m.',
    },
    specs: [
      { key: { ka: 'ტიპი', ru: 'Тип', en: 'Type' }, value: 'RG59 Coax' },
      { key: { ka: 'სიგრძე', ru: 'Длина', en: 'Length' }, value: '100m' },
    ],
  },
];

// ─── WRITE ALL ────────────────────────────────────────────────────────────────
const baseProduct = {
  currency: 'GEL',
  isActive: true,
  createdAt: new Date('2026-02-15T00:00:00Z').toISOString(),
};

const allNew = [...nvrProducts, ...storageProducts, ...serviceProducts, ...accessoryProducts];

allNew.forEach((p, i) => {
  const product = {
    ...baseProduct,
    ...p,
    createdAt: new Date(Date.now() - (100 + i) * 3600000).toISOString(),
  };
  const fpath = path.join(DIR, `${p.id}.json`);
  fs.writeFileSync(fpath, JSON.stringify(product, null, 2), 'utf8');
});

console.log(`Written ${allNew.length} new product files`);
console.log('  NVR kits: ' + nvrProducts.length);
console.log('  Storage:  ' + storageProducts.length);
console.log('  Services: ' + serviceProducts.length);
console.log('  Accessories: ' + accessoryProducts.length);
console.log('Done!');
