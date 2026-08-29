import random

class CompanyNameGenerator:
    PREFIXES = [
        "Nimbus",
        "Vertex",
        "Quantum",
        "Lumen",
        "Apex",
        "Orbit",
        "Nexus",
        "Meridian",
        "Cobalt",
        "Stellar",
        "Atlas",
        "Zenith",
        "Prism",
        "Nova",
        "Pulse",
        "Crest",
        "Harbor",
        "Monarch",
        "Solstice",
        "Vantage",
    ]

    SUFFIXES = [
        "Labs",
        "Systems",
        "Solutions",
        "Group",
        "Dynamics",
        "Technologies",
        "Works",
        "Digital",
        "Analytics",
        "Industries",
        "Consulting",
        "Networks",
        "Software",
        "Robotics",
        "Ventures",
        "Studios",
    ]

    @classmethod
    def generate(cls):
        prefix = random.choice(cls.PREFIXES)
        suffix = random.choice(cls.SUFFIXES)

        return f"{prefix} {suffix}"
