from pathlib import Path

path = Path('src/client/src/pages/Employees.tsx')
text = path.read_text()
start = "  const renderAddEmployee = () => ("
end = "  const renderReports = () => ("

if start not in text or end not in text:
  raise SystemExit('Markers not found in Employees.tsx')

pre, rest = text.split(start, 1)
old_block, post = rest.split(end, 1)

new_block = """  const renderAddEmployee = () => {
    const supervisorOptions = employees
      .filter((emp) => emp.status === 'active')
      .map((emp) => formatEmployeeName(emp));

    return (
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          padding: '24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3
            style={{
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontWeight: 600,
              margin: 0,
              color: COLORS.text,
            }}
          >
            {editingEmployee ? 'Edit Employee' : 'Add Employee'}
          </h3>
          {error && activeTab === 'add' && (
            <div
              style={{
                color: '#c62828',
                backgroundColor: '#fdecea',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: COLORS.lightBg,
                border: `1px dashed ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                margin: '0 auto',
              }}
            >
              <span style={{ fontSize: '48px', color: COLORS.textLight }}>👤</span>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#ff9800',
                  color: COLORS.white,
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 600,
                }}
              >
                +
              </div>
            </div>
            <div
              style={{
                marginTop: '12px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.textNote.fontSize,
                color: COLORS.textLight,
                lineHeight: 1.4,
              }}
            >
              Accepts jpg, png, gif up to 1MB. Recommended
              <br />
              dimensions: 200px × 200px
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              {[
                { label: 'First Name', key: 'firstName' },
                { label: 'Middle Name', key: 'middleName' },
                { label: 'Last Name', key: 'lastName' },
              ].map((field) => (
                <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    style={{
                      fontSize: TYPOGRAPHY.textNote.fontSize,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontWeight: 500,
                      color: COLORS.text,
                    }}
                  >
                    {field.label}*
                  </label>
                  <input
                    type=\"text\"
                    value={(employeeForm as any)[field.key]}
                    onChange={(e) => handleFormChange(field.key as keyof EmployeeFormState, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label
                style={{
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text,
                }}
              >
                Employee ID*
              </label>
              <input
                type=\"text\"
                value={employeeForm.employeeId}
                onChange={(e) => handleFormChange('employeeId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant fontSize??\n*** End Patch

