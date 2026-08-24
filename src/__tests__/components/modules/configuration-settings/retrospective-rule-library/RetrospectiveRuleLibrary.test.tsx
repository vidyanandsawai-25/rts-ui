import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RetrospectiveRuleLibraryClient } from '@/components/modules/configuration-settings/retrospective-rule-library/RetrospectiveRuleLibraryClient';
import { INITIAL_RETROSPECTIVE_RULES, INITIAL_RETROSPECTIVE_STATS } from '@/lib/api/configuration-settings/retrospective-rule-library/retrospective-rule.service';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) => {
    const dict: Record<string, string> = {
      'title': 'Retrospective Rule Library',
      'subtitle': 'Review, compare and configure corporation-specific rules.',
      'exportJson': 'Export JSON',
      'corporations.all': 'All Corporations',
      'defaultDateRules.title': 'Default Date Rules',
      'defaultDateRules.subtitle': 'Define default occupancy date rules for cases where actual occupancy date is not available.',
      'defaultDateRules.defaultBadge': 'Default',
      'defaultDateRules.columns.priority': 'Priority',
      'defaultDateRules.columns.ruleName': 'Rule Name',
      'defaultDateRules.columns.appliesTo': 'Applies To',
      'defaultDateRules.columns.condition': 'Condition',
      'defaultDateRules.columns.defaultDateLogic': 'Default Date Logic',
      'defaultDateRules.columns.effectiveFrom': 'Effective From',
      'defaultDateRules.columns.status': 'Status',
      'defaultDateRules.columns.actions': 'Actions',
      'defaultDateRules.showing': `Showing ${values?.start || 1} to ${values?.end || 5} of ${values?.total || 5} rules`,
      'ruleLibrary.title': 'Corporation Rule Library',
      'ruleLibrary.subtitle': 'Select a rule to inspect its source wording or open it in the builder.',
      'ruleLibrary.createRule': 'Create Rule',
      'ruleLibrary.searchPlaceholder': 'Search rule, evidence or result...',
      'ruleLibrary.statuses.all': 'All statuses',
      'ruleLibrary.evidenceFilters.all': 'All evidence',
      'ruleLibrary.columns.rule': 'RULE',
      'ruleLibrary.columns.condition': 'CONDITION',
      'ruleLibrary.columns.startLogic': 'START LOGIC',
      'ruleLibrary.columns.commonTaxation': 'COMMON TAXATION',
      'ruleLibrary.columns.unauthorizedPenalty': 'UNAUTHORIZED PENALTY',
      'ruleLibrary.columns.status': 'STATUS',
      'ruleLibrary.columns.actions': 'ACTIONS',
      'ruleLibrary.buttons.view': 'View',
      'ruleLibrary.buttons.edit': 'Edit',
      'stats.importedRules': 'Imported rules',
      'stats.readyActive': 'Ready / active',
      'stats.needReview': 'Need review',
      'stats.lookbackGuardrail': 'Statutory look-back guardrail',
      'stats.years': 'yrs',
      'builder.title': 'Configure Retrospective Rule',
      'builder.subtitle': 'Set taxation, define evidence conditions, and choose the resulting action.',
      'builder.pills.taxation': 'Taxation',
      'builder.pills.conditions': 'Conditions',
      'builder.pills.actions': 'Actions',
      'builder.taxation.title': 'Taxation Rate & Percentage',
      'builder.conditions.badge': 'WHEN',
      'builder.conditions.availableEvidence': 'Available evidence',
      'builder.actions.badge': 'THEN',
      'builder.actions.retrospectiveTaxTitle': 'Retrospective Tax',
    };
    const fullKey = namespace ? `${namespace}.${key}`.replace('retrospectiveRuleLibrary.', '') : key;
    return dict[fullKey] || dict[key] || key;
  },
  useLocale: () => 'en',
}));

describe('RetrospectiveRuleLibrary Component', () => {
  it('renders the header, title, and subtitle correctly', () => {
    render(
      <RetrospectiveRuleLibraryClient
        initialRules={INITIAL_RETROSPECTIVE_RULES}
        initialStats={INITIAL_RETROSPECTIVE_STATS}
      />
    );

    expect(screen.getByText('Retrospective Rule Library')).toBeInTheDocument();
    expect(
      screen.getByText('Review, compare and configure corporation-specific rules.')
    ).toBeInTheDocument();
  });

  const mockRules = [
    {
      id: '1',
      ruleCode: 'FUR-01',
      ruleTitle: '6 Years From Today',
      conditionDescription: 'When actual occupancy date is Not Available',
      evidenceCategory: 'Authorized: OC or CC available' as const,
      startLogicTitle: 'Occupancy Date = Today - 6 Years',
      startLogicBoundary: '01/07/2021',
      commonTaxationBadge: 'Current-year for all years',
      commonTaxationDescription: 'Current-year percentage for all years',
      unauthorizedPenalty: 'Not applicable — OC/CC available',
      status: 'Active' as const,
    },
    {
      id: '2',
      ruleCode: 'FUR-02',
      ruleTitle: 'CC Date Minus 6 Months',
      conditionDescription: 'When occupancy date is not available but CC date is available',
      evidenceCategory: 'Authorized: OC or CC available' as const,
      startLogicTitle: 'Occupancy Date = CC Date - 6 Months',
      startLogicBoundary: '01/07/2021',
      commonTaxationBadge: 'Current-year for all years',
      commonTaxationDescription: 'Current-year percentage for all years',
      unauthorizedPenalty: 'Not applicable — OC/CC available',
      status: 'Active' as const,
    },
  ];

  it('renders default date rules table section correctly', () => {
    render(
      <RetrospectiveRuleLibraryClient
        initialRules={mockRules}
        initialStats={INITIAL_RETROSPECTIVE_STATS}
      />
    );

    expect(screen.getAllByText('Default Date Rules')[0]).toBeInTheDocument();
    expect(screen.getByText('6 Years From Today')).toBeInTheDocument();
    expect(screen.getByText('CC Date Minus 6 Months')).toBeInTheDocument();
  });

  it('opens Rule Builder screen when edit button in Default Date Rules table is clicked', async () => {
    render(
      <RetrospectiveRuleLibraryClient
        initialRules={mockRules}
        initialStats={INITIAL_RETROSPECTIVE_STATS}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Configure Retrospective Rule')).toBeInTheDocument();
    expect(screen.getByText('Taxation Rate & Percentage')).toBeInTheDocument();
  });

  it('opens Rule Builder screen when Create Rule button is clicked', () => {
    render(
      <RetrospectiveRuleLibraryClient
        initialRules={INITIAL_RETROSPECTIVE_RULES}
        initialStats={INITIAL_RETROSPECTIVE_STATS}
      />
    );

    const createBtns = screen.getAllByRole('button', { name: /create rule/i });
    fireEvent.click(createBtns[0]);

    expect(screen.getByText('Configure Retrospective Rule')).toBeInTheDocument();
    expect(screen.getByText('Taxation Rate & Percentage')).toBeInTheDocument();
    expect(screen.getByText('Available evidence')).toBeInTheDocument();
    expect(screen.getByText('Retrospective Tax')).toBeInTheDocument();
  });
});
