
// Status normalization functions
export const normalizeStatus = (status: string): string => {
  switch (status) {
    case "todo":
      return "pending";
    case "in-progress":
      return "in_progress";
    case "review":
      return "in_review";
    case "completed":
      return "completed";
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "in_review":
      return "in_review";
    default:
      return "pending";
  }
};

export const mapStatusToBoardFormat = (status: string): string => {
  switch (status) {
    case "pending":
    case "todo":
      return "todo";
    case "in_progress":
    case "in-progress":
      return "in-progress";
    case "in_review":
    case "review":
      return "review";
    case "completed":
      return "completed";
    default:
      return "todo";
  }
};

export const mapStatusToColumnFormat = (status: string): string => {
  switch (status) {
    case "todo":
    case "pending":
      return "pending";
    case "in-progress":
    case "in_progress":
      return "in_progress";
    case "review":
    case "in_review":
      return "in_review";
    case "completed":
      return "completed";
    default:
      return "pending";
  }
};

// Date formatting functions
export const normalizeDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || '';
  }
};

export const parseDateString = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    // JavaScript months are 0-based, so subtract 1 from the month
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};
