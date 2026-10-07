export interface User { id: number; username: string; name: string; email: string }
export interface Category { name: string; slug: string }
export interface LessonSummary { id: number; title: string; order: number; duration_minutes: number; completed: boolean }
export interface Course {
  id: number; slug: string; title: string; description: string; category: Category;
  instructor: string; instructor_role: string; level: string; artwork: string; featured: boolean;
  lesson_count: number; duration_minutes: number; enrolled: boolean; bookmarked: boolean;
  completed_lessons: number; progress: number; next_lesson_id: number | null;
}
export interface CourseDetail extends Course { lessons: LessonSummary[] }
export interface Lesson extends LessonSummary { content: string; question: string; choices: string[] }
export interface LessonResponse { lesson: Lesson; course: CourseDetail }
export interface Stats { enrolled_courses: number; completed_lessons: number; completed_courses: number; learning_minutes: number; weekly_lessons: number }
export interface Dashboard { courses: Course[]; stats: Stats }
