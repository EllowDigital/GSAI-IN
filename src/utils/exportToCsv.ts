export function exportFeesToCsv(items: any[], month: number, year: number) {
  if (!Array.isArray(items) || items.length === 0) return;

  const headers = [
    "Student Name",
    "Program",
    "Month",
    "Year",
    "Monthly Fee",
    "Paid Amount",
    "Balance Due",
    "Status",
    "Notes"
  ];

  const csvRows = [
    headers.join(","),
    ...items.map(fee =>
      [
        `"${fee.student?.name || ""}"`,
        `"${fee.student?.program || ""}"`,
        `"${fee.fee?.month || month}"`,
        `"${fee.fee?.year || year}"`,
        `"${fee.fee ? fee.fee.monthly_fee : fee.student?.default_monthly_fee || ""}"`,
        `"${fee.fee ? fee.fee.paid_amount : ""}"`,
        `"${fee.fee ? fee.fee.balance_due : ""}"`,
        `"${fee.fee ? fee.fee.status : "unpaid"}"`,
        `"${fee.fee ? fee.fee.notes : ""}"`
      ].join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `fees_${month}_${year}.csv`;
  link.click();
}

export function exportStudentsToCsv(students: any[]) {
  if (!Array.isArray(students) || students.length === 0) return;

  const headers = [
    "Name",
    "Aadhar Number",
    "Program",
    "Join Date",
    "Parent Name",
    "Parent Contact"
  ];

  const csvRows = [
    headers.join(","),
    ...students.map(stu =>
      [
        `"${stu.name || ""}"`,
        `"${stu.aadhar_number || ""}"`,
        `"${stu.program || ""}"`,
        `"${stu.join_date || ""}"`,
        `"${stu.parent_name || ""}"`,
        `"${stu.parent_contact || ""}"`
      ].join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `students.csv`;
  link.click();
}
