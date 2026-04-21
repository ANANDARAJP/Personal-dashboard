import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { financeApi, habitApi, goalApi, taskApi, journalApi, officeApi } from '../services/api';

const formatHeader = (sheet) => {
  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF22C55E' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
};

const applyDataStyle = (sheet) => {
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.font = { name: 'Calibri' };
    }
  });
};

export const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Personal Life Tracker';
  workbook.created = new Date();

  // Fetch all data in parallel
  const [finance, habits, goals, tasks, journal, office] = await Promise.all([
    financeApi.getTransactions({ size: 1000 }).then(r => r?.content || []),
    habitApi.getHabits().then(r => r || []),
    goalApi.getGoals({ size: 1000 }).then(r => r || []),
    taskApi.getTasks({ size: 1000 }).then(r => r?.content || []),
    journalApi.getEntries({ size: 1000 }).then(r => r || []),
    officeApi.getHistory({ size: 1000 }).then(r => Array.isArray(r) ? r : r?.content || [])
  ]);

  // Finance Sheet
  const fSheet = workbook.addWorksheet('Finance');
  fSheet.columns = [
    { header: 'Title Name', key: 'titleName', width: 20 },
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Date', key: 'transactionDate', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
  ];
  finance.forEach(t => fSheet.addRow(t));
  formatHeader(fSheet);
  applyDataStyle(fSheet);

  // Habits Sheet
  const hSheet = workbook.addWorksheet('Habits');
  hSheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Frequency', key: 'frequency', width: 15 },
    { header: 'Target Days/Week', key: 'targetDaysPerWeek', width: 18 },
    { header: 'Current Streak', key: 'currentStreak', width: 15 },
    { header: 'Longest Streak', key: 'longestStreak', width: 15 },
  ];
  habits.forEach(h => hSheet.addRow(h));
  formatHeader(hSheet);
  applyDataStyle(hSheet);

  // Goals Sheet
  const gSheet = workbook.addWorksheet('Goals');
  gSheet.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Progress (%)', key: 'progressPercentage', width: 15 },
    { header: 'Target Date', key: 'targetDate', width: 15 },
    { header: 'Category', key: 'category', width: 15 },
  ];
  goals.forEach(g => gSheet.addRow(g));
  formatHeader(gSheet);
  applyDataStyle(gSheet);

  // Planner Sheet
  const pSheet = workbook.addWorksheet('Planner');
  pSheet.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Priority', key: 'priority', width: 12 },
  ];
  tasks.forEach(t => pSheet.addRow(t));
  formatHeader(pSheet);
  applyDataStyle(pSheet);

  // Journal Sheet
  const jSheet = workbook.addWorksheet('Journal');
  jSheet.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Content', key: 'content', width: 50 },
    { header: 'Date', key: 'entryDate', width: 15 },
    { header: 'Mood', key: 'mood', width: 15 },
    { header: 'Mood Score', key: 'moodScore', width: 12 },
    { header: 'Gratitude', key: 'gratitude', width: 30 },
    { header: 'Reflection', key: 'reflection', width: 30 },
  ];
  journal.forEach(j => jSheet.addRow(j));
  formatHeader(jSheet);
  applyDataStyle(jSheet);

  // Office Sheet
  const oSheet = workbook.addWorksheet('Office');
  oSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Check In', key: 'inTime', width: 15 },
    { header: 'Check Out', key: 'outTime', width: 15 },
    { header: 'Summary', key: 'summaryText', width: 50 },
  ];
  office.forEach(o => {
    let summaryText = o.summary || '';
    try {
      const p = JSON.parse(o.summary);
      summaryText = `Morning: ${p.morning || ''}\nAfternoon: ${p.afternoon || ''}\nEnd of Day: ${p.today || ''}`.trim();
    } catch (e) {}
    oSheet.addRow({ ...o, summaryText });
  });
  formatHeader(oSheet);
  applyDataStyle(oSheet);

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'LifeTracker_Data.xlsx');
};
