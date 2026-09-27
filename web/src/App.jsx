// App shell: sidebar (computer), the current screen, bottom bars, tab bar (phone/tablet),
// plus the capture flow and sheets that open on top.
import { AppController } from './state/AppController.js';
import { Sidebar } from './layout/Sidebar.jsx';
import { TabBar } from './layout/TabBar.jsx';
import { HomeScreen } from './screens/home/HomeScreen.jsx';
import { ReportsScreen } from './screens/reports/ReportsScreen.jsx';
import { TasksScreen } from './screens/tasks/TasksScreen.jsx';
import { AlertsScreen } from './screens/alerts/AlertsScreen.jsx';
import { ReportDetailScreen } from './screens/report-detail/ReportDetailScreen.jsx';
import { DetailActionBar } from './screens/report-detail/DetailActionBar.jsx';
import { AddDetailsScreen } from './screens/add-details/AddDetailsScreen.jsx';
import { SaveDetailsBar } from './screens/add-details/SaveDetailsBar.jsx';
import { ReportSentScreen } from './screens/report-sent/ReportSentScreen.jsx';
import { TeamScreen } from './screens/team/TeamScreen.jsx';
import { CaptureFlow } from './screens/capture/CaptureFlow.jsx';
import { SheetHost } from './sheets/SheetHost.jsx';
import { AuthScreen, LoadingScreen, LoadErrorScreen, NotConfiguredScreen, TurnedOffScreen } from './screens/auth/AuthScreen.jsx';
import { Toast } from './components/Toast.jsx';
import { InstallPrompt } from './components/InstallPrompt.jsx';

export class App extends AppController {
  render() {
    const v = this.viewModel();
    const is = v.is;
    const km = v.lang === 'km' ? ' km' : '';
    // Not signed in yet (or still loading): show the matching full-page screen.
    const gate = !this.isConfigured() ? <NotConfiguredScreen v={v} />
      : !this.state.session ? <AuthScreen v={v} app={this} />
      : this.state.loadError ? <LoadErrorScreen v={v} app={this} />
      : this.state.booting ? <LoadingScreen v={v} />
      : v.turnedOff ? <TurnedOffScreen v={v} app={this} /> : null;
    if (gate) return <div className={'app' + km}>{gate}<Toast v={v} /><InstallPrompt t={v.t} /></div>;
    return (
      <div className={'app' + km}>
        <Sidebar v={v} />
        <main className="main">
          <div className="scroll" ref={v.scrollRef}>
            {is.home ? <HomeScreen v={v} /> : null}
            {is.list ? <ReportsScreen v={v} /> : null}
            {is.tasks ? <TasksScreen v={v} /> : null}
            {is.alerts ? <AlertsScreen v={v} /> : null}
            {is.detail ? <ReportDetailScreen v={v} /> : null}
            {is.details ? <AddDetailsScreen v={v} /> : null}
            {is.done ? <ReportSentScreen v={v} /> : null}
            {is.team ? <TeamScreen v={v} /> : null}
          </div>
          <DetailActionBar v={v} />
          {is.details ? <SaveDetailsBar v={v} /> : null}
          {v.showTabs ? <TabBar v={v} /> : null}
        </main>
        {is.capture ? <CaptureFlow v={v} /> : null}
        <SheetHost v={v} />
        <Toast v={v} />
        {/* not over screens that have their own bottom action bar */}
        {!is.capture && !is.detail && !is.details && !v.sheet.show ?<InstallPrompt t={v.t} aboveTabs={v.showTabs} /> : null}
      </div>
    );
  }
}
