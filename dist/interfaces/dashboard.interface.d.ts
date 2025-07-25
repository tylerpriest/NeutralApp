import { DashboardWidget, DashboardLayout } from '../types';
export interface IDashboardManager {
    registerWidget(widget: DashboardWidget): void;
    unregisterWidget(widgetId: string): void;
    getActiveWidgets(): DashboardWidget[];
    updateLayout(layout: DashboardLayout): Promise<void>;
    showWelcomeScreen(): void;
}
//# sourceMappingURL=dashboard.interface.d.ts.map