-- ================================================
-- Seed Data: Sample Tasks
-- Railway PaaS — PostgreSQL
-- ================================================

INSERT INTO tasks (title, description, status) VALUES
  ('Set up Railway project',
   'Create a new Railway project and link it to the GitHub repository for automatic deployments.',
   'completed'),

  ('Configure environment variables',
   'Add DATABASE_URL, PORT, and NODE_ENV as environment variables in the Railway dashboard.',
   'completed'),

  ('Provision PostgreSQL database',
   'Add the Postgres plugin in Railway and verify the connection string is injected.',
   'in-progress'),

  ('Implement CRUD API endpoints',
   'Build RESTful endpoints for creating, reading, updating, and deleting tasks using Express and pg.',
   'in-progress'),

  ('Write project documentation',
   'Create a 2-3 page report covering deployment, scalability, CI/CD, and PaaS comparison.',
   'pending');
