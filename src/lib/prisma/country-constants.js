import { Country } from '@prisma/client';

export const COUNTRY_ENUM = Country;
export const COUNTRY_VALUES = Object.freeze(Object.values(Country));

const COUNTRY_LABEL_OVERRIDES = Object.freeze({
  Cote_dIvoire: "Cote d'Ivoire",
  Czech_Republic: 'Czech Republic',
  Democratic_Republic_of_the_Congo: 'Democratic Republic of the Congo',
  Sao_Tome_and_Principe: 'Sao Tome and Principe',
  Timor_Leste: 'Timor-Leste',
});

const formatCountryLabel = (name) => {
  if (COUNTRY_LABEL_OVERRIDES[name]) return COUNTRY_LABEL_OVERRIDES[name];
  return name.replace(/_/g, ' ');
};

export const COUNTRY_OPTIONS = COUNTRY_VALUES.map((name) => ({
  value: name,
  label: formatCountryLabel(name),
}));

export function isValidCountry(value) {
  if (value === null) return true;
  if (typeof value !== 'string' || value.length === 0) return false;
  return COUNTRY_VALUES.includes(value);
}
