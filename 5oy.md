# LMS (Learning Management System) Project

## Overview

This project is a **Learning Management System (LMS)** backend.  
The system allows mentors to create courses, students to purchase courses, watch lessons, submit homework, and take exams.

The backend should be built with a **clean architecture** and follow professional backend development practices.

---

# Database Structure

## Enums / Types

### UserRole
Defines the role of the user in the system.

- ADMIN
- MENTOR
- ASSISTANT
- STUDENT

### CourseLevel

Represents the difficulty level of a course.

- BEGINNER
- PRE_INTERMEDIATE
- INTERMEDIATE
- UPPER_INTERMEDIATE
- ADVANCED

### PaidVia

Defines the payment method.

- PAYME
- CLICK
- CASH

### HomeworkSubStatus

Homework submission status.

- PENDING
- APPROVED
- REJECTED

### ExamAnswer

Exam answer options.

- variantA
- variantB
- variantC
- variantD

---

# Users Table

Stores all system users.

Fields:

- id
- phone
- password
- role
- fullName
- image
- createdAt

Each user can have a specific role such as admin, mentor, assistant, or student.

---

# MentorProfile

Additional information for mentors.

Fields:

- about
- job
- experience
- telegram
- instagram
- linkedin
- facebook
- github
- website

Each mentor profile is connected to a **User**.

---

# CourseCategory

Used to group courses by category.

Example:

- Programming
- Design
- Marketing
- English

Fields:

- id
- name
- createdAt

---

# Course

Represents a course created by a mentor.

Fields:

- id
- name
- about
- price
- banner
- introVideo
- level
- published
- categoryId
- mentorId
- updatedAt
- createdAt

Each course belongs to a **category** and is created by a **mentor**.

---

# AssignedCourse

Stores courses that students want to enroll in.

Fields:

- userId
- courseId
- createdAt

---

# PurchasedCourse

Stores courses purchased by students.

Fields:

- courseId
- userId
- amount
- paidVia
- purchasedAt

---

# Rating

Students can rate and comment on courses.

Fields:

- rate
- comment
- courseId
- userId
- createdAt

---

# LastActivity

Tracks the last activity of a student.

Fields:

- userId
- courseId
- sectionId
- lessonId
- url
- updatedAt

Used to resume learning from the last watched lesson.

---

# SectionLesson

Course sections.

Example:

Course: NestJS Backend

Sections:
- Introduction
- Controllers
- Services
- Authentication

Fields:

- id
- name
- courseId
- createdAt

---

# Lesson

Individual lessons inside a section.

Fields:

- id
- name
- about
- video
- sectionId
- updatedAt
- createdAt

---

# LessonView

Tracks whether a student has watched a lesson.

Fields:

- lessonId
- userId
- view

---

# LessonFile

Files attached to lessons.

Example:

- PDF
- Source code
- Documents

Fields:

- file
- note
- lessonId
- createdAt

---

# Homework

Homework assigned for a lesson.

Fields:

- task
- file
- lessonId
- updatedAt
- createdAt

Each lesson can have **one homework**.

---

# HomeworkSubmission

Student homework submissions.

Fields:

- text
- file
- reason
- status
- homeworkId
- userId
- updatedAt
- createdAt

Mentors can approve or reject submissions.

---

# Exam

Exam questions for a section.

Fields:

- question
- variantA
- variantB
- variantC
- variantD
- answer
- sectionLessonId
- createdAt

---

# StudentExamQuestion

Stores student answers to exam questions.

Fields:

- examId
- userId
- answer
- isCorrect
- sectionLessonId
- createdAt

---

# ExamResult

Stores exam results.

Fields:

- sectionLessonId
- userId
- passed
- corrects
- wrongs
- createdAt

---

# Question

Students can ask questions related to courses.

Fields:

- userId
- courseId
- text
- file  
- read
- readAt
- updatedAt
- createdAt

---

# QuestionAnswer

Mentors answer student questions.

Fields:

- questionId
- userId
- text
- file
- updatedAt
- createdAt