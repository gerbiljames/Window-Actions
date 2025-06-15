import { WindowDropdownOptionsClass } from '../inputs/windowIdValue';
import {
  MonitorDropdownOptionsClass,
  WindowIdTypeClass,
  WindowSelectedTextValueClass,
} from '../inputs';
import { PIEventRecievedEvent, SUB_ACTION_TYPE } from '@/types/index';
/**
 * @description The config objects that takes in all
 * inputs/classes that listen to events from the plugin
 */
type ListenToEventConfig = {
  WindowDropdownOptions: WindowDropdownOptionsClass;
  WindowIdType: WindowIdTypeClass;
  WindowSelectedTextValue: WindowSelectedTextValueClass;
  MonitorDropdownOptions?: MonitorDropdownOptionsClass;
};

export const listenToEvents =
  (config: ListenToEventConfig) => (event?: PIEventRecievedEvent | null) => {
    const { WindowDropdownOptions, MonitorDropdownOptions } = config;
    if (!event) return;
    const { payload } = event;
    const { action } = payload;
    switch (action) {
      case SUB_ACTION_TYPE.ACTIVE_WINDOWS:
        WindowDropdownOptions.recieveActiveWindowsEvent(payload);
        break;
      case SUB_ACTION_TYPE.CURRENT_MONITORS:
        if (MonitorDropdownOptions)
          MonitorDropdownOptions.recieveAvailableMonitorsEvent(payload);
        break;
      default:
        return;
    }
  };
