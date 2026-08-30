import { Injectable } from '@angular/core';
import { ParentDashboardDto, StudentWithDetailsDto, DailyDiaryDto, UserDto, TenantDto } from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  getParentDashboard(): ParentDashboardDto {
    const children: StudentWithDetailsDto[] = [
      {
        id: 'student-1',
        name: 'Aisha Sharma',
        rollNumber: '12A',
        admissionNumber: '2024-118',
        section: 'A',
        className: 'Grade 5',
        gender: 'Female',
        dateOfBirth: '2014-02-11',
        phone: '+91 9876543210',
        avatarUrl: null,
        bloodGroup: 'O+',
        todayStatus: 'Present',
        monthlySummary: {
          studentId: 'student-1',
          monthVal: 8,
          yearVal: 2026,
          presentDays: 23,
          absentDays: 2,
          lateDays: 1,
          leaveDays: 1,
          workingDays: 26,
          attendancePercentage: 88,
        },
        recentAttendance: [
          { id: 'a1', attendanceDate: '2026-08-27', attendanceType: 'PRESENT', remarks: 'Attended class on time.' },
          { id: 'a2', attendanceDate: '2026-08-26', attendanceType: 'LATE', remarks: 'Reached 12 minutes late.' },
          { id: 'a3', attendanceDate: '2026-08-25', attendanceType: 'ABSENT', remarks: 'Not feeling well.' },
        ],
        dailyDiary: [
          { id: 'd1', title: 'Math Practice Sheet', subjectName: 'Mathematics', description: 'Complete the worksheet on fractions.', dueDate: '2026-08-30', status: 'Assigned' },
          { id: 'd2', title: 'Science Lab Notes', subjectName: 'Science', description: 'Submit the lab observation summary.', dueDate: '2026-08-31', status: 'Pending' },
        ],
      },
      {
        id: 'student-2',
        name: 'Rohan Sharma',
        rollNumber: '8B',
        admissionNumber: '2024-204',
        section: 'B',
        className: 'Grade 3',
        gender: 'Male',
        dateOfBirth: '2016-09-08',
        phone: '+91 9823123456',
        avatarUrl: null,
        bloodGroup: 'A+',
        todayStatus: 'Late',
        monthlySummary: {
          studentId: 'student-2',
          monthVal: 8,
          yearVal: 2026,
          presentDays: 20,
          absentDays: 3,
          lateDays: 2,
          leaveDays: 1,
          workingDays: 26,
          attendancePercentage: 77,
        },
        recentAttendance: [
          { id: 'b1', attendanceDate: '2026-08-27', attendanceType: 'LATE', remarks: 'Late due to traffic.' },
          { id: 'b2', attendanceDate: '2026-08-26', attendanceType: 'PRESENT', remarks: 'Normal day.' },
          { id: 'b3', attendanceDate: '2026-08-25', attendanceType: 'LEAVE', remarks: 'Family event.' },
        ],
        dailyDiary: [
          { id: 'd3', title: 'Reading Homework', subjectName: 'English', description: 'Prepare summary of chapter 6.', dueDate: '2026-08-29', status: 'Assigned' },
        ],
      },
    ];

    return {
      childrenCount: children.length,
      children,
      outstandingFeeBalance: 12450,
      unreadNotificationCount: 5,
      pendingLeaveRequestCount: 2,
    };
  }

  getStudents(): StudentWithDetailsDto[] {
    return this.getParentDashboard().children;
  }

  getNotifications() {
    return [
      { id: 'n1', title: 'Fee Reminder', description: 'Quarterly fees due before 15 Sep.', isRead: false, createdAt: '2026-08-27' },
      { id: 'n2', title: 'PTA Meeting', description: 'Parent-teacher meeting is scheduled for 1 Sep.', isRead: false, createdAt: '2026-08-26' },
      { id: 'n3', title: 'Transport Update', description: 'Bus route 7 is delayed by 10 minutes.', isRead: true, createdAt: '2026-08-25' },
    ];
  }

  getAdminTenants(): TenantDto[] {
    return [
      { id: 't1', name: 'Northview Academy', code: 'NVA', address: 'Bengaluru', active: true },
      { id: 't2', name: 'Sunrise Public School', code: 'SPS', address: 'Hyderabad', active: true },
    ];
  }

  getUserProfile(): UserDto {
    return {
      id: 'user-1',
      name: 'Parent User',
      email: 'parent@example.com',
      tenantId: 'tenant-001',
      roles: ['ROLE_PARENT'],
    };
  }
}
