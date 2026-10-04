import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  PageSetupToolbar,
  FormattingToolbar,
  DesignerSidebar,
  DesignerStage,
  PropertiesPanel,
  DesignerStatusBar,
  DesignerDropdowns,
} from '@/components/modules/property-tax/report-designer';

describe('Modular Report Designer Folder Structure', () => {
  it('renders PageSetupToolbar with critical actions', () => {
    const { container } = render(<PageSetupToolbar />);
    expect(container.querySelector('#btnCreateNewReport')).toBeTruthy();
    expect(container.querySelector('#btnImportReportSource')).toBeTruthy();
    expect(container.querySelector('#selReportId')).toBeTruthy();
    expect(container.querySelector('#selPaperSize')).toBeTruthy();
    expect(container.querySelector('#selZoom')).toBeTruthy();
    expect(container.querySelector('#btnSave')).toBeTruthy();
    expect(container.querySelector('#btnPublish')).toBeTruthy();
  });

  it('renders FormattingToolbar with typography and alignment controls', () => {
    const { container } = render(<FormattingToolbar />);
    expect(container.querySelector('#btnUndo')).toBeTruthy();
    expect(container.querySelector('#btnRedo')).toBeTruthy();
    expect(container.querySelector('#btnCopy')).toBeTruthy();
    expect(container.querySelector('#btnDelete')).toBeTruthy();
    expect(container.querySelector('#fmtFontFamily')).toBeTruthy();
    expect(container.querySelector('#fmtFontSize')).toBeTruthy();
    expect(container.querySelector('#fmtBold')).toBeTruthy();
    expect(container.querySelector('#fmtItalic')).toBeTruthy();
    expect(container.querySelector('#fmtUnderline')).toBeTruthy();
  });

  it('renders DesignerSidebar with fields, toolbox, and sections tabs', () => {
    const { container } = render(<DesignerSidebar />);
    expect(container.querySelector('#tabContentFields')).toBeTruthy();
    expect(container.querySelector('#fieldSearchInput')).toBeTruthy();
    expect(container.querySelector('#treeDataFields')).toBeTruthy();
    expect(container.querySelector('#tabContentToolbox')).toBeTruthy();
    expect(container.querySelector('#tabContentSections')).toBeTruthy();
  });

  it('renders DesignerStage with horizontal ruler and paper sheet', () => {
    const { container } = render(<DesignerStage />);
    expect(container.querySelector('#rulerViewport')).toBeTruthy();
    expect(container.querySelector('#canvasScrollArea')).toBeTruthy();
    expect(container.querySelector('#designerStage')).toBeTruthy();
    expect(container.querySelector('#sectionGutter')).toBeTruthy();
    expect(container.querySelector('#reportCanvas')).toBeTruthy();
  });

  it('renders PropertiesPanel and DesignerStatusBar', () => {
    const { container: propContainer } = render(<PropertiesPanel />);
    expect(propContainer.querySelector('#sidebarRight')).toBeTruthy();
    expect(propContainer.querySelector('#propertiesContainer')).toBeTruthy();

    const { container: statusContainer } = render(<DesignerStatusBar />);
    expect(statusContainer.querySelector('#statusSelection')).toBeTruthy();
    expect(statusContainer.querySelector('#statusPaperDimensions')).toBeTruthy();
    expect(statusContainer.querySelector('#statusLastSave')).toBeTruthy();
  });

  it('renders DesignerDropdowns for tables, shapes, and watermark', () => {
    const { container } = render(<DesignerDropdowns />);
    expect(container.querySelector('#tableDropdown')).toBeTruthy();
    expect(container.querySelector('#shapesDropdown')).toBeTruthy();
    expect(container.querySelector('#watermarkDropdown')).toBeTruthy();
    expect(container.querySelector('#pageColorDropdown')).toBeTruthy();
    expect(container.querySelector('#crToast')).toBeTruthy();
  });
});
