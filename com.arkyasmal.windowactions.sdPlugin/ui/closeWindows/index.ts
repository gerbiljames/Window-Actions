import {
  listenToEvents,
  WindowIdTypeClass,
  WindowIdUITypeClass,
  WindowSelectedTextValueClass,
  WindowDropdownOptionsClass,
  windowDropdownElId,
  windowTextInputElId,
  windowIdUITypeId,
} from '../utils';
const streamDeckClient = SDPIComponents.streamDeckClient;
/**
 * Configure window inputs for window dropdown
 */
export const WindowDropdownOptions = new WindowDropdownOptionsClass({
  streamDeckClient: streamDeckClient,
  dropdownElId: windowDropdownElId,
});
export const WindowSelectedTextValue = new WindowSelectedTextValueClass({
  streamDeckClient: streamDeckClient,
});

/**
 * Configure window inputs for window type inputs
 */
export const WindowIdType = new WindowIdTypeClass({
  streamDeckClient: streamDeckClient,
});
export const WindowIdUIType = new WindowIdUITypeClass({
  streamDeckClient: streamDeckClient,
  dropdownElId: windowDropdownElId,
  textElId: windowTextInputElId,
  idUITypeElId: windowIdUITypeId,
});

/**
 * Subscribe to changes in window type
 */
WindowIdType.subscribeOnChange(
  WindowDropdownOptions.changeOptionsByWinIdType.bind(WindowDropdownOptions)
);
WindowIdType.subscribeOnChange(
  WindowIdUIType.detectWindowTypeChange.bind(WindowIdUIType)
);
/**
 * Recieve events from plugin
 */
const config = {
  WindowDropdownOptions: WindowDropdownOptions,
  WindowIdType: WindowIdType,
  WindowSelectedTextValue: WindowSelectedTextValue,
};
streamDeckClient.sendToPropertyInspector.subscribe(listenToEvents(config));
/**
 * Run initalization code when the DOM loads
 */
document.addEventListener('DOMContentLoaded', function () {
  //initalize options stored inside
  WindowDropdownOptions.replaceOptions();
  WindowIdUIType.changeUIByType();
});
