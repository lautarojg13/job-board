import { Briefcase, Sparkles, FileCheck, PlusCircle, Building2, LucideIcon } from 'lucide-react';
import { ActiveTab } from '../Header';

export interface NavItem {
  key: ActiveTab;
  icon: LucideIcon;
  labelDesktop: string;
  labelMobile: string;
  requiresAuth?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'jobs', icon: Briefcase, labelDesktop: 'Find Jobs', labelMobile: 'Jobs' },
  { key: 'ai-match', icon: Sparkles, labelDesktop: 'AI Agent', labelMobile: 'AI Agent' },
  { key: 'applications', icon: FileCheck, labelDesktop: 'Applications', labelMobile: 'Applications', requiresAuth: true },
  { key: 'employer', icon: PlusCircle, labelDesktop: 'Employer Portal', labelMobile: 'Employer' },
  { key: 'companies', icon: Building2, labelDesktop: 'Companies', labelMobile: 'Companies' },
];
