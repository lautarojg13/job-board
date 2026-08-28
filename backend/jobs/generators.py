import random

class JobTitleGenerator:
    TECHNOLOGIES = [
        "Python",
        "Django",
        "FastAPI",
        "Java",
        "Spring Boot",
        "JavaScript",
        "TypeScript",
        "React",
        "Angular",
        "Vue.js",
        "C#",
        ".NET",
        "Go",
        "Rust",
        "PHP",
        "Laravel",
        "Ruby on Rails",
    ]

    SENIORITIES = [
        "Junior",
        "Mid-Level",
        "Senior",
        "Lead",
    ]

    @classmethod
    def generate(cls):
        technology = random.choice(cls.TECHNOLOGIES)
        seniority = random.choice(cls.SENIORITIES)

        return f"{seniority} {technology} Developer"