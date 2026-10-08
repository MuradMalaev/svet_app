// Константы приложения (перенесены из исходного Flutter-приложения)

export const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const HIJRI_MONTHS = ['Мухаррам', 'Сафар', 'Рабиу-ль-авваль', 'Рабиу-с-сани', 'Джумада-ль-уля', 'Джумада-с-сания', 'Раджаб', 'Шабан', 'Рамадан', 'Шавваль', 'Зу-ль-када', 'Зу-ль-хиджджа'];

// Начало каждого из 30 джузов: [сура, аят] (сверено с alquran.cloud/v1/meta)
export const JUZ_START = [
  [1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41],
  [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
  [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1],
];

// Порядок сур по традиционной хронологии ниспослания
export const CHRONO = [
  96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108, 102, 107, 109, 105, 113,
  114, 112, 53, 80, 97, 91, 85, 95, 106, 101, 75, 104, 77, 50, 90, 86, 54, 38, 7, 72,
  36, 25, 35, 19, 20, 56, 26, 27, 28, 17, 10, 11, 12, 15, 6, 37, 31, 34, 39, 40,
  41, 42, 43, 44, 45, 46, 51, 88, 18, 16, 71, 14, 21, 23, 32, 52, 67, 69, 70, 78,
  79, 82, 84, 30, 29, 83, 2, 8, 3, 33, 60, 4, 99, 57, 47, 13, 55, 76, 65, 98,
  59, 24, 22, 63, 58, 49, 66, 64, 61, 62, 48, 5, 9, 110,
];

export const RECITERS = [
  { id: 'alafasy', ru: 'Мишари Рашид', dir: 'Alafasy_128kbps' },
  { id: 'shatri', ru: 'Абу Бакр аш-Шатри', dir: 'Abu_Bakr_Ash-Shaatree_128kbps' },
  { id: 'dussary', ru: 'Ясир ад-Даусари', dir: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'husary', ru: 'Махмуд аль-Хусари', dir: 'Husary_128kbps' },
  { id: 'sowaid', ru: 'Айман Сувейд (Таджвид)', dir: 'Ayman_Sowaid_64kbps' },
];

export const PRAYER_METHODS = [
  { id: 'mwl', ru: 'Muslim World League', fajr: 18, isha: 17, ishaMin: 0 },
  { id: 'isna', ru: 'ISNA (Северная Америка)', fajr: 15, isha: 15, ishaMin: 0 },
  { id: 'egypt', ru: 'Египетская всеобщая инстанция', fajr: 19.5, isha: 17.5, ishaMin: 0 },
  { id: 'karachi', ru: 'Университет Карачи', fajr: 18, isha: 18, ishaMin: 0 },
  { id: 'makkah', ru: 'Умм аль-Кура (Мекка)', fajr: 18.5, isha: 0, ishaMin: 90 },
];

// [название, широта, долгота, часовой пояс IANA]
export const CITIES = [
  ['Москва', 55.7558, 37.6173, 'Europe/Moscow'], ['Санкт-Петербург', 59.9343, 30.3351, 'Europe/Moscow'],
  ['Казань', 55.7961, 49.1064, 'Europe/Moscow'], ['Краснодар', 45.0355, 38.9753, 'Europe/Moscow'],
  ['Грозный', 43.318, 45.6949, 'Europe/Moscow'], ['Махачкала', 42.9849, 47.5047, 'Europe/Moscow'],
  ['Нальчик', 43.4981, 43.6189, 'Europe/Moscow'], ['Уфа', 54.7388, 55.9721, 'Asia/Yekaterinburg'],
  ['Екатеринбург', 56.8389, 60.6057, 'Asia/Yekaterinburg'], ['Новосибирск', 55.0084, 82.9357, 'Asia/Novosibirsk'],
  ['Минск', 53.9006, 27.5590, 'Europe/Minsk'], ['Баку', 40.4093, 49.8671, 'Asia/Baku'],
  ['Ташкент', 41.2995, 69.2401, 'Asia/Tashkent'], ['Алматы', 43.222, 76.8512, 'Asia/Almaty'],
  ['Стамбул', 41.0082, 28.9784, 'Europe/Istanbul'], ['Каир', 30.0444, 31.2357, 'Africa/Cairo'],
  ['Мекка', 21.4225, 39.8262, 'Asia/Riyadh'], ['Медина', 24.5247, 39.5692, 'Asia/Riyadh'],
  ['Дубай', 25.2048, 55.2708, 'Asia/Dubai'], ['Берлин', 52.52, 13.405, 'Europe/Berlin'],
  ['Лондон', 51.5074, -0.1278, 'Europe/London'], ['Нью-Йорк', 40.7128, -74.006, 'America/New_York'],
];

export const KAABA = { lat: 21.4225, lon: 39.8262 };

export const PRAYER_EVENTS = [
  { key: 'fajr', ru: 'Фаджр' }, { key: 'sunrise', ru: 'Восход' }, { key: 'dhuhr', ru: 'Зухр' },
  { key: 'asr', ru: 'Аср' }, { key: 'maghrib', ru: 'Магриб' }, { key: 'isha', ru: 'Иша' },
];
export const OBLIGATORY = PRAYER_EVENTS.filter((e) => e.key !== 'sunrise');

// Таджвид: 8 категорий — как в справочнике пользователя. Коды правил — из Tajweed Guide Al Quran Cloud.
export const TAJWEED_CLASS = {
  h: 'tj-silent', s: 'tj-silent', l: 'tj-silent',
  n: 'tj-madd2', p: 'tj-madd246', m: 'tj-madd6', o: 'tj-madd45',
  q: 'tj-qalqala',
  g: 'tj-ghunna', f: 'tj-ghunna', c: 'tj-ghunna', i: 'tj-ghunna', a: 'tj-ghunna', w: 'tj-ghunna',
};
export const TAJWEED_LEGEND = [
  ['tj-madd6', 'Мадд: 6'],
  ['tj-madd45', 'Мадд: 4 или 5'],
  ['tj-madd246', 'Мадд: 2, 4 или 6'],
  ['tj-madd2', 'Мадд: 2'],
  ['tj-ghunna', 'Гунна (носовой звук)'],
  ['tj-qalqala', 'Калькаля'],
  ['tj-tafkhim', 'Тафхим'],
  ['tj-silent', 'Тихий'],
];

export const QUOTES = [
  'Каждый намаз — это шаг ближе к Аллаху',
  'Постоянство в малом лучше нерегулярности в большом',
  'Каждая прочитанная буква Корана — награда',
  'Поминание Аллаха успокаивает сердца',
  'Маленький шаг сегодня — привычка на всю жизнь',
];

export const TOTAL_PAGES = 604;
export const SRS_INTERVALS = [1, 3, 7, 30];
export const HADITH_TAGS = ['Все', 'Вера', 'Нрав', 'Молитва', 'Пост', 'Покаяние', 'Сделки', 'Семья', 'Очищение сердца'];
export const HADITH_BOOKS = [
  { id: 'bukhari', ru: 'Сахих аль-Бухари' },
  { id: 'ajurri', ru: '40 хадисов аль-Аджурри' },
];
export const AZKAR_CATS = [
  { id: 'morning', ru: 'Утренние' },
  { id: 'evening', ru: 'Вечерние' },
  { id: 'after_prayer', ru: 'После намаза' },
];
