from django.core.management.base import BaseCommand
from django.db import transaction
from learning.models import Category, Course, Lesson

# Small, editable starter courses. Each tuple contains a real reading and quiz.
COURSES = [
    {
        'title': 'Python, one step at a time', 'slug': 'python-one-step-at-a-time',
        'category': 'Development', 'category_slug': 'development', 'artwork': 'python',
        'description': 'Start with the basics and turn your first lines of Python into a useful little program. No experience needed.',
        'lessons': [
            ('Meet your first program', 8,
             '## A small beginning\nPython lets you give a computer clear instructions. A program is simply a series of those instructions, run in order.\n\nThe `print` function writes a value to the screen:\n\n```python\nprint("Hello, learner!")\nprint(2 + 3)\n```\n\nThe first line displays a string: text surrounded by quotes. The second calculates a number before displaying it. Python runs the lines from top to bottom.\n\n### Try it yourself\nInstall Python, save these lines in `hello.py`, and run `python hello.py` in a terminal. Change the greeting and run it again.\n\n### Takeaway\nFunctions perform actions. We call a function by writing its name followed by parentheses.',
             'What does print(2 + 3) display?', ['2 + 3', '5', '23'], 1, 'Python evaluates the addition first, so print displays the number 5.'),
            ('Variables and everyday data', 12,
             '## Give your data a name\nA variable connects a name to a value. Use names that describe what the value means.\n\n```python\nname = "Alex"\nlessons_finished = 3\nis_learning = True\nprint(f"{name} finished {lessons_finished} lessons.")\n```\n\nText is a `str`, whole numbers are `int`, and true-or-false values are `bool`. An f-string inserts values inside braces into a message.\n\n### Changing a value\n```python\nlessons_finished = lessons_finished + 1\n```\n\nThe right side is evaluated before the new value is assigned. The variable now refers to 4.\n\n### Try it yourself\nMake variables for a book title and the number of pages you have read. Print a sentence using both.',
             'Which value is a boolean?', ['"True"', '42', 'True'], 2, 'True without quotes is a boolean. "True" with quotes is a string.'),
            ('Make decisions and repeat', 12,
             '## Two useful building blocks\nAn `if` statement chooses what to do. A loop repeats an action. Python uses indentation to group instructions.\n\n```python\nscore = 80\nif score >= 70:\n    print("Nice work!")\nelse:\n    print("Keep practicing.")\n\nfor topic in ["variables", "conditions", "loops"]:\n    print(f"Today: {topic}")\n```\n\nThe condition is either true or false. The `for` loop visits each item in the list once. Every indented line belongs to its block.\n\n### Try it yourself\nMake a list of three things you want to learn. Print each item. Then add a condition that prints a special message for your favorite topic.',
             'How many times does a for loop over a list of three items run its body?', ['Once', 'Three times', 'Forever'], 1, 'A for loop visits each item, so a three-item list runs the body three times.'),
            ('Build a reusable function', 13,
             '## A little program you can reuse\nFunctions package related instructions. Parameters let the same function work with different input. `return` sends a result back to the caller.\n\n```python\ndef progress_percent(completed, total):\n    if total == 0:\n        return 0\n    return round(completed / total * 100)\n\nprint(progress_percent(3, 4))\n```\n\nThis displays 75. The guard for zero prevents division by zero. Returning a value makes the function usable in other calculations or displays.\n\n### Your mini project\nCreate a list of four learning goals. Write a function that counts how many you have completed, then show a progress percentage. Try zero, some, and all goals completed.\n\n### Takeaway\nSmall functions with a clear purpose are easier to reuse and test.',
             'What does return do inside a function?', ['Sends a result back to the caller', 'Always prints text', 'Repeats the function'], 0, 'return ends the function call and sends its value back to the caller.'),
        ],
    },
    {
        'title': 'Build your first website', 'slug': 'build-your-first-website',
        'category': 'Development', 'category_slug': 'development', 'artwork': 'web',
        'description': 'Bring an idea to life with HTML, CSS, and a little JavaScript. Build a page that looks good on any screen.',
        'lessons': [
            ('Structure with HTML', 10,
             '## Give content a structure\nHTML describes the meaning of content. A heading introduces a section, a paragraph contains text, and a link connects pages.\n\n```html\n<main>\n  <h1>My learning journal</h1>\n  <p>A small space for big ideas.</p>\n  <a href="https://developer.mozilla.org/">Learn about the web</a>\n</main>\n```\n\nUse semantic elements such as `main`, `nav`, and `article`. They help browsers and assistive tools understand your page. Use buttons for actions and links for navigation.\n\n### Try it yourself\nSave a complete HTML document as `index.html`. Include a heading, a paragraph, and a list of your goals, then open it in a browser.',
             'Which element is best for navigating to another page?', ['<button>', '<a>', '<div>'], 1, 'An anchor element with href is a link for navigation.'),
            ('Style with CSS', 12,
             '## Turn structure into a design\nCSS rules select elements and set properties. Start with type, spacing, and color.\n\n```css\nbody {\n  font-family: system-ui, sans-serif;\n  color: #243a32;\n  margin: 0;\n}\nmain {\n  max-width: 60rem;\n  margin: auto;\n  padding: 2rem;\n}\n```\n\nThe box model includes content, padding, border, and margin. Padding is space inside the box; margin is space outside. Add `box-sizing: border-box` so declared widths include padding and borders.\n\n### Try it yourself\nCreate a `.card` class with padding, a border, and rounded corners. Compare the effect of changing its padding and margin.',
             'Which property adds space inside an element, between content and border?', ['margin', 'padding', 'display'], 1, 'Padding creates space inside the element. Margin creates space outside it.'),
            ('Layouts that adapt', 12,
             '## Think in flexible space\nA responsive page adapts to available width. CSS Grid and media queries let your cards move from several columns to one.\n\n```css\n.cards {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n@media (max-width: 700px) {\n  .cards { grid-template-columns: 1fr; }\n}\n```\n\nInclude a viewport meta tag in your HTML so mobile browsers use the device width. Avoid fixed widths for page content. Images can use `max-width: 100%` to fit their containers.\n\n### Try it yourself\nResize your browser. Check that text is readable, cards fit, and controls are easy to tap.',
             'What is a media query used for?', ['Changing styles based on conditions such as screen width', 'Downloading images', 'Saving a database record'], 0, 'Media queries apply styles when conditions such as a maximum width are satisfied.'),
            ('Add a little interaction', 11,
             '## Respond to an action\nJavaScript connects an event to behavior. The DOM is the browser\'s representation of your page.\n\n```html\n<button id="celebrate">I finished a lesson</button>\n<p id="message" aria-live="polite"></p>\n<script>\n  document.querySelector("#celebrate").addEventListener("click", () => {\n    document.querySelector("#message").textContent = "One step forward!";\n  });\n</script>\n```\n\nThe listener runs when the button is clicked. Using `textContent` inserts text without interpreting HTML. The live region announces the update to assistive tools.\n\n### Your mini project\nAdd a button to your learning journal that updates a progress message. Test it with a mouse and keyboard.',
             'Which event fires when a user activates a button?', ['load', 'click', 'scroll'], 1, 'The click event fires for mouse activation and standard keyboard activation of a button.'),
        ],
    },
    {
        'title': 'Design that feels right', 'slug': 'design-that-feels-right',
        'category': 'Design', 'category_slug': 'design', 'artwork': 'design',
        'description': 'Learn the foundations of thoughtful interfaces: clear hierarchy, confident color, and layouts with room to breathe.',
        'lessons': [
            ('Start with the person', 9,
             '## A design starts with a need\nBefore drawing screens, describe who is using them, what they want to do, and what stands in their way.\n\nFor a learning site, someone may want to fit a useful lesson into a short break. Their problem is choosing quickly and knowing where they left off.\n\n### A simple exercise\nWrite a sentence: **As a learner, I want to find a short beginner lesson so I can make progress during lunch.** Then list the information needed: topic, difficulty, time, and progress.\n\n### Takeaway\nDesign choices should help a person accomplish a task. Beautiful decoration cannot compensate for missing information or a confusing flow.',
             'What should guide the first design decisions?', ['The user\'s task and needs', 'The latest color trend', 'The number of animations'], 0, 'Understanding the person and their task gives the design a clear purpose.'),
            ('Create visual hierarchy', 11,
             '## Help people find what matters\nHierarchy gives elements different importance. Use size, weight, spacing, and placement to make the reading order clear.\n\nA page might have a large title, a brief description, a clear primary button, and quieter supporting details. Give the most important action one consistent style.\n\n### Try it yourself\nSketch a course card. Emphasize the title first. Put duration and difficulty together. Keep the enrollment action easy to find.\n\n### Check your work\nLook away, then glance at your design for three seconds. Can you name the topic and the next action? If everything competes equally, reduce emphasis on supporting details.',
             'Which choice creates a clearer hierarchy?', ['Making all text equally bold', 'Giving the title more emphasis than supporting details', 'Using a different font for every line'], 1, 'Different levels of emphasis guide attention to the title and then supporting information.'),
            ('Color and accessible contrast', 12,
             '## Color has a job\nChoose a neutral foundation, one main action color, and a few supporting colors. Use contrast to keep text readable.\n\nWCAG recommends at least a 4.5:1 contrast ratio for normal text and 3:1 for large text. Use a contrast checker rather than judging by eye.\n\nDo not communicate a result through color alone. A success message can combine a check icon, text, and color. Links and controls also need visible focus states.\n\n### Try it yourself\nChoose a background and text color for your course card. Check the contrast. Then design an error message that still makes sense when printed in grayscale.',
             'Why should an error include text as well as color?', ['Text helps communicate meaning without relying on color perception', 'Text always loads faster', 'Red is never allowed'], 0, 'People perceive colors differently, so the meaning must also be available through text or other cues.'),
            ('Spacing and consistent rhythm', 10,
             '## Give your design room\nA small spacing scale makes layouts feel coherent. Try values such as 4, 8, 12, 16, 24, and 32 pixels. Use smaller gaps within related groups and larger gaps between groups.\n\nAlignment is equally useful: line up the left edges of a card title, description, and action. Repeated patterns help people understand the interface quickly.\n\n### Your mini project\nDesign a course overview with a heading, description, three cards, and a primary action. Use your spacing scale throughout.\n\n### Review\nCheck it at phone and desktop widths. Make sure text can grow without clipping and buttons have enough space to tap comfortably.',
             'What does a larger gap between two groups usually communicate?', ['They are less closely related', 'They are the same item', 'The page failed to load'], 0, 'Spacing groups related information; a larger gap separates distinct groups.'),
        ],
    },
    {
        'title': 'Tell a story with data', 'slug': 'tell-a-story-with-data',
        'category': 'Data & AI', 'category_slug': 'data-ai', 'artwork': 'data',
        'description': 'Turn a spreadsheet into a clear story. Ask better questions, choose the right chart, and share what you find.',
        'lessons': [
            ('Ask a useful question', 9,
             '## Start before the chart\nA good analysis begins with a question that data can answer. “How did lesson completions change each week?” is more useful than “Make a dashboard.”\n\nDecide what one row represents: a learner, a lesson, or an event. Define your metric carefully. A count of enrolled people is different from a count of completed lessons.\n\n### Try it yourself\nWrite a question about your learning habits. Identify the records you would need and the period you want to compare.\n\n### Takeaway\nA precise question determines what to collect, how to summarize it, and what a useful answer looks like.',
             'Which is the clearest analysis question?', ['Show me everything', 'How many lessons did I complete each week?', 'Make it impressive'], 1, 'A weekly completion question defines both a metric and a time interval.'),
            ('Clean before you compare', 12,
             '## Make the records consistent\nBefore calculating, check missing values, duplicates, units, and date formats. A blank duration is not automatically zero, and the same event recorded twice should not count twice.\n\nImagine a duration column containing `15`, `20 min`, and an empty cell. Normalize known values into one numeric unit. Record how you handled the unknown value.\n\n### Try it yourself\nCreate a small table of lesson dates and durations. Add a duplicate and a missing duration. Decide which records are valid for a total-time calculation.\n\n### Takeaway\nKeep the original data and document cleaning choices. Reproducible steps make results easier to trust.',
             'How should you treat an unknown duration?', ['Always count it as zero without explanation', 'Record it as missing and document how it affects analysis', 'Copy the largest duration'], 1, 'Missing data is unknown; handle it explicitly and explain the choice.'),
            ('Choose a clear chart', 11,
             '## Match the chart to the question\nBar charts compare categories. Line charts show change over ordered time. Scatterplots show relationships between two numeric variables.\n\nFor completions by topic, try bars. For weekly learning minutes, try a line. Label axes with units and give the chart a title that states its purpose.\n\nA bar chart normally starts its numeric axis at zero because viewers compare bar lengths. Avoid unnecessary 3D effects and decorative clutter.\n\n### Try it yourself\nSketch both a bar chart and a line chart for a month of weekly progress. Which better answers your original question?',
             'Which chart is a natural choice for learning minutes over time?', ['A line chart', 'A decorative 3D pie chart', 'A random icon grid'], 0, 'A line chart connects ordered observations and makes changes over time easy to see.'),
            ('Share an honest takeaway', 10,
             '## A finding needs context\nSummarize the pattern, give evidence, and explain limitations. “Completions rose from 4 to 6” is more useful than “Learning exploded.”\n\nCorrelation does not by itself prove causation. If more learning happened after a redesign, other factors such as a new course or more free time may explain the change.\n\n### Your mini project\nCreate one chart and write three sentences: what changed, the evidence, and what you still do not know.\n\n### Takeaway\nA clear data story helps someone make a decision while respecting uncertainty. Link your conclusion back to the question you started with.',
             'Does correlation alone establish causation?', ['Yes, always', 'Only with colorful charts', 'No'], 2, 'A relationship between variables does not establish that one caused the other.'),
        ],
    },
    {
        'title': 'React from the ground up', 'slug': 'react-from-the-ground-up',
        'category': 'Development', 'category_slug': 'development', 'artwork': 'react',
        'description': 'Think in components, work with state, and build an interactive interface one small piece at a time.',
        'lessons': [
            ('Think in components', 10,
             '## Break the interface into pieces\nA React component is a function that returns UI. Components help you reuse patterns and give each piece a clear responsibility. JSX looks like HTML but lives in JavaScript.\n\n```jsx\nfunction Welcome() {\n  return <h1>A little learning, every day.</h1>;\n}\n```\n\nComponent names begin with a capital letter. You can place `<Welcome />` inside another component.\n\n### Try it yourself\nDivide a course page into a header, course card, and lesson list. Decide what each component should display. Start with static content before adding behavior.',
             'How should a custom React component name begin?', ['With a capital letter', 'With a hyphen', 'With a number'], 0, 'Capitalized JSX names refer to custom components.'),
            ('Pass information with props', 11,
             '## One pattern, different content\nProps are inputs passed from a parent to a child component. They make components reusable.\n\n```jsx\nfunction CourseCard({ title, minutes }) {\n  return (\n    <article>\n      <h2>{title}</h2>\n      <p>{minutes} minutes</p>\n    </article>\n  );\n}\n\n<CourseCard title="Learn Python" minutes={45} />\n```\n\nCurly braces place JavaScript expressions inside JSX. Treat props as read-only. If data needs to change, the owner of that data should update it.\n\n### Try it yourself\nRender two course cards with different titles and durations using the same component.',
             'How should a component treat its props?', ['As read-only inputs', 'As global variables to mutate', 'As database tables'], 0, 'Props are read-only inputs; updates should come from the component that owns the data.'),
            ('Remember with state', 12,
             '## Make the interface respond\nState remembers a value between renders. Updating state tells React to render the relevant UI again.\n\n```jsx\nimport { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(value => value + 1)}>\n      {count} lessons completed\n    </button>\n  );\n}\n```\n\nUse the updater form when the next value depends on the previous one. A plain local variable will not preserve the value across renders.\n\n### Try it yourself\nCreate a bookmark button that toggles between saved and unsaved using boolean state.',
             'What triggers React to update this counter\'s displayed value?', ['Changing a plain local variable', 'Calling the state setter', 'Changing the file name'], 1, 'Calling the state setter updates state and requests a render.'),
            ('Render a useful list', 12,
             '## Turn data into an interface\nUse `map` to turn an array into components. Give each item a stable key so React can track its identity.\n\n```jsx\nconst lessons = [\n  { id: 1, title: "Components" },\n  { id: 2, title: "State" },\n];\n\nfunction LessonList() {\n  return (\n    <ul>\n      {lessons.map(lesson => (\n        <li key={lesson.id}>{lesson.title}</li>\n      ))}\n    </ul>\n  );\n}\n```\n\nUse stable IDs instead of array positions when items can be reordered. Show an empty state when a list has no items.\n\n### Your mini project\nCombine a course card, bookmark state, and a lesson list into a small learning dashboard.',
             'What is a good key for a list item that can move?', ['A stable unique ID', 'A random value created each render', 'Its color'], 0, 'A stable unique ID lets React track an item across updates and reordering.'),
        ],
    },
    {
        'title': 'A practical introduction to AI', 'slug': 'a-practical-introduction-to-ai',
        'category': 'Data & AI', 'category_slug': 'data-ai', 'artwork': 'ai',
        'description': 'Understand the basics of AI, write clearer prompts, and build a thoughtful habit of checking the results.',
        'lessons': [
            ('Patterns, not magic', 9,
             '## A useful starting point\nMachine learning systems learn patterns from examples. A model might predict a category, estimate a number, or generate text. Its output depends on training, input, and system design.\n\nA language model generates text based on learned patterns and the current context. Fluent wording does not guarantee an accurate answer.\n\n### Try it yourself\nList three tasks where a draft or suggestion would help you. Then list what you would need to verify before using the result.\n\n### Takeaway\nTreat an AI output as something to evaluate. Understanding the task matters more than being impressed by the wording.',
             'Does fluent AI-generated text guarantee factual accuracy?', ['Yes', 'No', 'Only if it is long'], 1, 'Fluent text can contain errors, so factual claims still need verification.'),
            ('Write a clear prompt', 11,
             '## Give the task enough context\nA clear prompt describes the goal, relevant context, constraints, and desired output.\n\nInstead of “Write about learning,” try: “Draft a 100-word welcome message for adult beginners learning Python. Use plain language, include one practice suggestion, and avoid technical jargon.”\n\nYou can ask for a revision after seeing the first result. Keep the instruction focused and provide examples when the desired format is unusual.\n\n### Try it yourself\nWrite a prompt for a study plan. Include the topic, current experience, available time, and the format you want.',
             'Which prompt is more useful?', ['Help', 'Make it better', 'Create a three-day beginner Python plan with 20 minutes of practice per day'], 2, 'The detailed prompt specifies topic, experience level, schedule, and time constraints.'),
            ('Evaluate the result', 12,
             '## Decide what good looks like\nCheck outputs against the task. For a study plan, ask whether it fits the time limit, starts at the right level, and includes practice. For code, run meaningful tests. For factual claims, consult reliable sources.\n\nBe especially careful with unfamiliar details: plausible explanations can still be wrong. Ask for evidence and verify that it actually supports the claim.\n\n### Try it yourself\nCreate a short checklist before generating your next result. Score the output against each item, then revise the instruction based on the gaps.\n\n### Takeaway\nEvaluation turns experimentation into a repeatable workflow.',
             'What is a useful way to evaluate generated code?', ['Trust it if it looks tidy', 'Run tests for the intended behavior', 'Count the lines'], 1, 'Tests provide evidence that the code behaves as intended.'),
            ('Build a thoughtful workflow', 10,
             '## Keep the person in the loop\nA practical workflow is: define the task, provide appropriate context, generate a draft, evaluate it, and revise. Choose a small task with a clear success condition to start.\n\nDo not enter confidential or personal information into a tool unless you understand its data handling and have permission to share it. Keep human review for consequential decisions.\n\n### Your mini project\nAsk for a draft learning plan using a fictional learner profile. Check its time estimates and prerequisites. Edit it into a plan you could actually follow.\n\n### Takeaway\nAI can support a process. Good judgment, suitable data, and verification make that process useful.',
             'What should you do before sharing confidential information with an AI tool?', ['Share everything to improve the answer', 'Understand its data handling and confirm permission', 'Remove only the punctuation'], 1, 'Check both the tool\'s data handling and your permission to share the information.'),
        ],
    },
]


class Command(BaseCommand):
    help = 'Add six starter courses without replacing existing course content or learner progress.'

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        for index, item in enumerate(COURSES):
            category, _ = Category.objects.get_or_create(slug=item['category_slug'], defaults={'name': item['category']})
            course, created = Course.objects.get_or_create(slug=item['slug'], defaults={
                'title': item['title'], 'description': item['description'], 'category': category,
                'instructor': 'Mayshe Team', 'instructor_role': 'Your guides to practical learning',
                'level': 'Intermediate' if item['artwork'] == 'react' else 'Beginner',
                'artwork': item['artwork'], 'featured': index < 3,
            })
            if not created:
                continue
            created_count += 1
            for order, lesson in enumerate(item['lessons'], start=1):
                title, duration, content, question, choices, answer, explanation = lesson
                Lesson.objects.create(course=course, title=title, order=order, duration_minutes=duration,
                                      content=content, question=question, choices=choices,
                                      correct_answer=answer, explanation=explanation)
        self.stdout.write(self.style.SUCCESS(f'Added {created_count} courses. Existing courses and learner progress were preserved.'))
