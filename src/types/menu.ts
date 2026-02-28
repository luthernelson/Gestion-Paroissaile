export interface MenuItem {
  label: string
  route?: string
  icon?: string
  permission?: string | null
  children?: MenuItem[]
}