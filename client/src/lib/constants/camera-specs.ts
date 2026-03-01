export interface PredefinedSpecOption {
  value: string;
}

export interface PredefinedSpec {
  id: string;
  keyKa: string;
  keyRu: string;
  keyEn: string;
  type: 'multiselect' | 'text';
  options?: PredefinedSpecOption[];
}

export const CAMERA_SPECS: PredefinedSpec[] = [
  {
    id: 'body_type',
    keyKa: 'კორპუსის ტიპი',
    keyRu: 'Тип корпуса',
    keyEn: 'Body type',
    type: 'multiselect',
    options: [
      { value: 'პლასმასი' },
      { value: 'მეტალი' },
      { value: 'პლასმასი / მეტალი' },
    ],
  },
  {
    id: 'camera_type',
    keyKa: 'კამერის ტიპი',
    keyRu: 'Тип камеры',
    keyEn: 'Camera type',
    type: 'multiselect',
    options: [
      { value: 'PT' },
      { value: 'PTZ' },
      { value: 'Bullet' },
      { value: 'Dome' },
    ],
  },
  {
    id: 'lens',
    keyKa: 'ლინზა',
    keyRu: 'Объектив',
    keyEn: 'Lens',
    type: 'multiselect',
    options: [
      { value: '2.8MM' },
      { value: '3.6MM' },
      { value: '4.0MM' },
      { value: '2.8-12MM' },
      { value: '4.7-94MM' },
    ],
  },
  {
    id: 'protection_class',
    keyKa: 'დაცვის კლასი',
    keyRu: 'Класс защиты',
    keyEn: 'Protection class',
    type: 'multiselect',
    options: [
      { value: 'IP20' },
      { value: 'IP44' },
      { value: 'IP65' },
      { value: 'IP66' },
      { value: 'IP67' },
      { value: 'IP68' },
    ],
  },
  {
    id: 'video_compression',
    keyKa: 'ვიდეო შეკუმშვის ფორმატი',
    keyRu: 'Формат сжатия видео',
    keyEn: 'Video compression',
    type: 'multiselect',
    options: [
      { value: 'H264' },
      { value: 'H265' },
      { value: 'H265+' },
    ],
  },
  {
    id: 'storage',
    keyKa: 'მეხსიერება',
    keyRu: 'Память',
    keyEn: 'Storage',
    type: 'multiselect',
    options: [
      { value: 'Cloud' },
      { value: 'Cloud & MicroSD UP TO 64GB' },
      { value: 'Cloud & MicroSD UP TO 128GB' },
      { value: 'Cloud & MicroSD UP TO 256GB' },
      { value: 'Cloud & MicroSD UP TO 512GB' },
    ],
  },
  {
    id: 'viewing_angle',
    keyKa: 'ხედვის კუთხე',
    keyRu: 'Угол обзора',
    keyEn: 'Viewing angle',
    type: 'text',
  },
  {
    id: 'microphone',
    keyKa: 'მიკროფონი',
    keyRu: 'Микрофон',
    keyEn: 'Microphone',
    type: 'multiselect',
    options: [
      { value: 'კი' },
      { value: 'არა' },
    ],
  },
  {
    id: 'speaker',
    keyKa: 'სპიკერი',
    keyRu: 'Динамик',
    keyEn: 'Speaker',
    type: 'multiselect',
    options: [
      { value: 'კი' },
      { value: 'არა' },
    ],
  },
  {
    id: 'connectivity',
    keyKa: 'დაკავშირება',
    keyRu: 'Подключение',
    keyEn: 'Connectivity',
    type: 'multiselect',
    options: [
      { value: 'WIFI 2.4Ghz' },
      { value: 'WIFI 5.0Ghz' },
      { value: 'WIFI 2.4Ghz / LAN პორტი' },
      { value: 'WIFI 5.0Ghz / LAN პორტი' },
      { value: 'WIFI 2.4Ghz / 5Ghz / LAN პორტი' },
      { value: 'LAN პორტი' },
    ],
  },
  {
    id: 'poe',
    keyKa: 'PoE კავშირი',
    keyRu: 'PoE',
    keyEn: 'PoE',
    type: 'multiselect',
    options: [
      { value: 'კი' },
      { value: 'არა' },
    ],
  },
  {
    id: 'app',
    keyKa: 'აპლიკაცია',
    keyRu: 'Приложение',
    keyEn: 'App',
    type: 'multiselect',
    options: [
      { value: 'Icsee' },
      { value: 'Icsee PRO' },
      { value: 'Xmeye' },
      { value: 'Xmeye PRO' },
      { value: 'V380' },
      { value: 'V380 PRO' },
      { value: 'Tuya / Smartlife' },
      { value: 'IPC360' },
      { value: 'O-KAM PRO' },
      { value: 'EseeCloud' },
      { value: 'Yoosee' },
      { value: 'Cam720' },
      { value: 'CamHi' },
      { value: 'CamHipro' },
      { value: 'Wallpixel' },
      { value: 'Bitvision' },
    ],
  },
  {
    id: 'perimeter',
    keyKa: 'პერიმეტრი',
    keyRu: 'Периметр',
    keyEn: 'Perimeter',
    type: 'multiselect',
    options: [
      { value: 'გარე' },
      { value: 'შიდა' },
    ],
  },
  {
    id: 'megapixels',
    keyKa: 'მეგაპიქსელი',
    keyRu: 'Мегапиксели',
    keyEn: 'Megapixels',
    type: 'multiselect',
    options: [
      { value: '2MP' },
      { value: '3MP' },
      { value: '4MP' },
      { value: '5MP' },
      { value: '6MP' },
      { value: '8MP' },
      { value: '2+2MP' },
      { value: '3+3MP' },
      { value: '4+4MP' },
      { value: '5+5MP' },
    ],
  },
  {
    id: 'video_resolution',
    keyKa: 'ვიდეოს რეზოლუცია',
    keyRu: 'Разрешение видео',
    keyEn: 'Video resolution',
    type: 'multiselect',
    options: [
      { value: 'HD - 1280 × 720' },
      { value: 'FHD - 1920 × 1080' },
      { value: '2K - 2560 × 1440' },
      { value: '3K - 3072 × 1728' },
      { value: '4K - 3840 × 2160' },
    ],
  },
  {
    id: 'night_vision',
    keyKa: 'ღამის ხედვა',
    keyRu: 'Ночное видение',
    keyEn: 'Night vision',
    type: 'multiselect',
    options: [
      { value: 'ინფრაწითელი' },
      { value: 'ფერადი' },
      { value: 'ინფრაწითელი / ფერადი' },
    ],
  },
];

export function findPredefinedSpecByKaKey(kaKey: string): PredefinedSpec | undefined {
  return CAMERA_SPECS.find((s) => s.keyKa === kaKey);
}

export const PREDEFINED_KA_KEYS = new Set(CAMERA_SPECS.map((s) => s.keyKa));
