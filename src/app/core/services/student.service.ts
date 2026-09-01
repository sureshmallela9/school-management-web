import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse, Student, CreateStudentRequest, UpdateStudentRequest } from '../models/student.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly mockStudents: Student[] = [
    {
      id: 'student-1',
      tenantId: 'tenant-001',
      name: 'Aisha Sharma',
      rollNumber: '12A',
      classId: 'class-5',
      className: 'Grade 5',
      section: 'A',
      parentId: 'parent-1',
      parentName: 'Ravi Sharma',
      admissionNumber: 'ADM-1001',
      phone: '+91 98765 43210',
      dateOfBirth: '2014-02-11',
      gender: 'FEMALE',
      bloodGroup: 'O+',
      address: 'Bengaluru',
    },
    {
      id: 'student-2',
      tenantId: 'tenant-001',
      name: 'Rohan Sharma',
      rollNumber: '8B',
      classId: 'class-3',
      className: 'Grade 3',
      section: 'B',
      parentId: 'parent-1',
      parentName: 'Ravi Sharma',
      admissionNumber: 'ADM-1002',
      phone: '+91 98231 23456',
      dateOfBirth: '2016-09-08',
      gender: 'MALE',
      bloodGroup: 'A+',
      address: 'Bengaluru',
    },
    {
      id: 'student-3',
      tenantId: 'tenant-001',
      name: 'Meera Nair',
      rollNumber: '11C',
      classId: 'class-11',
      className: 'Grade 11',
      section: 'C',
      parentId: 'parent-2',
      parentName: 'Nair Family',
      admissionNumber: 'ADM-1003',
      phone: '+91 90900 11223',
      dateOfBirth: '2012-05-21',
      gender: 'FEMALE',
      bloodGroup: 'AB+',
      address: 'Hyderabad',
    },
  ];

  constructor(private readonly authService: AuthService) {}

  private getTenantId(): string {
    return this.authService.getTenantId() ?? 'tenant-001';
  }

  getStudents(tenantId: string, page = 1, limit = 10, searchTerm?: string): Observable<PaginatedResponse<Student>> {
    const filteredData = this.mockStudents.filter((student) => {
      const matchesTenant = student.tenantId === (tenantId || this.getTenantId());
      const matchesSearch = !searchTerm || [student.name, student.rollNumber].some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesTenant && matchesSearch;
    });

    const start = (page - 1) * limit;
    const slice = filteredData.slice(start, start + limit);

    return of({
      success: true,
      data: slice,
      message: 'Students retrieved successfully',
      total: filteredData.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filteredData.length / limit)),
    }).pipe(delay(150));
  }

  getStudentById(id: string, tenantId: string): Observable<ApiResponse<Student>> {
    const student = this.mockStudents.find((item) => item.id === id && item.tenantId === (tenantId || this.getTenantId()));

    return of(student
      ? { success: true, data: student, message: 'Student retrieved successfully', error: null, code: null }
      : { success: false, data: null, message: 'Student not found', error: 'Student not found', code: 404 }).pipe(delay(120));
  }

  createStudent(student: CreateStudentRequest): Observable<ApiResponse<Student>> {
    const payload: Student = {
      ...student,
      id: `student-${Date.now()}`,
      tenantId: student.tenantId ?? this.getTenantId(),
    } as Student;

    const duplicate = this.mockStudents.some((item) => item.admissionNumber === student.admissionNumber && item.tenantId === (student.tenantId ?? this.getTenantId()));

    if (duplicate) {
      return of({ success: false, data: null, message: 'Admission number already exists', error: 'Admission number already in use', code: 409 }).pipe(delay(120));
    }

    this.mockStudents.push(payload);

    return of({ success: true, data: payload, message: 'Student created successfully', error: null, code: null }).pipe(delay(150));
  }

  updateStudent(id: string, student: UpdateStudentRequest, tenantId: string): Observable<ApiResponse<Student>> {
    const index = this.mockStudents.findIndex((item) => item.id === id && item.tenantId === (tenantId || this.getTenantId()));

    if (index === -1) {
      return of({ success: false, data: null, message: 'Student not found', error: 'Student not found', code: 404 }).pipe(delay(120));
    }

    const updated = { ...this.mockStudents[index], ...student, tenantId: tenantId || this.getTenantId() } as Student;
    this.mockStudents[index] = updated;

    return of({ success: true, data: updated, message: 'Student updated successfully', error: null, code: null }).pipe(delay(150));
  }

  deleteStudent(id: string, tenantId: string): Observable<ApiResponse<any>> {
    const index = this.mockStudents.findIndex((item) => item.id === id && item.tenantId === (tenantId || this.getTenantId()));

    if (index === -1) {
      return of({ success: false, data: null, message: 'Student not found', error: 'Student not found', code: 404 }).pipe(delay(120));
    }

    this.mockStudents.splice(index, 1);

    return of({ success: true, data: null, message: 'Student deleted successfully', error: null, code: null }).pipe(delay(120));
  }

  getMyStudents(tenantId: string, page = 1, limit = 10): Observable<PaginatedResponse<Student>> {
    const currentUserId = this.authService.getUserId() ?? 'parent-1';
    const filtered = this.mockStudents.filter((student) => student.tenantId === (tenantId || this.getTenantId()) && student.parentId === currentUserId);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return of({
      success: true,
      data,
      message: 'My students retrieved successfully',
      total: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    }).pipe(delay(120));
  }
}
