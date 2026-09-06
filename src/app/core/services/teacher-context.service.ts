import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HomeworkService } from './homework.service';
import { AttendanceService } from '../../features/attendance/attendance.service';

const STORAGE_PREFIX = 'teacher-context';

/**
 * There is no "list my classes" or "list my students" endpoint for the TEACHER role on this
 * backend - every classId/studentId field a teacher fills in today is free text. This service
 * makes those boxes pre-populated/autocomplete-able instead, by:
 *  1) harvesting real classId/studentId values from endpoints teachers CAN already call
 *     (today's attendance, their own homework list), and
 *  2) remembering every classId/studentId a teacher successfully uses, persisted in
 *     localStorage per tenant+user, so the suggestion list grows over time.
 * Consumers bind an <input list="..."> to a <datalist> built from classIds()/studentIdsFor().
 */
@Injectable({ providedIn: 'root' })
export class TeacherContextService {
  private readonly authService = inject(AuthService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly homeworkService = inject(HomeworkService);

  private readonly classIdsSignal = signal<string[]>(this.readStorage('classes'));
  private readonly studentIdsByClass = new Map<string, Set<string>>();
  private refreshed = false;

  readonly classIds = this.classIdsSignal.asReadonly();

  /** Best-effort fetch of known classIds/studentIds; safe to call from every teacher screen's ngOnInit. */
  refresh(): void {
    if (this.refreshed) return;
    this.refreshed = true;
    const tenantId = this.authService.getTenantId() ?? '';
    forkJoin({
      attendance: this.attendanceService.getTodayAttendance(tenantId).pipe(
        map((res) => res.data || []),
        catchError(() => of([])),
      ),
      homework: this.homeworkService.listForTeacher(this.authService.getUserId() ?? '', 0, 50).pipe(
        map((res) => res.data || []),
        catchError(() => of([])),
      ),
    }).subscribe(({ attendance, homework }) => {
      attendance.forEach((record) => {
        this.rememberClass(record.classId);
        this.rememberStudent(record.classId, record.studentId);
      });
      homework.forEach((hw) => this.rememberClass(hw.classId));
    });
  }

  rememberClass(classId?: string | null): void {
    if (!classId) return;
    const current = this.classIdsSignal();
    if (!current.includes(classId)) {
      const next = [...current, classId];
      this.classIdsSignal.set(next);
      this.writeStorage('classes', next);
    }
  }

  rememberStudent(classId: string | null | undefined, studentId?: string | null): void {
    if (!studentId) return;
    const key = classId || '_global';
    const set = this.studentIdsByClass.get(key) ?? new Set<string>(this.readStorage(`students:${key}`));
    if (!set.has(studentId)) {
      set.add(studentId);
      this.writeStorage(`students:${key}`, [...set]);
    }
    this.studentIdsByClass.set(key, set);
    if (key !== '_global') {
      this.rememberStudent(null, studentId);
    }
  }

  studentIdsFor(classId?: string | null): string[] {
    const key = classId || '_global';
    if (!this.studentIdsByClass.has(key)) {
      this.studentIdsByClass.set(key, new Set(this.readStorage(`students:${key}`)));
    }
    return [...(this.studentIdsByClass.get(key) ?? new Set())];
  }

  private storageKey(suffix: string): string {
    return `${STORAGE_PREFIX}:${this.authService.getTenantId() ?? ''}:${this.authService.getUserId() ?? ''}:${suffix}`;
  }

  private readStorage(suffix: string): string[] {
    try {
      const raw = localStorage.getItem(this.storageKey(suffix));
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  private writeStorage(suffix: string, values: string[]): void {
    try {
      localStorage.setItem(this.storageKey(suffix), JSON.stringify(values));
    } catch {
      // localStorage unavailable (private browsing / quota) - in-memory list still works this session
    }
  }
}
