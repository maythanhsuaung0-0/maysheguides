from django.contrib import admin
from .models import Bookmark, Category, Course, Enrollment, Lesson, Progress


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'featured']
    list_filter = ['category', 'level']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LessonInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}


admin.site.register([Enrollment, Progress, Bookmark])
admin.site.site_header = 'Mayshe Guides'
admin.site.site_title = 'Mayshe Admin'
