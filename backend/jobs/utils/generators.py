import factory

class JobTitleGenerator:
    TECHNOLOGIES = []
    SENIORITIES = []

    @classmethod
    def generate(cls):
        random_techonology = factory.random.randgen.choice(cls.TECHNOLOGIES)
        random_seniority = factory.random.randgen.choice(cls.SENIORITIES)

         return f"{random_techonology} - {random_seniority} Developer"