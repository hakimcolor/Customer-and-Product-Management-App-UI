'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';
export default function EmployeesPage() {
  return (
    <div>
      <PageHeader
        title="Employees"
        breadcrumbs={[{ label: 'People' }, { label: 'Employees' }]}
      />
      <ComingSoon
        title="Employees Module"
        description="Employee management with payroll, attendance, and HR features coming soon."
      />
    </div>
  );
}
