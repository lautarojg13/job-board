import {
  PublicCompany,
  JobPost,
  ApplicationDetail,
  CustomUserDetails
} from '../types';

export const INITIAL_COMPANIES: PublicCompany[] = [
  {
    id: 101,
    name: 'Acme Innovations',
    description: 'Leading cloud-native software and AI solutions provider empowering digital transformations.',
    website: 'https://acme-innovations.example.com',
    followers_count: 1420
  },
  {
    id: 102,
    name: 'Apex Financial Tech',
    description: 'Next-generation fintech company building high-frequency trading engines and consumer banking applications.',
    website: 'https://apexfintech.example.com',
    followers_count: 890
  },
  {
    id: 103,
    name: 'Pulse Health Media',
    description: 'Telemedicine and health data platform dedicated to improving patient care globally.',
    website: 'https://pulsehealth.example.com',
    followers_count: 650
  },
  {
    id: 104,
    name: 'GreenGrid Energy',
    description: 'Sustainable clean energy technology company modernizing smart grids and battery storage.',
    website: 'https://greengrid.example.com',
    followers_count: 1100
  }
];

export const INITIAL_JOBS: JobPost[] = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer (React & Django)',
    description: 'We are seeking an experienced Full Stack Engineer to lead the architecture of our core web platform. You will work with React 19, TypeScript, Django REST Framework, and PostgreSQL. Key responsibilities include designing scalable APIs, optimizing database queries, and creating intuitive user interfaces.',
    company: 101,
    location: 'San Francisco, CA',
    posted_by: 1,
    posted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active',
    employment_type: 'FT',
    salary: 155000,
    work_mode: 'remote'
  },
  {
    id: 2,
    title: 'Frontend Developer (TypeScript & Motion)',
    description: 'Join our creative design engineering team to craft high-performance interactive web dashboards and smooth user workflows using modern Tailwind CSS and animation engines.',
    company: 101,
    location: 'New York, NY',
    posted_by: 1,
    posted_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: 'active',
    employment_type: 'FT',
    salary: 130000,
    work_mode: 'hybrid'
  },
  {
    id: 3,
    title: 'Backend Python/Django Systems Architect',
    description: 'High-scale API design, Redis caching, microservices, and high-performance backend pipelines for our algorithmic financial engine.',
    company: 102,
    location: 'Chicago, IL',
    posted_by: 2,
    posted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'active',
    employment_type: 'FT',
    salary: 175000,
    work_mode: 'onsite'
  },
  {
    id: 4,
    title: 'Part-Time Technical Content Writer & Documentation Specialist',
    description: 'Create technical tutorials, OpenAPI documentation, and API guides for developer platforms.',
    company: 103,
    location: 'Austin, TX',
    posted_by: 3,
    posted_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'active',
    employment_type: 'PT',
    salary: 65000,
    work_mode: 'remote'
  },
  {
    id: 5,
    title: 'DevOps & Kubernetes Infrastructure Contract Specialist',
    description: '3-month contract to configure multi-region Kubernetes clusters, Prometheus monitoring, and Terraform automation.',
    company: 104,
    location: 'Seattle, WA',
    posted_by: 4,
    posted_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'active',
    employment_type: 'CT',
    salary: 140000,
    work_mode: 'remote'
  }
];

export const INITIAL_APPLICATIONS: ApplicationDetail[] = [
  {
    id: 501,
    status: 'reviewed',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    applicant_id: 10,
    job_id: 1,
    cover_letter: 'I have 6 years of experience scaling Django REST APIs and building modern React frontends. Excited to join Acme Innovations!',
    resume: 'https://example.com/resumes/john_doe_resume.pdf'
  },
  {
    id: 502,
    status: 'pending',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    applicant_id: 10,
    job_id: 2,
    cover_letter: 'Passionate frontend engineer focused on micro-interactions and high-accessibility design.',
    resume: 'https://example.com/resumes/john_doe_resume.pdf'
  }
];

export const INITIAL_USER: CustomUserDetails = {
  id: 10,
  username: 'alex_dev',
  email: 'alex.dev@example.com',
  first_name: 'Alex',
  last_name: 'Rivera',
  role: 'USER'
};
