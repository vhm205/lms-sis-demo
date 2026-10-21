/**
 * Helper to format VND currency and convert numbers to Vietnamese words for receipts
 */

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

const defaultNumbers = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function readGroupThree(group: string, isFirst: boolean): string {
  let read = "";
  const hundred = parseInt(group[0]);
  const ten = parseInt(group[1]);
  const unit = parseInt(group[2]);

  if (hundred !== 0 || !isFirst) {
    read += defaultNumbers[hundred] + " trăm ";
    if (ten === 0 && unit !== 0) {
      read += "lẻ ";
    }
  }

  if (ten !== 0 && ten !== 1) {
    read += defaultNumbers[ten] + " mươi ";
    if (unit === 1) {
      read += "mốt ";
    } else if (unit === 5) {
      read += "lăm ";
    } else if (unit !== 0) {
      read += defaultNumbers[unit] + " ";
    }
  } else if (ten === 1) {
    read += "mười ";
    if (unit === 1) {
      read += "một ";
    } else if (unit === 5) {
      read += "lăm ";
    } else if (unit !== 0) {
      read += defaultNumbers[unit] + " ";
    }
  } else if (unit !== 0) {
    read += defaultNumbers[unit] + " ";
  }

  return read;
}

export function numberToVietnameseWords(amount: number): string {
  if (amount === 0) return "Không đồng";
  if (isNaN(amount)) return "";

  let numStr = Math.round(Math.abs(amount)).toString();
  while (numStr.length % 3 !== 0) {
    numStr = "0" + numStr;
  }

  const groups: string[] = [];
  for (let i = 0; i < numStr.length; i += 3) {
    groups.push(numStr.substring(i, i + 3));
  }

  let result = "";
  const totalGroups = groups.length;

  for (let i = 0; i < totalGroups; i++) {
    const isFirst = i === 0;
    const groupRead = readGroupThree(groups[i], isFirst);
    if (groupRead.trim() !== "") {
      const unitIndex = totalGroups - 1 - i;
      result += groupRead + (units[unitIndex] ? units[unitIndex] + " " : "");
    }
  }

  result = result.trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng chẵn";
  }

  return result;
}
