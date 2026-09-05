export interface HomeworkDto {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  subjectName?: string | null;
  classId: string;
  className?: string | null;
  dueDate: string;
  assignedDate: string;
  teacherId?: string | null;
  teacherName?: string | null;
  attachments?: string[] | null;
  status?: string | null;
  tenantId?: string;
}

export interface HomeworkRequest {
  title: string;
  description?: string;
  subjectId: string;
  classId: string;
  dueDate: string;
  assignedDate: string;
  teacherId?: string;
  attachments?: string[];
}
