import { pickLocalized } from '@/i18n/config';

export function localizeActivity(activity, locale) {
  if (!activity) return activity;
  return {
    ...activity,
    title: pickLocalized({ locale, en: activity.title, zh: activity.titleZh }),
    description: pickLocalized({ locale, en: activity.description, zh: activity.descriptionZh }),
    summary: pickLocalized({ locale, en: activity.summary, zh: activity.summaryZh })
  };
}

export function localizeActivities(list = [], locale) {
  return list.map(a => localizeActivity(a, locale));
}

export function localizedField(obj, baseKey = 'en', locale) {
  const zhKey = baseKey + 'Zh';
  return pickLocalized({
    locale,
    en: obj?.[baseKey],
    zh: obj?.[zhKey]
  });
}