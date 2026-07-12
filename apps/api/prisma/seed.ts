import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyphlab.test' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin@cyphlab.test',
      passwordHash,
      role: 'ADMIN'
    }
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@cyphlab.test' },
    update: {},
    create: {
      fullName: 'Project Manager',
      email: 'manager@cyphlab.test',
      passwordHash,
      role: 'PROJECT_MANAGER'
    }
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@cyphlab.test' },
    update: {},
    create: {
      fullName: 'Team Member',
      email: 'member@cyphlab.test',
      passwordHash,
      role: 'TEAM_MEMBER'
    }
  });

  const project = await prisma.project.upsert({
    where: { id: 'cyphlab-platform-project' },
    update: {},
    create: {
      id: 'cyphlab-platform-project',
      name: 'CyphLab Platform',
      description: 'Internal task management rollout',
      managerId: manager.id,
      members: {
        create: [{ userId: member.id }]
      },
      tasks: {
        create: [
          {
            title: 'Build auth flow',
            description: 'Login and RBAC baseline',
            assigneeId: member.id
          }
        ]
      }
    }
  });

  console.log({ admin: admin.email, manager: manager.email, member: member.email, project: project.name });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
