import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <SegmentedControl
      value={i18n.resolvedLanguage}
      onChange={(lng) => {
        return i18n.changeLanguage(lng);
      }}
      data={[
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
      ]}
    />
  );
}
