// utils/dateUtils.ts

import moment from "moment";

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function generateEmployeePassword(email: string): string {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";

  const passwordLength = 12; // You can adjust this length according to your requirements
  let generatedPassword = "";
  let charset = "";

  // Generate a unique seed value from the email
  let seed = 0;
  for (let i = 0; i < email.length; i++) {
    seed += email.charCodeAt(i);
  }

  // Use the seed to initialize the random number generator
  const random = (max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280.0) * max);
  };

  // Add at least one character from each group to ensure validation
  generatedPassword += uppercaseChars[random(uppercaseChars.length)];
  generatedPassword += lowercaseChars[random(lowercaseChars.length)];
  generatedPassword += numbers[random(numbers.length)];
  generatedPassword += specialChars[random(specialChars.length)];

  charset += uppercaseChars + lowercaseChars + numbers + specialChars;

  // Fill the remaining characters of the password
  for (let i = generatedPassword.length; i < passwordLength; i++) {
    generatedPassword += charset[random(charset.length)];
  }

  return generatedPassword;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function AsUTC(date: Date | null | undefined): Date | null {
  return moment(date).utcOffset(0, true).startOf("day").toDate();
}
