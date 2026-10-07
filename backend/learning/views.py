import json
from datetime import timedelta
from functools import wraps

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.db.models import Q, Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import Bookmark, Category, Course, Enrollment, Lesson, Progress


def csrf_failure(request, reason=''):
    return JsonResponse({'error': 'Your session has expired. Refresh the page and try again.'}, status=403)


def api_body(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        try:
            data = json.loads(request.body or '{}')
        except (ValueError, UnicodeDecodeError):
            return JsonResponse({'error': 'Send a valid JSON object.'}, status=400)
        if not isinstance(data, dict):
            return JsonResponse({'error': 'Send a valid JSON object.'}, status=400)
        request.data = data
        return view(request, *args, **kwargs)
    return wrapped


def authenticated(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Sign in to save your learning progress.'}, status=401)
        return view(request, *args, **kwargs)
    return wrapped


def user_data(user):
    return {'id': user.id, 'username': user.username, 'name': user.first_name or user.username, 'email': user.email}


def learning_state(user):
    if not user.is_authenticated:
        return {'enrolled': set(), 'bookmarks': set(), 'completed': set()}
    return {
        'enrolled': set(Enrollment.objects.filter(user=user).values_list('course_id', flat=True)),
        'bookmarks': set(Bookmark.objects.filter(user=user).values_list('course_id', flat=True)),
        'completed': set(Progress.objects.filter(user=user).values_list('lesson_id', flat=True)),
    }


def course_data(course, state):
    lessons = list(course.lessons.all())
    completed = sum(lesson.id in state['completed'] for lesson in lessons)
    next_lesson = next((lesson.id for lesson in lessons if lesson.id not in state['completed']), None)
    return {
        'id': course.id, 'slug': course.slug, 'title': course.title,
        'description': course.description,
        'category': {'name': course.category.name, 'slug': course.category.slug},
        'instructor': course.instructor, 'instructor_role': course.instructor_role,
        'level': course.level, 'artwork': course.artwork, 'featured': course.featured,
        'lesson_count': len(lessons), 'duration_minutes': sum(l.duration_minutes for l in lessons),
        'enrolled': course.id in state['enrolled'], 'bookmarked': course.id in state['bookmarks'],
        'completed_lessons': completed, 'progress': round(completed / len(lessons) * 100) if lessons else 0,
        'next_lesson_id': next_lesson,
    }


def course_queryset():
    return Course.objects.select_related('category').prefetch_related('lessons')


@require_GET
@ensure_csrf_cookie
def session(request):
    return JsonResponse({'user': user_data(request.user) if request.user.is_authenticated else None})


@require_POST
@api_body
def register(request):
    data = request.data
    if not all(isinstance(data.get(field), str) for field in ['name', 'email', 'password']):
        return JsonResponse({'error': 'Please enter your name, email, and password.'}, status=400)
    name, email, password = data['name'].strip(), data['email'].strip().lower(), data['password']
    if not name or len(name) > 150 or len(email) > 150:
        return JsonResponse({'error': 'Use a name and email with no more than 150 characters.'}, status=400)
    user = User(username=email, email=email, first_name=name)
    try:
        validate_email(email)
        validate_password(password, user)
    except ValidationError as error:
        return JsonResponse({'error': ' '.join(error.messages)}, status=400)
    if User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).exists():
        return JsonResponse({'error': 'An account with this email already exists. Try signing in.'}, status=400)
    try:
        with transaction.atomic():
            user.set_password(password)
            user.save()
    except IntegrityError:
        return JsonResponse({'error': 'An account with this email already exists.'}, status=400)
    login(request, user)
    return JsonResponse({'user': user_data(user)}, status=201)


@require_POST
@api_body
def sign_in(request):
    if not isinstance(request.data.get('email'), str) or not isinstance(request.data.get('password'), str):
        return JsonResponse({'error': 'Enter your email and password.'}, status=400)
    email = request.data['email'].strip().lower()
    existing = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()
    user = authenticate(request, username=existing.username if existing else email, password=request.data['password'])
    if user is None:
        return JsonResponse({'error': 'The email or password is incorrect.'}, status=400)
    login(request, user)
    return JsonResponse({'user': user_data(user)})


@require_POST
def sign_out(request):
    logout(request)
    return JsonResponse({'user': None})


@require_GET
def categories(request):
    return JsonResponse({'categories': list(Category.objects.values('name', 'slug'))})


@require_GET
def courses(request):
    queryset = course_queryset()
    query = request.GET.get('q', '').strip()
    if query:
        queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query) | Q(instructor__icontains=query))
    if category := request.GET.get('category'):
        queryset = queryset.filter(category__slug=category)
    state = learning_state(request.user)
    if request.GET.get('enrolled') == 'true':
        queryset = queryset.filter(id__in=state['enrolled'])
    if request.GET.get('bookmarked') == 'true':
        queryset = queryset.filter(id__in=state['bookmarks'])
    return JsonResponse({'courses': [course_data(course, state) for course in queryset]})


@require_GET
def course_detail(request, slug):
    course = get_object_or_404(course_queryset(), slug=slug)
    state = learning_state(request.user)
    result = course_data(course, state)
    result['lessons'] = [{
        'id': lesson.id, 'title': lesson.title, 'order': lesson.order,
        'duration_minutes': lesson.duration_minutes, 'completed': lesson.id in state['completed'],
    } for lesson in course.lessons.all()]
    return JsonResponse({'course': result})


@require_POST
@authenticated
def enroll(request, slug):
    course = get_object_or_404(course_queryset(), slug=slug)
    if not course.lessons.exists():
        return JsonResponse({'error': 'This course does not have any lessons yet.'}, status=400)
    Enrollment.objects.get_or_create(user=request.user, course=course)
    return JsonResponse({'course': course_data(course, learning_state(request.user))})


@require_POST
@authenticated
def bookmark(request, slug):
    course = get_object_or_404(Course, slug=slug)
    saved, created = Bookmark.objects.get_or_create(user=request.user, course=course)
    if not created:
        saved.delete()
    return JsonResponse({'bookmarked': created})


@require_GET
@authenticated
def lesson_detail(request, lesson_id):
    lesson = get_object_or_404(Lesson.objects.select_related('course'), id=lesson_id)
    if not Enrollment.objects.filter(user=request.user, course=lesson.course).exists():
        return JsonResponse({'error': 'Join this course before opening its lessons.'}, status=403)
    state = learning_state(request.user)
    course = get_object_or_404(course_queryset(), id=lesson.course_id)
    result = course_data(course, state)
    result['lessons'] = [{
        'id': item.id, 'title': item.title, 'order': item.order,
        'duration_minutes': item.duration_minutes, 'completed': item.id in state['completed'],
    } for item in course.lessons.all()]
    return JsonResponse({'lesson': {
        'id': lesson.id, 'title': lesson.title, 'content': lesson.content,
        'order': lesson.order, 'duration_minutes': lesson.duration_minutes,
        'completed': lesson.id in state['completed'],
        'question': lesson.question, 'choices': lesson.choices,
    }, 'course': result})


@require_POST
@authenticated
@api_body
def complete_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    if not Enrollment.objects.filter(user=request.user, course=lesson.course).exists():
        return JsonResponse({'error': 'Join this course before completing its lessons.'}, status=403)
    answer = request.data.get('answer')
    if type(answer) is not int or answer < 0 or answer >= len(lesson.choices):
        return JsonResponse({'error': 'Choose an answer to check your understanding.'}, status=400)
    correct = answer == lesson.correct_answer
    if correct:
        Progress.objects.get_or_create(user=request.user, lesson=lesson)
    return JsonResponse({'correct': correct, 'explanation': lesson.explanation if correct else 'Not quite. Revisit the lesson and give it another try.', 'completed': correct or Progress.objects.filter(user=request.user, lesson=lesson).exists()})


@require_GET
@authenticated
def dashboard(request):
    state = learning_state(request.user)
    enrolled = [course_data(course, state) for course in course_queryset().filter(id__in=state['enrolled'])]
    progress = Progress.objects.filter(user=request.user)
    minutes = progress.aggregate(total=Sum('lesson__duration_minutes'))['total'] or 0
    return JsonResponse({
        'courses': enrolled,
        'stats': {
            'enrolled_courses': len(enrolled), 'completed_lessons': len(state['completed']),
            'completed_courses': sum(course['progress'] == 100 for course in enrolled),
            'learning_minutes': minutes,
            'weekly_lessons': progress.filter(completed_at__gte=timezone.now() - timedelta(days=7)).count(),
        },
    })
