application_fixtures = [
    "applications.tests.fixtures",
    "applications.tests.factories",
]

company_fixtures = [
    "companies.tests.fixtures",
    "companies.tests.factories",
]

core_fixtures = [
    "core.tests.fixtures.auth",
    "core.tests.fixtures.files",
    # "core.tests.factories",
]

job_fixtures = [
    "jobs.tests.fixtures",
    "jobs.tests.factories",
]

user_fixtures = [
    "users.tests.fixtures",
    "users.tests.factories",
]



pytest_plugins = application_fixtures + company_fixtures + core_fixtures + job_fixtures + user_fixtures