import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seeding...');

  await prisma.user.deleteMany();
  console.log(' Cleared existing users');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const mentorPassword = await bcrypt.hash('mentor123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      phone: '+998901234567',
      password: adminPassword,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      image: 'https://via.placeholder.com/150?text=Admin',
    },
  });
  console.log('✓ Admin user created:', admin.phone);

  const mentor = await prisma.user.create({
    data: {
      phone: '+998901234568',
      password: mentorPassword,
      fullName: 'John Mentor',
      role: UserRole.MENTOR,
      image: 'https://via.placeholder.com/150?text=Mentor',
      mentorProfile: {
        create: {
          about: 'Experienced software developer with 10+ years of experience',
          job: 'Senior Software Engineer',
          experience: '10+ years',
          telegram: '@johnmentor',
          instagram: '@johnmentor',
          linkedin: 'linkedin.com/in/johnmentor',
          github: 'github.com/johnmentor',
          website: 'johnmentor.dev',
        },
      },
    },
    include: {
      mentorProfile: true,
    },
  });
  console.log('✓ Mentor user created:', mentor.phone);

  const student = await prisma.user.create({
    data: {
      phone: '+998901234569',
      password: studentPassword,
      fullName: 'Jane Student',
      role: UserRole.STUDENT,
      image: 'https://via.placeholder.com/150?text=Student',
    },
  });
  console.log('✓ Student user created:', student.phone);

  const category = await prisma.courseCategory.create({
    data: {
      name: 'Web Development',
    },
  });
  console.log('✓ Course category created:', category.name);

  const course = await prisma.course.create({
    data: {
      name: 'Advanced TypeScript for Backend Development',
      about: 'Learn advanced TypeScript concepts for building scalable backend applications',
      price: 49.99,
      banner: 'https://via.placeholder.com/1920x1080?text=TypeScript+Course',
      introVideo: 'https://example.com/intro.mp4',
      level: 'ADVANCED',
      published: true,
      categoryId: category.id,
      mentorId: mentor.id,
    },
  });
  console.log('✓ Sample course created:', course.name);

  const section1 = await prisma.sectionLesson.create({
    data: {
      name: 'Getting Started with TypeScript',
      courseId: course.id,
    },
  });
  console.log('✓ Section 1 created:', section1.name);

  const section2 = await prisma.sectionLesson.create({
    data: {
      name: 'Advanced Type System',
      courseId: course.id,
    },
  });
  console.log('✓ Section 2 created:', section2.name);

  const lesson1 = await prisma.lesson.create({
    data: {
      name: 'Introduction to TypeScript',
      about: 'Understand the basics of TypeScript and why it matters',
      video: 'https://example.com/lesson1.mp4',
      sectionId: section1.id,
    },
  });
  console.log('✓ Lesson 1 created:', lesson1.name);

  const lesson2 = await prisma.lesson.create({
    data: {
      name: 'Setting Up Your Development Environment',
      about: 'Configure TypeScript compiler and IDE for optimal development',
      video: 'https://example.com/lesson2.mp4',
      sectionId: section1.id,
    },
  });
  console.log('✓ Lesson 2 created:', lesson2.name);

  const lesson3 = await prisma.lesson.create({
    data: {
      name: 'Generics and Type Parameters',
      about: 'Master generics for writing reusable and type-safe code',
      video: 'https://example.com/lesson3.mp4',
      sectionId: section2.id,
    },
  });
  console.log('✓ Lesson 3 created:', lesson3.name);

  await prisma.lessonFile.create({
    data: {
      fileUrl: 'https://example.com/lesson1-slides.pdf',
      note: 'Slides for introduction',
      lessonId: lesson1.id,
    },
  });

  await prisma.lessonFile.create({
    data: {
      fileUrl: 'https://example.com/lesson1-code.zip',
      note: 'Code examples',
      lessonId: lesson1.id,
    },
  });
  console.log('✓ Lesson files created');

  await prisma.purchasedCourse.create({
    data: {
      courseId: course.id,
      userId: student.id,
      amount: course.price,
      paidVia: 'PAYME',
    },
  });
  console.log('✓ Student purchased the course');

  await prisma.assignedCourse.create({
    data: {
      courseId: course.id,
      userId: student.id,
    },
  });
  console.log('✓ Course assigned to student');

  await prisma.lessonView.create({
    data: {
      lessonId: lesson1.id,
      userId: student.id,
      view: true,
    },
  });

  await prisma.lastActivity.create({
    data: {
      userId: student.id,
      courseId: course.id,
      lessonId: lesson1.id,
      sectionId: section1.id,
      updatedAt: new Date(),
    },
  });
  console.log('✓ Last activity tracked for student');

  const question = await prisma.question.create({
    data: {
      userId: student.id,
      courseId: course.id,
      text: 'How do I use generics with interfaces?',
      read: false,
    },
  });
  console.log('✓ Sample question created');

  await prisma.questionAnswer.create({
    data: {
      questionId: question.id,
      userId: mentor.id,
      text: 'Generics with interfaces allow you to create flexible, reusable type definitions. Here is an example...',
    },
  });
  console.log('✓ Mentor answered the question');

  await prisma.rating.create({
    data: {
      courseId: course.id,
      userId: student.id,
      rate: 5,
      comment: 'Excellent course! Learned a lot about advanced TypeScript patterns.',
    },
  });
  console.log('✓ Sample rating created');

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('📝 Credentials for testing:\n');
  console.log('Admin:');
  console.log('  Phone: +998901234567');
  console.log('  Password: admin123\n');
  console.log('Mentor:');
  console.log('  Phone: +998901234568');
  console.log('  Password: mentor123\n');
  console.log('Student:');
  console.log('  Phone: +998901234569');
  console.log('  Password: student123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
