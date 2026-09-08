export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  timestamp?: number | null;
  isRead: boolean;
  targetRole?: string | null;
  actionUrl?: string | null;
  tenantId?: string;
}
