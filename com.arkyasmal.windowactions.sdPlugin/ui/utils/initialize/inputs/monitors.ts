import {
  AvailableMonitorPayload,
  MonitorType,
  SUB_ACTION_TYPE,
} from '@/types/index';
import { createOption, removeAllOptions } from '../../dropdown';

type MonitorDropdownClassProps = {
  streamDeckClient: typeof SDPIComponents.streamDeckClient;
  dropdownElId: string;
};
type MonitorValue = {
  monitor_name: string;
  monitor_idx: number;
};
export class MonitorDropdownOptionsClass {
  private client: typeof SDPIComponents.streamDeckClient;
  private dropdownElId: string;
  public availableMonitors: MonitorType[] = [];
  public options: HTMLOptionElement[] = [];
  public value: MonitorValue | null = null; // value of the monitor
  constructor(props: MonitorDropdownClassProps) {
    if (!props.streamDeckClient) throw Error('No streamdeck client attached');
    this.client = props.streamDeckClient;
    this.dropdownElId = props.dropdownElId;
    this.fetchAvailableMonitors();
    this.client.getSettings().then((settings) => {
      const potentialValue =
        settings?.settings?.monitor_settings?.monitor_idx ||
        (settings.settings?.value?.newMonitor as number | null) ||
        0;
      const monitorName =
        settings?.settings?.monitor_settings?.monitor_name ||
        `Generic PnP Monitor`;
      if (typeof potentialValue === 'number')
        this.value = {
          monitor_idx: potentialValue || 0,
          monitor_name: monitorName,
        };
      else this.setMonitorValue(null);
    });
  }
  public onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.value) return;
    const monitorIdx = parseInt(target.value) || 0;
    if (monitorIdx >= this.availableMonitors.length - 1) return;
    const currMonitor = this.availableMonitors.find(
      (monitor) => monitor.idx === monitorIdx
    );
    if (!currMonitor) return this.setMonitorValue(null);
    this.setMonitorValue({
      monitor_name: currMonitor.name,
      monitor_idx: currMonitor.idx,
    });
  };
  private async setMonitorValue(value: MonitorValue | null) {
    if (!this.client) throw Error('No streamdeck client attached');
    this.value = value;
    const settings = await this.client.getSettings();
    const newSettings = {
      ...(settings?.settings ?? {}),
      monitor_settings: {
        ...(settings?.settings?.monitor_settings ?? {}),
      },
    };
    this.client.setSettings(newSettings);
  }
  /**
   * @param e - Any event from a handler
   * @description - SENDS a websocket event to the streamdeck plugin
   * to initiate a fetch of available monitors. This function is meant
   * to be attached to an event handler like `onload`, or whenever
   * initalization of monitors is required
   */
  public fetchAvailableMonitors = async (e?: Event) => {
    await this.client.send('sendToPlugin', {
      action: SUB_ACTION_TYPE.CURRENT_MONITORS,
    });
  };
  /**
   * The following functions are mean to handle RECIEVING a websocket
   * event from the streamdeck plugin, and make changes accordingly
   */
  public recieveAvailableMonitorsEvent = async (
    res: AvailableMonitorPayload
  ) => {
    const { settings } = await this.client.getSettings();
    const result = res?.result?.monitors;
    const currValue =
      settings?.monitor_settings?.monitor_idx ||
      (settings?.value?.newMonitor as number | null) ||
      0;
    //only populate if new options exist
    if (!result) return;
    //populate new options data
    this.availableMonitors = result;
    this.options = result.map((monitor) => {
      const value = monitor.idx;
      const text = `${monitor.name} (Monitor ${monitor.idx})`;
      return createOption(value, text);
    });
    //select curr value
    this.options.forEach((val) => {
      const isValue = val.value === currValue.toString();
      if (isValue) val.defaultSelected = true;
    });
    this.replaceOptions(this.options);
  };
  /**
   * add options to dropdown
   */
  public replaceOptions = (options?: HTMLOptionElement[]) => {
    options = options || this.options;
    const selectDropdown = document.getElementById(
      this.dropdownElId
    ) as HTMLSelectElement;
    //this means it hasn't loaded into the dom yet
    if (!selectDropdown) return;
    //replace old nodes, with new nodes
    removeAllOptions(selectDropdown);
    selectDropdown.append(...options);
  };
}
