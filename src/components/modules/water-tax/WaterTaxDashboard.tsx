import { getTranslations } from 'next-intl/server';

/**
 * Water Tax Module
 * Handles water bill management and payments
 */

/**
 * WaterTaxDashboard Component
 * Display water connection details and payment options
 */
const WaterTaxDashboard = async () => {
  const t = await getTranslations('modules');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{t('waterTax.title')}</h2>
      {/* Add your water tax dashboard implementation here */}
    </div>
  );
};

export default WaterTaxDashboard;
