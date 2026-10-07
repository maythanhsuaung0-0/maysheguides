from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=80)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ['id']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Course(models.Model):
    LEVELS = [('Beginner', 'Beginner'), ('Intermediate', 'Intermediate')]
    title = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.ForeignKey(Category, related_name='courses', on_delete=models.PROTECT)
    instructor = models.CharField(max_length=100)
    instructor_role = models.CharField(max_length=120)
    level = models.CharField(max_length=20, choices=LEVELS, default='Beginner')
    artwork = models.CharField(max_length=30, default='python')
    featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=180)
    order = models.PositiveIntegerField()
    content = models.TextField(help_text='Markdown lesson content')
    duration_minutes = models.PositiveIntegerField(default=10)
    question = models.CharField(max_length=500)
    choices = models.JSONField(default=list)
    correct_answer = models.PositiveSmallIntegerField(default=0)
    explanation = models.TextField()

    class Meta:
        ordering = ['order', 'id']
        constraints = [models.UniqueConstraint(fields=['course', 'order'], name='unique_lesson_order')]

    def __str__(self):
        return f'{self.course.title}: {self.title}'


class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'course'], name='unique_enrollment')]


class Progress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'lesson'], name='unique_progress')]


class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'course'], name='unique_bookmark')]
