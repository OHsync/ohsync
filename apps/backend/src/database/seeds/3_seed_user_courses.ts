import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user_courses').del();

  // Inserts seed entries
  await knex('user_courses').insert([
    {
      user_id: 88884444,
      course_id: 508104,
      course_code: 'CDA3101',
    },
    {
      user_id: 88884444,
      course_id: 507903,
      course_code: 'COP4533',
    },
    {
      user_id: 55558888,
      course_id: 508104,
      course_code: 'CDA3101',
    },
    {
      user_id: 55558888,
      course_id: 507903,
      course_code: 'COP4533',
    }
  ]);
}