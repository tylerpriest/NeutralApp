import { DashboardWidget, DashboardLayout } from '../../../shared';

export interface IDashboardManager {
  registerWidget(widget: DashboardWidget): void;
  unregisterWidget(widgetId: string): void;
  getActiveWidgets(): DashboardWidget[];
  updateLayout(layout: DashboardLayout): Promise<boolean>;
  showWelcomeScreen(): boolean;
  calculateOptimalLayout(widgets: DashboardWidget[]): DashboardLayout;
  handleWidgetError(widgetId: string, error: Error): boolean;
  getWidgetsByPlugin(pluginId: string): DashboardWidget[];
  exportLayout(): DashboardLayout;
  importLayout(layout: DashboardLayout): Promise<boolean>;
  resetToDefault(): Promise<void>;
  handlePluginUninstall(pluginId: string): void;
  refreshLayout(): Promise<void>;
} 