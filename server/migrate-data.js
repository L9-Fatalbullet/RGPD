import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_PATH = path.resolve('./data/assessments.json');
const USERS_PATH = path.resolve('./data/users.json');
const REGISTERS_PATH = path.resolve('./data/registers.json');
const DPIAS_PATH = path.resolve('./data/dpias.json');
const AUDIT_PATH = path.resolve('./data/audit.json');
const PROGRESSION_PATH = path.resolve('./data/progression.json');
const ISO27001_PATH = path.resolve('./data/iso27001.json');
const ORGANIZATIONS_PATH = path.resolve('./data/organizations.json');

// Generate unique organization ID
function generateOrganizationId() {
  return crypto.randomBytes(8).toString('hex');
}

// Read JSON file safely
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.trim()) {
      return [];
    }
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Write JSON file safely
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✓ Updated ${filePath}`);
  } catch (error) {
    console.error(`✗ Error writing ${filePath}:`, error);
  }
}

// Migrate data to include organizationId
function migrateData() {
  console.log('🔄 Starting data migration...\n');

  // Read existing data
  const users = readJsonFile(USERS_PATH);
  const organizations = readJsonFile(ORGANIZATIONS_PATH);
  const assessments = readJsonFile(DATA_PATH);
  const registers = readJsonFile(REGISTERS_PATH);
  const dpias = readJsonFile(DPIAS_PATH);
  const progression = readJsonFile(PROGRESSION_PATH);
  const iso27001 = readJsonFile(ISO27001_PATH);
  const audit = readJsonFile(AUDIT_PATH);

  // Create default organization if none exists
  if (organizations.length === 0) {
    const defaultOrg = {
      id: generateOrganizationId(),
      name: 'Organisation par défaut',
      description: 'Organisation créée automatiquement lors de la migration',
      address: '',
      phone: '',
      email: 'admin@default.org',
      website: '',
      sector: '',
      size: '',
      logo: '/logo.png',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    organizations.push(defaultOrg);
    writeJsonFile(ORGANIZATIONS_PATH, organizations);
    console.log('✓ Created default organization');
  }

  const defaultOrgId = organizations[0].id;

  // Migrate users
  let usersUpdated = false;
  const updatedUsers = users.map(user => {
    if (!user.organizationId) {
      usersUpdated = true;
      return {
        ...user,
        organizationId: defaultOrgId,
        createdAt: user.createdAt || new Date().toISOString(),
        isActive: user.isActive !== false
      };
    }
    return user;
  });

  if (usersUpdated) {
    writeJsonFile(USERS_PATH, updatedUsers);
    console.log('✓ Migrated users with organizationId');
  }

  // Migrate assessments
  let assessmentsUpdated = false;
  const updatedAssessments = assessments.map(assessment => {
    if (!assessment.organizationId) {
      assessmentsUpdated = true;
      return {
        ...assessment,
        organizationId: defaultOrgId
      };
    }
    return assessment;
  });

  if (assessmentsUpdated) {
    writeJsonFile(DATA_PATH, updatedAssessments);
    console.log('✓ Migrated assessments with organizationId');
  }

  // Migrate registers
  let registersUpdated = false;
  const updatedRegisters = registers.map(register => {
    if (!register.organizationId) {
      registersUpdated = true;
      return {
        ...register,
        organizationId: defaultOrgId
      };
    }
    return register;
  });

  if (registersUpdated) {
    writeJsonFile(REGISTERS_PATH, updatedRegisters);
    console.log('✓ Migrated registers with organizationId');
  }

  // Migrate DPIAs
  let dpiasUpdated = false;
  const updatedDpias = dpias.map(dpia => {
    if (!dpia.organizationId) {
      dpiasUpdated = true;
      return {
        ...dpia,
        organizationId: defaultOrgId
      };
    }
    return dpia;
  });

  if (dpiasUpdated) {
    writeJsonFile(DPIAS_PATH, updatedDpias);
    console.log('✓ Migrated DPIAs with organizationId');
  }

  // Migrate progression
  let progressionUpdated = false;
  const updatedProgression = progression.map(prog => {
    if (!prog.organizationId) {
      progressionUpdated = true;
      return {
        ...prog,
        organizationId: defaultOrgId
      };
    }
    return prog;
  });

  if (progressionUpdated) {
    writeJsonFile(PROGRESSION_PATH, updatedProgression);
    console.log('✓ Migrated progression with organizationId');
  }

  // Migrate ISO 27001 assessments
  let iso27001Updated = false;
  const updatedIso27001 = iso27001.map(assessment => {
    if (!assessment.organizationId) {
      iso27001Updated = true;
      return {
        ...assessment,
        organizationId: defaultOrgId
      };
    }
    return assessment;
  });

  if (iso27001Updated) {
    writeJsonFile(ISO27001_PATH, updatedIso27001);
    console.log('✓ Migrated ISO 27001 assessments with organizationId');
  }

  // Migrate audit logs
  let auditUpdated = false;
  const updatedAudit = audit.map(log => {
    if (!log.organizationId) {
      auditUpdated = true;
      return {
        ...log,
        organizationId: defaultOrgId
      };
    }
    return log;
  });

  if (auditUpdated) {
    writeJsonFile(AUDIT_PATH, updatedAudit);
    console.log('✓ Migrated audit logs with organizationId');
  }

  console.log('\n✅ Data migration completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Organizations: ${organizations.length}`);
  console.log(`   - Users: ${updatedUsers.length}`);
  console.log(`   - Assessments: ${updatedAssessments.length}`);
  console.log(`   - Registers: ${updatedRegisters.length}`);
  console.log(`   - DPIAs: ${updatedDpias.length}`);
  console.log(`   - ISO 27001: ${updatedIso27001.length}`);
  console.log(`   - Audit logs: ${updatedAudit.length}`);
}

// Run migration
migrateData(); 