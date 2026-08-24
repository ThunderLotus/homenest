export type FieldType = 'boolean' | 'number' | 'string' | 'select' | 'password'

export interface FieldOption {
  label: string
  value: string | number
}

/**
 * Describes one editable `options`/`secrets` field of a service type.
 * The property panel renders the matching input control from `type`;
 * the editor creates default values from `default`.
 */
export interface FieldDescriptor {
  key: string
  type: FieldType
  label: string
  required?: boolean
  default?: unknown
  options?: FieldOption[]
}

export interface ServiceDescriptor {
  type: string
  /** resolveComponent name of the render component (matches `Item.vue`) */
  component: string
  /** display name shown in the "add service" menu */
  label: string
  /** `options` fields, rendered by the property panel */
  fields: FieldDescriptor[]
  /** which `secrets` keys exist for this type (password inputs) */
  secretsFields: string[]
}

/**
 * Service description registry. Drives both the render component
 * resolution (`Item.vue`) and the dynamically generated property panel
 * form, so adding a new service type only requires a registry entry.
 *
 * NOTE: `label`/field `label` are plain English display strings for now;
 * they can be moved to i18n keys without changing the shape.
 */
export const serviceRegistry: Record<string, ServiceDescriptor> = {
  'base': {
    type: 'base',
    component: 'ServiceBase',
    label: 'Base',
    fields: [],
    secretsFields: [],
  },
  'ip-api': {
    type: 'ip-api',
    component: 'ServiceIpApi',
    label: 'IP API',
    fields: [
      { key: 'flagIcon', type: 'boolean', default: true, label: 'Flag icon' },
    ],
    secretsFields: [],
  },
  'openweathermap': {
    type: 'openweathermap',
    component: 'ServiceOpenWeatherMap',
    label: 'OpenWeatherMap',
    fields: [
      { key: 'city', type: 'string', label: 'City' },
      { key: 'lat', type: 'number', required: true, label: 'Latitude' },
      { key: 'lon', type: 'number', required: true, label: 'Longitude' },
      {
        key: 'units',
        type: 'select',
        default: 'metric',
        options: [
          { label: 'Metric', value: 'metric' },
          { label: 'Imperial', value: 'imperial' },
          { label: 'Standard', value: 'standard' },
        ],
        label: 'Units',
      },
    ],
    secretsFields: ['apiKey'],
  },
}

export function getServiceDescriptor(type?: string): ServiceDescriptor {
  return ((type && serviceRegistry[type]) || serviceRegistry.base) as ServiceDescriptor
}
