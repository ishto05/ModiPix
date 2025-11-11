import { Platform, RiskCategory, ImprovementTip, ModerationData } from './types';

export const platforms: Platform[] = [
  {
    name: 'Instagram',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaaFtYUUTwkoXTUtbbc7ED_0S8Y2FE7b8NE62kkPCKEvYmA4Ve2LmxTaf4p0ka3UriJvjPAMRpir0GefzdqBKU7jKv6amyXISC-pa4O_e76gbzXSDI21PtA3XDU2bashxxS2maeMyTFDk1_eltNHsAU-l7hrlfo5oFKm4VgJlQDy70bNUvU_mn4stX-9czqTT21ozmxb-S2IZC_K9Az5nSO4xSRA2XaQk0pC9id4X8Eol3E4BY61lzWOUnMlxlD15bkLEBWrg9JHM',
    emoji: '❌',
    status: 'Unsafe',
    statusColor: 'text-red-600',
    score: '0.92',
    description: 'Violates Community Guidelines on nudity.'
  },
  {
    name: 'TikTok',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALylMu5ozrLHPEY5rQgMZt8xTI_gObI2lCQ1WnywTX_s6kaVt80sHrqXJKEyvl3Qvp3xTQ1y1CuHUSjr3wm-lq8Tg0-0L547eIt95cXZJWYvU2l0wfdwIeNWmVoxwhcP-aCgcOeZGnVMwJZe2an37iCvfmVVpuBu1vMxI6pGiDWLXCCWT7DusTW9ZMJd5qHORmHYRrzI-r36Ge-J7NBU4j8SuhwGlRinp7mD1XuJcNkObwqu4dUq75AiTq6OfMVZh8njL8wb2S8RU',
    emoji: '⚠️',
    status: 'Risk',
    statusColor: 'text-yellow-600',
    score: '0.75',
    description: 'Potentially sensitive content, may be shadow-banned.'
  },
  {
    name: 'YouTube',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZYlmFfl3KglXcva58Fikz215oeZOX2shPZylsq3yREWhJTyDdTxu1bYT87PrRJDL7LOzQ6xXLnLaKp90n_Qt7VEsdyPs_TTIpS6XpMMJde_szzvsLCtotA7fIUHVX23-Ns61t1VolaB0e6TTbIERU6OQ5Ryo2FRGMh_VsAtEoKasvBx1f3V7NLQy1341rWk0-9ZaxkYRE7EbKmi3tlUOynCMyp5zRZGj4wPq20nNfcHLxQZ23sQ66mw798G89abw-8p-YzINoCY0',
    emoji: '✅',
    status: 'Safe',
    statusColor: 'text-green-600',
    score: '0.30',
    description: 'Content is acceptable under current policies.'
  },
  {
    name: 'Twitter/X',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1erxJiVuJ0sbBg5Bm1S5-CTZhz8EmKIeFSaR13nFjdIQXZ6JG-PJm4rCU-ZYfE2fm8nrOuoKDNEvRcpzpgBC_WsK2DQMQEucw5XDzq-fcmXAAkG9n5Rm-2cv2FsZfw-p73hi5YLDrfpByf7xQcY0jAhXfB9jc8sjaEfPJu6VxL8txk05pFSM_kkuTYx0QPb0KNFcqj5uwH1ZbN_ln255QStOetAbNItVua4I0_7lJ0UiElu5QF7UeoTiTdFMKpD48FZPvb5zkEmg',
    emoji: '✅',
    status: 'Safe',
    statusColor: 'text-green-600',
    score: '0.21',
    description: 'Permitted, but may be marked as sensitive media.'
  }
];

export const riskCategories: RiskCategory[] = [
  { label: 'Hate', height: '80%' },
  { label: 'Violence', height: '60%' },
  { label: 'Nudity', height: '90%' },
  { label: 'Spam', height: '40%' }
];

export const improvementTips: ImprovementTip[] = [
  {
    icon: 'lightbulb',
    title: 'Fine-tune Nudity Filters',
    description: 'The \'Nudity\' category shows a high-risk score. Adjust your filters to be more sensitive to this category to reduce false negatives.'
  },
  {
    icon: 'visibility',
    title: 'Review Flagged Images',
    description: 'Regularly review images flagged under \'Hate\' and \'Violence\' to identify common patterns and improve model accuracy with new training data.'
  }
];

export const moderationData: ModerationData = {
  imageId: 'img_1a2b3c4d5e',
  timestamp: '2024-05-15T10:30:00Z',
  riskScore: 0.85,
  riskLevel: 'High',
  categories: {
    hate: 0.80,
    violence: 0.60,
    nudity: 0.90,
    spam: 0.40
  }
};
