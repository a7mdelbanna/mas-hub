/**
 * Form Component Specifications
 * Form input and control components for MAS Business OS
 */

import { ComponentSpec } from './layout.spec';

/**
 * Input Component Specification
 */
export const InputSpec: ComponentSpec = {
  name: 'Input',
  description: 'Text input field with various types and states',
  variants: {
    default: {
      height: '40px',
      padding: '0 var(--spacing-3)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-primary)',
      fontSize: 'var(--text-base)',
    },
    filled: {
      background: 'var(--color-bg-secondary)',
      borderBottom: '2px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
    },
    outlined: {
      background: 'transparent',
      border: '2px solid var(--color-border-strong)',
    },
    underlined: {
      background: 'transparent',
      border: 'none',
      borderBottom: '1px solid var(--color-border-default)',
      borderRadius: '0',
    },
  },
  props: {
    type: {
      type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'",
      default: 'text',
      description: 'Input type',
    },
    value: {
      type: 'string | number',
      required: false,
      description: 'Input value',
    },
    placeholder: {
      type: 'string',
      required: false,
      description: 'Placeholder text',
    },
    label: {
      type: 'string',
      required: false,
      description: 'Input label',
    },
    error: {
      type: 'string | boolean',
      required: false,
      description: 'Error message or state',
    },
    helperText: {
      type: 'string',
      required: false,
      description: 'Helper text below input',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disabled state',
    },
    required: {
      type: 'boolean',
      default: false,
      description: 'Required field',
    },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      description: 'Input size',
    },
    prefix: {
      type: 'ReactNode',
      required: false,
      description: 'Prefix content',
    },
    suffix: {
      type: 'ReactNode',
      required: false,
      description: 'Suffix content',
    },
  },
  accessibility: {
    ariaLabel: 'dynamic',
    ariaDescribedBy: 'helper/error text',
    ariaInvalid: 'on error',
    ariaRequired: 'when required',
    minTouchTarget: '44px',
    keyboardType: 'appropriate',
    autocomplete: 'appropriate',
  },
  responsive: {
    mobile: {
      fullWidth: true,
      largerTouchTarget: true,
      nativeKeyboard: true,
    },
    tablet: {
      standardWidth: true,
    },
    desktop: {
      standardWidth: true,
      hoverEffects: true,
    },
  },
  rtl: {
    mirrored: true,
    textDirection: 'rtl',
    prefixPosition: 'end',
    suffixPosition: 'start',
  },
};

/**
 * Select Component Specification
 */
export const SelectSpec: ComponentSpec = {
  name: 'Select',
  description: 'Dropdown selection component',
  variants: {
    default: {
      minHeight: '40px',
      padding: '0 var(--spacing-3)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-primary)',
    },
    multiple: {
      minHeight: '80px',
      chipDisplay: true,
    },
    searchable: {
      showSearch: true,
      filterOptions: true,
    },
    grouped: {
      groupedOptions: true,
      groupHeaders: true,
    },
  },
  props: {
    options: {
      type: 'SelectOption[]',
      required: true,
      description: 'Select options',
    },
    value: {
      type: 'string | string[]',
      required: false,
      description: 'Selected value(s)',
    },
    onChange: {
      type: '(value: string | string[]) => void',
      required: true,
      description: 'Change handler',
    },
    multiple: {
      type: 'boolean',
      default: false,
      description: 'Allow multiple selection',
    },
    searchable: {
      type: 'boolean',
      default: false,
      description: 'Enable search',
    },
    placeholder: {
      type: 'string',
      default: 'Select...',
      description: 'Placeholder text',
    },
    label: {
      type: 'string',
      required: false,
      description: 'Select label',
    },
    error: {
      type: 'string | boolean',
      required: false,
      description: 'Error state',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disabled state',
    },
    loading: {
      type: 'boolean',
      default: false,
      description: 'Loading state',
    },
  },
  accessibility: {
    role: 'combobox',
    ariaExpanded: 'dynamic',
    ariaHasPopup: 'listbox',
    ariaControls: 'listbox id',
    keyboardNavigation: 'arrow keys + enter',
    screenReaderAnnouncements: true,
  },
  responsive: {
    mobile: {
      nativeSelect: 'optional',
      fullScreenDropdown: true,
      bottomSheet: true,
    },
    tablet: {
      customDropdown: true,
      maxDropdownHeight: '300px',
    },
    desktop: {
      customDropdown: true,
      maxDropdownHeight: '400px',
      virtualScroll: true,
    },
  },
  rtl: {
    mirrored: true,
    dropdownAlignment: 'end',
    chevronPosition: 'start',
  },
};

/**
 * DatePicker Component Specification
 */
export const DatePickerSpec: ComponentSpec = {
  name: 'DatePicker',
  description: 'Date and time selection component',
  variants: {
    default: {
      format: 'MM/DD/YYYY',
      calendarType: 'gregorian',
    },
    range: {
      selectRange: true,
      showRangeHighlight: true,
    },
    time: {
      showTime: true,
      timeFormat: '12h',
    },
    inline: {
      inline: true,
      alwaysOpen: true,
    },
  },
  props: {
    value: {
      type: 'Date | Date[] | null',
      required: false,
      description: 'Selected date(s)',
    },
    onChange: {
      type: '(date: Date | Date[] | null) => void',
      required: true,
      description: 'Date change handler',
    },
    format: {
      type: 'string',
      default: 'MM/DD/YYYY',
      description: 'Date format',
    },
    locale: {
      type: 'string',
      default: 'en',
      description: 'Locale for formatting',
    },
    minDate: {
      type: 'Date',
      required: false,
      description: 'Minimum selectable date',
    },
    maxDate: {
      type: 'Date',
      required: false,
      description: 'Maximum selectable date',
    },
    disabledDates: {
      type: 'Date[] | (date: Date) => boolean',
      required: false,
      description: 'Disabled dates',
    },
    showTime: {
      type: 'boolean',
      default: false,
      description: 'Show time picker',
    },
    range: {
      type: 'boolean',
      default: false,
      description: 'Select date range',
    },
  },
  accessibility: {
    ariaLabel: 'Date picker',
    keyboardNavigation: 'full calendar navigation',
    screenReaderAnnouncements: true,
    focusTrap: true,
    escapeKey: 'close',
  },
  responsive: {
    mobile: {
      nativePicker: 'optional',
      fullScreenCalendar: true,
      touchGestures: true,
    },
    tablet: {
      popoverCalendar: true,
      standardSize: true,
    },
    desktop: {
      popoverCalendar: true,
      keyboardShortcuts: true,
    },
  },
  rtl: {
    mirrored: true,
    calendarDirection: 'rtl',
    weekStartDay: 'locale-specific',
    arabicNumerals: 'when ar locale',
  },
};

/**
 * FileUpload Component Specification
 */
export const FileUploadSpec: ComponentSpec = {
  name: 'FileUpload',
  description: 'File upload component with drag and drop',
  variants: {
    default: {
      border: '2px dashed var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-8)',
      minHeight: '200px',
    },
    compact: {
      minHeight: '100px',
      padding: 'var(--spacing-4)',
    },
    button: {
      displayType: 'button',
      border: 'none',
      minHeight: 'auto',
    },
    avatar: {
      shape: 'circle',
      imagePreview: true,
      singleFile: true,
    },
  },
  props: {
    accept: {
      type: 'string',
      required: false,
      description: 'Accepted file types',
    },
    multiple: {
      type: 'boolean',
      default: false,
      description: 'Allow multiple files',
    },
    maxSize: {
      type: 'number',
      default: 10485760, // 10MB
      description: 'Maximum file size in bytes',
    },
    maxFiles: {
      type: 'number',
      default: 10,
      description: 'Maximum number of files',
    },
    onUpload: {
      type: '(files: File[]) => void',
      required: true,
      description: 'Upload handler',
    },
    onError: {
      type: '(error: Error) => void',
      required: false,
      description: 'Error handler',
    },
    dragAndDrop: {
      type: 'boolean',
      default: true,
      description: 'Enable drag and drop',
    },
    showPreview: {
      type: 'boolean',
      default: true,
      description: 'Show file previews',
    },
    autoUpload: {
      type: 'boolean',
      default: false,
      description: 'Auto upload on selection',
    },
  },
  accessibility: {
    ariaLabel: 'File upload',
    keyboardAccessible: true,
    announceFileStatus: true,
    focusableDropzone: true,
  },
  responsive: {
    mobile: {
      cameraCapture: true,
      simplifiedUI: true,
      compactPreviews: true,
    },
    tablet: {
      standardDropzone: true,
      gridPreviews: true,
    },
    desktop: {
      largeDropzone: true,
      detailedPreviews: true,
      dragAndDrop: true,
    },
  },
  rtl: {
    mirrored: true,
    progressDirection: 'rtl',
    iconAlignment: 'center',
  },
};

/**
 * Checkbox Component Specification
 */
export const CheckboxSpec: ComponentSpec = {
  name: 'Checkbox',
  description: 'Checkbox input for boolean or multiple selections',
  variants: {
    default: {
      size: '20px',
      borderRadius: 'var(--radius-sm)',
      border: '2px solid var(--color-border-strong)',
    },
    circular: {
      borderRadius: 'var(--radius-full)',
    },
    filled: {
      checkedBackground: 'var(--color-brand-primary)',
      checkedBorder: 'var(--color-brand-primary)',
    },
  },
  props: {
    checked: {
      type: 'boolean',
      required: false,
      description: 'Checked state',
    },
    onChange: {
      type: '(checked: boolean) => void',
      required: true,
      description: 'Change handler',
    },
    label: {
      type: 'string | ReactNode',
      required: false,
      description: 'Checkbox label',
    },
    value: {
      type: 'string',
      required: false,
      description: 'Checkbox value',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disabled state',
    },
    indeterminate: {
      type: 'boolean',
      default: false,
      description: 'Indeterminate state',
    },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      description: 'Checkbox size',
    },
  },
  accessibility: {
    role: 'checkbox',
    ariaChecked: 'dynamic',
    ariaLabel: 'from label or explicit',
    minTouchTarget: '44px',
    keyboardActivation: 'space',
  },
  responsive: {
    mobile: {
      largerTouchTarget: true,
      increasedSpacing: true,
    },
    tablet: {
      standardSize: true,
    },
    desktop: {
      standardSize: true,
      hoverEffects: true,
    },
  },
  rtl: {
    mirrored: true,
    labelPosition: 'start',
  },
};

/**
 * Radio Component Specification
 */
export const RadioSpec: ComponentSpec = {
  name: 'Radio',
  description: 'Radio button for single selection from multiple options',
  variants: {
    default: {
      size: '20px',
      borderRadius: 'var(--radius-full)',
      border: '2px solid var(--color-border-strong)',
    },
    button: {
      displayType: 'button',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
    },
    card: {
      displayType: 'card',
      padding: 'var(--spacing-4)',
      border: '2px solid var(--color-border-default)',
    },
  },
  props: {
    options: {
      type: 'RadioOption[]',
      required: true,
      description: 'Radio options',
    },
    value: {
      type: 'string',
      required: false,
      description: 'Selected value',
    },
    onChange: {
      type: '(value: string) => void',
      required: true,
      description: 'Change handler',
    },
    name: {
      type: 'string',
      required: true,
      description: 'Radio group name',
    },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: 'vertical',
      description: 'Layout orientation',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disabled state',
    },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      description: 'Radio size',
    },
  },
  accessibility: {
    role: 'radiogroup',
    radioRole: 'radio',
    ariaChecked: 'dynamic',
    keyboardNavigation: 'arrow keys',
    focusManagement: true,
  },
  responsive: {
    mobile: {
      verticalLayout: true,
      largerTouchTarget: true,
    },
    tablet: {
      flexibleLayout: true,
    },
    desktop: {
      flexibleLayout: true,
      compactSpacing: true,
    },
  },
  rtl: {
    mirrored: true,
    labelPosition: 'start',
  },
};

/**
 * Switch/Toggle Component Specification
 */
export const SwitchSpec: ComponentSpec = {
  name: 'Switch',
  description: 'Toggle switch for on/off states',
  variants: {
    default: {
      width: '44px',
      height: '24px',
      borderRadius: 'var(--radius-full)',
      thumbSize: '20px',
    },
    withLabel: {
      showStateLabel: true,
      onLabel: 'ON',
      offLabel: 'OFF',
    },
    withIcon: {
      showStateIcon: true,
    },
  },
  props: {
    checked: {
      type: 'boolean',
      required: false,
      description: 'Checked state',
    },
    onChange: {
      type: '(checked: boolean) => void',
      required: true,
      description: 'Change handler',
    },
    label: {
      type: 'string',
      required: false,
      description: 'Switch label',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Disabled state',
    },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      description: 'Switch size',
    },
    color: {
      type: 'string',
      default: 'primary',
      description: 'Switch color',
    },
  },
  accessibility: {
    role: 'switch',
    ariaChecked: 'dynamic',
    ariaLabel: 'from label or explicit',
    minTouchTarget: '44px',
    keyboardActivation: 'space/enter',
  },
  responsive: {
    mobile: {
      standardSize: true,
      touchFriendly: true,
    },
    tablet: {
      standardSize: true,
    },
    desktop: {
      standardSize: true,
      hoverEffects: true,
    },
  },
  rtl: {
    mirrored: true,
    thumbDirection: 'reversed',
    labelPosition: 'start',
  },
};